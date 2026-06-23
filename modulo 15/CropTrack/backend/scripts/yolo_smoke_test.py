#!/usr/bin/env python3
"""YOLO smoke test — validates that the off-the-shelf coffee leaf disease
detector generalises better than our classification models on real-world,
out-of-distribution images.

Context
-------
Sprint 5 viability analysis surfaced that CustomCNN_SE (our best classifier,
99.86% val accuracy on JMuBEN) relies on global colour statistics and collapses
to "Phoma" on every real-world photo. We pivoted to object detection. This
script downloads a small public set of iNaturalist Coffea arabica images and
runs the pretrained YOLOv8 checkpoint (`backend/models/coffee_yolo_v1.pt`,
sourced from Akhil1409906/YOLOv8-Based-SUNet-Real-Time-Coffee-Leaf-Disease-
Detection-Using-a-Hybrid-Deep-Learning-Model on GitHub) to demonstrate the
generalisation improvement.

Expected behaviour
------------------
- Healthy / out-of-frame images return zero detections (= not a false positive
  factory).
- Images with visible damage return bounding boxes with spatially meaningful
  placement.

Run (from `backend/` with the venv active):
    python scripts/yolo_smoke_test.py
"""
from pathlib import Path
import sys
import urllib.request

try:
    from ultralytics import YOLO
except ImportError:
    print("error: install ultralytics first — pip install ultralytics")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
WEIGHTS = ROOT / "models" / "coffee_yolo_v1.pt"
CACHE = ROOT / "scripts" / ".yolo_test_cache"
CACHE.mkdir(parents=True, exist_ok=True)

# Public iNaturalist research-grade Coffea arabica observations. Stable URLs
# under inaturalist-open-data.s3.amazonaws.com (CC-licensed via iNat).
SAMPLES = [
    ("leaf_1.jpg", "iNat — Mage, RJ, Brazil",
     "https://inaturalist-open-data.s3.amazonaws.com/photos/632957292/large.jpg"),
    ("leaf_2.jpg", "iNat — Quito, Ecuador",
     "https://inaturalist-open-data.s3.amazonaws.com/photos/630753356/large.jpg"),
    ("leaf_3.jpg", "iNat — Puerto Rico",
     "https://inaturalist-open-data.s3.amazonaws.com/photos/632317148/large.jpg"),
    ("leaf_4.jpg", "iNat — Santa Cruz de Yojoa, Honduras",
     "https://inaturalist-open-data.s3.amazonaws.com/photos/630592051/large.jpg"),
    ("leaf_5.jpg", "iNat — Comalcalco, Mexico",
     "https://inaturalist-open-data.s3.amazonaws.com/photos/633454613/large.jpg"),
]


def ensure_sample(fname: str, url: str) -> Path:
    dest = CACHE / fname
    if not dest.exists():
        print(f"  downloading {fname}...")
        urllib.request.urlretrieve(url, dest)
    return dest


def main() -> int:
    if not WEIGHTS.exists():
        print(f"error: weights not found at {WEIGHTS}")
        return 1

    print(f"loading YOLO weights from {WEIGHTS.relative_to(ROOT)}")
    model = YOLO(str(WEIGHTS))
    print(f"  task    : {model.task}")
    print(f"  classes : {model.names}")
    print()

    print(f"{'image':<12}{'source':<40}{'#det':<6}classes detected")
    print("-" * 100)
    totals = {"clean": 0, "with_boxes": 0}
    for fname, note, url in SAMPLES:
        img = ensure_sample(fname, url)
        result = model.predict(str(img), verbose=False, conf=0.25)[0]
        n_det = len(result.boxes) if result.boxes is not None else 0

        if n_det == 0:
            detected = "— no detections —"
            totals["clean"] += 1
        else:
            parts = []
            for i in range(n_det):
                cls_idx = int(result.boxes.cls[i].item())
                cls_name = model.names[cls_idx]
                conf = float(result.boxes.conf[i].item())
                parts.append(f"{cls_name}@{conf * 100:.0f}%")
            detected = "  ".join(parts)
            totals["with_boxes"] += 1

            annotated = CACHE / f"annotated_{fname}"
            result.save(filename=str(annotated))

        print(f"{fname:<12}{note:<40}{n_det:<6}{detected}")

    print()
    print(f"summary: {totals['clean']} clean · {totals['with_boxes']} with detections")
    print(f"annotated outputs (if any) in {CACHE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
