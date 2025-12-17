# ML Training Pipeline

This folder contains the machine learning training pipeline for the sentiment analysis model.

## Setup

```bash
# Install dependencies
pip install -r requirements.txt
```

## Training the Model

```bash
python train.py
```

This will:
1. Download the IMDB 50K dataset (~80MB, first time only)
2. Preprocess and clean the text data
3. Create TF-IDF features (10,000 features, bigrams)
4. Train a Logistic Regression classifier
5. Evaluate performance on test set
6. Save model and results

**Expected performance:**
- Training accuracy: ~87-89%
- Test accuracy: ~85-87%
- Training time: ~2-3 minutes (on modern CPU)

## Output Files

After training, you'll have:

```
models/
├── sentiment_model.pkl          # Trained Logistic Regression model
└── tfidf_vectorizer.pkl         # TF-IDF vectorizer

results/
├── training_results.json        # Detailed metrics and config
└── classification_report.txt    # Sklearn classification report
```

## Testing the Model

```bash
python test_model.py
```

Interactive prompt to test the model with custom reviews.

## Model Details

- **Algorithm**: Logistic Regression (sklearn)
- **Features**: TF-IDF with 10,000 features, bigrams (1,2)
- **Dataset**: IMDB 50K reviews (25K train, 25K test)
- **Performance**: ~85% accuracy, high precision/recall
- **Model size**: ~10MB (both model + vectorizer)

## For Interview

Key points to mention:
- Trained on standard IMDB 50K dataset
- Used TF-IDF for feature extraction (simple but effective)
- Logistic Regression chosen for speed and interpretability
- 85% accuracy aligns with simple baseline models
- Training pipeline is reproducible and documented

