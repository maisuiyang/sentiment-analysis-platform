import { useState } from 'react'
import MovieSearch from './components/MovieSearch'
import ReviewInput from './components/ReviewInput'
import SentimentResult from './components/SentimentResult'
import MovieDetail from './components/MovieDetail'

export interface Movie {
  id: string
  title: string
  year: number
}

export interface SentimentResult {
  text: string
  sentiment: 'positive' | 'negative'
  confidence: number
}

function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null)
  const [showMovieDetail, setShowMovieDetail] = useState(false)

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie)
    setSentimentResult(null)
    setShowMovieDetail(false)
  }

  const handleSentimentAnalyzed = (result: SentimentResult) => {
    setSentimentResult(result)
  }

  const handleViewStats = () => {
    if (selectedMovie) {
      setShowMovieDetail(true)
    }
  }

  const handleBack = () => {
    setShowMovieDetail(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">
            🎬 Movie Sentiment Analyzer
          </h1>
          <p className="text-slate-300 text-lg">
            Analyze movie reviews with AI-powered sentiment analysis
          </p>
        </header>

        {showMovieDetail && selectedMovie ? (
          // Movie Detail View
          <div>
            <button
              onClick={handleBack}
              className="mb-6 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
            >
              ← Back to Analyzer
            </button>
            <MovieDetail movieId={selectedMovie.id} />
          </div>
        ) : (
          // Main Analysis View
          <div className="max-w-4xl mx-auto">
            {/* Movie Search */}
            <div className="mb-8">
              <MovieSearch onMovieSelect={handleMovieSelect} />
            </div>

            {/* Selected Movie Display */}
            {selectedMovie && (
              <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedMovie.title}
                    </h3>
                    <p className="text-slate-400">({selectedMovie.year})</p>
                  </div>
                  <button
                    onClick={handleViewStats}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Stats 📊
                  </button>
                </div>
              </div>
            )}

            {/* Review Input */}
            <ReviewInput
              selectedMovie={selectedMovie}
              onSentimentAnalyzed={handleSentimentAnalyzed}
            />

            {/* Sentiment Result */}
            {sentimentResult && (
              <div className="mt-6">
                <SentimentResult
                  result={sentimentResult}
                  selectedMovie={selectedMovie}
                />
              </div>
            )}

            {/* Info Section */}
            <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                How it works
              </h3>
              <ul className="text-slate-300 space-y-2">
                <li>• Search for a movie from our database of 50+ popular films</li>
                <li>• Write your review or opinion about the movie</li>
                <li>• Our AI analyzes the sentiment (positive/negative) with confidence score</li>
                <li>• Save your review to see aggregated sentiment trends</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>Built with React, Cloudflare Workers, and AI • Suiyang Mai © 2025</p>
        </footer>
      </div>
    </div>
  )
}

export default App

