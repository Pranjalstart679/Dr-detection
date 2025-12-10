# 🚀 Complete Setup Guide - DR Detection Web Application

This guide will help you get your Diabetic Retinopathy detection application fully operational with your trained InceptionV3 model.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Python 3.9+ installed
- ✅ Node.js 18+ and npm/pnpm installed
- ✅ Your trained model file: `best_inceptionv3_finetuned_S_93.h5`
- ✅ A Supabase account (free tier works)
- ✅ A Render.com or Railway.app account (for ML service hosting)

---

## Part 1: Local Development Setup

### Step 1: Set Up ML Service Locally (10 minutes)

1. **Navigate to ML service directory:**
   ```bash
   cd ml-service
   ```

2. **Create and activate virtual environment:**
   ```bash
   # Create venv
   python -m venv venv
   
   # Activate (Windows PowerShell)
   venv\Scripts\Activate.ps1
   
   # Activate (Windows CMD)
   venv\Scripts\activate.bat
   
   # Activate (Mac/Linux)
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   
   ⏱️ This may take 5-10 minutes (TensorFlow is large)

4. **Verify your model is in place:**
   ```bash
   ls best_inceptionv3_finetuned_S_93.h5
   ```
   ✅ You should see the file listed

5. **Start the ML service:**
   ```bash
   python app.py
   ```
   
   You should see:
   ```
   Loading model from best_inceptionv3_finetuned_S_93.h5...
   Model loaded successfully!
   Input shape: (None, 299, 299, 3)
   INFO:     Uvicorn running on http://0.0.0.0:5000
   ```

6. **Test in a NEW terminal (keep the server running):**
   ```bash
   # Test health endpoint
   curl http://localhost:5000/health
   # Should return: {"status":"ok","model_loaded":true}
   
   # Test with an image (replace with your fundus image path)
   curl -X POST -F "image=@path/to/fundus_image.jpg" http://localhost:5000/predict
   ```

✅ **Success:** If you get a JSON response with prediction results, your ML service is working!

---

### Step 2: Test ML Service (5 minutes) ⭐ DO THIS FIRST

Before setting up the full application, let's verify your ML service works:

1. **Keep ML service running** (from Step 1)

2. **Open a NEW terminal and test:**
   ```bash
   # Test health endpoint
   curl http://localhost:5000/health
   # Should return: {"status":"ok","model_loaded":true}
   ```

3. **Test with an image (recommended):**
   ```bash
   cd ml-service
   venv\Scripts\Activate.ps1  # Windows
   # source venv/bin/activate  # Mac/Linux
   
   # Run test script with your fundus image
   python test_ml_service.py path\to\fundus_image.jpg
   ```

✅ **If tests pass, your ML service is ready!** You can now proceed to set up the frontend and Supabase.

⚠️ **Important:** The frontend requires Supabase to work. You cannot test the full application until Steps 3-6 are complete.

---

### Step 2b: Set Up Frontend (Optional - for later)

You can install frontend dependencies now, but **the app won't work until Supabase is configured** (Steps 3-6):

1. **Open a new terminal and navigate to project root:**
   ```bash
   cd ..  # Go back to project root
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **DON'T start the frontend yet** - it won't work without Supabase configuration

⚠️ **Note:** The frontend connects to Supabase Edge Functions, which you'll deploy in Step 4. Without Supabase, the frontend cannot function.

---

## Part 2: Supabase Backend Setup

### Step 3: Create Supabase Project (5 minutes)

1. **Go to https://supabase.com** and sign in

2. **Create a new project:**
   - Click "New Project"
   - Name: `dr-detection` (or any name you prefer)
   - Database Password: Choose a strong password (save it!)
   - Region: Select closest to you
   - Click "Create new project"
   
   ⏱️ Wait 2-3 minutes for project creation

3. **Get your project credentials:**
   - Go to Settings → API
   - Copy these values:
     - **Project URL:** `https://xxxxx.supabase.co`
     - **Project ID:** `xxxxx` (from the URL)
     - **anon/public key:** `eyJhbGc...` (long string)

4. **Update your frontend configuration:**
   - Open `src/utils/supabase/info.tsx`
   - Replace with your values:
   ```typescript
   export const projectId = "your-project-id";  // From URL
   export const publicAnonKey = "your-anon-key";  // The long eyJhbGc... string
   ```

---

### Step 4: Deploy Supabase Edge Function (10 minutes)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   # or
   brew install supabase/tap/supabase  # Mac
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```
   Follow the prompts to authenticate

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-id
   ```
   Use the password you created earlier

4. **Deploy the Edge Function:**
   ```bash
   supabase functions deploy make-server-b925e7ef --no-verify-jwt
   ```

5. **Verify deployment:**
   ```bash
   curl https://your-project-id.supabase.co/functions/v1/make-server-b925e7ef/health
   ```
   Should return: `{"status":"ok"}`

✅ **Backend is now deployed!**

---

## Part 3: Deploy ML Service to Production

### Step 5: Deploy to Render.com (15 minutes)

1. **Prepare your repository:**
   ```bash
   # Make sure all changes are committed
   git add .
   git commit -m "Configure ML service for production"
   git push
   ```

2. **Go to https://render.com** and sign up/login

3. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your `Dr-detection` repository

4. **Configure the service:**
   - **Name:** `dr-ml-service` (or any name)
   - **Region:** Choose closest to your users
   - **Branch:** `main` or `Newtry` (your current branch)
   - **Root Directory:** `ml-service`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`

5. **Set Environment Variables:**
   - Click "Environment" tab
   - Add: 
     - Key: `MODEL_PATH`
     - Value: `best_inceptionv3_finetuned_S_93.h5`

6. **Deploy:**
   - Click "Create Web Service"
   - ⏱️ Wait 5-10 minutes for build and deployment
   - Your model file should be included since it's in the git repo

7. **Get your service URL:**
   - After deployment, you'll see: `https://dr-ml-service.onrender.com`
   - Copy this URL!

8. **Test the deployed service:**
   ```bash
   curl https://dr-ml-service.onrender.com/health
   ```

⚠️ **Note about free tier:** Render free tier has cold starts (30-60 seconds) after inactivity.

---

### Alternative: Deploy to Railway.app

If you prefer Railway (faster, paid but cheap):

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Configure:
   - Root Directory: `ml-service`
   - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Add environment variable: `MODEL_PATH=best_inceptionv3_finetuned_S_93.h5`
6. Deploy

---

### Step 6: Connect ML Service to Supabase (3 minutes)

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project

2. **Add ML_API_URL secret:**
   - Go to: Project Settings → Edge Functions → Secrets
   - Click "Add new secret"
   - **Name:** `ML_API_URL`
   - **Value:** `https://dr-ml-service.onrender.com` (your actual URL)
   - Click "Save"

3. **Redeploy your Edge Function:**
   ```bash
   supabase functions deploy make-server-b925e7ef --no-verify-jwt
   ```

---

## Part 4: Final Testing

### Step 7: Test the Complete Application (5 minutes)

1. **Open your web application:**
   ```bash
   npm run dev
   ```
   Or go to your deployed URL if you deployed the frontend

2. **Create an account:**
   - Click "Sign Up"
   - Enter email, password, and name
   - Click "Sign Up"

3. **Add a test patient:**
   - Click "Add New Patient"
   - Fill in:
     - First Name: John
     - Last Name: Doe
     - Date of Birth: Any date
     - Medical Record Number: TEST001
     - Diabetes Type: 2
   - Click "Create Patient"

4. **Perform screening:**
   - Click on the patient card
   - Click "Start Screening"
   - Upload a fundus image
   - Click "Start Analysis"
   
   ⏱️ Wait 10-30 seconds (longer if using Render free tier due to cold start)

5. **Verify results:**
   - ✅ Should show actual prediction (not "Mock" in corner)
   - ✅ Stage should be one of: No DR, Mild DR, Moderate DR, Severe DR, or Proliferative DR
   - ✅ Confidence score should be 0.0 - 1.0
   - ✅ Recommendation should appear
   - ✅ Image should be displayed

---

## 🎉 Success Checklist

- [ ] ML service runs locally and returns predictions
- [ ] Frontend runs locally
- [ ] Supabase project created and configured
- [ ] Edge Function deployed to Supabase
- [ ] ML service deployed to Render/Railway
- [ ] ML_API_URL configured in Supabase secrets
- [ ] Can create user account
- [ ] Can add patients
- [ ] Can upload images and get REAL predictions (not mock)
- [ ] Predictions are accurate and reasonable
- [ ] Images are stored and displayed correctly

---

## 🐛 Troubleshooting

### Issue: "Model not loaded" error

**Solution:**
```bash
# Verify model file exists
ls ml-service/best_inceptionv3_finetuned_S_93.h5

# Check if file is too large for git (> 100MB)
ls -lh ml-service/best_inceptionv3_finetuned_S_93.h5

# If > 100MB, you'll need to upload directly to Render
```

For large models on Render:
1. Deploy without model first
2. Use Render Shell to upload model
3. Or use Render Disks for persistent storage

---

### Issue: Still seeing mock predictions

**Checks:**
1. Verify ML service is running:
   ```bash
   curl https://your-ml-service.onrender.com/health
   ```

2. Check Supabase has ML_API_URL set:
   - Go to Supabase Dashboard → Settings → Edge Functions → Secrets
   - Verify `ML_API_URL` exists

3. Check browser console for errors:
   - Open DevTools (F12)
   - Look for red errors

4. Check Edge Function logs:
   - Supabase Dashboard → Edge Functions → Logs
   - Look for "ML API error"

---

### Issue: "Prediction failed" or timeout

**Solutions:**

1. **Cold start on Render free tier:**
   - First request after inactivity takes 30-60 seconds
   - Subsequent requests are fast
   - Consider upgrading to paid tier ($7/month) for no cold starts

2. **Check ML service logs:**
   - Render Dashboard → your service → Logs tab
   - Look for errors

3. **Test ML service directly:**
   ```bash
   curl -X POST -F "image=@test_image.jpg" https://your-ml-service.onrender.com/predict
   ```

4. **Verify image format:**
   - Must be JPEG or PNG
   - Reasonable size (< 10MB)

---

### Issue: Frontend not connecting to backend

**Solution:**
1. Check `src/utils/supabase/info.tsx` has correct values
2. Verify Edge Function URL in browser network tab
3. Check CORS errors in browser console
4. Verify Supabase project is not paused (free tier pauses after inactivity)

---

### Issue: Authentication not working

**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Disable email confirmation (for testing):
   - Turn off "Enable email confirmations"
3. Check email provider settings if using email confirmation

---

## 📊 Performance Optimization

### For Faster Predictions:

1. **Upgrade Render plan:**
   - $7/month = No cold starts
   - $25/month = More RAM and CPU

2. **Optimize model:**
   - Consider quantization (TensorFlow Lite)
   - Reduce input size if accuracy allows
   - Use TensorFlow model optimization toolkit

3. **Add caching:**
   - Cache predictions for duplicate images
   - Store feature vectors for similarity matching

4. **Use GPU instances:**
   - Render doesn't offer GPU
   - Consider AWS Lambda with GPU
   - Or Azure Functions with GPU

---

## 🚀 Next Steps

Once everything is working:

1. **Deploy frontend to Vercel:**
   ```bash
   npm run build
   vercel deploy
   ```

2. **Set up custom domain:**
   - Vercel: Add custom domain in dashboard
   - Update CORS in Edge Function if needed

3. **Add monitoring:**
   - Set up error tracking (Sentry)
   - Monitor ML service performance
   - Track prediction accuracy

4. **Improve UI:**
   - Add batch upload
   - Add report export (PDF)
   - Add patient history charts

5. **Security enhancements:**
   - Add rate limiting
   - Add ML API authentication
   - Set up proper CORS policies
   - Add input validation

6. **Compliance (if clinical use):**
   - HIPAA compliance setup
   - Audit logging
   - Data encryption at rest
   - Regular security audits

---

## 📚 Additional Resources

- **Supabase Documentation:** https://supabase.com/docs
- **Render Documentation:** https://render.com/docs
- **FastAPI Documentation:** https://fastapi.tiangolo.com
- **TensorFlow Documentation:** https://www.tensorflow.org/guide

---

## 🆘 Getting Help

If you encounter issues:

1. Check browser console (F12) for frontend errors
2. Check Supabase Edge Function logs
3. Check Render service logs
4. Test each component independently
5. Verify all environment variables are set

---

## 📝 Configuration Summary

### Files Updated:
- ✅ `ml-service/app.py` - Configured for InceptionV3 (299x299, [-1,1] normalization)
- ✅ `ml-service/requirements.txt` - Pinned dependency versions
- ✅ `src/supabase/functions/server/index.tsx` - Integrated ML API calls
- ✅ `src/utils/supabase/info.tsx` - You need to update with your Supabase credentials

### Environment Variables Needed:

**Supabase Edge Function:**
- `ML_API_URL` - Your ML service URL from Render

**Render/Railway (ML Service):**
- `MODEL_PATH` - Set to `best_inceptionv3_finetuned_S_93.h5`

### Important Notes:
- Model expects 299x299 images (InceptionV3 standard)
- Preprocessing uses [-1, 1] normalization
- Model outputs 5 classes (0-4 for DR stages)
- Free tier services have cold starts
- Large model files (>100MB) may need special handling

---

Good luck with your deployment! 🎉
