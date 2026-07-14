import supabase, { verifyAdmin, rewriteSupabaseUrl } from './db-client.js';

async function enrichProducts(products) {
  if (!products || products.length === 0) return products;
  const productIds = products.map(p => p.id);
  const [cats, discs, imgs] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('discounts').select('*'),
    supabase.from('product_images').select('*').in('product_id', productIds).order('is_primary', { ascending: false }),
  ]);
  const catMap = {};
  (cats.data || []).forEach(c => { catMap[c.id] = c; });
  const discMap = {};
  (discs.data || []).forEach(d => { discMap[d.id] = d; });
  const imgMap = {};
  (imgs.data || []).forEach(img => {
    if (!imgMap[img.product_id]) imgMap[img.product_id] = [];
    imgMap[img.product_id].push(img);
  });
  return products.map(p => {
    const images = (imgMap[p.id] || []).map(img => ({
      ...img,
      image_url: rewriteSupabaseUrl(img.image_url)
    }));
    const primaryImg = images.find(i => i.is_primary);
    const rewrittenImageUrl = rewriteSupabaseUrl(p.image_url);
    return {
      ...p,
      image_url: rewrittenImageUrl,
      categories: p.category_id ? catMap[p.category_id] || null : null,
      discounts: p.discount_id ? discMap[p.discount_id] || null : null,
      product_images: images,
      display_image: primaryImg ? primaryImg.image_url : rewrittenImageUrl,
    };
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      let query = supabase.from('products').select('*');
      const { category, featured, search, sort } = req.query;
      if (category && category !== 'all') query = query.eq('category_id', Number(category));
      if (featured === 'true') query = query.eq('featured', true);
      if (search) query = query.ilike('name', `%${search}%`);
      if (sort === 'price_asc') query = query.order('price', { ascending: true });
      else if (sort === 'price_desc') query = query.order('price', { ascending: false });
      else if (sort === 'newest') query = query.order('id', { ascending: false });
      else query = query.order('id', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      const enriched = await enrichProducts(data);
      return res.status(200).json(enriched);
    }
    if (req.method === 'POST') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { name, slug, description, price, category_id, image_url, stock, sizes, colors, featured, discount_id } = req.body;
      const { data, error } = await supabase.from('products').insert({ name, slug, description, price, category_id, image_url, stock, sizes, colors, featured, discount_id: discount_id || null }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { id, name, slug, description, price, category_id, image_url, stock, sizes, colors, featured, discount_id } = req.body;
      const { data, error } = await supabase.from('products').update({ name, slug, description, price, category_id, image_url, stock, sizes, colors, featured, discount_id: discount_id || null }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Admin only' });
      const { id } = req.body;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
