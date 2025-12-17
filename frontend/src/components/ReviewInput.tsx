import { useState } from 'react'
import { Movie, SentimentResult } from '../App'

interface Props {
  selectedMovie: Movie | null
  onSentimentAnalyzed: (result: SentimentResult) => void
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function ReviewInput({ selectedMovie, onSentimentAnalyzed }: Props) {
  const [reviewText, setReviewText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!reviewText.trim()) {
      setError('Please enter a review')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: reviewText }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment')
      }

      const data = await response.json()
      onSentimentAnalyzed({
        text: data.text,
        sentiment: data.sentiment,
        confidence: data.confidence,
      })
    } catch (err) {
      setError('Failed to analyze sentiment. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAnalyze()
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Write your review
        {selectedMovie && (
          <span className="text-slate-400 ml-2">
            for {selectedMovie.title}
          </span>
        )}
      </label>
      
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={
          selectedMovie
            ? `Share your thoughts about ${selectedMovie.title}...`
            : 'First, select a movie from the search above...'
        }
        disabled={!selectedMovie}
        rows={5}
        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-400">
          {reviewText.length}/1000 characters
          {reviewText.length > 0 && (
            <span className="ml-3 text-slate-500">
              Press ⌘/Ctrl + Enter to analyze
            </span>
          )}
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={!selectedMovie || !reviewText.trim() || isAnalyzing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isAnalyzing ? (
            <span className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Analyzing...
            </span>
          ) : (
            '🔍 Analyze Sentiment'
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

