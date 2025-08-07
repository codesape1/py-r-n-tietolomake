import { createClient } from '@supabase/supabase-js';

const BUCKET = process.env.BUCKET_NAME || 'quote_uploads';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } } // riittää 3–5 kuvaa / lomake
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { files } = await readJson(req); // [{name,type,data}] data=base64 ilman prefixiä
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'files[] required' });
    }

    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const out  = [];

    for (const f of files) {
      const { name, type, data } = f || {};
      if (!name || !type || !data) continue;

      const bytes = Buffer.from(data, 'base64');
      const key   = `${new Date().toISOString().slice(0,10)}/${cryptoRandom(8)}_${sanitize(name)}`; // <- FIX

      const { error } = await supa.storage.from(BUCKET).upload(key, bytes, {
        contentType: type,
        upsert     : false
      });
      if (error) throw error;

      const { data: pub } = supa.storage.from(BUCKET).getPublicUrl(key);
      out.push(pub.publicUrl);
    }

    return res.status(200).json({ urls: out });
  } catch (e) {
    console.error('upload error', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function cryptoRandom(n) {
  return [...crypto.getRandomValues(new Uint8Array(n))]
    .map(b => b.toString(16).padStart(2,'0'))
    .join('');
}

function sanitize(name) {
  return name.replace(/[^\w.\-]+/g, '_').slice(-80);
}
