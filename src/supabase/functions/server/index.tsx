import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client for admin operations and storage
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Create storage bucket on startup
const bucketName = 'make-b925e7ef-fundus-images';
const { data: buckets } = await supabase.storage.listBuckets();
const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
if (!bucketExists) {
  await supabase.storage.createBucket(bucketName, { public: false });
  console.log(`Created bucket: ${bucketName}`);
}

// Get ML API URL from environment variable
const ML_API_URL = Deno.env.get('ML_API_URL') || '';

// Function to call ML API for prediction
async function callMLAPI(imageBuffer: ArrayBuffer, contentType: string) {
  if (!ML_API_URL) {
    throw new Error('ML_API_URL not configured');
  }

  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: contentType });
  formData.append('image', blob, 'fundus.jpg');

  const response = await fetch(`${ML_API_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ML API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Map ML API response to our format
  return {
    stage: data.stage_label || data.stage,
    confidence: data.confidence,
    recommendation: data.recommendation,
  };
}

// Health check endpoint
app.get("/make-server-b925e7ef/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-b925e7ef/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error during signup for ${email}:`, error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get all patients for a user
app.get("/make-server-b925e7ef/patients", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const patients = await kv.getByPrefix(`patient:${user.id}:`);
    return c.json({ patients: patients || [] });
  } catch (error) {
    console.log('Error fetching patients:', error);
    return c.json({ error: 'Failed to fetch patients' }, 500);
  }
});

// Create a new patient
app.post("/make-server-b925e7ef/patients", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const patientData = await c.req.json();
    const patientId = crypto.randomUUID();
    const patient = {
      id: patientId,
      ...patientData,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`patient:${user.id}:${patientId}`, patient);
    return c.json({ patient });
  } catch (error) {
    console.log('Error creating patient:', error);
    return c.json({ error: 'Failed to create patient' }, 500);
  }
});

// Upload fundus image and get prediction
app.post("/make-server-b925e7ef/upload-image", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('image') as File;
    const patientId = formData.get('patientId') as string;

    if (!file || !patientId) {
      return c.json({ error: 'Image and patientId are required' }, 400);
    }

    // Upload image to Supabase Storage
    const fileName = `${patientId}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.log('Error uploading image:', uploadError);
      return c.json({ error: 'Failed to upload image' }, 500);
    }

    // Get signed URL for the image
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

    // Call actual ML API for prediction
    let mlPrediction;
    try {
      mlPrediction = await callMLAPI(arrayBuffer, file.type);
    } catch (mlError) {
      console.log('ML API error:', mlError);
      return c.json({ error: 'ML service error: Failed to process image prediction. Ensure ML service is running.' }, 500);
    }

    // Store prediction result
    const predictionId = crypto.randomUUID();
    const prediction = {
      id: predictionId,
      patientId,
      userId: user.id,
      imageUrl: signedUrlData?.signedUrl,
      imagePath: fileName,
      stage: mlPrediction.stage,
      confidence: mlPrediction.confidence,
      recommendation: mlPrediction.recommendation,
      isMock: mlPrediction.isMock || false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`prediction:${user.id}:${predictionId}`, prediction);
    
    // Update patient's last screening date
    const patientKey = `patient:${user.id}:${patientId}`;
    const patientData = await kv.get(patientKey);
    if (patientData) {
      patientData.lastScreening = new Date().toISOString();
      await kv.set(patientKey, patientData);
    }

    return c.json({ prediction });
  } catch (error) {
    console.log('Error processing image upload:', error);
    return c.json({ error: 'Failed to process image' }, 500);
  }
});

// Get all predictions for a patient
app.get("/make-server-b925e7ef/predictions/:patientId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const patientId = c.req.param('patientId');
    const allPredictions = await kv.getByPrefix(`prediction:${user.id}:`);
    const predictions = allPredictions?.filter(p => p.patientId === patientId) || [];

    // Refresh signed URLs if needed
    for (const prediction of predictions) {
      if (prediction.imagePath) {
        const { data: signedUrlData } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(prediction.imagePath, 60 * 60 * 24 * 7);
        prediction.imageUrl = signedUrlData?.signedUrl;
      }
    }

    return c.json({ predictions });
  } catch (error) {
    console.log('Error fetching predictions:', error);
    return c.json({ error: 'Failed to fetch predictions' }, 500);
  }
});

Deno.serve(app.fetch);
