from PIL import Image
import numpy as np
import os

def create_dummy_image(filename='dummy.jpg'):
    # Create a random image 224x224x3
    arr = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    img = Image.fromarray(arr)
    img.save(filename)
    print(f"Created {filename}")

if __name__ == "__main__":
    create_dummy_image()
