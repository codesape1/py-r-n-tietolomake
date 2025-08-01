import { createClient } from '@supabase/supabase-js';

const TABLE = process.env.TABLE_NAME || 'e_bikes_test';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await sb.from(TABLE).select('brand_name, brand_slug');
    if (error) throw error;

    // Deduplikointi ja aakkosjärjestys
    const map = new Map();
    for (const r of data) {
      if (!map.has(r.brand_slug)) map.set(r.brand_slug, { slug: r.brand_slug, name: r.brand_name });
    }
    const brands = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    return res.status(200).json({ brands });
  } catch (e) {
    console.error('brands error', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // halutessa rajaa omaan domainiin
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
