import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Upload, Eye, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadImage } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import type { Patient, Prediction } from '../utils/types';

interface ScreeningWorkflowProps {
  accessToken: string;
  patient: Patient;
  onBack: () => void;
  onComplete: (prediction: Prediction) => void;
}

export function ScreeningWorkflow({ accessToken, patient, onBack, onComplete }: ScreeningWorkflowProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      const result = await uploadImage(accessToken, patient.id, selectedFile);
      setPrediction(result);
      setStep('complete');
      toast.success('Analysis complete');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to process image');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityColor = (stage: string) => {
    switch (stage) {
      case 'No DR':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Mild DR':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Moderate DR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Severe DR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Proliferative DR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isUrgent = (stage: string) => {
    return stage === 'Severe DR' || stage === 'Proliferative DR';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Patient Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Screening for {patient.firstName} {patient.lastName}</CardTitle>
            <CardDescription>
              MRN: {patient.medicalRecordNumber || 'N/A'} | DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
              {patient.diabetesType && ` | Type ${patient.diabetesType} Diabetes`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'upload' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-sm">Upload Image</span>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-gray-300">
              <div className={`h-full bg-blue-600 transition-all ${step === 'processing' || step === 'complete' ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step === 'processing' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'processing' ? 'border-blue-600 bg-blue-50' : step === 'complete' ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                {step === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              </div>
              <span className="text-sm">Analysis</span>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-gray-300">
              <div className={`h-full bg-blue-600 transition-all ${step === 'complete' ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step === 'complete' ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm">Results</span>
            </div>
          </div>
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Fundus Image</CardTitle>
              <CardDescription>Select a retinal fundus photograph for diabetic retinopathy analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img src={previewUrl} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
                      <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                      <Button type="button" variant="outline" size="sm">
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-700">Click to upload fundus image</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {selectedFile && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Image selected. Click "Begin Analysis" to process the fundus image through the AI model.
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleUpload} disabled={!selectedFile || isProcessing} className="w-full" size="lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Begin Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
                <h3 className="text-xl text-gray-900">Analyzing Image...</h3>
                <p className="text-gray-600">Processing through AI model ensemble</p>
                <Progress value={66} className="w-64 mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Step */}
        {step === 'complete' && prediction && (
          <div className="space-y-6">
            {/* Urgent Alert */}
            {isUrgent(prediction.stage) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  URGENT: This case requires immediate attention. Refer to retinal specialist as soon as possible.
                </AlertDescription>
              </Alert>
            )}

            {/* Image and Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Display */}
              <Card>
                <CardHeader>
                  <CardTitle>Fundus Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={prediction.imageUrl} alt="Fundus" className="w-full rounded-lg" />
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>AI-powered diagnosis generated on {new Date(prediction.createdAt).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stage Badge */}
                  <div>
                    <Label className="text-gray-600 text-sm mb-2 block">Detected Stage</Label>
                    <div className={`inline-block px-4 py-2 rounded-lg border-2 ${getSeverityColor(prediction.stage)}`}>
                      <span className="text-lg">{prediction.stage}</span>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div>
                    <Label className="text-gray-600 text-sm mb-2 block">Confidence Score</Label>
                    <div className="space-y-2">
                      <Progress value={prediction.confidence * 100} className="h-3" />
                      <p className="text-2xl text-gray-900">{(prediction.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Clinical Recommendation */}
                  <div>
                    <Label className="text-gray-600 text-sm mb-2 block">Clinical Recommendation</Label>
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        {prediction.recommendation}
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => onComplete(prediction)} className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button onClick={onBack} className="flex-1">
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
