import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  cors(res); if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('models')
    .select('brand_slug, brand_name')
    .neq('is_archived', true);

  if (error) return res.status(500).json({ error: error.message });
  const brands = [...new Map(data.map(d => [d.brand_slug, { slug:d.brand_slug, name:d.brand_name }])).values()]
                .sort((a,b)=>a.name.localeCompare(b.name));
  res.json({ brands });
}

function cors(res){
  res.setHeader('Access-Control-Allow-Origin', '*'); // halutessa rajaa omaan myymälädomainiin
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
