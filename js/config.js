// ============================================
// FIVE SPACE WORLD — SITE CONFIG
// ============================================
// Same Supabase project as Safa Zahan.
// brand: 'fivespace' filters all DB queries
// so data stays isolated between brands.
// ============================================

const _env = window.ENV || {};

const SITE_CONFIG = {
  brand:     'fivespace',
  brandName: 'Five Space World',
  tagline:   'Architecture at the scale of civilisation',
  email:     'studio@fivespace.zahan.one',
  location:  'Mumbai, India',
  year:      new Date().getFullYear().toString(),

  child: {
    name: 'Safa Zahan',
    url:  'https://safa.zahan.one',
  },

  supabase: {
    url:     _env.SUPABASE_URL      || 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: _env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE',
  },
};

// ============================================
// SUPABASE CLIENT
// ============================================

// ── Safe Supabase init — never crashes the page ──
let db = null;
try {
  if (typeof supabase !== 'undefined') {
    const { createClient } = supabase;
    db = createClient(SITE_CONFIG.supabase.url, SITE_CONFIG.supabase.anonKey);
  } else {
    console.warn('[FS] Supabase SDK not loaded — project cards will be empty.');
  }
} catch(e) {
  console.warn('[FS] Supabase init failed:', e.message);
}

// ============================================
// DATA HELPERS
// ============================================

async function getProjects(featuredOnly = false) {
  if (!db) return [];
  let query = db
    .from('projects')
    .select('*')
    .eq('brand', SITE_CONFIG.brand)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (featuredOnly) query = query.eq('featured', true);

  const { data, error } = await query;
  if (error) { console.error('getProjects error:', error); return []; }
  return data;
}

async function getProjectBySlug(slug) {
  if (!db) return null;
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('brand', SITE_CONFIG.brand)
    .single();
  if (error) throw error;
  return data;
}

async function submitContactForm(formData) {
  if (!db) return { error: { message: 'Database not available' } };
  const { error } = await db
    .from('contact_messages')
    .insert([{ ...formData, brand: SITE_CONFIG.brand }]);
  if (error) throw error;
  return true;
}

// ============================================
// ADMIN HELPERS
// ============================================

async function loginAdmin(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function logoutAdmin() { await db.auth.signOut(); }

async function getSession() {
  const { data } = await db.auth.getSession();
  return data.session;
}

async function upsertProject(project) {
  const { data, error } = await db
    .from('projects').upsert([project]).select().single();
  if (error) throw error;
  return data;
}

async function deleteProject(id) {
  const { error } = await db.from('projects').delete().eq('id', id);
  if (error) throw error;
}

async function uploadImage(file, folder = 'projects') {
  const ext  = file.name.split('.').pop().toLowerCase();
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await db.storage
    .from('project-images')
    .upload(name, file, { upsert: false, contentType: file.type });
  if (error) throw error;

  const { data: urlData } = db.storage
    .from('project-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

async function getAllProjectsAdmin() {
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('brand', SITE_CONFIG.brand)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function getAllMessages() {
  const { data, error } = await db
    .from('contact_messages')
    .select('*')
    .eq('brand', SITE_CONFIG.brand)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function getPublishedSlugs() {
  const { data, error } = await db
    .from('projects')
    .select('slug, updated_at')
    .eq('brand', SITE_CONFIG.brand)
    .eq('published', true)
    .order('updated_at', { ascending: false });
  if (error) return [];
  return data;
}

// ============================================
// UTILITIES
// ============================================

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mdToHtml(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
