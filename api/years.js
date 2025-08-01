import { createClient } from '@supabase/supabase-js';

const TABLE = process.env.TABLE_NAME || 'e_bikes_test';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand } = req.query;
  if (!brand) return res.status(400).json({ error: 'brand is required' });

  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await sb
      .from(TABLE)
      .select('year')
      .eq('brand_slug', brand);

    if (error) throw error;

    const years = [...new Set((data || [])
      .map(r => parseInt(r.year, 10))
      .filter(n => !isNaN(n)))]
      .sort((a, b) => b - a);

    return res.status(200).json({ years });
  } catch (e) {
    console.error('years error', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
