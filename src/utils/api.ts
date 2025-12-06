import { projectId, publicAnonKey } from './supabase/info';
import type { Patient, Prediction } from './types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-b925e7ef`;
const ML_API_BASE = 'http://localhost:8000';

export async function signup(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }
  return data;
}

export async function getPatients(accessToken: string): Promise<Patient[]> {
  const response = await fetch(`${API_BASE}/patients`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error fetching patients:', data.error);
    throw new Error(data.error || 'Failed to fetch patients');
  }
  return data.patients;
}

export async function createPatient(accessToken: string, patientData: Partial<Patient>): Promise<Patient> {
  const response = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(patientData),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error creating patient:', data.error);
    throw new Error(data.error || 'Failed to create patient');
  }
  return data.patient;
}

export async function uploadImage(accessToken: string, patientId: string, imageFile: File): Promise<Prediction> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  // Call local FastAPI model
  const response = await fetch(`${ML_API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Error uploading image:', data.detail);
    throw new Error(data.detail || 'Failed to upload image');
  }

  // Return a Prediction object compatible with the frontend
  return {
    id: 'temp-' + Date.now(),
    patientId: patientId,
    imageUrl: '', // We don't have a persistent URL from the local API yet
    prediction: data.prediction,
    confidence: data.confidence,
    createdAt: new Date().toISOString(),
    status: 'completed'
  };
}

export async function getPredictions(accessToken: string, patientId: string): Promise<Prediction[]> {
  const response = await fetch(`${API_BASE}/predictions/${patientId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error fetching predictions:', data.error);
    throw new Error(data.error || 'Failed to fetch predictions');
  }
  return data.predictions;
}
