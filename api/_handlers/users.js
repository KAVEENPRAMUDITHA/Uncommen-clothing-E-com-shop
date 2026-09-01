import supabase, { verifyAdmin, getAdminEmail } from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const adminEmail = await getAdminEmail();

    if (req.method === 'GET') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });

      // List all auth users via admin API (paginated, 1000 max)
      const { data: authUsers, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (listErr) throw listErr;

      // Fetch all roles
      const { data: roles } = await supabase.from('user_roles').select('*');
      const roleMap = {};
      (roles || []).forEach(r => { roleMap[r.user_id] = r.role; });

      // Fetch order counts per user
      const { data: orders } = await supabase.from('orders').select('user_id');
      const orderCountMap = {};
      (orders || []).forEach(o => {
        if (o.user_id) orderCountMap[o.user_id] = (orderCountMap[o.user_id] || 0) + 1;
      });

      const users = (authUsers.users || []).map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        role: u.email === adminEmail ? 'admin' : (roleMap[u.id] || 'customer'),
        is_super: u.email === adminEmail,
        order_count: orderCountMap[u.id] || 0,
      }));

      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { email, password, role } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

      const { data, error } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (error) {
        if (error.message.includes('already') || error.message.includes('registered')) {
          return res.status(409).json({ error: 'User already exists' });
        }
        throw error;
      }

      // Assign role
      if (role === 'admin') {
        await supabase.from('user_roles').upsert({ user_id: data.user.id, role: 'admin' }, { onConflict: 'user_id' });
      }

      return res.status(201).json({
        id: data.user.id, email: data.user.email, role: role || 'customer',
        created_at: data.user.created_at, last_sign_in_at: null, is_super: false, order_count: 0,
      });
    }

    if (req.method === 'PUT') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { id, role } = req.body;
      if (!id) return res.status(400).json({ error: 'User ID required' });

      // Don't allow demoting the super-admin
      const { data: targetUser } = await supabase.auth.admin.getUserById(id);
      if (targetUser?.user?.email === adminEmail) {
        return res.status(400).json({ error: 'Cannot modify super-admin role' });
      }

      if (role === 'admin') {
        const { error } = await supabase.from('user_roles').upsert({ user_id: id, role: 'admin' }, { onConflict: 'user_id' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', id);
        if (error) throw error;
      }

      return res.status(200).json({ ok: true, id, role });
    }

    if (req.method === 'DELETE') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'User ID required' });

      // Don't allow deleting the super-admin
      const { data: targetUser } = await supabase.auth.admin.getUserById(id);
      if (targetUser?.user?.email === adminEmail) {
        return res.status(400).json({ error: 'Cannot delete super-admin' });
      }

      // Clean up role, then delete user
      await supabase.from('user_roles').delete().eq('user_id', id);
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;

      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
