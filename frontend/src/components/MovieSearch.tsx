import { useState, useEffect } from 'react'
import { Movie } from '../App'

interface Props {
  onMovieSelect: (movie: Movie) => void
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function MovieSearch({ onMovieSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (searchQuery.length > 1) {
      searchMovies(searchQuery)
    } else {
      setMovies([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  const searchMovies = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/movies?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setMovies(data.movies || [])
      setShowDropdown(true)
    } catch (error) {
      console.error('Error searching movies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectMovie = (movie: Movie) => {
    onMovieSelect(movie)
    setSearchQuery('')
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Search for a movie
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="e.g., The Dark Knight, Inception, Shawshank..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && movies.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {movies.map((movie) => (
            <button
              key={movie.id}
              onClick={() => handleSelectMovie(movie)}
              className="w-full text-left px-4 py-3 hover:bg-slate-700 transition border-b border-slate-700 last:border-b-0"
            >
              <div className="text-white font-medium">{movie.title}</div>
              <div className="text-slate-400 text-sm">({movie.year})</div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && searchQuery.length > 1 && movies.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 text-center text-slate-400">
          No movies found. Try a different search.
        </div>
      )}
    </div>
  )
}

