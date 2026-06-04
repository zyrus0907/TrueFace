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


def error_level_analysis(img: Image.Image, quality: int = 90) -> float:
    """Recompress and measure difference. Edited regions often differ more."""
    rgb = img.convert("RGB")
    buf = io.BytesIO()
    rgb.save(buf, "JPEG", quality=quality)
    buf.seek(0)
    recompressed = Image.open(buf)
    diff = ImageChops.difference(rgb, recompressed)
    extrema = diff.getextrema()
    return float(max(channel_max for _, channel_max in extrema))


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    raw = await file.read()
    img = Image.open(io.BytesIO(raw))

    signals = []
    exif = img.getexif()

    software = exif.get(305)  # 305 = Software tag
    signals.append({
        "name": "editing_software_tag",
        "detail": f"Metadata names software: {software}" if software
                  else "No editing-software tag in metadata.",
        "suspicion": 0.6 if software else 0.1,
    })

    has_exif = len(exif) > 0
    signals.append({
        "name": "metadata_present",
        "detail": "Camera metadata present." if has_exif
                  else "Metadata stripped (common after editing or screenshots).",
        "suspicion": 0.1 if has_exif else 0.4,
    })

    ela_max = error_level_analysis(img)
    signals.append({
        "name": "error_level_analysis",
        "detail": f"Max recompression difference: {ela_max:.0f}/255.",
        "suspicion": round(min(ela_max / 255.0, 1.0), 2),
    })

    avg_suspicion = sum(s["suspicion"] for s in signals) / len(signals)
    authenticity_score = round((1 - avg_suspicion) * 100)

    return {
        "authenticity_score": authenticity_score,
        "signals": signals,
        "disclaimer": "Heuristic estimate, not a definitive verdict. "
                      "Can produce false positives; do not treat as proof.",
    }
