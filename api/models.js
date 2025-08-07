import { createClient } from '@supabase/supabase-js';
import { setCors } from '../../lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand, year } = req.query || {};
  if (!brand || !year) {
    return res.status(400).json({ error: 'brand and year are required' });
  }

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await sb.rpc('distinct_models', {
    p_brand: brand,
    p_year : +year
  });

  if (error) {
    console.error('models-list error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.status(200).json({ models: data });   // [{ model_slug, name }]
}
