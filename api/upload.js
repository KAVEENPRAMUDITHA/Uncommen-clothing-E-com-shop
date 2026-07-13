import supabase from './db-client.js';

const ADMIN_EMAIL = 'admin@uncommonclothing.lk';

async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  if (user.email === ADMIN_EMAIL) return user;
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { fileName, fileBase64, contentType, folder } = req.body;
      if (!fileName || !fileBase64) return res.status(400).json({ error: 'Missing file data' });
      const buffer = Buffer.from(fileBase64, 'base64');
      const uploadFolder = folder || 'products';
      const path = `${uploadFolder}/${Date.now()}-${fileName}`;
      const { data, error } = await supabase.storage.from('product-images').upload(path, buffer, { contentType: contentType || 'image/png', upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      return res.status(200).json({ url: urlData.publicUrl });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
