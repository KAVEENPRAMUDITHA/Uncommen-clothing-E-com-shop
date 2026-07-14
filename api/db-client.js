import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './db-wake.js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: async (url, options) => {
      const res = await fetch(url, options);
      if (!res.ok && res.status >= 500) triggerRestore();
      return res;
    },
  },
});

export default supabase;

export async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  if (user.email === 'admin@uncommonclothing.lk') return user;
  
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleData?.role === 'admin') return user;
  return null;
}

export function rewriteSupabaseUrl(url) {
  if (!url) return url;
  const projectRef = process.env.FULLSTACK_PROJECT_REF || 'qsaaascspwlwveglmxgb';
  
  // Clean S3 gateway endpoints to public CDN formats
  let cleaned = url.replace(/https:\/\/[\w\-]+\.storage\.supabase\.co\/storage\/v1\/s3\//gi, `https://${projectRef}.supabase.co/storage/v1/object/public/`);
  
  // Clean any old supabase.co subdomains to current active subdomain
  cleaned = cleaned.replace(/https:\/\/[\w\-]+\.supabase\.co\/storage\/v1\/object\/public\//gi, `https://${projectRef}.supabase.co/storage/v1/object/public/`);
  
  return cleaned;
}
