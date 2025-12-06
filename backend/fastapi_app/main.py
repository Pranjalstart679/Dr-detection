from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = FastAPI()

# Allow CORS for local development and production
# In production, you might want to restrict this to your Vercel app's domain
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    # Add your Vercel app URL here later, e.g., "https://your-app.vercel.app"
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
# We use a relative path assuming the server is run from the 'fastapi_app' directory
# or the root directory. We'll try to find it.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "..", "models", "best_inceptionv3_finetuned_S_93.h5")

print(f"Loading model from: {MODEL_PATH}")

model = None
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    print("Ensure you have 'tensorflow' installed and the model file exists.")

def preprocess_image(image_bytes):
    """
    Preprocess the image to match InceptionV3 requirements.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((299, 299)) # InceptionV3 standard size
    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0 # Normalize to [0, 1]
    return img_array

@app.get("/")
def read_root():
    return {"message": "Dr-Detection API is running. Use /predict to analyze images."}

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        contents = await image.read()
        processed_image = preprocess_image(contents)

        prediction = model.predict(processed_image)
        predicted_class_index = np.argmax(prediction, axis=1)[0]
        confidence = float(np.max(prediction))

        # Map index to string labels based on your training
        # UPDATE THESE LABELS to match your actual model's classes
        labels = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative']
        
        if predicted_class_index < len(labels):
            result_label = labels[predicted_class_index]
        else:
            result_label = "Unknown"

        return {
            "prediction": result_label,
            "confidence": confidence,
            "raw_output": prediction.tolist()
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
