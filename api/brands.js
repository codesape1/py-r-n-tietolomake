// api/brands.js
import { createClient } from '@supabase/supabase-js';

/*
 * ENV-muuttujat (Vercel tai .env):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   // voit vaihtaa anon-key:hen, jos RLS sallii selectin
 */

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supa = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    /*  TÄRKEIN MUUTOS  —  haetaan yhdellä RPC-kutsulla  */
    const { data, error } = await supa.rpc('distinct_brands');  // [{ slug, name }]
    if (error) throw error;

    /*  Aakkosjärjestys varmuuden vuoksi (RPC jo järjestää)  */
    const brands = (data || []).sort((a, b) =>
      a.name.localeCompare(b.name, 'fi')
    );

    return res.status(200).json({ brands });
  } catch (e) {
    console.error('brands error:', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}

/* ----------------------------------------------------------------- */
/* Helpers                                                           */
/* ----------------------------------------------------------------- */
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');        // rajaa omaan domainiin jos haluat
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
