import { createClient } from '@supabase/supabase-js';

const TABLE = process.env.TABLE_NAME || 'e_bikes';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand } = req.query || {};
  if (!brand) return res.status(400).json({ error: 'brand is required' });

  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Hae vain year-kenttä valitulle merkille (case-insensitive) ja poista nullit
    const { data, error } = await sb
      .from(TABLE)
      .select('year', { head: false })
      .ilike('brand_slug', brand)   // case-insensitive varmuuden vuoksi
      .not('year', 'is', null);

    if (error) throw error;

    // Poimi “siisti” nelinumeroinen 20xx-vuosi
    const extractYear = (y) => {
      const m = String(y).match(/\b(20\d{2})\b/);
      return m ? parseInt(m[1], 10) : null;
    };

    const years = [...new Set((data || []).map(r => extractYear(r.year)).filter(Boolean))]
      .sort((a, b) => b - a);

    return res.status(200).json({ years });
  } catch (e) {
    console.error('years error', { brand, msg: e?.message || e });
    return res.status(500).json({ error: String(e.message || e) });
  }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
