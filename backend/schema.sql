-- Database schema for sentiment analysis platform

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,              -- IMDB ID (e.g., "tt0111161")
  title TEXT NOT NULL,
  year INTEGER,
  poster_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id TEXT NOT NULL,
  review_text TEXT NOT NULL,
  sentiment TEXT NOT NULL,          -- 'positive' or 'negative'
  confidence REAL NOT NULL,         -- 0.0 to 1.0
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_movie_reviews ON reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_sentiment ON reviews(movie_id, sentiment);
CREATE INDEX IF NOT EXISTS idx_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_movie_title ON movies(title);

