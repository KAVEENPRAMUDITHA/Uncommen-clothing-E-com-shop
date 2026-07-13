import { supabase } from './db-client.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  // Helper function to query profiles or fallback to users
  const getProfilesTable = async (queryFn) => {
    try {
      const { data, error } = await queryFn(supabase.from('profiles'));
      if (error && (error.message.includes('does not exist') || error.code === '42P01')) {
        // Fallback to 'users' table
        const fallbackRes = await queryFn(supabase.from('users'));
        if (fallbackRes.error) throw fallbackRes.error;
        return fallbackRes.data;
      }
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  try {
    switch (req.method) {
      case 'GET': {
        if (id) {
          // Fetch a single profile
          const data = await getProfilesTable(query =>
            query.select('*').eq('id', id).single()
          );
          if (!data) return res.status(404).json({ error: 'User profile not found' });
          return res.status(200).json(data);
        } else {
          // Fetch all profiles
          const data = await getProfilesTable(query =>
            query.select('*').order('created_at', { ascending: false })
          );
          return res.status(200).json(data || []);
        }
      }

      case 'PUT':
      case 'PATCH': {
        if (!id) {
          return res.status(400).json({ error: 'User ID is required for updates' });
        }

        const { full_name, fullName, role } = req.body || {};
        const updates = {};

        const targetFullName = full_name !== undefined ? full_name : fullName;
        if (targetFullName !== undefined) updates.full_name = targetFullName;
        if (role !== undefined) updates.role = role;

        const data = await getProfilesTable(query =>
          query.update(updates).eq('id', id).select().single()
        );

        return res.status(200).json(data);
      }

      case 'DELETE': {
        if (!id) {
          return res.status(400).json({ error: 'User ID is required for deletion' });
        }

        // Delete from custom profiles/users table
        await getProfilesTable(query =>
          query.delete().eq('id', id)
        );

        // Note: For full deletion, you'd also need to delete from auth.users (requires service role / admin privileges)
        return res.status(200).json({ message: 'User profile deleted successfully' });
      }

      default:
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Users API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
import supabase from './db-client.js';

const ADMIN_EMAIL = 'admin@uncommonclothing.lk';

async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  // Super-admin (hardcoded) or role-based admin
  if (user.email === ADMIN_EMAIL) return user;
  const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
  if (roleRow?.role === 'admin') return user;
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
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
        role: u.email === ADMIN_EMAIL ? 'admin' : (roleMap[u.id] || 'customer'),
        is_super: u.email === ADMIN_EMAIL,
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
      if (targetUser?.user?.email === ADMIN_EMAIL) {
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
      if (targetUser?.user?.email === ADMIN_EMAIL) {
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
