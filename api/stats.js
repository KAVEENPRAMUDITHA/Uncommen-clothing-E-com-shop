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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const [prod, ord, cat, rev] = await Promise.all([
        supabase.from('products').select('id, price, stock'),
        supabase.from('orders').select('id, total, status'),
        supabase.from('categories').select('id'),
        supabase.from('reviews').select('id, rating'),
      ]);
      const products = prod.data || [];
      const orders = ord.data || [];
      const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
      const pending = orders.filter(o => o.status === 'pending').length;
      const lowStock = products.filter(p => Number(p.stock || 0) < 10).length;
      const avgRating = (rev.data || []).length ? (rev.data.reduce((s, r) => s + r.rating, 0) / rev.data.length) : 0;
      return res.status(200).json({
        products: products.length,
        orders: orders.length,
        revenue,
        pending,
        categories: (cat.data || []).length,
        reviews: (rev.data || []).length,
        avgRating: Number(avgRating.toFixed(2)),
        lowStock,
      });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
