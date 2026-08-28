import os
import io
from typing import Dict

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from tensorflow import keras
from PIL import Image
import numpy as np

# ----------------- CONFIG -----------------

# Path to model – can be overridden by env var on Render
MODEL_PATH = os.getenv("MODEL_PATH", "best_inceptionv3_finetuned_S_93.h5")

# InceptionV3 expects 299x299 images
IMAGE_SIZE = (299, 299)  # (width, height)

# Make sure this matches your training labels / indices
DR_STAGES: Dict[int, str] = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR",
}

# Choose ONE normalization (must match training)
def normalize(img_array: np.ndarray) -> np.ndarray:
    # InceptionV3 preprocessing: [-1, 1] normalization
    return (img_array / 127.5) - 1.0


# ----------------- FASTAPI SETUP -----------------

app = FastAPI(title="DR ML Service (FastAPI)")

# Allow frontend / Supabase to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # in prod: restrict to your domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class PredictionResponse(BaseModel):
    stage_index: int
    stage_label: str
    confidence: float
    recommendation: str


# ----------------- STARTUP: LOAD MODEL -----------------

@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found at {MODEL_PATH}")
    print(f"Loading model from {MODEL_PATH}...")
    model = keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
    print("Input shape:", model.input_shape)


# ----------------- ROUTES -----------------

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", model_loaded=model is not None)


@app.post("/predict", response_model=PredictionResponse)
async def predict(image: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # Check file type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read image bytes
    image_bytes = await image.read()

    try:
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image")

    # Preprocess
    pil_image = pil_image.resize(IMAGE_SIZE)   # (width, height)
    img_array = np.array(pil_image).astype("float32")
    img_array = normalize(img_array)
    img_array = np.expand_dims(img_array, axis=0)  # (1, H, W, C)

    # Run prediction
    preds = model.predict(img_array)
    # If model outputs logits/probabilities for classes:
    probs = preds[0]
    class_idx = int(np.argmax(probs))
    confidence = float(probs[class_idx])

    stage_label = DR_STAGES.get(class_idx, f"Class {class_idx}")

    # You can customize this logic
    if class_idx == 0:
        recommendation = "No DR detected. Regular annual screening recommended."
    else:
        recommendation = (
            "Signs of diabetic retinopathy detected. Recommend ophthalmologist review."
        )

    return PredictionResponse(
        stage_index=class_idx,
        stage_label=stage_label,
        confidence=confidence,
        recommendation=recommendation,
    )


# For local testing: `python app.py`
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
