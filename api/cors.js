// api/cors.js
// Salli alkuperä pyynnön headerista, jos se täsmää
// ALLOW_ORIGINS voi olla pilkuin erotettu lista domaineja
const ALLOW_ORIGINS =
  (process.env.CORS_ALLOW_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

export function setCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed =
    ALLOW_ORIGINS.length === 0
      ? /^https:\/\/(.*\.)?(myshopify\.com)$/i.test(origin) // oletus
      : ALLOW_ORIGINS.includes(origin);

  if (allowed) res.setHeader('Access-Control-Allow-Origin', origin);

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
