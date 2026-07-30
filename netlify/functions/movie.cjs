const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { message: 'Method not allowed' });
  }

  if (!TMDB_API_KEY) {
    return json(500, { message: 'TMDB_API_KEY is not configured on the server.' });
  }

  const movieId = event.queryStringParameters?.id;
  const language = typeof event.queryStringParameters?.language === 'string' ? event.queryStringParameters.language : 'en-US';

  if (!movieId) {
    return json(400, { message: 'Missing movie id.' });
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${encodeURIComponent(movieId)}?language=${encodeURIComponent(language)}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return json(response.status, data);
    }

    return json(200, data);
  } catch (error) {
    console.error('Netlify movie proxy error:', error);
    return json(500, { message: 'Failed to fetch movie details.' });
  }
};
