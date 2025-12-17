/**
 * Sentiment Analysis API
 * Cloudflare Workers with D1 database and Workers AI
 */

export interface Env {
  DB: D1Database;
  AI: any;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Clean and prepare text for sentiment analysis
function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML
    .replace(/[^a-zA-Z0-9\s.,!?]/g, '') // Remove special chars
    .trim()
    .substring(0, 1000); // Limit length
}

// Main handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: POST /api/predict - Analyze sentiment
      if (path === '/api/predict' && request.method === 'POST') {
        const body = await request.json<{ text: string }>();
        
        if (!body.text || body.text.trim().length === 0) {
          return jsonResponse({ error: 'Text is required' }, 400);
        }

        const cleanedText = cleanText(body.text);
        
        // Use Cloudflare Workers AI for sentiment analysis
        const aiResponse = await env.AI.run('@cf/huggingface/distilbert-sst-2-int8', {
          text: cleanedText
        });

        // Parse AI response
        const sentiment = aiResponse[0].label.toLowerCase(); // "positive" or "negative"
        const confidence = aiResponse[0].score;

        return jsonResponse({
          text: body.text,
          sentiment,
          confidence: parseFloat(confidence.toFixed(4)),
          model: 'distilbert-sst-2'
        });
      }

      // Route: POST /api/reviews - Save review
      if (path === '/api/reviews' && request.method === 'POST') {
        const body = await request.json<{
          movieId: string;
          text: string;
          sentiment: string;
          confidence: number;
        }>();

        if (!body.movieId || !body.text || !body.sentiment) {
          return jsonResponse({ error: 'Missing required fields' }, 400);
        }

        // Check if movie exists
        const movie = await env.DB.prepare(
          'SELECT id FROM movies WHERE id = ?'
        ).bind(body.movieId).first();

        if (!movie) {
          return jsonResponse({ error: 'Movie not found' }, 404);
        }

        // Insert review
        const result = await env.DB.prepare(
          'INSERT INTO reviews (movie_id, review_text, sentiment, confidence) VALUES (?, ?, ?, ?)'
        ).bind(
          body.movieId,
          body.text.substring(0, 1000), // Limit text length
          body.sentiment,
          body.confidence
        ).run();

        return jsonResponse({
          success: true,
          reviewId: result.meta.last_row_id,
          message: 'Review saved successfully'
        }, 201);
      }

      // Route: GET /api/movies/:movieId/sentiment - Get movie sentiment stats
      if (path.match(/^\/api\/movies\/[^\/]+\/sentiment$/) && request.method === 'GET') {
        const movieId = path.split('/')[3];

        // Get movie info
        const movie = await env.DB.prepare(
          'SELECT id, title, year FROM movies WHERE id = ?'
        ).bind(movieId).first();

        if (!movie) {
          return jsonResponse({ error: 'Movie not found' }, 404);
        }

        // Get sentiment statistics
        const stats = await env.DB.prepare(`
          SELECT 
            COUNT(*) as total_reviews,
            SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
            SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
            AVG(confidence) as avg_confidence
          FROM reviews
          WHERE movie_id = ?
        `).bind(movieId).first();

        // Get recent reviews
        const recentReviews = await env.DB.prepare(
          'SELECT review_text, sentiment, confidence, created_at FROM reviews WHERE movie_id = ? ORDER BY created_at DESC LIMIT 10'
        ).bind(movieId).all();

        // Get sentiment trend (last 30 days)
        const trend = await env.DB.prepare(`
          SELECT 
            DATE(created_at) as date,
            SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
            SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative
          FROM reviews
          WHERE movie_id = ? AND created_at >= date('now', '-30 days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `).bind(movieId).all();

        return jsonResponse({
          movie: {
            id: movie.id,
            title: movie.title,
            year: movie.year
          },
          stats: {
            totalReviews: stats?.total_reviews || 0,
            positiveCount: stats?.positive_count || 0,
            negativeCount: stats?.negative_count || 0,
            positivePercentage: stats?.total_reviews 
              ? ((stats.positive_count / stats.total_reviews) * 100).toFixed(1)
              : 0,
            averageConfidence: stats?.avg_confidence 
              ? parseFloat(stats.avg_confidence.toFixed(3))
              : 0
          },
          recentReviews: recentReviews.results.map((r: any) => ({
            text: r.review_text,
            sentiment: r.sentiment,
            confidence: r.confidence,
            date: r.created_at
          })),
          trend: trend.results
        });
      }

      // Route: GET /api/movies - Search/list movies
      if (path === '/api/movies' && request.method === 'GET') {
        const searchQuery = url.searchParams.get('q');
        
        let query = 'SELECT id, title, year, poster_url FROM movies';
        let params: any[] = [];

        if (searchQuery) {
          query += ' WHERE title LIKE ? ORDER BY title LIMIT 20';
          params.push(`%${searchQuery}%`);
        } else {
          query += ' ORDER BY title LIMIT 50';
        }

        const movies = await env.DB.prepare(query).bind(...params).all();

        return jsonResponse({
          movies: movies.results,
          count: movies.results.length
        });
      }

      // Route: GET /api/health - Health check
      if (path === '/api/health' && request.method === 'GET') {
        return jsonResponse({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'sentiment-api'
        });
      }

      // 404 - Not found
      return jsonResponse({ error: 'Not found' }, 404);

    } catch (error: any) {
      console.error('API Error:', error);
      return jsonResponse({ 
        error: 'Internal server error',
        message: error.message 
      }, 500);
    }
  }
};

// Helper: JSON response with CORS
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

