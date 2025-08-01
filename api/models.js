import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  cors(res); if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand, year, q } = req.query;
  if (!brand || !year || !q || q.length < 2) return res.json({ results: [] });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.rpc('search_models', { p_brand: brand, p_year: +year, p_q: q.toLowerCase() });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ results: data });
}

function cors(res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
