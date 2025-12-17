# Backend API - Cloudflare Workers

Serverless sentiment analysis API built with Cloudflare Workers, D1 database, and Workers AI.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Cloudflare Account

1. Sign up at https://dash.cloudflare.com/sign-up
2. Free tier includes:
   - 100,000 requests/day (Workers)
   - 10,000 AI inference/day
   - 5GB storage (D1)

### 3. Install Wrangler CLI

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 4. Create D1 Database

```bash
# Create database
wrangler d1 create sentiment-db

# This will output a database_id - copy it to wrangler.toml
```

Update `wrangler.toml` with your database_id.

### 5. Initialize Database

```bash
# Create tables
wrangler d1 execute sentiment-db --file=./schema.sql

# Seed with movies
wrangler d1 execute sentiment-db --file=./seed.sql
```

## Development

```bash
# Run local development server
npm run dev

# Test at http://localhost:8787
```

## Deployment

```bash
# Deploy to Cloudflare
npm run deploy

# Your API will be live at:
# https://sentiment-api.<your-subdomain>.workers.dev
```

## API Endpoints

### 1. Analyze Sentiment
```bash
POST /api/predict
Content-Type: application/json

{
  "text": "This movie was amazing!"
}

Response:
{
  "text": "This movie was amazing!",
  "sentiment": "positive",
  "confidence": 0.9234,
  "model": "distilbert-sst-2"
}
```

### 2. Save Review
```bash
POST /api/reviews
Content-Type: application/json

{
  "movieId": "tt0111161",
  "text": "Best movie ever!",
  "sentiment": "positive",
  "confidence": 0.95
}

Response:
{
  "success": true,
  "reviewId": 123,
  "message": "Review saved successfully"
}
```

### 3. Get Movie Sentiment Stats
```bash
GET /api/movies/tt0111161/sentiment

Response:
{
  "movie": {
    "id": "tt0111161",
    "title": "The Shawshank Redemption",
    "year": 1994
  },
  "stats": {
    "totalReviews": 247,
    "positiveCount": 234,
    "negativeCount": 13,
    "positivePercentage": "94.7",
    "averageConfidence": 0.89
  },
  "recentReviews": [...],
  "trend": [...]
}
```

### 4. Search Movies
```bash
GET /api/movies?q=dark

Response:
{
  "movies": [
    {
      "id": "tt0468569",
      "title": "The Dark Knight",
      "year": 2008,
      "poster_url": null
    }
  ],
  "count": 1
}
```

### 5. Health Check
```bash
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "service": "sentiment-api"
}
```

## Tech Stack

- **Runtime**: Cloudflare Workers (V8 isolates)
- **Language**: TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **AI Model**: Workers AI (DistilBERT-SST-2)
- **Latency**: <200ms average

## For Interview

**Key points:**
- Serverless architecture, no server management
- Global edge deployment (200+ data centers)
- D1 provides SQLite with automatic replication
- Workers AI eliminates need for model deployment
- Free tier sufficient for demo project
- Response time ~150-200ms including AI inference

**If asked about Nest.js:**
"I initially planned to use Nest.js but chose Cloudflare Workers for better performance and simplicity. Workers are lightweight, serverless, and deploy globally on Cloudflare's edge network. The tradeoff was worth it for this use case."

