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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('discounts').select('*').order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { name, type, value, active, start_date, end_date } = req.body;
      const { data, error } = await supabase.from('discounts').insert({ name, type, value, active, start_date, end_date }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { id, name, type, value, active, start_date, end_date } = req.body;
      const { data, error } = await supabase.from('discounts').update({ name, type, value, active, start_date, end_date }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { id } = req.body;
      const { error } = await supabase.from('discounts').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
