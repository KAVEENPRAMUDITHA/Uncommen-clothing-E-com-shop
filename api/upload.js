import supabase, { verifyAdmin } from './db-client.js';

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

      // Check and automatically create storage bucket if it does not exist
      const { data: buckets, error: bucketCheckErr } = await supabase.storage.listBuckets();
      if (!bucketCheckErr) {
        const hasBucket = buckets?.some(b => b.name === 'product-images');
        if (!hasBucket) {
          await supabase.storage.createBucket('product-images', { public: true });
        }
      }

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, buffer, {
          contentType: contentType || 'image/png',
          upsert: true,
        });

      if (error) throw error;

      // Construct and return the standard public CDN URL
      const projectRef = process.env.FULLSTACK_PROJECT_REF || 'qsaaascspwlwveglmxgb';
      const publicUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/product-images/${path}`;
      
      return res.status(200).json({ url: publicUrl });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
