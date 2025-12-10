"""
Simple test script for the ML service.
Run this to verify your model is working correctly.
"""

import requests
import sys
import os
from pathlib import Path

# ML service URL
ML_SERVICE_URL = "http://localhost:5000"

def test_health():
    """Test the health endpoint"""
    print("\n🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{ML_SERVICE_URL}/health", timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") == "ok" and data.get("model_loaded"):
            print("✅ Health check passed!")
            print(f"   Response: {data}")
            return True
        else:
            print("❌ Health check failed!")
            print(f"   Response: {data}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to ML service!")
        print("   Make sure the service is running: python app.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_prediction(image_path=None):
    """Test the prediction endpoint"""
    if not image_path:
        print("\n⚠️  No image provided for prediction test")
        print("   To test predictions, run:")
        print("   python test_ml_service.py path/to/fundus_image.jpg")
        return True
    
    print(f"\n🔍 Testing prediction with image: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                f"{ML_SERVICE_URL}/predict",
                files=files,
                timeout=60
            )
            response.raise_for_status()
            data = response.json()
        
        print("✅ Prediction successful!")
        print(f"   Stage Index: {data.get('stage_index')}")
        print(f"   Stage Label: {data.get('stage_label')}")
        print(f"   Confidence: {data.get('confidence'):.2%}")
        print(f"   Recommendation: {data.get('recommendation')}")
        
        # Validate response
        if 'stage_index' in data and 'stage_label' in data and 'confidence' in data:
            return True
        else:
            print("⚠️  Response missing expected fields")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out! (Model might be slow or not loaded)")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 ML Service Test Suite")
    print("=" * 60)
    
    # Test 1: Health check
    health_ok = test_health()
    
    if not health_ok:
        print("\n❌ Health check failed. Cannot proceed with tests.")
        print("\nTroubleshooting:")
        print("1. Make sure you're in the ml-service directory")
        print("2. Activate virtual environment: venv\\Scripts\\activate")
        print("3. Start the service: python app.py")
        sys.exit(1)
    
    # Test 2: Prediction (if image provided)
    image_path = sys.argv[1] if len(sys.argv) > 1 else None
    prediction_ok = test_prediction(image_path)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    print(f"Health Check: {'✅ PASSED' if health_ok else '❌ FAILED'}")
    if image_path:
        print(f"Prediction Test: {'✅ PASSED' if prediction_ok else '❌ FAILED'}")
    
    if health_ok and (prediction_ok or not image_path):
        print("\n🎉 All tests passed!")
        print("\nYour ML service is ready for integration!")
        print("\nNext steps:")
        print("1. Deploy to Render/Railway (see SETUP_GUIDE.md)")
        print("2. Set ML_API_URL in Supabase")
        print("3. Test from your web application")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
