# Frontend - React + Vite + TypeScript

Modern sentiment analysis web interface built with React, TypeScript, and Tailwind CSS.

## Setup

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start dev server (runs on http://localhost:3000)
npm run dev
```

Make sure the backend API is running on `http://localhost:8787` (or update `.env` with your API URL).

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to Cloudflare Pages

```bash
# Deploy (after building)
npm run deploy

# Or use GitHub integration (automatic on push to main)
```

## Features

### 1. Movie Search
- Autocomplete search from 50+ popular movies
- Real-time search results
- Clean, intuitive interface

### 2. Sentiment Analysis
- Write movie reviews (up to 1000 characters)
- AI-powered sentiment analysis
- Confidence score visualization
- Instant results (<200ms)

### 3. Review Management
- Save reviews to database
- Associate reviews with specific movies
- Persistent storage

### 4. Movie Statistics
- Aggregated sentiment distribution
- Positive/negative counts
- Recent reviews list
- Sentiment trend charts (last 30 days)
- Visual bar charts with Recharts

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR, optimized builds)
- **Styling**: Tailwind CSS (utility-first, responsive)
- **Charts**: Recharts (sentiment trend visualization)
- **Deployment**: Cloudflare Pages (global CDN)

## Project Structure

```
src/
├── components/
│   ├── MovieSearch.tsx      # Movie search with autocomplete
│   ├── ReviewInput.tsx      # Review input and analysis
│   ├── SentimentResult.tsx  # Sentiment display and save
│   └── MovieDetail.tsx      # Movie stats and trends
├── App.tsx                  # Main app component
├── main.tsx                 # Entry point
└── index.css                # Tailwind imports + global styles
```

## Environment Variables

Create `.env` file:

```bash
VITE_API_URL=http://localhost:8787/api  # Development
# VITE_API_URL=https://sentiment-api.your-domain.workers.dev/api  # Production
```

## For Interview

**What to say:**
- "Built with React and TypeScript for type safety"
- "Uses Vite for fast development and optimized production builds"
- "Tailwind CSS for responsive, modern UI"
- "Recharts for data visualization of sentiment trends"
- "Deployed on Cloudflare Pages with automatic builds from GitHub"

**Key features to highlight:**
- Real-time search with debouncing
- Optimistic UI updates
- Error handling and loading states
- Responsive design (mobile-friendly)
- Keyboard shortcuts (Cmd/Ctrl + Enter to analyze)
- Clean component architecture with TypeScript interfaces

