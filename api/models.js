import { createClient } from '@supabase/supabase-js';
import { setCors } from './cors.js';

const RPC = process.env.RPC_NAME || 'search_models';

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand, year, q } = req.query || {};
  if (!brand || !year || !q || q.length < 2) {
    return res.status(200).json({ results: [] });
  }

  try {
    const sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await sb.rpc(RPC, {
      p_brand: brand,
      p_year: +year,
      p_q: q
    });
    if (error) throw error;

    return res.status(200).json({ results: data }); // [{ model_slug,display_name }]
  } catch (e) {
    console.error('models error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
