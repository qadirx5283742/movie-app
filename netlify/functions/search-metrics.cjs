const SUPABASE_BASE_URL = process.env.VITE_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_REST_URL = `${SUPABASE_BASE_URL}/rest/v1`;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_TABLE = process.env.VITE_SUPABASE_TABLE;

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

const normalizeSearchTerm = (searchTerm) => {
  if (typeof searchTerm !== 'string') return '';

  return searchTerm
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .slice(0, 80);
};

const parseSupabaseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { raw: text };
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { message: 'Method not allowed' });
  }

  if (!SUPABASE_REST_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_TABLE) {
    return json(500, { message: 'Supabase configuration is missing on the server.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { searchTerm, movie } = body;
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm);

    if (!normalizedSearchTerm || !movie?.id) {
      return json(400, { message: 'Invalid search payload.' });
    }

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '/no-movie.png';

    const tableUrl = `${SUPABASE_REST_URL}/${SUPABASE_TABLE}`;

    const existingResponse = await fetch(
      `${tableUrl}?select=id,count&search_term=eq.${encodeURIComponent(normalizedSearchTerm)}`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    const existingRows = await parseSupabaseResponse(existingResponse);

    if (!existingResponse.ok) {
      return json(existingResponse.status, {
        message: existingRows?.message || 'Supabase lookup failed.',
        details: existingRows,
      });
    }

    if (existingRows && existingRows.length > 0) {
      const row = existingRows[0];
      const updateResponse = await fetch(
        `${tableUrl}?id=eq.${encodeURIComponent(row.id)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            count: Number(row.count) + 1,
            movie_id: movie.id,
            poster_url: posterUrl,
          }),
        }
      );

      const updateData = await parseSupabaseResponse(updateResponse);

      if (!updateResponse.ok) {
        return json(updateResponse.status, {
          message: updateData?.message || 'Supabase update failed.',
          details: updateData,
        });
      }

      return json(200, { success: true, updated: true });
    }

    const insertResponse = await fetch(tableUrl, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify([
        {
          search_term: normalizedSearchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: posterUrl,
        },
      ]),
    });

    const insertData = await parseSupabaseResponse(insertResponse);

    if (!insertResponse.ok) {
      return json(insertResponse.status, {
        message: insertData?.message || 'Supabase insert failed.',
        details: insertData,
      });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error('Netlify search-metrics proxy error:', error);
    return json(500, { message: 'Failed to save movie search metrics.' });
  }
};
