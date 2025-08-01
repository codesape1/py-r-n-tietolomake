export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    hasUrl: !!process.env.SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    table: process.env.TABLE_NAME || 'e_bikes_test',
    rpc: process.env.RPC_NAME || 'search_models_test'
  });
}
