import { createClient } from '@supabase/supabase-js';
import { setCors } from './cors.js';

const QUOTES = process.env.QUOTES_TABLE || 'quotes';

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = await readJson(req);

    /* --- honeypot --- */
    if (body.company) return res.status(200).json({ ok: true });

    const {
      brand, year, model, model_slug, size,
      mileage_km, price_new_eur,
      receipt_status, tuned_over_25, assist_ok,
      notes, customer_name, email, phone,
      privacy_consent, photo_urls
    } = body || {};

    /* minimivaatimukset */
    if (!brand || !year || !email) {
      return res.status(400).json({ error: 'brand, year and email are required' });
    }
    if (!model && !model_slug) {
      return res.status(400).json({ error: 'model or model_slug is required' });
    }
    if (!privacy_consent) {
      return res.status(400).json({ error: 'privacy consent required' });
    }

    /* liiketoimintasäännöt */
    const yearNum = +year;
    const ok =
      yearNum >= 2020 && yearNum <= 2025 &&
      (mileage_km ?? 0) <= 7000 &&
      (price_new_eur ?? 0) <= 7000 &&
      receipt_status && receipt_status !== 'no' &&
      tuned_over_25 === false &&
      assist_ok === true;

    if (!ok) {
      return res.status(400).json({ error: 'Bike does not meet purchase criteria' });
    }

    /* talletus */
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const row = {
      brand_slug: String(brand).toLowerCase(),
      year: String(year),
      model_input: model || null,
      model_slug: model_slug || null,
      size: size || null,
      mileage_km: mileage_km ? +mileage_km : null,
      price_new_eur: price_new_eur ? +price_new_eur : null,
      receipt_status: receipt_status || null,
      tuned_over_25: tuned_over_25 ?? null,
      assist_ok: assist_ok ?? null,
      notes: notes || null,
      customer_name: customer_name || null,
      email,
      phone: phone || null,
      privacy_consent: !!privacy_consent,
      photo_urls: Array.isArray(photo_urls) ? photo_urls : [],
      source: 'shopify'
    };

    const { data, error } = await sb.from(QUOTES).insert(row).select().single();
    if (error) throw error;

    /* vapaaehtoinen Make / Sheets -webhook */
    if (process.env.MAKE_WEBHOOK_URL) {
      fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.error('MAKE webhook failed:', err));
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    console.error('quote error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}
