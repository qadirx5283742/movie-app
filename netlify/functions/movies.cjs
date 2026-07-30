const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const VITE_TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;

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

  if (!VITE_TMDB_API_KEY) {
    return json(500, { message: 'TMDB_API_KEY is not configured on the server.' });
  }

  const page = Number.parseInt(event.queryStringParameters?.page ?? '1', 10);
  const query = typeof event.queryStringParameters?.query === 'string' ? event.queryStringParameters.query.trim() : '';
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;

  const requestPath = query
    ? `/search/movie?query=${encodeURIComponent(query)}&page=${safePage}`
    : `/discover/movie?sort_by=popularity.desc&page=${safePage}`;

  try {
    const response = await fetch(`${TMDB_BASE_URL}${requestPath}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${VITE_TMDB_API_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return json(response.status, data);
    }

    return json(200, data);
  } catch (error) {
    console.error('Netlify movies proxy error:', error);
    return json(500, { message: 'Failed to fetch movies.' });
  }
};
