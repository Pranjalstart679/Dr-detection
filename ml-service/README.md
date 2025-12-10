# ML Service - Diabetic Retinopathy Detection API

FastAPI service for DR detection using InceptionV3 deep learning model.

## 📋 Model Information

- **Model File:** `best_inceptionv3_finetuned_S_93.h5`
- **Architecture:** InceptionV3 (fine-tuned)
- **Input Size:** 299x299x3 RGB images
- **Preprocessing:** [-1, 1] normalization
- **Output:** 5 classes (DR stages 0-4)
- **Framework:** TensorFlow 2.15

## 🚀 Quick Start

### 1. Set Up Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# Activate (Windows CMD)
venv\Scripts\activate.bat

# Activate (Mac/Linux)
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI 0.104.1
- TensorFlow 2.15.0
- Pillow 10.1.0
- Uvicorn 0.24.0
- Gunicorn 21.2.0
- NumPy 1.26.2

### 3. Verify Model

```bash
# Check model file exists
ls best_inceptionv3_finetuned_S_93.h5

# Check model details (optional)
python -c "from tensorflow import keras; m = keras.models.load_model('best_inceptionv3_finetuned_S_93.h5'); print('Input:', m.input_shape); print('Output:', m.output_shape)"
```

### 4. Start Service

```bash
# Development mode (with auto-reload)
python app.py

# Production mode
gunicorn app:app --bind 0.0.0.0:5000 --workers 1 --timeout 120
```

Service will be available at: `http://localhost:5000`

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "model_loaded": true
}
```

**Example:**
```bash
curl http://localhost:5000/health
```

### Predict DR Stage

```bash
POST /predict
Content-Type: multipart/form-data
```

**Parameters:**
- `image` (file): Fundus image (JPEG, PNG)

**Response:**
```json
{
  "stage_index": 0,
  "stage_label": "No DR",
  "confidence": 0.92,
  "recommendation": "No DR detected. Regular annual screening recommended."
}
```

**Example:**
```bash
curl -X POST \
  -F "image=@fundus_image.jpg" \
  http://localhost:5000/predict
```

## 🎯 DR Stage Classifications

| Index | Label | Description |
|-------|-------|-------------|
| 0 | No DR | No diabetic retinopathy detected |
| 1 | Mild DR | Mild non-proliferative DR |
| 2 | Moderate DR | Moderate non-proliferative DR |
| 3 | Severe DR | Severe non-proliferative DR |
| 4 | Proliferative DR | Proliferative DR (advanced stage) |

## 🔧 Configuration

### Environment Variables

- `MODEL_PATH` - Path to model file (default: `best_inceptionv3_finetuned_S_93.h5`)

### Model Configuration

Edit `app.py` if you need to adjust:

```python
# Image input size (must match model training)
IMAGE_SIZE = (299, 299)  # InceptionV3 standard

# Preprocessing normalization (must match training)
def normalize(img_array):
    return (img_array / 127.5) - 1.0  # [-1, 1] range
```

### DR Stage Labels

Customize in `app.py`:

```python
DR_STAGES = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR",
}
```

### Recommendations

Customize recommendations in `app.py` (lines 119-126):

```python
if class_idx == 0:
    recommendation = "No DR detected. Regular annual screening recommended."
else:
    recommendation = "Signs of diabetic retinopathy detected. Recommend ophthalmologist review."
```

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:5000/health
```

Expected: `{"status":"ok","model_loaded":true}`

### Test Prediction

```bash
# With a real fundus image
curl -X POST -F "image=@path/to/fundus.jpg" http://localhost:5000/predict

# Expected output format:
# {
#   "stage_index": 2,
#   "stage_label": "Moderate DR",
#   "confidence": 0.84,
#   "recommendation": "Signs of diabetic retinopathy detected..."
# }
```

### Test with Python

```python
import requests

# Health check
response = requests.get('http://localhost:5000/health')
print(response.json())

# Prediction
with open('fundus_image.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post('http://localhost:5000/predict', files=files)
    print(response.json())
```

## 📊 Performance

### Expected Response Times

- Health check: < 100ms
- First prediction: 2-5 seconds (model initialization)
- Subsequent predictions: 0.5-2 seconds (CPU) or 0.1-0.5 seconds (GPU)

### Memory Usage

- Base: ~500MB (FastAPI + dependencies)
- Model loaded: ~1.5GB - 2GB (InceptionV3)
- Per request: ~100MB additional (temporary)

### Optimization Tips

1. **Use GPU for faster inference:**
   - Install `tensorflow-gpu` instead of `tensorflow`
   - Requires CUDA-compatible GPU

2. **Reduce model size:**
   - Use TensorFlow Lite
   - Apply quantization
   - Prune unnecessary layers

3. **Batch processing:**
   - Modify endpoint to accept multiple images
   - Process in batches for efficiency

4. **Caching:**
   - Cache predictions for duplicate images
   - Use Redis for distributed caching

## 🚀 Deployment

### Deploy to Render.com

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: dr-ml-service
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120
    envVars:
      - key: MODEL_PATH
        value: best_inceptionv3_finetuned_S_93.h5
```

2. Push to GitHub and connect to Render

3. Set build command: `pip install -r requirements.txt`

4. Set start command: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`

### Deploy to Railway.app

1. Connect GitHub repository

2. Set root directory: `ml-service`

3. Railway auto-detects Python and runs:
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn app:app --bind 0.0.0.0:$PORT`

4. Add environment variable:
   - `MODEL_PATH=best_inceptionv3_finetuned_S_93.h5`

### Deploy to AWS Lambda

For serverless deployment, requires additional setup:
- Convert to TensorFlow Lite
- Use Lambda layers for dependencies
- Increase timeout (30+ seconds)
- Increase memory (2GB+)

## 🐛 Troubleshooting

### Model Not Loading

**Error:** `Model file not found at best_inceptionv3_finetuned_S_93.h5`

**Solutions:**
1. Check file exists: `ls best_inceptionv3_finetuned_S_93.h5`
2. Check file path is correct
3. If deployed, ensure model is uploaded to server

### Out of Memory

**Error:** `ResourceExhausted` or `OOM`

**Solutions:**
1. Reduce batch size (if batch processing)
2. Use CPU-only TensorFlow: `tensorflow-cpu`
3. Increase system RAM
4. Consider model optimization

### Slow Predictions

**Issue:** Predictions taking > 30 seconds

**Solutions:**
1. Use GPU instance
2. Upgrade hosting plan (more CPU/RAM)
3. Optimize model (quantization)
4. Reduce image size if possible

### Wrong Predictions

**Issue:** Model predictions don't match expectations

**Solutions:**
1. Verify preprocessing matches training:
   - Image size (299x299)
   - Normalization ([-1, 1])
2. Check if model file is correct version
3. Validate input image quality
4. Review class indices mapping

### CORS Errors

**Error:** Browser blocking requests

**Solution:** Already configured in `app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, restrict to your domain:
```python
allow_origins=["https://your-app.vercel.app"],
```

## 🔒 Security Considerations

### Current Setup (Development)

- ✅ CORS enabled for all origins
- ⚠️ No authentication required
- ⚠️ No rate limiting

### Production Recommendations

1. **Add API Authentication:**
```python
from fastapi import Header, HTTPException

async def verify_api_key(x_api_key: str = Header()):
    if x_api_key != "your-secret-key":
        raise HTTPException(status_code=401)
```

2. **Add Rate Limiting:**
```bash
pip install slowapi
```

3. **Restrict CORS:**
```python
allow_origins=["https://your-frontend-domain.com"]
```

4. **Add Input Validation:**
- File size limits
- File type verification
- Malware scanning

## 📈 Monitoring

### Logs

```bash
# View logs (development)
# Already logging to console in app.py

# Production logs on Render
# View in Render dashboard → Logs tab
```

### Health Monitoring

Set up monitoring to ping `/health` endpoint:
- UptimeRobot (free)
- Pingdom
- Datadog

### Error Tracking

Consider integrating:
- Sentry (error tracking)
- LogRocket (session replay)
- CloudWatch (AWS)

## 📝 API Response Examples

### Successful Prediction

```json
{
  "stage_index": 2,
  "stage_label": "Moderate DR",
  "confidence": 0.8456,
  "recommendation": "Signs of diabetic retinopathy detected. Recommend ophthalmologist review."
}
```

### Error Responses

**Invalid file type:**
```json
{
  "detail": "File must be an image"
}
```

**Model not loaded:**
```json
{
  "detail": "Model not loaded"
}
```

**Invalid image:**
```json
{
  "detail": "Could not read image"
}
```

## 🛠️ Development

### Project Structure

```
ml-service/
├── app.py                                    # FastAPI application
├── requirements.txt                          # Python dependencies
├── best_inceptionv3_finetuned_S_93.h5       # Trained model
├── venv/                                     # Virtual environment
└── README.md                                 # This file
```

### Running Tests

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest test_app.py
```

### Code Format

```bash
# Install formatters
pip install black isort

# Format code
black app.py
isort app.py
```

## 🤝 Contributing

When updating the model:
1. Train new model
2. Save as `.h5` file
3. Update `MODEL_PATH` in `app.py`
4. Verify input size and preprocessing
5. Test locally before deploying
6. Update version in commits

## 📚 Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com
- **TensorFlow Guide:** https://www.tensorflow.org/guide
- **InceptionV3 Paper:** https://arxiv.org/abs/1512.00567
- **Pillow Docs:** https://pillow.readthedocs.io

---

**Questions?** See [SETUP_GUIDE.md](../SETUP_GUIDE.md) in the project root.
