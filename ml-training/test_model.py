"""
Test the trained sentiment analysis model
"""
import joblib
import re

def clean_text(text):
    """Clean and preprocess text"""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s\.\!\?]', '', text)
    text = text.lower()
    text = ' '.join(text.split())
    return text

def predict_sentiment(text, model, vectorizer):
    """Predict sentiment for a given text"""
    cleaned = clean_text(text)
    vec = vectorizer.transform([cleaned])
    pred = model.predict(vec)[0]
    prob = model.predict_proba(vec)[0]
    
    sentiment = "positive" if pred == 1 else "negative"
    confidence = float(prob[pred])
    
    return {
        "text": text,
        "sentiment": sentiment,
        "confidence": confidence,
        "probabilities": {
            "negative": float(prob[0]),
            "positive": float(prob[1])
        }
    }

def main():
    print("Loading model and vectorizer...")
    model = joblib.load('models/sentiment_model.pkl')
    vectorizer = joblib.load('models/tfidf_vectorizer.pkl')
    print("✓ Model loaded successfully!\n")
    
    # Interactive testing
    print("="*60)
    print("Sentiment Analysis - Interactive Testing")
    print("="*60)
    print("Enter movie reviews to analyze (type 'quit' to exit)\n")
    
    while True:
        text = input("\nEnter review: ").strip()
        
        if text.lower() in ['quit', 'exit', 'q']:
            print("\nGoodbye!")
            break
        
        if not text:
            continue
        
        result = predict_sentiment(text, model, vectorizer)
        
        print(f"\nSentiment: {result['sentiment'].upper()}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Probabilities: Negative={result['probabilities']['negative']:.2%}, "
              f"Positive={result['probabilities']['positive']:.2%}")

if __name__ == "__main__":
    main()

