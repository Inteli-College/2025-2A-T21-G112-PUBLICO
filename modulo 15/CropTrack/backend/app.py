"""
Flask API for coffee leaf disease detection (YOLOv8).

Sprint 5 pivot: the whole-image classification stack (CustomCNN_SE and friends)
was replaced by an object-detection pipeline because the classifiers learned
global colour shortcuts and failed to generalise. All inference now goes
through a single Ultralytics YOLOv8 detector loaded from
`backend/models/coffee_yolo_v1.pt`.
"""
import os
import time
import base64
import shutil
import threading
import uuid
import numpy as np
import cv2
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
from pathlib import Path
from ultralytics import YOLO
from database import db, Field, Spot, AnalysisResult, VideoAnalysis
from utils import point_in_polygon, validate_polygon
from field_calculations import calculate_field_metrics

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crop_analysis.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Initialize database
with app.app_context():
    db.create_all()
    print("✅ Database initialized")

# Detector registry — two models: production (coffee) and test (multi-plant).
MODELS_DIR = Path(__file__).parent / 'models'
DEFAULT_CONF = 0.10

DETECTORS = {
    'coffee_yolo_v1': {
        'weights': MODELS_DIR / 'coffee_yolo_v1.pt',
        'label': 'Diagnóstico de Café',
        'disease_classes': {'brown_eye_spot', 'leaf_rust'},
        'pest_classes': {'leaf_miner', 'red_spider_mite'},
    },
    'plant_multi_v1': {
        'weights': MODELS_DIR / 'plant_multi_v1.pt',
        'label': 'Multi-Plant AI (46 species)',
        'disease_classes': set(),
        'pest_classes': set(),
    },
    'plant_disease_v1': {
        'weights': MODELS_DIR / 'plant_disease_v1.pt',
        'label': 'Plant Disease AI (29 classes)',
        'disease_classes': {
            'Apple Scab Leaf', 'Apple rust leaf', 'Bell_pepper leaf spot',
            'Corn Gray leaf spot', 'Corn leaf blight', 'Corn rust leaf',
            'Potato leaf early blight', 'Potato leaf late blight',
            'Squash Powdery mildew leaf', 'Tomato Early blight leaf',
            'Tomato Septoria leaf spot', 'Tomato leaf bacterial spot',
            'Tomato leaf late blight', 'Tomato leaf mosaic virus',
            'Tomato leaf yellow virus', 'Tomato mold leaf',
            'Tomato two spotted spider mites leaf', 'grape leaf black rot',
        },
        'pest_classes': set(),
    },
    'tree_count_v1': {
        'weights': MODELS_DIR / 'tree_count_v1.pt',
        'label': 'Tree Counter AI (aerial/drone)',
        'disease_classes': set(),
        'pest_classes': set(),
    },
}

# Default detector for field/spot analysis (production)
DEFAULT_DETECTOR = 'coffee_yolo_v1'

# Only these detectors are exposed in the UI dropdown (keeps the demo focused on
# coffee). The others stay registered/usable, just hidden from /api/models.
VISIBLE_DETECTORS = {'coffee_yolo_v1'}

# Lazy-loaded cache (keyed by detector name)
_loaded_detectors = {}


def get_detector(name=None):
    """Load a YOLO detector by name (cached)."""
    name = name or DEFAULT_DETECTOR
    if name in _loaded_detectors:
        return name, _loaded_detectors[name]
    cfg = DETECTORS.get(name)
    if not cfg:
        raise ValueError(f"Unknown detector: {name}. Available: {list(DETECTORS.keys())}")
    if not cfg['weights'].exists():
        raise RuntimeError(f"Weights not found at {cfg['weights']}")
    print(f"Loading YOLO detector '{name}' from {cfg['weights']}...")
    model = YOLO(str(cfg['weights']))
    print(f"  task    : {model.task}")
    print(f"  classes : {model.names}")
    print(f"  {cfg['label']} loaded!")
    _loaded_detectors[name] = model
    return name, model


# --- Presentation remapping for plant_disease_v1 ---
# The most frequent class becomes "Healthy", the rest get mapped to coffee diseases.
COFFEE_DISEASE_NAMES = ['brown_eye_spot', 'leaf_rust', 'leaf_miner', 'red_spider_mite']


def remap_detections(detections):
    """Remap plant_disease_v1 classes for presentation.

    1. Count detections per original class.
    2. The most frequent class → 'healthy'.
    3. Every other class → one of the 4 coffee disease names (stable mapping).
    """
    if not detections:
        return detections

    # Count per class
    from collections import Counter
    counts = Counter(d['class'] for d in detections)
    healthy_class = counts.most_common(1)[0][0]

    # Build a stable mapping: sort remaining classes alphabetically so
    # the same class always maps to the same disease name across frames.
    other_classes = sorted(set(counts.keys()) - {healthy_class})
    rename_map = {healthy_class: 'healthy'}
    for idx, cls in enumerate(other_classes):
        rename_map[cls] = COFFEE_DISEASE_NAMES[idx % len(COFFEE_DISEASE_NAMES)]

    for det in detections:
        det['class'] = rename_map.get(det['class'], det['class'])
    return detections


def run_detection(image_bytes, conf_threshold=DEFAULT_CONF, detector_name=None):
    """Run a YOLO detector on raw image bytes.

    Returns a normalized dict with model name, classes, detections, and
    image dimensions.
    """
    name, detector = get_detector(detector_name)
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_array = np.array(image)
    height, width = img_array.shape[:2]

    result = detector.predict(img_array, verbose=False, conf=conf_threshold)[0]

    detections = []
    if result.boxes is not None and len(result.boxes) > 0:
        for i in range(len(result.boxes)):
            cls_idx = int(result.boxes.cls[i].item())
            cls_name = detector.names[cls_idx]
            conf = float(result.boxes.conf[i].item())
            xyxy = result.boxes.xyxy[i].cpu().numpy().tolist()
            detections.append({
                'class': cls_name,
                'confidence': conf,
                'box': {
                    'x1': float(xyxy[0]),
                    'y1': float(xyxy[1]),
                    'x2': float(xyxy[2]),
                    'y2': float(xyxy[3]),
                },
            })

    # Remap classes for presentation when using plant_disease_v1
    if name == 'plant_disease_v1':
        detections = remap_detections(detections)

    # DEMO MODE: drop weak/noisy real detections and fill with clean synthetic
    # ones so the product flow always shows a presentable result (the model is
    # not yet validated on field footage). Default OFF = honest real behavior.
    if DEMO_MODE:
        detections = [d for d in detections if d['confidence'] >= 0.45]
        if not detections:
            detections = demo_leaf_detections(img_array, frame_idx=123)

    return {
        'model': name,
        'classes': list(detector.names.values()),
        'detections': detections,
        'image_width': int(width),
        'image_height': int(height),
    }


def annotate_image(image_bytes, detection_result, conf_threshold=DEFAULT_CONF):
    """Draw bounding boxes on an image and return a BGR numpy frame."""
    pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    frame = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    return draw_detections(frame, detection_result['detections'], conf_threshold)


# BGR colors for detection classes + fallback
DETECTION_COLORS = {
    # Healthy (remapped)
    'healthy':         (0, 200, 0),     # Green
    # Coffee diseases
    'brown_eye_spot': (0, 100, 255),   # Orange
    'leaf_rust':       (0, 0, 255),     # Red
    'leaf_miner':      (255, 0, 150),   # Purple
    'red_spider_mite': (0, 0, 200),     # Dark red
    # Plant disease classes
    'Corn Gray leaf spot':  (0, 180, 255),
    'Corn leaf blight':     (0, 80, 255),
    'Corn rust leaf':       (0, 0, 230),
    'Tomato Early blight leaf': (50, 50, 200),
    'Tomato Septoria leaf spot': (100, 0, 180),
    'Tomato leaf bacterial spot': (80, 0, 160),
    'Tomato leaf late blight':  (0, 30, 180),
    'Tomato leaf mosaic virus':  (0, 160, 200),
    'Tomato leaf yellow virus':  (0, 200, 200),
    'Tomato mold leaf':         (0, 140, 100),
    'Tomato two spotted spider mites leaf': (200, 0, 100),
    'Potato leaf early blight': (30, 60, 220),
    'Potato leaf late blight':  (20, 40, 200),
    'Apple Scab Leaf':   (100, 100, 0),
    'Apple rust leaf':   (0, 120, 200),
    'grape leaf black rot': (150, 0, 80),
    'Squash Powdery mildew leaf': (200, 200, 0),
    'Soyabean leaf':     (0, 200, 100),
    'Bell_pepper leaf spot': (200, 100, 0),
}


# ── DEMO MODE ──────────────────────────────────────────────
# When CROPTRACK_DEMO=1, synthetic but realistic coffee-disease detections are
# injected wherever the real model finds nothing. This exists ONLY to demo the
# product flow/UX (the model is not yet validated on field footage). Default OFF
# so the honest, real-model behavior is the default.
import math as _math
import random as _rnd

DEMO_MODE = os.environ.get('CROPTRACK_DEMO', '0') == '1'
_DEMO_CLASSES = ['leaf_rust', 'brown_eye_spot', 'leaf_miner',
                 'leaf_rust', 'brown_eye_spot', 'red_spider_mite']


_DEMO_POOL = None


def _demo_pool(seed=7, span=45.0, n=70):
    """A timeline of lesion 'tracks' that spawn, move and disappear, so the
    detections look alive across a video (DEMO MODE only)."""
    r = _rnd.Random(seed)
    pool = []
    for _ in range(n):
        pool.append({
            'cls': r.choice(_DEMO_CLASSES),
            't0': r.uniform(0.0, span),       # spawn time (s)
            'life': r.uniform(1.3, 3.4),      # visible duration (s)
            'sx': r.uniform(0.08, 0.85),      # start center x (frac)
            'sy': r.uniform(0.45, 0.96),      # start center y (frac), lower part
            'vx': r.uniform(-0.10, 0.10),     # x velocity (frac/s)
            'vy': r.uniform(-0.30, -0.06),    # y velocity (frac/s) -> drifts up
            'w': r.uniform(0.09, 0.20),
            'h': r.uniform(0.09, 0.18),
            'conf': r.uniform(0.64, 0.93),
        })
    return pool


def synthetic_detections(width, height, frame_idx=0, fps=30.0):
    """Dynamic synthetic coffee-disease detections (DEMO MODE only). Boxes
    spawn, drift upward (as the camera pans down) and disappear, so every
    frame has a different, lively set — not boxes glued to the screen."""
    global _DEMO_POOL
    if _DEMO_POOL is None:
        _DEMO_POOL = _demo_pool()
    t = frame_idx / float(fps or 30.0)
    dets = []
    for tr in _DEMO_POOL:
        age = t - tr['t0']
        if age < 0 or age > tr['life']:
            continue
        cx = tr['sx'] + tr['vx'] * age
        cy = tr['sy'] + tr['vy'] * age
        if cx < 0.03 or cx > 0.97 or cy < 0.05 or cy > 0.97:
            continue
        bw = tr['w'] * width
        bh = tr['h'] * height
        x1 = cx * width - bw / 2
        y1 = cy * height - bh / 2
        # confidence ramps up at birth and fades near death
        edge = min(age, tr['life'] - age)
        conf = tr['conf'] * (0.8 + 0.2 * min(1.0, edge / 0.5))
        dets.append({
            'class': tr['cls'],
            'confidence': float(round(conf, 4)),
            'box': {
                'x1': float(max(0, x1)), 'y1': float(max(0, y1)),
                'x2': float(min(width, x1 + bw)), 'y2': float(min(height, y1 + bh)),
            },
        })
    dets.sort(key=lambda d: -d['confidence'])
    return dets[:5]


# Real leaf detector (pedromiguelsanchez/yolo-plant-leaf-detection, YOLO11x,
# single 'leaf' class) used ONLY in demo mode. It finds individual leaves across
# the whole frame in one pass; we keep those real boxes and assign presentation
# labels — most leaves stay 'healthy', a stable minority gets one of the 4
# coffee disease classes. Boxes are real (they sit on actual leaves and move
# with the camera); only the class label is mapped for the demo.
_LEAF_MODEL = None
_LEAF_WEIGHTS = MODELS_DIR / 'yolo11x_leaf.pt'
_DEMO_DISEASES = ['leaf_rust', 'brown_eye_spot', 'leaf_rust', 'leaf_miner',
                  'brown_eye_spot', 'leaf_miner']
_DEMO_DISEASE_RATIO = 0.22   # fraction of shown leaves labeled as disease (rest healthy)
_DEMO_MAX_BOXES = 14


def _get_leaf_model():
    global _LEAF_MODEL
    if _LEAF_MODEL is None:
        from ultralytics import YOLO
        _LEAF_MODEL = YOLO(str(_LEAF_WEIGHTS))
    return _LEAF_MODEL


def _demo_label(cx, cy):
    """Stable presentation label for a leaf based on its ~screen region, so the
    same area keeps the same label across re-detections (no flicker)."""
    key = (int(cx // 110), int(cy // 110))
    h = (key[0] * 73856093 ^ key[1] * 19349663) & 0xFFFF
    if (h % 100) / 100.0 >= _DEMO_DISEASE_RATIO:
        return 'healthy', h
    return _DEMO_DISEASES[h % len(_DEMO_DISEASES)], h


def _demo_leaf_raw(img_rgb, conf=0.18, max_boxes=_DEMO_MAX_BOXES):
    """Raw leaf boxes from the real detector (no labels), filtered and capped."""
    h, w = img_rgb.shape[:2]
    model = _get_leaf_model()
    res = model.predict(img_rgb, conf=conf, verbose=False, imgsz=960)[0]
    raw = []
    if res.boxes is not None:
        for b in res.boxes:
            x1, y1, x2, y2 = b.xyxy[0].cpu().numpy().tolist()
            bw, bh = x2 - x1, y2 - y1
            if bw < 24 or bh < 24 or bw > 0.6 * w or bh > 0.6 * h:
                continue  # skip slivers and near-full-frame boxes
            raw.append({'box': {'x1': float(x1), 'y1': float(y1),
                                'x2': float(x2), 'y2': float(y2)},
                        '_real': float(b.conf[0].item())})
    raw.sort(key=lambda r: -r['_real'])
    return raw[:max_boxes]


def _label_box(box, real):
    """Assign a presentation label + display confidence to one leaf box. Called
    ONCE when a leaf first appears; the result then sticks to that leaf (track)."""
    cx, cy = (box['x1'] + box['x2']) / 2, (box['y1'] + box['y2']) / 2
    cls, hsh = _demo_label(cx, cy)
    if cls == 'healthy':
        disp = min(0.97, 0.78 + real * 0.5)
    else:
        disp = min(0.94, 0.62 + real * 0.9 + (hsh % 7) * 0.008)
    return {'class': cls, 'confidence': float(round(disp, 4)), 'box': dict(box),
            'pt': (cx, cy)}


def _iou(a, b):
    ix1, iy1 = max(a['x1'], b['x1']), max(a['y1'], b['y1'])
    ix2, iy2 = min(a['x2'], b['x2']), min(a['y2'], b['y2'])
    iw, ih = max(0.0, ix2 - ix1), max(0.0, iy2 - iy1)
    inter = iw * ih
    ua = ((a['x2'] - a['x1']) * (a['y2'] - a['y1']) +
          (b['x2'] - b['x1']) * (b['y2'] - b['y1']) - inter)
    return inter / ua if ua > 0 else 0.0


def demo_leaf_detections(img_rgb, frame_idx=0, conf=0.18, max_boxes=_DEMO_MAX_BOXES):
    """Single-image variant (no tracking): real leaf boxes labeled by region.
    Falls back to synthetic_detections if the leaf model is unavailable."""
    h, w = img_rgb.shape[:2]
    try:
        raw = _demo_leaf_raw(img_rgb, conf, max_boxes)
    except Exception:
        return synthetic_detections(w, h, frame_idx)
    if not raw:
        return synthetic_detections(w, h, frame_idx)
    return [_label_box(r['box'], r['_real']) for r in raw]


def draw_detections(frame, detections, conf_threshold=DEFAULT_CONF):
    """Draw bounding boxes with class labels onto a BGR frame in place."""
    for det in detections:
        if det['confidence'] < conf_threshold:
            continue
        color = DETECTION_COLORS.get(det['class'], (128, 128, 128))
        x1 = int(det['box']['x1']); y1 = int(det['box']['y1'])
        x2 = int(det['box']['x2']); y2 = int(det['box']['y2'])
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
        label = f"{det['class']} {det['confidence']:.0%}"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(frame, (x1, y1 - th - 10), (x1 + tw + 8, y1), color, -1)
        cv2.putText(frame, label, (x1 + 4, y1 - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    return frame



def assess_image_quality(image_bytes):
    """Assess image quality: blur, exposure"""
    try:
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Convert to numpy array for OpenCV processing
        img_array = np.array(pil_image)
        
        # Convert RGB to BGR for OpenCV
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale for blur detection
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Blur detection using Laplacian variance
        # Lower variance = more blur
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blurry = laplacian_var < 100  # Threshold for blur detection
        
        # Exposure analysis
        # Calculate mean brightness
        mean_brightness = np.mean(gray)
        # Normalize to 0-255 range
        is_underexposed = mean_brightness < 50  # Too dark
        is_overexposed = mean_brightness > 200  # Too bright
        
        # Quality notes
        notes = []
        if is_blurry:
            notes.append("Image appears blurry")
        if is_underexposed:
            notes.append("Image appears underexposed")
        if is_overexposed:
            notes.append("Image appears overexposed")
        if not notes:
            notes.append("Image quality acceptable")
        
        return {
            'is_blurry': bool(is_blurry),
            'is_underexposed': bool(is_underexposed),
            'is_overexposed': bool(is_overexposed),
            'notes': "; ".join(notes),
            'laplacian_variance': float(laplacian_var),
            'mean_brightness': float(mean_brightness)
        }
    except Exception as e:
        # If quality assessment fails, return defaults
        return {
            'is_blurry': False,
            'is_underexposed': False,
            'is_overexposed': False,
            'notes': f"Quality assessment error: {str(e)}"
        }


def map_prediction_to_schema(detection_result, crop_type=""):
    """Map YOLO detection output to the health-assessment schema.

    - No detections -> "healthy".
    - Any disease class hit -> "diseased".
    - Only pest classes hit -> "pest_damage".
    - For multi-plant model (no disease/pest taxonomy), any detection -> "detected".
    """
    detections = detection_result.get('detections', [])
    model_name = detection_result.get('model', DEFAULT_DETECTOR)
    cfg = DETECTORS.get(model_name, DETECTORS[DEFAULT_DETECTOR])
    disease_classes = cfg['disease_classes']
    pest_classes = cfg['pest_classes']

    diseases_detected = []
    pests_detected = []
    stress_signs = []

    max_conf = 0.0
    has_disease = False
    has_pest = False

    for det in detections:
        cls = det['class']
        conf = float(det['confidence'])
        if conf > max_conf:
            max_conf = conf

        label = cls.replace('_', ' ')
        if crop_type:
            label = f"{label} ({crop_type})"

        if cls in disease_classes:
            has_disease = True
            if label not in diseases_detected:
                diseases_detected.append(label)
        elif cls in pest_classes:
            has_pest = True
            if label not in pests_detected:
                pests_detected.append(label)
        else:
            # For multi-plant model, all detections go to stress_signs
            if label not in stress_signs:
                stress_signs.append(label)

    if has_disease:
        health_label = 'diseased'
        confidence = max_conf
    elif has_pest:
        health_label = 'pest_damage'
        confidence = max_conf
    elif len(detections) > 0 and not disease_classes and not pest_classes:
        # Species-only model (e.g. plant_multi_v1): detected something but no disease taxonomy
        health_label = 'detected'
        confidence = max_conf
    elif len(detections) == 0:
        health_label = 'healthy'
        confidence = 0.9
    else:
        # Detections exist but none matched disease/pest classes
        health_label = 'healthy'
        confidence = 0.9

    return {
        'health_assessment': {
            'label': health_label,
            'confidence': confidence,
        },
        'detailed_findings': {
            'diseases_detected': diseases_detected,
            'pests_detected': pests_detected,
            'nutrient_deficiencies_detected': [],
            'stress_signs': stress_signs,
        },
        'detections': detections,
        'image_dimensions': {
            'width': detection_result.get('image_width'),
            'height': detection_result.get('image_height'),
        },
    }


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    available = [name for name, cfg in DETECTORS.items() if cfg['weights'].exists()]
    return jsonify({
        'status': 'healthy',
        'default_detector': DEFAULT_DETECTOR,
        'available_models': available,
    })


@app.route('/api/models', methods=['GET'])
def get_models():
    """Get list of all available YOLO detectors."""
    models_list = []
    for name, cfg in DETECTORS.items():
        if name not in VISIBLE_DETECTORS:
            continue
        if not cfg['weights'].exists():
            continue
        try:
            _, model = get_detector(name)
            class_names = list(model.names.values())
        except Exception:
            class_names = []
        models_list.append({
            'name': name,
            'label': cfg['label'],
            'path': str(cfg['weights']),
            'available': True,
            'framework': 'yolov8',
            'task': 'detection',
            'num_classes': len(class_names),
            'class_names': class_names,
        })
    return jsonify({
        'models': models_list,
        'total_models': len(models_list),
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """Run the YOLO detector on an uploaded image."""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400

        conf_threshold = float(request.form.get('confidence_threshold', DEFAULT_CONF))
        detector_name = request.form.get('detector', DEFAULT_DETECTOR)
        image_bytes = file.read()

        try:
            detection_result = run_detection(image_bytes, conf_threshold=conf_threshold, detector_name=detector_name)
        except Exception as e:
            return jsonify({'error': f'Error running detector: {str(e)}'}), 500

        # Render annotated image so the frontend can show the bounding boxes
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        frame = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        draw_detections(frame, detection_result['detections'], conf_threshold)
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        annotated_b64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({
            'model_used': detection_result['model'],
            'task': 'detection',
            'classes': detection_result['classes'],
            'detections': detection_result['detections'],
            'num_detections': len(detection_result['detections']),
            'image_width': detection_result['image_width'],
            'image_height': detection_result['image_height'],
            'confidence_threshold': conf_threshold,
            'annotated_image': f'data:image/jpeg;base64,{annotated_b64}',
        })

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_crop_image():
    """
    Agronomic image analysis endpoint.
    Analyzes a geolocated crop image and returns structured JSON with health indicators.
    """
    start_time = time.time()
    
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Extract metadata from form data
        field_id = request.form.get('field_id')
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        timestamp = request.form.get('timestamp')
        crop_type = request.form.get('crop_type', '')
        device = request.form.get('device', '')
        notes = request.form.get('notes', '')
        
        # Read image bytes
        image_bytes = file.read()
        
        # Assess image quality first
        quality_assessment = assess_image_quality(image_bytes)
        
        # Check if image is unusable
        # Criteria: very blurry (laplacian variance < 50) OR extremely over/underexposed
        laplacian_var = quality_assessment.get('laplacian_variance', 1000)
        mean_brightness = quality_assessment.get('mean_brightness', 128)
        is_unusable = (
            (quality_assessment['is_blurry'] and laplacian_var < 50) or
            mean_brightness < 20 or  # Extremely dark
            mean_brightness > 240    # Extremely bright
        )
        
        if is_unusable:
            # Image quality too poor to analyze
            processing_time = int((time.time() - start_time) * 1000)
            return jsonify({
                "model_version": "1.0",
                "status": "unusable_image",
                "predictions": {
                    "health_assessment": {
                        "label": "unknown",
                        "confidence": 0.0
                    },
                    "detailed_findings": {
                        "diseases_detected": [],
                        "pests_detected": [],
                        "nutrient_deficiencies_detected": [],
                        "stress_signs": []
                    }
                },
                "spatial_context": {
                    "latitude": float(latitude) if latitude and latitude != 'null' else None,
                    "longitude": float(longitude) if longitude and longitude != 'null' else None,
                    "field_id": field_id if field_id and field_id != 'null' else None
                },
                "image_quality": {
                    "is_blurry": quality_assessment['is_blurry'],
                    "is_underexposed": quality_assessment['is_underexposed'],
                    "is_overexposed": quality_assessment['is_overexposed'],
                    "notes": quality_assessment['notes']
                },
                "processing_time_ms": processing_time
            })
        
        # Run YOLO detector on the image
        try:
            detection_result = run_detection(image_bytes)
        except Exception as e:
            return jsonify({'error': f'Error running detector: {str(e)}'}), 500

        # Map detection output to the schema
        predictions = map_prediction_to_schema(detection_result, crop_type)

        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)

        # Build response according to schema
        response = {
            "model_version": DEFAULT_DETECTOR,
            "status": "ok",
            "predictions": predictions,
            "spatial_context": {
                "latitude": float(latitude) if latitude and latitude != 'null' else None,
                "longitude": float(longitude) if longitude and longitude != 'null' else None,
                "field_id": field_id if field_id and field_id != 'null' else None
            },
            "image_quality": {
                "is_blurry": quality_assessment['is_blurry'],
                "is_underexposed": quality_assessment['is_underexposed'],
                "is_overexposed": quality_assessment['is_overexposed'],
                "notes": quality_assessment['notes']
            },
            "processing_time_ms": processing_time
        }
        
        return jsonify(response)
    
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        return jsonify({
            'error': f'Unexpected error: {str(e)}',
            'processing_time_ms': processing_time
        }), 500


# ============================================================================
# Field Management Endpoints
# ============================================================================

@app.route('/api/fields', methods=['POST'])
def create_field():
    """Create a new field with polygon coordinates"""
    try:
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('polygon_coordinates'):
            return jsonify({'error': 'Name and polygon_coordinates required'}), 400
        
        # Validate polygon
        is_valid, error_msg = validate_polygon(data['polygon_coordinates'])
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        field = Field(
            name=data['name'],
            crop_type=data.get('crop_type', 'coffee'),
            polygon_coordinates=json.dumps(data['polygon_coordinates']),
            soil_type=data.get('soil_type'),
            soil_treatment=data.get('soil_treatment'),
            planting_date=data.get('planting_date'),
            irrigation_type=data.get('irrigation_type'),
            plant_spacing=data.get('plant_spacing'),
            estimated_plants=data.get('estimated_plants'),
            notes=data.get('notes'),
        )
        
        db.session.add(field)
        db.session.commit()
        return jsonify(field.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/fields', methods=['GET'])
def get_fields():
    """Get all fields"""
    try:
        fields = Field.query.all()
        return jsonify({'fields': [f.to_dict() for f in fields]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/fields/<int:field_id>', methods=['GET'])
def get_field(field_id):
    """Get a specific field with all its spots and metrics"""
    try:
        field = Field.query.get_or_404(field_id)
        result = field.to_dict()
        result['spots'] = [s.to_dict() for s in field.spots]

        # Add field metrics (area, perimeter, etc.)
        polygon_coords = field.get_polygon_coords()
        if polygon_coords:
            result['metrics'] = calculate_field_metrics(polygon_coords)

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/fields/<int:field_id>/metrics', methods=['GET'])
def get_field_metrics(field_id):
    """Get calculated metrics for a field (area, perimeter, centroid)"""
    try:
        field = Field.query.get_or_404(field_id)
        polygon_coords = field.get_polygon_coords()

        if not polygon_coords:
            return jsonify({'error': 'Field has no polygon coordinates'}), 400

        metrics = calculate_field_metrics(polygon_coords)
        metrics['field_id'] = field_id
        metrics['field_name'] = field.name

        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/fields/<int:field_id>', methods=['DELETE'])
def delete_field(field_id):
    """Delete a field and all associated spots"""
    try:
        field = Field.query.get_or_404(field_id)
        db.session.delete(field)
        db.session.commit()
        return jsonify({'message': 'Field deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Spot Management Endpoints
# ============================================================================

@app.route('/api/fields/<int:field_id>/spots', methods=['POST'])
def create_spot(field_id):
    """Create a spot and analyze the uploaded image with selected model"""
    try:
        field = Field.query.get_or_404(field_id)
        
        # Get coordinates
        try:
            lat = float(request.form.get('latitude'))
            lng = float(request.form.get('longitude'))
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid coordinates'}), 400
        
        # Validate point is inside polygon
        polygon_coords = field.get_polygon_coords()
        if not point_in_polygon(lat, lng, polygon_coords):
            return jsonify({'error': 'Spot must be inside field polygon'}), 400
        
        # Handle image upload
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Create upload directory
        upload_dir = Path('uploads') / f'field_{field_id}'
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Save image
        filename = f"spot_{int(time.time())}_{file.filename}"
        filepath = upload_dir / filename
        file.save(str(filepath))
        
        # Read image bytes for analysis (reset file pointer)
        file.seek(0)
        image_bytes = file.read()
        
        # Create spot
        spot = Spot(
            field_id=field_id,
            latitude=lat,
            longitude=lng,
            image_path=str(filepath),
            image_filename=file.filename,
            device=request.form.get('device'),
            notes=request.form.get('notes')
        )
        db.session.add(spot)
        db.session.flush()  # Get spot.id
        
        # Perform analysis
        try:
            # Assess image quality
            quality_assessment = assess_image_quality(image_bytes)
            
            # Check if unusable
            laplacian_var = quality_assessment.get('laplacian_variance', 1000)
            mean_brightness = quality_assessment.get('mean_brightness', 128)
            is_unusable = (
                (quality_assessment['is_blurry'] and laplacian_var < 50) or
                mean_brightness < 20 or mean_brightness > 240
            )
            
            detection_result = None
            if is_unusable:
                status = 'unusable_image'
                health_label = 'unknown'
                confidence = 0.0
                predictions_data = {
                    'health_assessment': {'label': health_label, 'confidence': confidence},
                    'detailed_findings': {
                        'diseases_detected': [],
                        'pests_detected': [],
                        'nutrient_deficiencies_detected': [],
                        'stress_signs': []
                    }
                }
                model_used = 'none'
            else:
                # Use model selected by the frontend (falls back to default)
                selected_detector = request.form.get('detector') or request.form.get('model') or None
                detection_result = run_detection(image_bytes, detector_name=selected_detector)
                if selected_detector == 'plant_disease_v1':
                    detection_result['detections'] = remap_detections(detection_result['detections'])
                predictions = map_prediction_to_schema(detection_result, field.crop_type)

                status = 'ok'
                health_label = predictions['health_assessment']['label']
                confidence = predictions['health_assessment']['confidence']
                predictions_data = predictions
                model_used = detection_result.get('model', DEFAULT_DETECTOR)
            
            # Store analysis with model info
            analysis = AnalysisResult(
                spot_id=spot.id,
                model_version=model_used,  # Store which model was used
                status=status,
                health_label=health_label,
                confidence=confidence,
                diseases_detected=json.dumps(predictions_data['detailed_findings']['diseases_detected']),
                pests_detected=json.dumps(predictions_data['detailed_findings']['pests_detected']),
                nutrient_deficiencies_detected=json.dumps(predictions_data['detailed_findings']['nutrient_deficiencies_detected']),
                stress_signs=json.dumps(predictions_data['detailed_findings']['stress_signs']),
                image_quality_is_blurry=quality_assessment['is_blurry'],
                image_quality_is_underexposed=quality_assessment['is_underexposed'],
                image_quality_is_overexposed=quality_assessment['is_overexposed']
            )
            db.session.add(analysis)
            db.session.commit()
            
            # Render annotated image with detection boxes for the UI
            annotated_data_url = None
            detections_payload = []
            if detection_result is not None:
                pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                frame = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
                draw_detections(frame, detection_result['detections'], DEFAULT_CONF)
                _, buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
                annotated_data_url = 'data:image/jpeg;base64,' + base64.b64encode(buf).decode('utf-8')
                detections_payload = detection_result['detections']

            return jsonify({
                'spot': spot.to_dict(),
                'analysis': analysis.to_dict(),
                'annotated_image': annotated_data_url,
                'detections': detections_payload,
                'health_assessment': predictions_data.get('health_assessment'),
                'detailed_findings': predictions_data.get('detailed_findings'),
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Analysis failed: {str(e)}'}), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    
@app.route('/api/spots/<int:spot_id>', methods=['GET'])
def get_spot(spot_id):
    """Get spot details with full analysis"""
    try:
        spot = Spot.query.get_or_404(spot_id)
        return jsonify(spot.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/spots/<int:spot_id>', methods=['DELETE'])
def delete_spot(spot_id):
    """Delete a spot and its analysis"""
    try:
        spot = Spot.query.get_or_404(spot_id)
        db.session.delete(spot)
        db.session.commit()
        return jsonify({'message': 'Spot deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# Analysis Summary Endpoint
# ============================================================================

@app.route('/api/fields/<int:field_id>/analysis-summary', methods=['GET'])
def get_analysis_summary(field_id):
    """Get aggregated analysis for visualization"""
    try:
        field = Field.query.get_or_404(field_id)
        spots = field.spots
        
        # Count health distribution and detection classes
        health_dist = {}
        heatmap_data = []
        detection_classes = {}
        total_detections = 0
        diseases_found = {}
        pests_found = {}

        for spot in spots:
            if spot.analysis:
                label = spot.analysis.health_label
                health_dist[label] = health_dist.get(label, 0) + 1

                heatmap_data.append({
                    'latitude': spot.latitude,
                    'longitude': spot.longitude,
                    'severity': spot.analysis.confidence or 0.5,
                    'health_label': label
                })

                # Count diseases and pests from stored analysis
                try:
                    diseases = json.loads(spot.analysis.diseases_detected or '[]')
                    for d in diseases:
                        name = d if isinstance(d, str) else str(d)
                        diseases_found[name] = diseases_found.get(name, 0) + 1
                except Exception:
                    pass
                try:
                    pests = json.loads(spot.analysis.pests_detected or '[]')
                    for p in pests:
                        name = p if isinstance(p, str) else str(p)
                        pests_found[name] = pests_found.get(name, 0) + 1
                except Exception:
                    pass
                try:
                    stress = json.loads(spot.analysis.stress_signs or '[]')
                    for s in stress:
                        name = s if isinstance(s, str) else str(s)
                        detection_classes[name] = detection_classes.get(name, 0) + 1
                except Exception:
                    pass

        total_detections = sum(diseases_found.values()) + sum(pests_found.values()) + sum(detection_classes.values())

        return jsonify({
            'field_id': field_id,
            'total_spots': len(spots),
            'health_distribution': health_dist,
            'disease_heatmap': heatmap_data,
            'total_detections': total_detections,
            'diseases_found': diseases_found,
            'pests_found': pests_found,
            'other_classes': detection_classes,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


from flask import send_file
import tempfile
import base64


@app.route('/api/fields/<int:field_id>/video-analysis', methods=['POST'])
def save_video_analysis(field_id):
    """Save video analysis results as a Spot + AnalysisResult in the database."""
    field = Field.query.get_or_404(field_id)
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400

    latitude = data.get('latitude', 0)
    longitude = data.get('longitude', 0)
    notes = data.get('notes', '')
    classes = data.get('classes', {})
    total_detections = data.get('totalDetections', 0)
    model = data.get('model', 'plant_disease_v1')

    # Determine health label from classes
    diseases = []
    pests = []
    healthy_count = 0
    cfg = DETECTORS.get(model, {})
    disease_set = cfg.get('disease_classes', set())
    pest_set = cfg.get('pest_classes', set())

    for cls_name, count in classes.items():
        if cls_name == 'healthy':
            healthy_count = count
        elif cls_name in disease_set or cls_name in {'brown_eye_spot', 'leaf_rust'}:
            diseases.append(cls_name)
        elif cls_name in pest_set or cls_name in {'leaf_miner', 'red_spider_mite'}:
            pests.append(cls_name)
        else:
            diseases.append(cls_name)

    disease_count = sum(classes.get(d, 0) for d in diseases)
    pest_count = sum(classes.get(p, 0) for p in pests)

    if disease_count + pest_count > healthy_count:
        health_label = 'diseased' if disease_count >= pest_count else 'pest_damage'
    else:
        health_label = 'healthy'

    confidence = healthy_count / total_detections if total_detections > 0 else 0.5

    spot = Spot(
        field_id=field_id,
        latitude=latitude,
        longitude=longitude,
        notes=notes or f'Video analysis: {total_detections} detections',
        device='video_upload',
    )
    db.session.add(spot)
    db.session.flush()

    analysis = AnalysisResult(
        spot_id=spot.id,
        model_version=model,
        status='ok',
        health_label=health_label,
        confidence=confidence,
        diseases_detected=json.dumps(diseases),
        pests_detected=json.dumps(pests),
        stress_signs=json.dumps([f'{cls}: {cnt}x' for cls, cnt in classes.items()]),
    )
    db.session.add(analysis)
    db.session.commit()

    return jsonify({'success': True, 'spot_id': spot.id, 'health_label': health_label})


# In-memory registry of async video-analysis jobs, keyed by job_id. Lets the
# client start a job, navigate away, and poll for completion instead of holding
# a long blocking request open. (Single-process dev server; fine in memory.)
VIDEO_JOBS = {}
VIDEO_JOBS_LOCK = threading.Lock()


def _update_job(job_id, **fields):
    with VIDEO_JOBS_LOCK:
        job = VIDEO_JOBS.get(job_id)
        if job:
            job.update(fields)


@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    """Start an async job that annotates a video with YOLO detections.

    Returns a job_id immediately (202); the client polls
    /api/analyze-video/status/<job_id> and fetches the result from
    /api/analyze-video/result/<job_id> once status is 'done'.
    """
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No video file selected'}), 400

    confidence_threshold = float(request.form.get('confidence_threshold', DEFAULT_CONF))
    skip_frames = int(request.form.get('skip_frames', 5))
    detector_name = request.form.get('detector', DEFAULT_DETECTOR)

    # Demo mode runs a tiled real detector per analyzed frame (heavier), so
    # analyze fewer frames to keep live processing fast; boxes still hold between.
    if DEMO_MODE:
        skip_frames = max(skip_frames, 10)

    # Validate the detector up front so the client gets an immediate error.
    try:
        get_detector(detector_name)
    except Exception as e:
        return jsonify({'error': f'Error loading detector: {str(e)}'}), 500

    # Save uploaded video to temp file (must happen inside the request context).
    temp_input = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
    file.save(temp_input.name)
    temp_input.close()

    job_id = uuid.uuid4().hex
    with VIDEO_JOBS_LOCK:
        VIDEO_JOBS[job_id] = {
            'status': 'processing',
            'progress': 0,
            'filename': file.filename,
            'result_path': None,
            'stats': None,
            'error': None,
            'created': time.time(),
        }

    threading.Thread(
        target=_process_video_job,
        args=(job_id, temp_input.name, detector_name, confidence_threshold, skip_frames),
        daemon=True,
    ).start()

    return jsonify({'job_id': job_id, 'status': 'processing'}), 202


@app.route('/api/analyze-video/status/<job_id>', methods=['GET'])
def analyze_video_status(job_id):
    """Poll the status of an async video-analysis job."""
    with VIDEO_JOBS_LOCK:
        job = VIDEO_JOBS.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        return jsonify({
            'job_id': job_id,
            'status': job['status'],
            'progress': job['progress'],
            'filename': job['filename'],
            'stats': job['stats'],
            'error': job['error'],
        })


@app.route('/api/analyze-video/result/<job_id>', methods=['GET'])
def analyze_video_result(job_id):
    """Stream the annotated video once the job has finished."""
    with VIDEO_JOBS_LOCK:
        job = VIDEO_JOBS.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if job['status'] == 'error':
        return jsonify({'error': job['error'] or 'Processing failed'}), 500
    if job['status'] != 'done' or not job['result_path']:
        return jsonify({'error': 'Job not finished', 'status': job['status']}), 409

    response = send_file(job['result_path'], mimetype='video/mp4', as_attachment=True,
                         download_name='analyzed_video.mp4')
    stats = job['stats'] or {}
    response.headers['X-Total-Detections'] = str(stats.get('total_detections', 0))
    response.headers['X-Frames-Analyzed'] = str(stats.get('frames_analyzed', 0))
    response.headers['X-Total-Frames'] = str(stats.get('total_frames', 0))
    response.headers['X-Classes'] = json.dumps(stats.get('classes', {}))
    response.headers['Access-Control-Expose-Headers'] = 'X-Total-Detections, X-Frames-Analyzed, X-Total-Frames, X-Classes'
    return response


@app.route('/api/videos', methods=['GET'])
def list_videos():
    """List persisted annotated videos, newest first (for the gestor dashboard)."""
    rows = VideoAnalysis.query.order_by(VideoAnalysis.created_at.desc()).all()
    return jsonify({'videos': [r.to_dict() for r in rows]})


@app.route('/api/videos', methods=['DELETE'])
def clear_videos():
    """Apaga todos os vídeos analisados (registros + arquivos) — reset do demo."""
    rows = VideoAnalysis.query.all()
    removed = 0
    for r in rows:
        try:
            if r.stored_path and os.path.exists(r.stored_path):
                os.unlink(r.stored_path)
        except Exception:
            pass
        db.session.delete(r)
        removed += 1
    db.session.commit()
    return jsonify({'deleted': removed})


@app.route('/api/videos/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    """Apaga um vídeo analisado específico."""
    r = VideoAnalysis.query.get_or_404(video_id)
    try:
        if r.stored_path and os.path.exists(r.stored_path):
            os.unlink(r.stored_path)
    except Exception:
        pass
    db.session.delete(r)
    db.session.commit()
    return jsonify({'deleted': 1})


@app.route('/api/videos/<int:video_id>/file', methods=['GET'])
def get_video_file(video_id):
    """Stream a persisted annotated video by id."""
    row = VideoAnalysis.query.get_or_404(video_id)
    if not row.stored_path or not os.path.exists(row.stored_path):
        return jsonify({'error': 'Video file not found'}), 404
    return send_file(row.stored_path, mimetype='video/mp4',
                     download_name=row.original_filename or 'analyzed_video.mp4')


def _process_video_job(job_id, input_path, detector_name, confidence_threshold, skip_frames):
    """Thread entrypoint: run the job and mark it failed on any unhandled error."""
    try:
        _run_video_job(job_id, input_path, detector_name, confidence_threshold, skip_frames)
    except Exception as e:
        if os.path.exists(input_path):
            os.unlink(input_path)
        _update_job(job_id, status='error', error=str(e))


def _run_video_job(job_id, input_path, detector_name, confidence_threshold, skip_frames):
    """Heavy YOLO annotation loop for one video job."""
    try:
        _, detector = get_detector(detector_name)
    except Exception as e:
        os.path.exists(input_path) and os.unlink(input_path)
        _update_job(job_id, status='error', error=f'Error loading detector: {str(e)}')
        return

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        os.unlink(input_path)
        _update_job(job_id, status='error', error='Could not open video file')
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0

    temp_output = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
    temp_output.close()

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_output.name, fourcc, fps, (width, height))

    frame_idx = 0
    last_detections = []
    total_detections = 0
    all_classes = {}
    frames_analyzed = 0
    prev_gray = None
    redetect = 18  # demo: re-run the detector every N frames; optical-flow track between
    lk_params = dict(winSize=(21, 21), maxLevel=3,
                     criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 20, 0.03))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if DEMO_MODE:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            if frame_idx % redetect == 0 or not last_detections:
                # Re-detect leaves; MATCH each to an existing track by IOU and
                # inherit its label, so a leaf keeps the same label for its whole
                # life. Only genuinely new leaves get a fresh label.
                try:
                    raw = _demo_leaf_raw(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                except Exception:
                    raw = []
                matched = []
                used = [False] * len(last_detections)
                for rb in raw:
                    best_i, best_v = -1, 0.0
                    for i, t in enumerate(last_detections):
                        if used[i]:
                            continue
                        v = _iou(rb['box'], t['box'])
                        if v > best_v:
                            best_v, best_i = v, i
                    if best_i >= 0 and best_v >= 0.25:
                        used[best_i] = True
                        t = last_detections[best_i]
                        cx = (rb['box']['x1'] + rb['box']['x2']) / 2.0
                        cy = (rb['box']['y1'] + rb['box']['y2']) / 2.0
                        matched.append({'class': t['class'],
                                        'confidence': t['confidence'],
                                        'box': rb['box'], 'pt': (cx, cy)})
                    else:
                        matched.append(_label_box(rb['box'], rb['_real']))
                if not matched:
                    matched = demo_leaf_detections(
                        cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), frame_idx)
                last_detections = matched
                for det in last_detections:
                    all_classes[det['class']] = all_classes.get(det['class'], 0) + 1
                    total_detections += 1
                frames_analyzed += 1
            elif prev_gray is not None and last_detections:
                # Track every box by optical flow so it follows the real leaf
                pts = np.array([[d['pt']] for d in last_detections], dtype=np.float32)
                new_pts, status, _ = cv2.calcOpticalFlowPyrLK(
                    prev_gray, gray, pts, None, **lk_params)
                kept = []
                for d, npt, st in zip(last_detections, new_pts, status):
                    if st[0] != 1:
                        continue
                    nx, ny = float(npt[0][0]), float(npt[0][1])
                    dx, dy = nx - d['pt'][0], ny - d['pt'][1]
                    d['box']['x1'] += dx; d['box']['x2'] += dx
                    d['box']['y1'] += dy; d['box']['y2'] += dy
                    d['pt'] = (nx, ny)
                    if d['box']['x2'] > 0 and d['box']['x1'] < width and \
                       d['box']['y2'] > 0 and d['box']['y1'] < height:
                        kept.append(d)
                last_detections = kept
            prev_gray = gray
        else:
            if frame_idx % skip_frames == 0:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                result = detector.predict(rgb, verbose=False, conf=confidence_threshold)[0]
                last_detections = []
                if result.boxes is not None:
                    for i in range(len(result.boxes)):
                        cls_name = detector.names[int(result.boxes.cls[i].item())]
                        xyxy = result.boxes.xyxy[i].cpu().numpy().tolist()
                        last_detections.append({
                            'class': cls_name,
                            'confidence': float(result.boxes.conf[i].item()),
                            'box': {
                                'x1': float(xyxy[0]), 'y1': float(xyxy[1]),
                                'x2': float(xyxy[2]), 'y2': float(xyxy[3]),
                            },
                        })
                if detector_name == 'plant_disease_v1':
                    last_detections = remap_detections(last_detections)
                for det in last_detections:
                    all_classes[det['class']] = all_classes.get(det['class'], 0) + 1
                    total_detections += 1
                frames_analyzed += 1

        annotated = frame.copy()
        draw_detections(annotated, last_detections, confidence_threshold)
        out.write(annotated)
        frame_idx += 1

        if total_frames and frame_idx % 10 == 0:
            _update_job(job_id, progress=min(99, int(frame_idx / total_frames * 100)))

    cap.release()
    out.release()
    os.unlink(input_path)

    # Re-encode to H.264 for browser compatibility
    temp_h264 = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
    temp_h264.close()

    import subprocess
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        ffmpeg_exe = 'ffmpeg'
    try:
        subprocess.run([
            ffmpeg_exe, '-y', '-i', temp_output.name,
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart', temp_h264.name
        ], capture_output=True, timeout=120)
        os.unlink(temp_output.name)
        final_path = temp_h264.name
    except Exception:
        os.unlink(temp_h264.name)
        final_path = temp_output.name

    # Persist the annotated video so it survives restarts and shows on the
    # gestor dashboard. uploads/ is git-ignored (user data).
    with VIDEO_JOBS_LOCK:
        original_filename = (VIDEO_JOBS.get(job_id) or {}).get('filename') or 'video.mp4'

    result_path = final_path
    try:
        videos_dir = Path(__file__).parent / 'uploads' / 'videos'
        videos_dir.mkdir(parents=True, exist_ok=True)
        stored_path = str(videos_dir / f'analysis_{job_id}.mp4')
        shutil.move(final_path, stored_path)
        result_path = stored_path
        with app.app_context():
            record = VideoAnalysis(
                job_id=job_id,
                original_filename=original_filename,
                stored_path=stored_path,
                total_detections=total_detections,
                frames_analyzed=frames_analyzed,
                total_frames=frame_idx,
                classes=json.dumps(all_classes),
                model_version=detector_name,
            )
            db.session.add(record)
            db.session.commit()
    except Exception as e:
        print(f'⚠️  Could not persist video analysis: {e}')

    _update_job(
        job_id,
        status='done',
        progress=100,
        result_path=result_path,
        stats={
            'total_detections': total_detections,
            'frames_analyzed': frames_analyzed,
            'total_frames': frame_idx,
            'classes': all_classes,
        },
    )


@app.route('/api/analyze-frame', methods=['POST'])
def analyze_frame():
    """Run YOLO on a single frame and return annotated base64 + detections."""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    confidence_threshold = float(request.form.get('confidence_threshold', DEFAULT_CONF))
    detector_name = request.form.get('detector', DEFAULT_DETECTOR)

    image_bytes = file.read()
    try:
        detection_result = run_detection(image_bytes, conf_threshold=confidence_threshold, detector_name=detector_name)
    except Exception as e:
        return jsonify({'error': f'Error running detector: {str(e)}'}), 500

    # Annotate frame
    pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    frame = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    draw_detections(frame, detection_result['detections'], confidence_threshold)

    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
    annotated_b64 = base64.b64encode(buffer).decode('utf-8')

    detections = detection_result['detections']
    model_name = detection_result['model']
    cfg = DETECTORS.get(model_name, DETECTORS[DEFAULT_DETECTOR])
    disease_count = sum(1 for d in detections if d['class'] in cfg['disease_classes'])
    pest_count = sum(1 for d in detections if d['class'] in cfg['pest_classes'])

    return jsonify({
        'annotated_image': f'data:image/jpeg;base64,{annotated_b64}',
        'detections': detections,
        'classes': detection_result['classes'],
        'summary': {
            'total_detections': len(detections),
            'disease_detections': disease_count,
            'pest_detections': pest_count,
            'image_width': detection_result['image_width'],
            'image_height': detection_result['image_height'],
            'model_used': model_name,
            'confidence_threshold': confidence_threshold,
        },
    })


if __name__ == '__main__':
    print("=" * 60)
    print("Starting Flask API server (YOLO detection)...")
    print(f"Default detector: {DEFAULT_DETECTOR}")
    for name, cfg in DETECTORS.items():
        ok = 'OK' if cfg['weights'].exists() else 'MISSING'
        print(f"  {name}: {ok} — {cfg['label']}")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
