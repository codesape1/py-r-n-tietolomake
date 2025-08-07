import { createClient } from '@supabase/supabase-js';

const RPC = process.env.RPC_NAME || 'search_models';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand, year, q } = req.query;
  if (!brand || !year || !q || q.length < 2) {
    return res.status(200).json({ results: [] });
  }

  try {
    const { data, error } = await sb.rpc(RPC, {
      p_brand: brand,
      p_year : +year,
      p_q    : q
    });
    if (error) throw error;

    return res.status(200).json({ results: data }); // [{ model_slug, display_name }]
  } catch (e) {
    console.error('models error', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
