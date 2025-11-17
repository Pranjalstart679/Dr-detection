# AI Diabetic Retinopathy Web App

This is a code bundle for AI Diabetic Retinopathy Web App. The original project is available at https://www.figma.com/design/PgXczQzP3Tx1UMoeG1P0N9/AI-Diabetic-Retinopathy-Web-App.

## Features

- **Binary Classification**: Quickly identifies if diabetic retinopathy is present (Normal vs Abnormal)
- **5-Class Classification**: Provides detailed severity grading:
  - Class 0: No DR (Normal)
  - Class 1: Mild DR
  - Class 2: Moderate DR
  - Class 3: Severe DR
  - Class 4: Proliferative DR
- **Confidence Scores**: Shows prediction confidence for both classification types
- **Batch Processing**: Analyze multiple images at once
- **Interactive UI**: User-friendly interface for single image predictions

## Running the Web App

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Model Setup

### Pre-trained Models

The trained models are tracked using Git LFS and are located in:
```
Retinopathy Models/Model/
```

Available models:
- `best_inceptionv3_finetuned_S_93.h5` (280.39 MB) - InceptionV3 fine-tuned model, 93% accuracy (Small dataset)
- `cnn_classifier_model2_S_88.h5` (138.43 MB) - CNN classifier, 88% accuracy (Small dataset)
- `cnn_classifier_model_L_95.h5` (138.43 MB) - CNN classifier, 95% accuracy (Large dataset)
- `final_inceptionv3_model_L_97.h5` (280.39 MB) - InceptionV3 model, 97% accuracy (Large dataset)

### Using the Predictor Notebook

1. Navigate to `Retinopathy Models/Model/Test/predictor.ipynb`
2. Update the `MODEL_PATH` variable to point to your desired model
3. Run the notebook cells to:
   - Load the model
   - Predict single images using the interactive UI
   - Perform batch predictions on multiple images

## Dataset Information

### Where to Get the Data

This project uses diabetic retinopathy datasets. You can obtain the datasets from:

1. **APTOS 2019 Blindness Detection** (Kaggle)
   - URL: https://www.kaggle.com/c/aptos2019-blindness-detection
   - Contains retinal images labeled with diabetic retinopathy severity
   - Place training images in: `Retinopathy Models/Training/APTOS DR V1/train_images/`

2. **Diabetic Retinopathy Detection** (Kaggle)
   - URL: https://www.kaggle.com/c/diabetic-retinopathy-detection
   - Large dataset with high-resolution retinal images
   - Place training images in: `Retinopathy Models/Training/DR V2 DS2/train_images/`

3. **Other Sources**:
   - Messidor Dataset: http://www.adcis.net/en/third-party/messidor/
   - IDRiD Dataset: https://idrid.grand-challenge.org/

### Dataset Structure

After downloading, organize your datasets as follows:
```
Retinopathy Models/
├── Training/
│   ├── APTOS DR V1/
│   │   ├── train_images/          # Place training images here
│   │   ├── balanced_train_images/ # Augmented/balanced dataset
│   │   └── train.csv              # Labels file
│   └── DR V2 DS2/
│       ├── train_images/          # Place training images here
│       ├── balanced_train_images/ # Augmented/balanced dataset
│       └── train.csv              # Labels file
```

**Note**: Image datasets are excluded from Git (see `.gitignore`) due to their large size. You must download them separately.

## Training Your Own Models

Training notebooks are available in:
- `Retinopathy Models/Training/APTOS DR V1/` - For APTOS dataset
- `Retinopathy Models/Training/DR V2 DS2/` - For DR V2 dataset
- `Retinopathy Models/Training/Ensembling/` - For ensemble models

Key notebooks:
- `ModelTransfer.ipynb` - Transfer learning with InceptionV3
- `model2a.ipynb` - Custom CNN classifier training
- `dataagumentation2.ipynb` - Data augmentation and balancing
- `newensemble.ipynb` - Ensemble model creation

## Model Performance

| Model | Dataset | Accuracy | Size |
|-------|---------|----------|------|
| InceptionV3 Final | Large | 97% | 280 MB |
| CNN Classifier | Large | 95% | 138 MB |
| InceptionV3 Fine-tuned | Small | 93% | 280 MB |
| CNN Classifier v2 | Small | 88% | 138 MB |

## Requirements

### Web App
- Node.js and npm
- React, TypeScript, Vite

### Model Training/Inference
- Python 3.8+
- TensorFlow 2.x
- NumPy, Pandas, Matplotlib
- Jupyter Notebook
- scikit-learn

Install Python dependencies:
```bash
pip install tensorflow numpy pandas matplotlib scikit-learn pillow ipywidgets
```

## Project Structure

```
├── src/                           # React web app source code
├── Retinopathy Models/
│   ├── Model/                     # Pre-trained models (tracked with Git LFS)
│   │   └── Test/
│   │       └── predictor.ipynb    # Prediction notebook
│   └── Training/                  # Training scripts and datasets
│       ├── APTOS DR V1/          # APTOS dataset training
│       ├── DR V2 DS2/            # DR V2 dataset training
│       └── Ensembling/           # Ensemble model training
├── .gitignore                     # Git ignore rules
└── README.md                      # This file
```

## License

This project is for educational and research purposes.

## Acknowledgments

- APTOS 2019 Blindness Detection Dataset
- Diabetic Retinopathy Detection Dataset
- InceptionV3 architecture from TensorFlow/Keras
