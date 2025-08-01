import { createClient } from '@supabase/supabase-js';

const QUOTES_TABLE = process.env.QUOTES_TABLE || 'quotes';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const b = req.body || {};

    const { error } = await sb.from(QUOTES_TABLE).insert({
      brand_slug: b.brand,
      year: +b.year,
      model_input: b.model,
      model_slug: b.model_slug || null,
      size: b.size || null,
      mileage: b.mileage ? +b.mileage : null,
      email: b.email
    });

    if (error) throw error;

    // (valinnainen) webhook Makeen
    if (process.env.MAKE_WEBHOOK_URL) {
      try {
        await fetch(process.env.MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(b)
        });
      } catch {}
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('quote error', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
