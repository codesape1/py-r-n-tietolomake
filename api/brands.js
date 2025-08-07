import { createClient } from '@supabase/supabase-js';

/*
 * ENV-muuttujat:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   // vaihda anon-key:hen, jos RLS sallii SELECTin
 */

// Luo client kerran cold-startissa
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Yksinkertainen CORS-helper
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // rajaa domainiin jos haluat
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { data, error } = await sb.rpc('distinct_brands'); // [{ slug, name }]
    if (error) throw error;

    const brands = (data || []).sort((a, b) =>
      a.name.localeCompare(b.name, 'fi')
    );

    return res.status(200).json({ brands });
  } catch (e) {
    console.error('brands error:', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
