const SUPABASE_BASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_REST_URL = `${SUPABASE_BASE_URL}/rest/v1`;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_TABLE = process.env.VITE_SUPABASE_TABLE || process.env.SUPABASE_TABLE || 'movie_search_metrics';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

exports.handler = async () => {
  if (!SUPABASE_REST_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_TABLE) {
    return json(500, { message: 'Supabase configuration is missing on the server.' });
  }

  try {
    const response = await fetch(
      `${SUPABASE_REST_URL}/${SUPABASE_TABLE}?select=*&order=count.desc&limit=5`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return json(response.status, data);
    }

    return json(200, data ?? []);
  } catch (error) {
    console.error('Netlify trending proxy error:', error);
    return json(500, { message: 'Failed to fetch trending movies.' });
  }
};
