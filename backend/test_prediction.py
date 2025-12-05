import requests
import os
import time

BASE_URL = "http://localhost:5000"
IMAGE_PATH = "dummy.jpg"

def test_prediction():
    # 1. Signup/Login to get token
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    
    print(f"Registering user {email}...")
    response = requests.post(f"{BASE_URL}/signup", json={
        "email": email,
        "password": password,
        "name": "Test User"
    })
    
    if response.status_code != 200:
        print(f"Signup failed: {response.text}")
        return
        
    token = response.json()['token']
    print(f"Got token: {token}")
    
    # 2. Upload Image
    print("Uploading image...")
    with open(IMAGE_PATH, 'rb') as f:
        files = {'image': f}
        data = {'patientId': 'test_patient_id'}
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.post(f"{BASE_URL}/upload-image", files=files, data=data, headers=headers)
        
    if response.status_code == 200:
        result = response.json()
        print("Prediction Success!")
        print(result)
        
        # Verify fields
        pred = result.get('prediction', {})
        if 'stage' in pred and 'confidence' in pred:
            print("Verification Passed: Response contains stage and confidence.")
        else:
            print("Verification Failed: Missing fields in response.")
    else:
        print(f"Upload failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    if not os.path.exists(IMAGE_PATH):
        print(f"Error: {IMAGE_PATH} not found. Run create_dummy_image.py first.")
    else:
        try:
            test_prediction()
        except Exception as e:
            print(f"Test failed with exception: {e}")
