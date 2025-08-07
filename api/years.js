import { createClient } from '@supabase/supabase-js';
import { setCors } from '../../lib/cors.js';

const TABLE = process.env.TABLE_NAME || 'e_bikes';

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { brand } = req.query || {};
  if (!brand) return res.status(400).json({ error: 'brand is required' });

  try {
    const sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1) slug
    let { data, error } = await sb
      .from(TABLE)
      .select('year')
      .eq('brand_slug', brand.toLowerCase().trim())
      .not('year', 'is', null);

    if (error) throw error;

    // 2) fallback: brand_name ILIKE
    if (!data.length) {
      ({ data, error } = await sb
        .from(TABLE)
        .select('year')
        .ilike('brand_name', brand)
        .not('year', 'is', null));
      if (error) throw error;
    }

    // distinct 20xx-vuodet
    const extract = y => (String(y).match(/\b(20\d{2})\b/) || [])[1] ?? null;

    const years = [...new Set(data.map(r => extract(r.year)).filter(Boolean))]
      .sort((a, b) => b - a);

    return res.status(200).json({ years });
  } catch (e) {
    console.error('years error', { brand, msg: e.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
