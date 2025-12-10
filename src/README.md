# AI-Powered Diabetic Retinopathy Screening Assistant

A web-based clinical application designed for primary care settings to enable rapid, AI-assisted screening for diabetic retinopathy. This application provides healthcare providers with objective analysis and clinical recommendations to support referral decisions.

## 🎯 Project Overview

This minor project demonstrates the integration of machine learning models with a modern web application architecture to address a real-world healthcare challenge. The system enables:

- **Rapid Screening**: Upload fundus images and receive analysis within seconds
- **Objective Assessment**: AI-powered classification of DR severity stages
- **Clinical Support**: Clear recommendations for patient management and referral
- **Professional Workflow**: Streamlined interface designed for busy clinical settings

## 🏗️ Architecture

### 3-Tier Web Architecture

#### **Presentation Layer (Frontend)**
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui component library
- **Features**:
  - Secure authentication for healthcare providers
  - Patient management system
  - Image upload and preview
  - Results visualization with confidence scores
  - Printable/downloadable reports

#### **Application Layer (Backend)**
- **Runtime**: Supabase Edge Functions (Deno)
- **Framework**: Hono web server
- **API**: RESTful endpoints for:
  - User authentication and session management
  - Patient CRUD operations
  - Image upload and storage
  - AI prediction integration (mock currently, ready for ML model)

#### **Data Layer**
- **Database**: Supabase PostgreSQL (Key-Value store)
- **Storage**: Supabase Storage for fundus images
- **Authentication**: Supabase Auth service

## 🚀 Features

### Core Functionality
- ✅ **Secure Login/Signup** - Healthcare provider authentication
- ✅ **Patient Management** - Create and manage patient profiles with medical history
- ✅ **Image Upload** - Upload fundus photographs for analysis
- ✅ **AI Analysis** - Real-time DR stage detection (No DR, Mild, Moderate, Severe, Proliferative)
- ✅ **Confidence Scoring** - Model confidence metrics for clinical decision support
- ✅ **Clinical Recommendations** - Evidence-based referral guidance
- ✅ **Report Generation** - Professional reports for patient files (print/download)

### User Experience
- 📱 Responsive design for desktop and tablet use
- 🎨 Clean, medical-grade interface
- ⚡ Minimal cognitive load with step-by-step workflow
- 🔒 Secure session management
- 📊 Patient screening history tracking

## 🛠️ Tech Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS v4
- Shadcn/ui
- Lucide React (icons)

**Backend:**
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Hono (web framework)
- Deno runtime

**ML Integration (Planned):**
- Flask/FastAPI model serving
- XGBoost meta-learner ensemble
- Base models for feature extraction

## 📋 Prerequisites

- Node.js 16+ or Bun
- Supabase account
- Git

## 🔧 Installation & Setup

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/dr-screening-assistant.git
cd dr-screening-assistant
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
bun install
\`\`\`

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project credentials from Settings > API
3. Update \`/utils/supabase/info.tsx\` with your credentials:
   - Project ID
   - Anon/Public Key

### 4. Deploy Edge Functions (Backend)

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the server function
supabase functions deploy server
\`\`\`

### 5. Run the application

\`\`\`bash
npm run dev
# or
bun run dev
\`\`\`

The app will be available at `http://localhost:3000`

## 🔌 ML Model Integration

The application currently uses mock predictions for demonstration. To integrate your trained model:

### 1. Deploy your ML model as an API

\`\`\`python
# Example Flask endpoint
@app.route('/predict', methods=['POST'])
def predict():
    image = request.files['image']
    # Your model prediction logic
    result = {
        'stage': 'Moderate DR',
        'confidence': 0.87,
        'recommendation': 'Refer to ophthalmologist within 3 months.'
    }
    return jsonify(result)
\`\`\`

### 2. Update the backend

In \`/supabase/functions/server/index.tsx\`, replace the \`generateMockPrediction()\` function with an actual API call:

\`\`\`typescript
// Replace mock prediction with actual ML API call
const response = await fetch('YOUR_ML_API_ENDPOINT/predict', {
  method: 'POST',
  body: formData,
});
const prediction = await response.json();
\`\`\`

## 📊 DR Staging System

The application classifies diabetic retinopathy into five stages:

1. **No DR** - No retinopathy detected
2. **Mild DR** - Microaneurysms only
3. **Moderate DR** - More than just microaneurysms but less than severe
4. **Severe DR** - Significant hemorrhages and microaneurysms
5. **Proliferative DR** - Neovascularization or vitreous/preretinal hemorrhage

## 🔐 Security & HIPAA Compliance

**⚠️ IMPORTANT**: This is a demonstration/prototype application for educational purposes.

For production deployment with real patient data:
- Implement proper HIPAA compliance measures
- Enable end-to-end encryption
- Set up audit logging
- Implement role-based access control (RBAC)
- Use business associate agreements (BAA) with cloud providers
- Ensure proper data backup and disaster recovery
- Conduct security audits

## 📝 Usage Workflow

1. **Login** → Healthcare provider authenticates
2. **Select/Create Patient** → Choose existing patient or register new
3. **Upload Image** → Upload fundus photograph
4. **View Results** → Review AI prediction, confidence, and recommendations
5. **Generate Report** → Create printable summary for patient file

## 🎓 Academic Context

This project demonstrates:
- Integration of ML models into production web applications
- 3-tier architecture design patterns
- Healthcare UX/UI principles
- Secure authentication and data handling
- Real-world clinical workflow optimization

## 📄 License

This project is created for academic/educational purposes.

## 🙏 Acknowledgments

- Shadcn/ui for the component library
- Supabase for backend infrastructure
- Lucide for icon system

## 👨‍💻 Author

Minor Project - AI-Powered Diabetic Retinopathy Screening Assistant

---

**Note**: This application is for demonstration and educational purposes only. It is not intended for clinical use without proper validation, regulatory approval, and HIPAA compliance measures.
