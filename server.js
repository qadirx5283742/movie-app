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
const VITE_TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;
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