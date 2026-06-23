"""
Sprint 5 - Benchmark dos modelos integrados ao backend.

Mede, para cada modelo disponivel em backend/models/:
  - Tamanho do arquivo (MB)
  - Tempo de carregamento (s)
  - Tempo medio de inferencia em uma imagem unica (ms)
  - Throughput estimado (imagens/segundo)
  - Memoria RSS do processo apos carregar o modelo (MB)

Uso:
    source venv/bin/activate
    python3 benchmark_models.py
"""

import gc
import io
import json
import os
import time
from pathlib import Path

import numpy as np
import psutil
from PIL import Image

import torch
from torchvision import transforms

try:
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')
    KERAS_AVAILABLE = True
except ImportError:
    KERAS_AVAILABLE = False

from models import create_model_architecture

BACKEND_DIR = Path(__file__).parent
MODELS_DIR = BACKEND_DIR / 'models'
IMG_SIZE = 224
WARMUP_RUNS = 3
BENCH_RUNS = 30
DEVICE = torch.device('cpu')

MODEL_CONFIGS = {
    'CustomCNN1': 5,
    'CustomCNN2': 5,
    'CustomCNN3': 5,
    'BinaryCNN_Light': 2,
    'BinaryCNN_Deep': 2,
    'BinaryCNN_Efficient': 2,
    'CustomCNN_SE': 5,
}

torch_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def find_sample_image():
    for p in (BACKEND_DIR / 'uploads').rglob('*.jpg'):
        return p
    for p in (BACKEND_DIR / 'uploads').rglob('*.jpeg'):
        return p
    for p in (BACKEND_DIR / 'uploads').rglob('*.png'):
        return p
    raise FileNotFoundError('Nenhuma imagem de exemplo encontrada em backend/uploads/')


def prepare_inputs(image_path):
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')

    torch_tensor = torch_transform(pil).unsqueeze(0).to(DEVICE)

    resized = pil.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(resized, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    arr = (arr - mean) / std
    keras_array = np.expand_dims(arr, axis=0)

    return torch_tensor, keras_array


def rss_mb():
    return psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024)


def detect_num_classes(state_dict):
    best = None
    for key, tensor in state_dict.items():
        if 'weight' in key and len(tensor.shape) == 2 and any(
            k in key.lower() for k in ('classifier', 'fc', 'head')
        ):
            out_dim = tensor.shape[0]
            if 2 <= out_dim <= 100:
                best = out_dim
    return best


def benchmark_pytorch(model_name, pth_path, torch_tensor):
    baseline = rss_mb()
    t0 = time.perf_counter()

    checkpoint = torch.load(pth_path, map_location=DEVICE)
    if isinstance(checkpoint, dict):
        if 'model_state_dict' in checkpoint:
            state_dict = checkpoint['model_state_dict']
        elif 'state_dict' in checkpoint:
            state_dict = checkpoint['state_dict']
        else:
            state_dict = checkpoint
    else:
        state_dict = checkpoint

    num_classes = detect_num_classes(state_dict) or MODEL_CONFIGS[model_name]
    model = create_model_architecture(model_name, num_classes)
    model.load_state_dict(state_dict, strict=False)
    model.to(DEVICE).eval()

    load_time = time.perf_counter() - t0
    mem_after = rss_mb()

    with torch.no_grad():
        for _ in range(WARMUP_RUNS):
            _ = model(torch_tensor)

        times = []
        for _ in range(BENCH_RUNS):
            t = time.perf_counter()
            _ = model(torch_tensor)
            times.append(time.perf_counter() - t)

    del model
    gc.collect()

    return {
        'framework': 'PyTorch',
        'file_mb': round(pth_path.stat().st_size / (1024 * 1024), 2),
        'load_time_s': round(load_time, 3),
        'inference_ms_mean': round(float(np.mean(times)) * 1000, 2),
        'inference_ms_std': round(float(np.std(times)) * 1000, 2),
        'inference_ms_p95': round(float(np.percentile(times, 95)) * 1000, 2),
        'throughput_img_s': round(1.0 / float(np.mean(times)), 2),
        'memory_delta_mb': round(mem_after - baseline, 1),
        'num_classes': num_classes,
    }


def benchmark_keras(model_name, keras_path, keras_array):
    if not KERAS_AVAILABLE:
        return {'framework': 'Keras', 'error': 'TensorFlow not installed'}

    baseline = rss_mb()
    t0 = time.perf_counter()
    model = tf.keras.models.load_model(str(keras_path))
    load_time = time.perf_counter() - t0
    mem_after = rss_mb()

    for _ in range(WARMUP_RUNS):
        _ = model.predict(keras_array, verbose=0)

    times = []
    for _ in range(BENCH_RUNS):
        t = time.perf_counter()
        _ = model.predict(keras_array, verbose=0)
        times.append(time.perf_counter() - t)

    del model
    gc.collect()

    return {
        'framework': 'Keras',
        'file_mb': round(keras_path.stat().st_size / (1024 * 1024), 2),
        'load_time_s': round(load_time, 3),
        'inference_ms_mean': round(float(np.mean(times)) * 1000, 2),
        'inference_ms_std': round(float(np.std(times)) * 1000, 2),
        'inference_ms_p95': round(float(np.percentile(times, 95)) * 1000, 2),
        'throughput_img_s': round(1.0 / float(np.mean(times)), 2),
        'memory_delta_mb': round(mem_after - baseline, 1),
        'num_classes': MODEL_CONFIGS[model_name],
    }


def main():
    print('=' * 70)
    print('Sprint 5 - Benchmark dos modelos (CPU)')
    print('=' * 70)
    print(f'TensorFlow disponivel: {KERAS_AVAILABLE}')
    print(f'Warmup runs: {WARMUP_RUNS} | Bench runs: {BENCH_RUNS}')

    sample = find_sample_image()
    print(f'Imagem de teste: {sample.name}')
    torch_tensor, keras_array = prepare_inputs(sample)

    results = {}

    for pth in sorted(MODELS_DIR.glob('*.pth')):
        stem = pth.stem.replace('_best', '').replace('_checkpoint', '')
        match = None
        for name in MODEL_CONFIGS:
            if name.lower() == stem.lower() or name.lower() in stem.lower():
                match = name
                break
        if not match:
            print(f'  [skip] {pth.name} — sem config')
            continue
        print(f'\n>> {match} (PyTorch)')
        try:
            results[match] = benchmark_pytorch(match, pth, torch_tensor)
            r = results[match]
            print(f'   {r["file_mb"]} MB | load {r["load_time_s"]}s | '
                  f'inference {r["inference_ms_mean"]}ms (+-{r["inference_ms_std"]}) | '
                  f'{r["throughput_img_s"]} img/s | mem +{r["memory_delta_mb"]}MB')
        except Exception as exc:
            print(f'   ERRO: {exc}')
            results[match] = {'framework': 'PyTorch', 'error': str(exc)}

    for kfile in sorted(MODELS_DIR.glob('*.keras')):
        stem = kfile.stem.replace('_best', '').replace('_checkpoint', '')
        match = None
        for name in MODEL_CONFIGS:
            if name.lower() == stem.lower() or name.lower() in stem.lower():
                match = name
                break
        if not match:
            print(f'  [skip] {kfile.name} — sem config')
            continue
        print(f'\n>> {match} (Keras)')
        try:
            results[match] = benchmark_keras(match, kfile, keras_array)
            r = results[match]
            if 'error' in r:
                print(f'   ERRO: {r["error"]}')
            else:
                print(f'   {r["file_mb"]} MB | load {r["load_time_s"]}s | '
                      f'inference {r["inference_ms_mean"]}ms (+-{r["inference_ms_std"]}) | '
                      f'{r["throughput_img_s"]} img/s | mem +{r["memory_delta_mb"]}MB')
        except Exception as exc:
            print(f'   ERRO: {exc}')
            results[match] = {'framework': 'Keras', 'error': str(exc)}

    out = BACKEND_DIR / 'benchmark_results.json'
    with open(out, 'w') as f:
        json.dump(results, f, indent=2)

    print('\n' + '=' * 70)
    print('Resumo')
    print('=' * 70)
    header = f'{"Modelo":<22} {"FW":<8} {"Size":>8} {"Load":>7} {"Inf":>10} {"img/s":>8} {"Mem":>9}'
    print(header)
    print('-' * len(header))
    for name, r in results.items():
        if 'error' in r:
            print(f'{name:<22} {"ERRO":<8} {r["error"][:40]}')
            continue
        print(f'{name:<22} {r["framework"]:<8} '
              f'{r["file_mb"]:>6}MB {r["load_time_s"]:>6}s '
              f'{r["inference_ms_mean"]:>7}ms {r["throughput_img_s"]:>8} '
              f'{r["memory_delta_mb"]:>7}MB')
    print(f'\nResultados salvos em: {out}')


if __name__ == '__main__':
    main()
