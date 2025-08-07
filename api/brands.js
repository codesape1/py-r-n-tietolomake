import { createClient } from '@supabase/supabase-js';
import { setCors } from './cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supa = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supa.rpc('distinct_brands'); // [{ slug,name }]
    if (error) throw error;

    const brands = (data || []).sort((a, b) =>
      a.name.localeCompare(b.name, 'fi')
    );

    return res.status(200).json({ brands });
  } catch (e) {
    console.error('brands error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
