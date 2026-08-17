import express from 'express';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;
const SUPABASE_BASE_URL = process.env.VITE_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_REST_URL = `${SUPABASE_BASE_URL}/rest/v1`;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.VITE_SUPABASE_TABLE;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const apiRequestLog = new Map();

const cleanupExpiredRateLimitEntries = () => {
  const now = Date.now();

  for (const [ip, entry] of apiRequestLog.entries()) {
    if (entry.resetAt <= now) {
      apiRequestLog.delete(ip);
    }
  }
};

const rateLimitApiRequests = (req, res, next) => {
  cleanupExpiredRateLimitEntries();

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const existingEntry = apiRequestLog.get(clientIp);

  if (!existingEntry || existingEntry.resetAt <= now) {
    apiRequestLog.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return next();
  }

  if (existingEntry.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((existingEntry.resetAt - now) / 1000).toString());
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  existingEntry.count += 1;
  return next();
};

app.use(express.json());
app.use('/api', rateLimitApiRequests);

const buildTmdbHeaders = () => {
  if (!TMDB_API_KEY) {
    return null;
  }

  return {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_API_KEY}`,
  };
};

const buildSupabaseHeaders = () => {
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

  if (!SUPABASE_REST_URL || !key || !SUPABASE_TABLE) {
    return null;
  }

  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Prefer: 'return=representation',
  };
};

const getSupabaseUpstreamError = async (response) => {
  const payload = await parseSupabaseRow(response);

  if (payload && payload.message) {
    return payload.message;
  }

  return `Supabase request failed with status ${response.status}`;
};

const parseSupabaseRow = async (response) => {
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

const buildSupabaseTableUrl = (query = '') => {
  const baseUrl = SUPABASE_REST_URL.replace(/\/$/, '');
  const tableUrl = `${baseUrl}/${SUPABASE_TABLE}`;

  return query ? `${tableUrl}?${query}` : tableUrl;
};

const proxyTmdbRequest = async (requestPath, res) => {
  const headers = buildTmdbHeaders();

  if (!headers) {
    return res.status(500).json({ message: 'TMDB_API_KEY is not configured on the server.' });
  }

  const response = await fetch(`${TMDB_BASE_URL}${requestPath}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json(data);
  }

  return res.json(data);
};

app.get('/api/movies', async (req, res) => {
  const page = Number.parseInt(req.query.page ?? '1', 10);
  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;

  const requestPath = query
    ? `/search/movie?query=${encodeURIComponent(query)}&page=${safePage}`
    : `/discover/movie?sort_by=popularity.desc&page=${safePage}`;

  try {
    await proxyTmdbRequest(requestPath, res);
  } catch (error) {
    console.error('TMDB proxy error:', error);
    res.status(500).json({ message: 'Failed to fetch movies.' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  const { id } = req.params;
  const language = typeof req.query.language === 'string' ? req.query.language : 'en-US';

  try {
    await proxyTmdbRequest(`/movie/${encodeURIComponent(id)}?language=${encodeURIComponent(language)}`, res);
  } catch (error) {
    console.error('TMDB movie details proxy error:', error);
    res.status(500).json({ message: 'Failed to fetch movie details.' });
  }
});

const normalizeSearchTerm = (searchTerm) => {
  if (typeof searchTerm !== 'string') return '';

  return searchTerm
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .slice(0, 80);
};

app.get('/api/trending', async (req, res) => {
  const headers = buildSupabaseHeaders();

  if (!headers) {
    return res.status(500).json({ message: 'Supabase configuration is missing on the server.' });
  }

  try {
    const response = await fetch(
      buildSupabaseTableUrl('select=*&order=count.desc&limit=5'),
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data ?? []);
  } catch (error) {
    console.error('Supabase trending proxy error:', error);
    return res.status(500).json({ message: 'Failed to fetch trending movies.' });
  }
});

app.post('/api/search-metrics', async (req, res) => {
  const headers = buildSupabaseHeaders();

  if (!headers) {
    return res.status(500).json({ message: 'Supabase configuration is missing on the server.' });
  }

  try {
    const { searchTerm, movie } = req.body ?? {};
    const normalizedSearchTerm = normalizeSearchTerm(searchTerm);

    if (!normalizedSearchTerm || !movie?.id) {
      return res.status(400).json({ message: 'Invalid search payload.' });
    }

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '/no-movie.png';

    const existingResponse = await fetch(
      buildSupabaseTableUrl(`select=id,count&search_term=eq.${encodeURIComponent(normalizedSearchTerm)}`),
      {
        method: 'GET',
        headers,
      }
    );

    const existingRows = await parseSupabaseRow(existingResponse);

    if (!existingResponse.ok) {
      return res.status(existingResponse.status).json({
        message: await getSupabaseUpstreamError(existingResponse),
      });
    }

    if (existingRows && existingRows.length > 0) {
      const row = existingRows[0];
      const updateResponse = await fetch(
        buildSupabaseTableUrl(`id=eq.${encodeURIComponent(row.id)}`),
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            count: Number(row.count) + 1,
            movie_id: movie.id,
            poster_url: posterUrl,
          }),
        }
      );

      const updateData = await parseSupabaseRow(updateResponse);

      if (!updateResponse.ok) {
        return res.status(updateResponse.status).json({
          message: await getSupabaseUpstreamError(updateResponse),
          details: updateData,
        });
      }

      return res.json({ success: true, updated: true });
    }

    const insertResponse = await fetch(
      buildSupabaseTableUrl(),
      {
        method: 'POST',
        headers,
        body: JSON.stringify([
          {
            search_term: normalizedSearchTerm,
            count: 1,
            movie_id: movie.id,
            poster_url: posterUrl,
          },
        ]),
      }
    );

    const insertData = await parseSupabaseRow(insertResponse);

    if (!insertResponse.ok) {
      return res.status(insertResponse.status).json({
        message: await getSupabaseUpstreamError(insertResponse),
        details: insertData,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Supabase search metric proxy error:', error);
    return res.status(500).json({ message: 'Failed to save movie search metrics.' });
  }
});

const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});