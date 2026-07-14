import supabase from './db-client.js';

const ADMIN_EMAIL = 'admin@uncommonclothing.lk';

async function verifyUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const user = await verifyUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      let query = supabase.from('orders').select('*, order_items(*)');
      
      // If the user is NOT the admin, filter by their own email
      if (user.email !== ADMIN_EMAIL) {
        query = query.eq('customer_email', user.email);
      }

      const { data, error } = await query.order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { customer_name, customer_email, customer_phone, address, city, total, payment_method, items } = req.body;
      if (!customer_name || !customer_email || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required order fields' });
      }

      // 1. Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ customer_name, customer_email, customer_phone, address, city, total, payment_method })
        .select()
        .single();
      
      if (orderErr) throw orderErr;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      return res.status(201).json(order);
    }

    if (req.method === 'PUT') {
      // Admin only: Update order status
      const user = await verifyUser(req);
      if (!user || user.email !== ADMIN_EMAIL) {
        return res.status(401).json({ error: 'Admin only' });
      }

      const { id, status } = req.body;
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      // Admin only: Delete order
      const user = await verifyUser(req);
      if (!user || user.email !== ADMIN_EMAIL) {
        return res.status(401).json({ error: 'Admin only' });
      }

      const { id } = req.body;
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
