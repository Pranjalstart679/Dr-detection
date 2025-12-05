import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { PatientForm } from './components/PatientForm';
import { ScreeningWorkflow } from './components/ScreeningWorkflow';
import { ReportView } from './components/ReportView';
import { Toaster } from './components/ui/sonner';
import type { Patient, Prediction } from './utils/types';

type Screen = 'auth' | 'dashboard' | 'newPatient' | 'screening' | 'report';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        setAccessToken(token);
        setUser(JSON.parse(userData));
        setCurrentScreen('dashboard');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  };

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setUser(null);
      setSelectedPatient(null);
      setCurrentPrediction(null);
      setCurrentScreen('auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentScreen('screening');
  };

  const handleNewPatient = () => {
    setCurrentScreen('newPatient');
  };

  const handlePatientCreated = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentScreen('screening');
  };

  const handleScreeningComplete = (prediction: Prediction) => {
    setCurrentPrediction(prediction);
    setCurrentScreen('report');
  };

  const handleBackToDashboard = () => {
    setSelectedPatient(null);
    setCurrentPrediction(null);
    setCurrentScreen('dashboard');
  };

  if (!accessToken || !user) {
    return (
      <>
        <AuthPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {currentScreen === 'dashboard' && (
        <Dashboard
          accessToken={accessToken}
          user={user}
          onLogout={handleLogout}
          onSelectPatient={handleSelectPatient}
          onNewPatient={handleNewPatient}
        />
      )}

      {currentScreen === 'newPatient' && (
        <PatientForm
          accessToken={accessToken}
          onBack={handleBackToDashboard}
          onPatientCreated={handlePatientCreated}
        />
      )}

      {currentScreen === 'screening' && selectedPatient && (
        <ScreeningWorkflow
          accessToken={accessToken}
          patient={selectedPatient}
          onBack={handleBackToDashboard}
          onComplete={handleScreeningComplete}
        />
      )}

      {currentScreen === 'report' && selectedPatient && currentPrediction && (
        <ReportView
          patient={selectedPatient}
          prediction={currentPrediction}
          onBack={handleBackToDashboard}
        />
      )}

      <Toaster />
    </>
  );
}
