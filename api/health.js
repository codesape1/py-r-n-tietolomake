// api/health.js
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    now: new Date().toISOString(),
    env: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SERVICE_KEY : !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
}
