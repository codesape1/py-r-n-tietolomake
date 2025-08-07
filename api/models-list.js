import { createClient } from '@supabase/supabase-js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // service-role ohittaa RLS
);

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand, year } = req.query || {};
  if (!brand || !year) {
    return res.status(400).json({ error: 'brand and year are required' });
  }

  try {
    const { data, error } = await sb.rpc('distinct_models', {
      p_brand: brand,
      p_year : +year
    });
    if (error) throw error;

    return res.status(200).json({ models: data }); // [{ model_slug, name }]
  } catch (e) {
    console.error('models-list error:', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
