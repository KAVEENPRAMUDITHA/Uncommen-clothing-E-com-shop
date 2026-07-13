import supabase from './db-client.js';

const ADMIN_EMAIL = 'admin@uncommonclothing.lk';

async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  if (user.email !== ADMIN_EMAIL) return null;
  return user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      const obj = {};
      (data || []).forEach(r => { obj[r.key] = r.value; });
      return res.status(200).json(obj);
    }
    if (req.method === 'PUT') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const entries = req.body || {};
      for (const [key, value] of Object.entries(entries)) {
        const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
        if (error) throw error;
      }
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
