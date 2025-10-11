import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, UserPlus, Activity, LogOut, Upload, User, Calendar } from 'lucide-react';
import { getPatients } from '../utils/api';
import { Patient } from '../utils/types';
import { toast } from 'sonner@2.0.3';

interface DashboardProps {
  accessToken: string;
  user: any;
  onLogout: () => void;
  onSelectPatient: (patient: Patient) => void;
  onNewPatient: () => void;
}

export function Dashboard({ accessToken, user, onLogout, onSelectPatient, onNewPatient }: DashboardProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await getPatients(accessToken);
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      patient.medicalRecordNumber?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl text-gray-900">DR Screening Dashboard</h1>
                <p className="text-sm text-gray-600">Diabetic Retinopathy Detection System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-900">{user.user_metadata?.name || user.email}</p>
                <p className="text-xs text-gray-500">Healthcare Provider</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Patients</CardTitle>
              <User className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{patients.length}</div>
              <p className="text-xs text-gray-500 mt-1">Registered in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Recent Screenings</CardTitle>
              <Activity className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {patients.filter(p => p.lastScreening).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Patients screened</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Calendar className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {patients.filter(p => !p.lastScreening).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting screening</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>Select a patient to begin screening or add a new patient</CardDescription>
              </div>
              <Button onClick={onNewPatient}>
                <UserPlus className="w-4 h-4 mr-2" />
                New Patient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or medical record number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Patient List */}
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery ? 'No patients found matching your search' : 'No patients yet. Add your first patient to get started.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => onSelectPatient(patient)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        {patient.lastScreening && (
                          <Badge variant="secondary" className="text-xs">
                            Screened
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>MRN: {patient.medicalRecordNumber || 'N/A'}</span>
                        <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                        <span>{patient.gender}</span>
                        {patient.diabetesType && (
                          <span>Type {patient.diabetesType} Diabetes</span>
                        )}
                      </div>
                      {patient.lastScreening && (
                        <p className="text-xs text-gray-400 mt-1">
                          Last screening: {formatDate(patient.lastScreening)}
                        </p>
                      )}
                    </div>
                    <Button size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Screen
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
