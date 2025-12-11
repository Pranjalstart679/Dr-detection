cd ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install fastapi uvicorn tensorflow pillow python-multipart
pip freeze > requirements.txt
