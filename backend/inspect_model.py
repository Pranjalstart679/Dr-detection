import tensorflow as tf
import os

MODEL_PATH = "model/model.h5"

if os.path.exists(MODEL_PATH):
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully!")
        model.summary()
        print("Input shape:", model.input_shape)
        print("Output shape:", model.output_shape)
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Model file not found at {MODEL_PATH}")
