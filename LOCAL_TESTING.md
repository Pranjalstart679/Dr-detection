# Quick Local Test Guide

## Current Situation

Your terminals show:
- ✅ ML service is running on `http://localhost:5000`
- ✅ Frontend is running on `http://localhost:3000`

However, the frontend **cannot work** without Supabase being configured because:
- The frontend calls Supabase Edge Functions for all backend operations
- You need to complete Steps 3-6 in SETUP_GUIDE.md first

## Test What You Have Now

### 1. Test ML Service Health

Open a new PowerShell terminal:

```powershell
# Test health endpoint
curl http://localhost:5000/health
```

Expected output: `{"status":"ok","model_loaded":true}`

### 2. Test ML Prediction with Image

```powershell
# Replace path with your actual fundus image
curl -X POST -F "image=@C:\path\to\your\fundus_image.jpg" http://localhost:5000/predict
```

Expected output:
```json
{
  "stage_index": 0,
  "stage_label": "No DR",
  "confidence": 0.92,
  "recommendation": "No DR detected. Regular annual screening recommended."
}
```

### 3. Use the Test Script

```powershell
cd ml-service
venv\Scripts\Activate.ps1
python test_ml_service.py C:\path\to\fundus_image.jpg
```

This will run automated tests and show results.

## To Test the Full Application

You MUST complete these steps from SETUP_GUIDE.md:

1. **Step 3:** Create Supabase project (5 min)
2. **Step 4:** Deploy Edge Function (10 min)
3. **Step 6:** Set ML_API_URL in Supabase to `http://localhost:5000` (for local testing)

Then your frontend will work!

## Alternative: Mock the Backend Temporarily

If you want to see the frontend UI working without Supabase, the app currently can't do that. It requires Supabase for authentication and storage.

## Next Action

Choose one:

**A) Test ML service only** (Quick, 2 minutes)
- Run the test commands above
- Verify your model works

**B) Complete Supabase setup** (20 minutes)
- Follow Steps 3-6 in SETUP_GUIDE.md
- Get full application working

**Recommendation:** Start with Option A to verify your ML service works, then do Option B when you have 20 minutes.
