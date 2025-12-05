import type { Patient, Prediction } from './types';

// Point to the local Python backend
const API_BASE = 'http://localhost:5000';

export async function signup(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }
  return data;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
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
  formData.append('patientId', patientId);

  const response = await fetch(`${API_BASE}/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error uploading image:', data.error);
    throw new Error(data.error || 'Failed to upload image');
  }
  return data.prediction;
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
