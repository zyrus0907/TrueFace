import io
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageChops

app = FastAPI(title="TrueFace Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

AI_MODEL = "dima806/ai_vs_real_image_detection"
_classifier = None


def get_classifier():
    global _classifier
    if _classifier is None:
        from transformers import pipeline
        _classifier = pipeline("image-classification", model=AI_MODEL)
    return _classifier


def error_level_analysis(img: Image.Image, quality: int = 90) -> float:
    rgb = img.convert("RGB")
    buf = io.BytesIO()
    rgb.save(buf, "JPEG", quality=quality)
    buf.seek(0)
    recompressed = Image.open(buf)
    diff = ImageChops.difference(rgb, recompressed)
    return float(max(channel_max for _, channel_max in diff.getextrema()))


def ai_generation_suspicion(img: Image.Image):
    keywords = ("ai", "artificial", "fake", "generated", "synthetic", "sdxl")
    try:
        clf = get_classifier()
        preds = clf(img.convert("RGB"))
        for p in preds:
            if any(k in p["label"].lower() for k in keywords):
                return float(p["score"]), p["label"]
        return 0.0, "no AI-class label matched"
    except Exception as e:
        return None, str(e)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    raw = await file.read()
    img = Image.open(io.BytesIO(raw))

    exif = img.getexif()
    software = exif.get(305)
    has_exif = len(exif) > 0
    ela_max = error_level_analysis(img)

    # Trustworthy forensic signals — these alone determine the score.
    forensic = [
        {
            "name": "editing_software_tag",
            "detail": f"Metadata names software: {software}" if software
                      else "No editing-software tag in metadata.",
            "suspicion": 0.6 if software else 0.1,
        },
        {
            "name": "metadata_present",
            "detail": "Camera metadata present." if has_exif
                      else "Metadata stripped (common after editing or screenshots).",
            "suspicion": 0.1 if has_exif else 0.4,
        },
        {
            "name": "error_level_analysis",
            "detail": f"Max recompression difference: {ela_max:.0f}/255.",
            "suspicion": round(min(ela_max / 255.0, 1.0), 2),
        },
    ]

    avg = sum(s["suspicion"] for s in forensic) / len(forensic)
    authenticity_score = round((1 - avg) * 100)

    signals = list(forensic)

    # Experimental AI signal: shown for transparency, NOT counted in the score,
    # because open AI-image detectors false-positive heavily on real photos.
    ai_susp, note = ai_generation_suspicion(img)
    if ai_susp is not None:
        signals.append({
            "name": "ai_generated_likelihood",
            "detail": f"Classifier says {ai_susp * 100:.0f}% ({note}). Experimental and "
                      "often wrong on real photos — not counted toward the score.",
            "suspicion": round(ai_susp, 2),
            "experimental": True,
        })

    return {
        "authenticity_score": authenticity_score,
        "signals": signals,
        "disclaimer": "Heuristic estimate, not a definitive verdict. "
                      "Can produce false positives; do not treat as proof.",
    }
