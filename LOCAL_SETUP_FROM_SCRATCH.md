# 🚀 Complete Local Setup Guide - From Scratch

Follow these steps exactly to set up your DR Detection app from a fresh clone.

---

## Prerequisites

Before starting, ensure you have:
- ✅ Python 3.9+ installed (`python --version`)
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Git installed
- ✅ A Supabase account (free at https://supabase.com)

---

## Part 1: Clone and Install Dependencies (5 minutes)

### Step 1: Clone Repository

```powershell
git clone https://github.com/Pranjalstart679/Dr-detection.git
cd Dr-detection
```

### Step 2: Install Frontend Dependencies

```powershell
npm install
```

This installs all React, TypeScript, and UI dependencies.

### Step 3: Set Up ML Service

```powershell
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

⏱️ This takes 5-10 minutes (TensorFlow is large)

---

## Part 2: Configure Supabase (10 minutes)

### Step 4: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** `dr-detection` (or any name)
   - **Database Password:** Choose strong password (save it!)
   - **Region:** Select closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### Step 5: Get Supabase Credentials

1. In your Supabase project, go to **Settings → API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Project Reference ID:** The `xxxxx` part from URL
   - **anon/public key:** Long string starting with `eyJhbGc...`

### Step 6: Update Frontend Configuration

Open `src/utils/supabase/info.tsx` and update:

```typescript
export const projectId = "your-project-id"  // The xxxxx part
export const publicAnonKey = "your-anon-key"  // The eyJhbGc... string
```

Save the file.

---

## Part 3: Deploy Edge Function (5 minutes)

### Step 7: Prepare Edge Function Directory

```powershell
# From project root (not ml-service)
cd ..  # If you're still in ml-service

# Create proper Supabase directory structure
New-Item -ItemType Directory -Force -Path "supabase/functions/make-server-b925e7ef"

# Copy Edge Function files
Copy-Item "src/supabase/functions/server/index.tsx" "supabase/functions/make-server-b925e7ef/index.ts"
Copy-Item "src/supabase/functions/server/kv_store.tsx" "supabase/functions/make-server-b925e7ef/kv_store.ts"
```

### Step 8: Fix Import in Edge Function

Open `supabase/functions/make-server-b925e7ef/index.ts`

Change line 4 from:
```typescript
import * as kv from "./kv_store.tsx";
```

To:
```typescript
import * as kv from "./kv_store.ts";
```

### Step 9: Create Deno Configuration

Create `supabase/functions/make-server-b925e7ef/deno.json`:

```json
{
  "imports": {
    "hono": "npm:hono@^3.11.7",
    "hono/": "npm:hono@^3.11.7/",
    "@supabase/supabase-js": "jsr:@supabase/supabase-js@^2.49.0"
  }
}
```

### Step 10: Login to Supabase CLI

```powershell
npx supabase login
```

Follow the prompts to authenticate in your browser.

### Step 11: Set ML_API_URL Secret

```powershell
# For local ML service (use host.docker.internal)
npx supabase secrets set ML_API_URL=http://host.docker.internal:5000 --project-ref YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual project ID.

### Step 12: Deploy Edge Function

```powershell
npx supabase functions deploy make-server-b925e7ef --project-ref YOUR_PROJECT_ID --no-verify-jwt
```

You should see: ✅ "Deployed Functions on project..."

---

## Part 4: Start Everything (2 minutes)

### Step 13: Start ML Service

Open a **new PowerShell terminal** (Terminal 1):

```powershell
cd Dr-detection/ml-service
venv\Scripts\Activate.ps1
python app.py
```

Wait for:
```
Model loaded successfully!
Input shape: (None, 299, 299, 3)
INFO:     Application startup complete.
```

**Keep this terminal running!**

### Step 14: Start Frontend

Open a **new PowerShell terminal** (Terminal 2):

```powershell
cd Dr-detection
npm run dev
```

Browser should open automatically at `http://localhost:3000`

**Keep this terminal running too!**

---

## Part 5: Test Everything (5 minutes)

### Step 15: Test ML Service

Open a **third PowerShell terminal** (Terminal 3):

```powershell
# Test health endpoint
curl http://localhost:5000/health
```

Expected: `{"status":"ok","model_loaded":true}`

You should see this request in **Terminal 1** (ML service)!

### Step 16: Test Full Application

1. Go to `http://localhost:3000` in your browser
2. **Sign Up:**
   - Click "Sign Up"
   - Enter email, password, and name
   - Click "Sign Up"

3. **Add a Patient:**
   - Click "Add New Patient"
   - Fill in patient details
   - Click "Create Patient"

4. **Upload Image:**
   - Click on the patient
   - Click "Start Screening"
   - Upload a fundus image
   - Click "Start Analysis"

5. **Verify Real Prediction:**
   - Watch **Terminal 1** (ML service) - you should see `POST /predict` request
   - Results should show actual prediction from your model
   - Confidence score should be reasonable (not just 0.88, 0.92, etc.)

---

## ✅ Success Checklist

You're done when:

- [ ] ML service runs and loads model successfully
- [ ] Frontend opens at http://localhost:3000
- [ ] Can create account and login
- [ ] Can add patients
- [ ] Can upload images
- [ ] **ML service terminal shows POST /predict requests**
- [ ] Predictions are from your actual model (not random)
- [ ] Images display in the app
- [ ] No errors in browser console (F12)

---

## 🐛 Common Issues & Solutions

### Issue: "Model not loaded"

**Solution:**
```powershell
# Check model file exists
cd ml-service
ls best_inceptionv3_finetuned_S_93.h5
```

If missing, copy your model file to `ml-service/` directory.

---

### Issue: Still getting random predictions

**Checks:**

1. **Verify ML_API_URL is set:**
   ```powershell
   npx supabase secrets list --project-ref YOUR_PROJECT_ID
   ```
   Should show: `ML_API_URL = http://host.docker.internal:5000`

2. **Check Edge Function logs:**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for "ML API error" messages

3. **Test ML service directly:**
   ```powershell
   curl -X POST -F "image=@path\to\fundus_image.jpg" http://localhost:5000/predict
   ```

---

### Issue: "Module not found" when deploying Edge Function

**Solution:**
Make sure you fixed the import in Step 8:
```typescript
import * as kv from "./kv_store.ts";  // Must be .ts not .tsx
```

---

### Issue: Frontend can't connect to Supabase

**Solution:**
Check `src/utils/supabase/info.tsx` has correct:
- `projectId` (from your Supabase project URL)
- `publicAnonKey` (from Settings → API)

---

### Issue: ML service not receiving requests

**Possible causes:**

1. **ML_API_URL not set** - Run Step 11 again
2. **Edge Function not redeployed** - Run Step 12 again
3. **Using localhost instead of host.docker.internal** - Edge Functions run in containers, they can't reach `localhost`. Must use `http://host.docker.internal:5000`

---

## 📝 Quick Command Reference

**Start ML Service:**
```powershell
cd ml-service
venv\Scripts\Activate.ps1
python app.py
```

**Start Frontend:**
```powershell
npm run dev
```

**Test ML Service:**
```powershell
curl http://localhost:5000/health
```

**Deploy Edge Function:**
```powershell
npx supabase functions deploy make-server-b925e7ef --project-ref YOUR_PROJECT_ID --no-verify-jwt
```

**Check Supabase Secrets:**
```powershell
npx supabase secrets list --project-ref YOUR_PROJECT_ID
```

---

## 🚀 For Production Deployment

Once local testing works, follow **SETUP_GUIDE.md** to:
1. Deploy ML service to Render.com or Railway.app
2. Update `ML_API_URL` to production URL
3. Deploy frontend to Vercel
4. Set up custom domain

---

## 💡 Pro Tips

1. **Always start ML service first** before testing frontend
2. **Keep both terminals running** during development
3. **Check ML service terminal** to see if requests are coming through
4. **Use browser DevTools (F12)** to check for frontend errors
5. **Check Supabase logs** if predictions fail

---

## 📁 Important Files to Remember

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/utils/supabase/info.tsx` | Supabase credentials | After creating Supabase project |
| `ml-service/app.py` | ML service configuration | If changing model or preprocessing |
| `supabase/functions/make-server-b925e7ef/index.ts` | Edge Function | After copying from src/ |

---

## 🎯 What Each Terminal Does

**Terminal 1 (ML Service):**
- Runs Python FastAPI server
- Loads your InceptionV3 model
- Processes image predictions
- Shows POST /predict requests when images are uploaded

**Terminal 2 (Frontend):**
- Runs Vite dev server
- Serves React application
- Hot-reloads when you edit code
- Shows HMR updates

**Terminal 3 (Testing/Commands):**
- Used for CLI commands
- Testing curl requests
- Deploying Edge Functions
- Can be closed after use

---

## 🔄 Daily Development Workflow

**Starting work:**
```powershell
# Terminal 1
cd ml-service
venv\Scripts\Activate.ps1
python app.py

# Terminal 2 (new terminal)
npm run dev
```

**Stopping work:**
- Press `Ctrl+C` in both terminals
- Close terminals

**After pulling new code:**
```powershell
# Update Python dependencies if needed
cd ml-service
venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Update Node dependencies if needed
npm install

# Redeploy Edge Function if backend changed
npx supabase functions deploy make-server-b925e7ef --project-ref YOUR_PROJECT_ID --no-verify-jwt
```

---

**You're all set! 🎉** Follow these steps and you'll have a fully working local development environment.
