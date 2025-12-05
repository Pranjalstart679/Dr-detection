export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  medicalRecordNumber?: string;
  diabetesType?: string;
  diagnosisDate?: string;
  userId: string;
  createdAt: string;
  lastScreening?: string;
}

export interface Prediction {
  id: string;
  patientId: string;
  userId: string;
  imageUrl: string;
  imagePath: string;
  stage: string;
  confidence: number;
  recommendation: string;
  createdAt: string;
  binaryClass?: string;
  binaryConfidence?: number;
  probabilities?: number[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}
