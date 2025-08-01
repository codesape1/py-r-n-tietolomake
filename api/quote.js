import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  cors(res); if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase.from('quotes').insert({
    brand_slug: body.brand,
    year: +body.year,
    model_input: body.model,
    model_slug: body.model_slug || null,
    size: body.size || null,
    mileage: body.mileage ? +body.mileage : null,
    email: body.email
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  if (process.env.MAKE_WEBHOOK_URL) {
    try { await fetch(process.env.MAKE_WEBHOOK_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }); } catch {}
  }
  res.json({ ok: true });
}

function cors(res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
