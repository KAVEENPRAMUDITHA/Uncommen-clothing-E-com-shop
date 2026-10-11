import crypto from 'crypto';
import supabase, { getAdminEmail } from './db-client.js';
import { sendOrderEmail } from './mailer.js';

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
    const adminEmail = await getAdminEmail();

    if (req.method === 'GET') {
      const user = await verifyUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      let query = supabase.from('orders').select('*, order_items(*)');
      
      // If the user is NOT the admin, filter by their own email
      if (user.email !== adminEmail) {
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
        .insert({ customer_name, customer_email, customer_phone, address, city, total, payment_method, status: 'pending' })
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

      // 3. Generate PayHere payload if paying by card
      let payherePayload = null;
      if (payment_method === 'card') {
        const { data: settingsRows } = await supabase.from('settings').select('*');
        const settings = {};
        (settingsRows || []).forEach(r => { settings[r.key] = r.value; });

        const merchantId = settings.payhere_merchant_id || '1238644';
        const merchantSecret = settings.payhere_secret || 'Mzg5MzE2ODk1MTM5OTEzNzMzNjMzNDczMTgwMDQ4MTYzNTM3NTkzNA==';
        const isSandbox = settings.payhere_sandbox === 'true';
        const currency = settings.currency || 'LKR';
        const formattedAmount = Number(total).toFixed(2);
        const orderId = String(order.id);

        const hashedSecret = crypto
          .createHash('md5')
          .update(merchantSecret)
          .digest('hex')
          .toUpperCase();

        const hash = crypto
          .createHash('md5')
          .update(merchantId + orderId + formattedAmount + currency + hashedSecret)
          .digest('hex')
          .toUpperCase();

        const proto = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
        const clientOrigin = req.headers.origin || `${proto}://${host}`;
        const hostedDomain = (settings.hosted_domain || 'https://uncommen-clothing.vercel.app').replace(/\/+$/, '');
        const notifyUrl = hostedDomain.startsWith('http') ? `${hostedDomain}/api/payhere-notify` : `https://${hostedDomain}/api/payhere-notify`;

        payherePayload = {
          sandbox: isSandbox,
          merchant_id: merchantId,
          return_url: `${clientOrigin}/orders`,
          cancel_url: `${clientOrigin}/checkout`,
          notify_url: notifyUrl,
          order_id: orderId,
          items: items.map(i => `${i.product_name} x ${i.quantity}`).join(', ').substring(0, 150) || `Order #${order.id}`,
          amount: formattedAmount,
          currency,
          hash,
          first_name: customer_name.trim().split(' ')[0] || 'Customer',
          last_name: customer_name.trim().split(' ').slice(1).join(' ') || 'Customer',
          email: customer_email,
          phone: customer_phone,
          address,
          city,
          country: 'Sri Lanka',
          delivery_address: address,
          delivery_city: city,
          delivery_country: 'Sri Lanka',
        };
      }

      // Card orders get their confirmation email once PayHere confirms payment
      if (payment_method !== 'card') await sendOrderEmail(order, 'pending');

      return res.status(201).json({
        ...order,
        payhere: payherePayload,
      });
    }

    if (req.method === 'PUT') {
      // Admin only: Update order status
      const user = await verifyUser(req);
      if (!user || user.email !== adminEmail) {
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
      await sendOrderEmail(data, status);
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      // Admin only: Delete order
      const user = await verifyUser(req);
      if (!user || user.email !== adminEmail) {
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
