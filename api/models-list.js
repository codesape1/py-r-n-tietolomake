// api/models-list.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand, year } = req.query || {};
  if (!brand || !year) {
    return res.status(400).json({ error: 'brand and year are required' });
  }

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY   // service-role ohittaa RLS
  );

  const { data, error } = await sb.rpc('distinct_models', {
    p_brand: brand,
    p_year : +year
  });

  if (error) {
    console.error('models-list error:', error);
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({ models: data });   // [{ model_slug, name }]
}
