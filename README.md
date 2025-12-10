# DR Detection - AI Diabetic Retinopathy Screening Application

A full-stack web application for diabetic retinopathy screening using AI/ML with InceptionV3 deep learning model.

The original Figma design is available at https://www.figma.com/design/PgXczQzP3Tx1UMoeG1P0N9/AI-Diabetic-Retinopathy-Web-App.

## 🌟 Features

- 👤 User authentication and patient management
- 📸 Fundus image upload and analysis
- 🤖 Real-time AI predictions using InceptionV3
- 📊 Patient history and screening reports
- 🔒 Secure image storage with Supabase
- 📱 Responsive design for desktop and mobile

## 🚀 Quick Start

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Start ML Service

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python app.py
```

The ML service will be available at `http://localhost:5000`

### 3. Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Complete Setup Guide

For complete deployment instructions including Supabase setup and production deployment:

👉 **See [SETUP_GUIDE.md](./SETUP_GUIDE.md)** for detailed step-by-step instructions

## 🧪 Quick Test

Test the ML service is working:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test prediction (replace with your image path)
curl -X POST -F "image=@path/to/fundus_image.jpg" http://localhost:5000/predict
```

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase Edge Functions (Deno + Hono)
- **ML Service:** FastAPI + TensorFlow 2.15 + InceptionV3
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth

## 📁 Project Structure

```
Dr-detection/
├── src/                      # Frontend React application
├── ml-service/              # ML API service (FastAPI)
│   ├── app.py              # ML service
│   ├── requirements.txt    # Python dependencies
│   └── best_inceptionv3_finetuned_S_93.h5  # Your trained model
└── SETUP_GUIDE.md          # Complete deployment guide
```

## 🔧 Configuration Files Updated

✅ **ml-service/app.py** - Configured for InceptionV3 (299x299, [-1,1] normalization)
✅ **ml-service/requirements.txt** - Pinned dependency versions
✅ **src/supabase/functions/server/index.tsx** - Integrated real ML API calls
✅ **Backend now calls your actual ML model instead of mock predictions**

## 📝 What You Need To Do

1. ✅ Install dependencies (see Quick Start above)
2. ⚠️ Update `src/utils/supabase/info.tsx` with your Supabase credentials
3. ⚠️ Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete deployment

## 🐛 Troubleshooting

- **ML Service not starting?** Check Python 3.9+ is installed and virtual environment is activated
- **Still seeing mock predictions?** Make sure ML_API_URL is configured in Supabase
- **Frontend errors?** Update Supabase credentials in `src/utils/supabase/info.tsx`

For detailed troubleshooting, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup and deployment guide (START HERE!)
- Model: InceptionV3 fine-tuned for DR detection (5 classes)

---

**Ready to deploy?** Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for step-by-step instructions! 🚀

  