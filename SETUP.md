# Development Setup

## Prerequisites
- Node.js 18+
- Cloudflare account
- Python 3.10+ (optional, for ML training)

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/maisuiyang/sentiment-analysis-platform.git
cd sentiment-analysis-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
wrangler login
wrangler d1 create sentiment-db
# Update wrangler.toml with database_id
wrangler d1 execute sentiment-db --file=./schema.sql --remote
wrangler d1 execute sentiment-db --file=./seed.sql --remote
npm run deploy
```

### 3. Frontend Setup  
```bash
cd frontend
npm install
echo "VITE_API_URL=https://your-api.workers.dev/api" > .env
npm run build
npx wrangler pages deploy dist --project-name your-app
```

## Local Development
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Workers + D1 Database
- **ML**: Python scikit-learn + Workers AI
- **Deployment**: Cloudflare Pages/Workers + GitHub Actions
