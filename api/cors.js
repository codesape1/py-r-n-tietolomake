// lib/cors.js
// Salli vain Shopify- ja oma domain – muokkaa regexiä tarvittaessa
const ALLOW_ORIGIN_REGEX = /^https:\/\/(.*\.)?(myshopify\.com|yourstore\.com)$/i;

export function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOW_ORIGIN_REGEX.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
