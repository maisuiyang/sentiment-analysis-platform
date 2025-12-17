import { useState } from 'react'
import { Movie, SentimentResult as SentimentResultType } from '../App'

interface Props {
  result: SentimentResultType
  selectedMovie: Movie | null
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function SentimentResult({ result, selectedMovie }: Props) {
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPositive = result.sentiment === 'positive'
  const confidencePercent = (result.confidence * 100).toFixed(1)

  const handleSaveReview = async () => {
    if (!selectedMovie) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          text: result.text,
          sentiment: result.sentiment,
          confidence: result.confidence,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save review')
      }

      setSaved(true)
    } catch (err) {
      setError('Failed to save review. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Analysis Result</h3>

      {/* Sentiment Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`text-6xl ${
              isPositive ? 'animate-bounce' : ''
            }`}
          >
            {isPositive ? '😊' : '😞'}
          </div>
          <div>
            <div
              className={`text-3xl font-bold ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositive ? 'Positive' : 'Negative'}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              Confidence: {confidencePercent}%
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="w-48">
          <div className="text-sm text-slate-400 mb-1">Confidence Score</div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isPositive ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${confidencePercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
        <div className="text-sm text-slate-400 mb-2">Your Review:</div>
        <div className="text-white italic">"{result.text}"</div>
      </div>

      {/* Save Button */}
      {selectedMovie && !saved && (
        <button
          onClick={handleSaveReview}
          disabled={isSaving}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isSaving ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Saving...
            </span>
          ) : (
            '💾 Save Review to Database'
          )}
        </button>
      )}

      {saved && (
        <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-center">
          ✓ Review saved successfully!
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

