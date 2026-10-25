const express = require('express');
const path = require('path');
const L = require('./logic');

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', 1); // set TRUST_PROXY=1 on Render, Railway, behind Nginx, etc.
app.use(express.json({ limit: '10kb' }));

// Tiny rate limiter: 300 API requests per minute per IP (counts reset every minute).
const hits = new Map();
setInterval(() => hits.clear(), 60_000).unref();
app.use('/api', (req, res, next) => {
  const n = (hits.get(req.ip) || 0) + 1;
  hits.set(req.ip, n);
  if (n > 300) return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  next();
});

// API routes. Request bodies are never logged or saved.
app.get('/api/traits', (req, res) => res.json(L.listTraits()));
const post = (route, fn) => app.post(route, (req, res) => {
  const r = fn(req.body);
  res.status(r.status).json(r.body);
});
post('/api/cross', L.crossHandler);
post('/api/height', L.heightHandler);
post('/api/rh', L.rhHandler);
post('/api/summary', L.summaryHandler);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// The frontend
app.use(express.static(path.join(__dirname, 'public')));

// Bad JSON, oversized body, etc.
app.use((err, req, res, next) =>
  res.status(err.status || 500).json({ error: err.status && err.status < 500 ? 'Bad request' : 'Server error' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
