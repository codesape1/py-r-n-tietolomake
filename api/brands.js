// api/brands.js
import { createClient } from '@supabase/supabase-js';

const TABLE = process.env.TABLE_NAME || 'e_bikes';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY       // vaihda anon-key:hen jos RLS käytössä
    );

    // distinct brand_slug + brand_name yhdellä kyselyllä
    const { data, error } = await sb
      .from(TABLE)
      .select('brand_slug, brand_name', { distinct: 'brand_slug' })
      .not('brand_slug', 'is', null);

    if (error) throw error;

    // 🎩  deduplikointi + aakkosjärjestys
    const brands = (data || [])
      .map(r => ({
        slug: String(r.brand_slug),
        name: r.brand_name || r.brand_slug        // varmistus
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({ brands });
  } catch (e) {
    console.error('brands error', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');          // rajoita jos haluat
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
