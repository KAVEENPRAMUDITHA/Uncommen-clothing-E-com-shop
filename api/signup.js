import supabase from './db-client.js';

const ADMIN_EMAIL = 'admin@uncommonclothing.lk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Use admin API to create user with email auto-confirmed
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        // Handle duplicate user gracefully
        if (error.message.includes('already') || error.message.includes('registered') || error.message.includes('exists')) {
          return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
        }
        throw error;
      }

      return res.status(201).json({
        ok: true,
        message: 'Account created successfully. You can now sign in.',
        user: { id: data.user.id, email: data.user.email }
      });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message || 'Failed to create account' });
  }
}
