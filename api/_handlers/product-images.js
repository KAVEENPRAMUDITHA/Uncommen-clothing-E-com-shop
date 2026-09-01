import supabase, { verifyAdmin, rewriteSupabaseUrl } from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { product_id } = req.query;
      let query = supabase.from('product_images').select('*').order('is_primary', { ascending: false });
      if (product_id) query = query.eq('product_id', Number(product_id));
      const { data, error } = await query;
      if (error) throw error;
      const formatted = (data || []).map(img => ({
        ...img,
        image_url: rewriteSupabaseUrl(img.image_url)
      }));
      return res.status(200).json(formatted);
    }
    if (req.method === 'POST') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { product_id, image_url, color, is_primary } = req.body;
      if (is_primary) {
        await supabase.from('product_images').update({ is_primary: false }).eq('product_id', product_id);
      }
      const { data, error } = await supabase.from('product_images')
        .insert({ product_id, image_url, color: color || null, is_primary: !!is_primary })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { id, color, is_primary, product_id } = req.body;
      if (is_primary && product_id) {
        await supabase.from('product_images').update({ is_primary: false }).eq('product_id', product_id);
      }
      const { data, error } = await supabase.from('product_images')
        .update({ color: color || null, is_primary: !!is_primary })
        .eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { id } = req.body;
      const { error } = await supabase.from('product_images').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
