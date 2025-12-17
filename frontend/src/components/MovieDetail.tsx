import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  movieId: string
  
}

interface MovieStats {
  movie: {
    id: string
    title: string
    year: number
  }
  stats: {
    totalReviews: number
    positiveCount: number
    negativeCount: number
    positivePercentage: string
    averageConfidence: number
  }
  recentReviews: Array<{
    text: string
    sentiment: string
    confidence: number
    date: string
  }>
  trend: Array<{
    date: string
    positive: number
    negative: number
  }>
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function MovieDetail({ movieId }: Props) {
  const [stats, setStats] = useState<MovieStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMovieStats()
  }, [movieId])

  const fetchMovieStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/movies/${movieId}/sentiment`)
      if (!response.ok) {
        throw new Error('Failed to fetch movie stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Failed to load movie statistics')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
        <div className="text-red-400 mb-4">⚠️ {error}</div>
        <button
          onClick={fetchMovieStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  const { movie, stats: movieStats, recentReviews, trend } = stats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
        <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
        <p className="text-slate-400">Released: {movie.year}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">Total Reviews</div>
          <div className="text-3xl font-bold text-white">{movieStats.totalReviews}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-green-700/50">
          <div className="text-slate-400 text-sm mb-1">Positive</div>
          <div className="text-3xl font-bold text-green-400">{movieStats.positiveCount}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-red-700/50">
          <div className="text-slate-400 text-sm mb-1">Negative</div>
          <div className="text-3xl font-bold text-red-400">{movieStats.negativeCount}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-blue-700/50">
          <div className="text-slate-400 text-sm mb-1">Positive Rate</div>
          <div className="text-3xl font-bold text-blue-400">{movieStats.positivePercentage}%</div>
        </div>
      </div>

      {/* Sentiment Bar */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Sentiment Distribution</h3>
        <div className="h-8 bg-slate-700 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${movieStats.positivePercentage}%` }}
          >
            {parseFloat(movieStats.positivePercentage) > 10 && `${movieStats.positivePercentage}%`}
          </div>
          <div
            className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${100 - parseFloat(movieStats.positivePercentage)}%` }}
          >
            {100 - parseFloat(movieStats.positivePercentage) > 10 &&
              `${(100 - parseFloat(movieStats.positivePercentage)).toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      {trend && trend.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Sentiment Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend.reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="positive" fill="#22c55e" name="Positive" />
              <Bar dataKey="negative" fill="#ef4444" name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Reviews */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Reviews</h3>
        {recentReviews.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {recentReviews.map((review, index) => (
              <div
                key={index}
                className="p-4 bg-slate-900 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {review.sentiment === 'positive' ? '😊' : '😞'}
                    </span>
                    <span
                      className={`font-semibold ${
                        review.sentiment === 'positive' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {review.sentiment === 'positive' ? 'Positive' : 'Negative'}
                    </span>
                    <span className="text-slate-500">
                      ({(review.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <span className="text-slate-500 text-sm">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-300 italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

