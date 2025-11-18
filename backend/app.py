import os
import requests
import tensorflow as tf
from flask import Flask, request, jsonify

app = Flask(__name__)

MODEL_URL = "https://drive.google.com/uc?export=download&id=1is6-DFbHmVhRjTEq3zDossNAQoHn_mJO"
MODEL_PATH = "model/model.h5"

def download_model():
    if not os.path.exists("model"):
        os.makedirs("model")

    if not os.path.exists(MODEL_PATH):
        print("Downloading model...")
        r = requests.get(MODEL_URL)
        open(MODEL_PATH, "wb").write(r.content)
        print("Model downloaded!")

download_model()

model = tf.keras.models.load_model(MODEL_PATH)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json["input"]
    prediction = model.predict([data])
    return jsonify({"output": prediction.tolist()})

if __name__ == "__main__":
    app.run(debug=True)

