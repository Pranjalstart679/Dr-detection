import os
import uuid
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Model Setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "final_inceptionv3_model_L_97.h5")
model = None

# Class labels
CLASS_LABELS = {
    0: 'No DR (Normal)',
    1: 'Mild DR',
    2: 'Moderate DR',
    3: 'Severe DR',
    4: 'Proliferative DR'
}

BINARY_LABELS = {
    0: 'Normal (No DR)',
    1: 'Abnormal (DR Detected)'
}

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            print(f"Loading model from {MODEL_PATH}...")
            model = tf.keras.models.load_model(MODEL_PATH)
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Model file not found at {MODEL_PATH}. Using mock predictions.")

# load_model()  # Removed global call for lazy loading

# Database Setup
DB_PATH = 'local_db.sqlite'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    # Create tables
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS patients 
                 (id TEXT PRIMARY KEY, userId TEXT, firstName TEXT, lastName TEXT, 
                  dateOfBirth TEXT, gender TEXT, medicalRecordNumber TEXT, 
                  diabetesType TEXT, createdAt TEXT, lastScreening TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS predictions 
                 (id TEXT PRIMARY KEY, patientId TEXT, userId TEXT, imageUrl TEXT, 
                  stage TEXT, confidence REAL, recommendation TEXT, createdAt TEXT,
                  binaryClass TEXT, binaryConfidence REAL, probabilities TEXT)''')
    
    # Migration: Add new columns if they don't exist
    try:
        c.execute('ALTER TABLE predictions ADD COLUMN binaryClass TEXT')
        c.execute('ALTER TABLE predictions ADD COLUMN binaryConfidence REAL')
        c.execute('ALTER TABLE predictions ADD COLUMN probabilities TEXT')
    except sqlite3.OperationalError:
        pass # Columns likely exist

    conn.commit()
    conn.close()

init_db()

# --- Routes ---

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    conn = get_db()
    try:
        user_id = str(uuid.uuid4())
        conn.execute('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)',
                     (user_id, email, password, name))
        conn.commit()
        return jsonify({'user': {'id': user_id, 'email': email, 'name': name}, 'token': user_id})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
    conn.close()
    
    if user:
        # In a real app, generate a JWT token. Here we use the user ID as a simple token.
        return jsonify({'user': {'id': user['id'], 'email': user['email'], 'name': user['name']}, 'token': user['id']})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/patients', methods=['GET'])
def get_patients():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401
        
    conn = get_db()
    patients = conn.execute('SELECT * FROM patients WHERE userId = ?', (token,)).fetchall()
    conn.close()
    
    return jsonify({'patients': [dict(p) for p in patients]})

@app.route('/patients', methods=['POST'])
def create_patient():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    patient_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()
    
    conn = get_db()
    conn.execute('''INSERT INTO patients (id, userId, firstName, lastName, dateOfBirth, 
                    gender, medicalRecordNumber, diabetesType, createdAt) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                 (patient_id, token, data.get('firstName'), data.get('lastName'), 
                  data.get('dateOfBirth'), data.get('gender'), data.get('medicalRecordNumber'), 
                  data.get('diabetesType'), created_at))
    conn.commit()
    conn.close()
    
    return jsonify({'patient': {**data, 'id': patient_id, 'userId': token, 'createdAt': created_at}})

@app.route('/upload-image', methods=['POST'])
def upload_image():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    
    file = request.files['image']
    patient_id = request.form.get('patientId')
    
    if file:
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # URL to access the image
        image_url = f"http://localhost:5000/uploads/{filename}"
        
        # --- PREDICTION LOGIC ---
        stage = "No DR"
        confidence = 0.0
        recommendation = "Routine follow-up in 12 months."
        binary_class = "Normal"
        binary_confidence = 0.0
        probabilities = [0.0] * 5
        
        # Lazy load model
        global model
        if model is None:
            print("Loading model for the first time... This may take a while.")
            load_model()
            print("Model loaded successfully.")

        
        if model:
            try:
                print(f"Processing image: {filename}")
                # Load and preprocess image
                img = tf.keras.utils.load_img(file_path, target_size=(224, 224))
                img_array = tf.keras.utils.img_to_array(img)
                img_array = np.expand_dims(img_array, axis=0)
                img_array = img_array / 255.0  # Normalize
                
                print("Running prediction...")
                # Predict
                preds = model.predict(img_array, verbose=0)
                print("Prediction complete.")
                predictions = preds[0]
                predicted_class = np.argmax(predictions)
                confidence = float(np.max(predictions))
                probabilities = [float(p) for p in predictions]
                
                # Binary classification logic
                normal_prob = predictions[0]
                abnormal_prob = np.sum(predictions[1:])
                
                if normal_prob > abnormal_prob:
                    binary_class = "Normal (No DR)"
                    binary_confidence = float(normal_prob)
                else:
                    binary_class = "Abnormal (DR Detected)"
                    binary_confidence = float(abnormal_prob)
                
                stage = CLASS_LABELS[predicted_class]
                
                if predicted_class == 0:
                    recommendation = "Routine follow-up in 12 months."
                else:
                    recommendation = "Consult with an ophthalmologist for proper diagnosis."
                    
            except Exception as e:
                print(f"Error during prediction: {e}")
                # Fallback to mock if prediction fails
                stage = "Error"
                confidence = 0.0
                recommendation = "Prediction failed. Please try again."
        
        prediction_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        
        import json
        probs_json = json.dumps(probabilities)
        
        conn = get_db()
        conn.execute('''INSERT INTO predictions (id, patientId, userId, imageUrl, stage, confidence, recommendation, createdAt, binaryClass, binaryConfidence, probabilities)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                     (prediction_id, patient_id, token, image_url, stage, confidence, recommendation, created_at, binary_class, binary_confidence, probs_json))
        
        # Update patient last screening
        conn.execute('UPDATE patients SET lastScreening = ? WHERE id = ?', (created_at, patient_id))
        conn.commit()
        conn.close()
        
        return jsonify({'prediction': {'id': prediction_id, 'stage': stage, 'confidence': confidence, 
                                       'recommendation': recommendation, 'imageUrl': image_url,
                                       'binaryClass': binary_class, 'binaryConfidence': binary_confidence,
                                       'probabilities': probabilities}})

@app.route('/predictions/<patient_id>', methods=['GET'])
def get_predictions(patient_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    predictions = conn.execute('SELECT * FROM predictions WHERE patientId = ?', (patient_id,)).fetchall()
    conn.close()
    return jsonify({'predictions': [dict(p) for p in predictions]})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

