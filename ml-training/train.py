"""
Train sentiment analysis model on IMDB 50K dataset
"""
import os
import json
import time
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split
import joblib
from datasets import load_dataset
import re
from tqdm import tqdm

def clean_text(text):
    """Clean and preprocess text"""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^a-zA-Z0-9\s\.\!\?]', '', text)
    # Convert to lowercase
    text = text.lower()
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def main():
    print("=" * 80)
    print("IMDB Sentiment Analysis Model Training")
    print("=" * 80)
    
    # Create output directory
    os.makedirs('models', exist_ok=True)
    os.makedirs('results', exist_ok=True)
    
    # Load IMDB dataset
    print("\n[1/6] Loading IMDB dataset...")
    print("This will download ~80MB of data (first time only)")
    dataset = load_dataset("imdb")
    
    print(f"✓ Dataset loaded successfully!")
    print(f"  - Training samples: {len(dataset['train']):,}")
    print(f"  - Test samples: {len(dataset['test']):,}")
    
    # Prepare data
    print("\n[2/6] Preprocessing text data...")
    train_texts = [clean_text(text) for text in tqdm(dataset['train']['text'], desc="Cleaning train")]
    train_labels = dataset['train']['label']
    test_texts = [clean_text(text) for text in tqdm(dataset['test']['text'], desc="Cleaning test")]
    test_labels = dataset['test']['label']
    
    print(f"✓ Preprocessing complete!")
    
    # Create TF-IDF features
    print("\n[3/6] Creating TF-IDF features...")
    print("Parameters: max_features=10000, ngram_range=(1,2)")
    
    vectorizer = TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        min_df=5,
        max_df=0.8,
        stop_words='english'
    )
    
    start_time = time.time()
    X_train = vectorizer.fit_transform(train_texts)
    X_test = vectorizer.transform(test_texts)
    vectorization_time = time.time() - start_time
    
    print(f"✓ TF-IDF vectorization complete! ({vectorization_time:.2f}s)")
    print(f"  - Feature dimension: {X_train.shape[1]:,}")
    print(f"  - Train matrix shape: {X_train.shape}")
    print(f"  - Test matrix shape: {X_test.shape}")
    
    # Train Logistic Regression model
    print("\n[4/6] Training Logistic Regression model...")
    print("Parameters: C=1.0, max_iter=1000, solver='lbfgs'")
    
    model = LogisticRegression(
        C=1.0,
        max_iter=1000,
        solver='lbfgs',
        random_state=42,
        verbose=1
    )
    
    start_time = time.time()
    model.fit(X_train, train_labels)
    training_time = time.time() - start_time
    
    print(f"\n✓ Training complete! ({training_time:.2f}s)")
    
    # Evaluate model
    print("\n[5/6] Evaluating model performance...")
    
    # Training set performance
    train_preds = model.predict(X_train)
    train_accuracy = accuracy_score(train_labels, train_preds)
    
    # Test set performance
    test_preds = model.predict(X_test)
    test_accuracy = accuracy_score(test_labels, test_preds)
    test_probs = model.predict_proba(X_test)
    
    # Detailed metrics
    precision, recall, f1, _ = precision_recall_fscore_support(
        test_labels, test_preds, average='binary'
    )
    
    cm = confusion_matrix(test_labels, test_preds)
    
    print(f"\n{'='*50}")
    print("MODEL PERFORMANCE")
    print(f"{'='*50}")
    print(f"Training Accuracy:   {train_accuracy:.4f} ({train_accuracy*100:.2f}%)")
    print(f"Test Accuracy:       {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")
    print(f"\nTest Set Metrics:")
    print(f"  Precision:         {precision:.4f}")
    print(f"  Recall:            {recall:.4f}")
    print(f"  F1-Score:          {f1:.4f}")
    print(f"\nConfusion Matrix:")
    print(f"  TN: {cm[0][0]:5d}  |  FP: {cm[0][1]:5d}")
    print(f"  FN: {cm[1][0]:5d}  |  TP: {cm[1][1]:5d}")
    
    # Save model and vectorizer
    print(f"\n[6/6] Saving model and results...")
    
    model_path = 'models/sentiment_model.pkl'
    vectorizer_path = 'models/tfidf_vectorizer.pkl'
    
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    
    print(f"✓ Model saved to: {model_path}")
    print(f"✓ Vectorizer saved to: {vectorizer_path}")
    
    # Save training results
    results = {
        'timestamp': datetime.now().isoformat(),
        'dataset': 'IMDB 50K',
        'model': 'Logistic Regression',
        'training_samples': len(train_texts),
        'test_samples': len(test_texts),
        'features': X_train.shape[1],
        'training_time_seconds': round(training_time, 2),
        'vectorization_time_seconds': round(vectorization_time, 2),
        'metrics': {
            'train_accuracy': round(train_accuracy, 4),
            'test_accuracy': round(test_accuracy, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'f1_score': round(f1, 4)
        },
        'confusion_matrix': {
            'tn': int(cm[0][0]),
            'fp': int(cm[0][1]),
            'fn': int(cm[1][0]),
            'tp': int(cm[1][1])
        },
        'hyperparameters': {
            'tfidf_max_features': 10000,
            'tfidf_ngram_range': '(1, 2)',
            'lr_C': 1.0,
            'lr_max_iter': 1000,
            'lr_solver': 'lbfgs'
        }
    }
    
    results_path = 'results/training_results.json'
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"✓ Results saved to: {results_path}")
    
    # Generate classification report
    report = classification_report(test_labels, test_preds, 
                                   target_names=['Negative', 'Positive'])
    report_path = 'results/classification_report.txt'
    with open(report_path, 'w') as f:
        f.write("IMDB Sentiment Analysis - Classification Report\n")
        f.write("=" * 60 + "\n\n")
        f.write(report)
        f.write("\n\nConfusion Matrix:\n")
        f.write(f"  TN: {cm[0][0]:5d}  |  FP: {cm[0][1]:5d}\n")
        f.write(f"  FN: {cm[1][0]:5d}  |  TP: {cm[1][1]:5d}\n")
    
    print(f"✓ Classification report saved to: {report_path}")
    
    # Test with sample predictions
    print(f"\n{'='*50}")
    print("SAMPLE PREDICTIONS")
    print(f"{'='*50}")
    
    test_samples = [
        "This movie was absolutely amazing! Best film I've seen in years.",
        "Terrible movie, waste of time. Very disappointed.",
        "It was okay, nothing special but not bad either.",
        "Masterpiece! The acting was superb and the plot kept me engaged.",
        "Boring and predictable. Would not recommend."
    ]
    
    for i, text in enumerate(test_samples, 1):
        cleaned = clean_text(text)
        vec = vectorizer.transform([cleaned])
        pred = model.predict(vec)[0]
        prob = model.predict_proba(vec)[0]
        sentiment = "Positive" if pred == 1 else "Negative"
        confidence = prob[pred]
        
        print(f"\n{i}. \"{text[:60]}...\"" if len(text) > 60 else f"\n{i}. \"{text}\"")
        print(f"   → {sentiment} (confidence: {confidence:.2%})")
    
    print(f"\n{'='*80}")
    print("✓ Training pipeline completed successfully!")
    print(f"{'='*80}\n")
    
    print("Next steps:")
    print("1. Check 'models/' folder for trained model files")
    print("2. Check 'results/' folder for detailed metrics")
    print("3. Use these models for inference or deploy to production")

if __name__ == "__main__":
    main()

