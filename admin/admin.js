document.addEventListener('DOMContentLoaded', function() {

// ============================================
// FIVE SPACE WORLD — ADMIN JS
// Includes: image upload, gallery upload,
// Markdown description preview, auth, tabs.
// ============================================

// ── AUTH ──────────────────────────────────────

async function checkAuth() {
  const session = await getSession();
  if (session) showPanel();
}

function showPanel() {
  const loginScreen = document.getElementById('loginScreen');
  const adminPanel  = document.getElementById('adminPanel');

  if (!loginScreen || !adminPanel) {
    console.error('[Admin] DOM elements missing — loginScreen or adminPanel not found');
    alert('Page error: admin panel elements missing. Please hard-refresh (Ctrl+Shift+R).');
    return;
  }

  loginScreen.style.display = 'none';
  adminPanel.style.display  = 'block';

  // Scroll to top so panel is visible
  window.scrollTo(0, 0);

  // Load projects — catch errors so panel still shows even if load fails
  loadAdminProjects().catch(err => {
    console.error('[Admin] loadAdminProjects failed:', err);
    const list = document.getElementById('adminProjectList');
    if (list) list.innerHTML = `<p style="color:#c0392b;">Error loading projects: ${err.message}</p>`;
  });
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  const btn      = document.getElementById('loginBtn');

  btn.textContent = 'Signing in…';
  btn.disabled = true;
  errEl.style.display = 'none';

  try {
    // Use supabase client directly — same as test page
    const { createClient } = supabase;
    const _db = createClient(SITE_CONFIG.supabase.url, SITE_CONFIG.supabase.anonKey);
    const { data, error } = await _db.auth.signInWithPassword({ email, password });

    if (error) throw error;

    // Success — show panel
    errEl.style.display = 'none';
    showPanel();

  } catch (err) {
    errEl.textContent   = err.message || 'Login failed.';
    errEl.style.display = 'block';
    errEl.style.color   = '#c0392b';
    errEl.style.fontSize = '0.85rem';
    errEl.style.padding = '0.5rem';
    errEl.style.background = '#fff0f0';
    errEl.style.marginTop = '0.75rem';
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await logoutAdmin();
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('adminPanel').style.display  = 'none';
});

// ── TABS ──────────────────────────────────────

document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    if (tab.dataset.tab === 'messages') loadMessages();
  });
});

// ── PROJECT LIST ──────────────────────────────

// Module-level cache — populated on load, invalidated after save/delete.
// Eliminates the redundant getAllProjectsAdmin() call inside editProject().
let _projectCache = null;

async function loadAdminProjects() {
  const list = document.getElementById('adminProjectList');
  try {
    _projectCache = await getAllProjectsAdmin();
    if (!_projectCache.length) {
      list.innerHTML = `<p style="color:var(--sandstone); padding:2rem 0;">No projects yet. Add your first one!</p>`;
      return;
    }
    list.innerHTML = _projectCache.map(p => `
      <div class="admin-project-item">
        <div style="display:flex; gap:1rem; align-items:center;">
          ${p.main_image_url
            ? `<img src="${p.main_image_url}" alt="${p.title}"
                    style="width:56px; height:56px; object-fit:cover; flex-shrink:0; background:var(--sandstone-lt);" />`
            : `<div style="width:56px; height:56px; background:var(--sandstone-lt); flex-shrink:0;"></div>`}
          <div>
            <div class="admin-project-title">${p.title}</div>
            <div style="font-size:0.7rem; letter-spacing:0.1em; color:var(--copper); margin-top:0.2rem;">
              ${[p.location, p.year, p.category].filter(Boolean).join(' · ')}
              &nbsp;·&nbsp;
              ${p.published
                ? '<span style="color:var(--patina)">Published</span>'
                : '<span style="color:var(--sandstone)">Draft</span>'}
              ${p.featured ? ' · <span style="color:var(--copper-dk)">Featured</span>' : ''}
            </div>
          </div>
        </div>
        <div class="admin-project-actions">
          <button class="btn-sm btn-edit" onclick="editProject('${p.id}')">Edit</button>
          <button class="btn-sm btn-danger" onclick="confirmDelete('${p.id}', '${p.title.replace(/'/g, "\\'")}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p style="color:#c0392b;">Error loading projects: ${err.message}</p>`;
  }
}

// ── MODAL ─────────────────────────────────────

const modal = document.getElementById('projectModal');

document.getElementById('addProjectBtn').addEventListener('click', () => {
  resetForm();
  document.getElementById('modalTitle').textContent = 'Add Project';
  modal.classList.add('open');
});

document.getElementById('modalClose').addEventListener('click',    () => modal.classList.remove('open'));
document.getElementById('cancelModalBtn').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

function resetForm() {
  ['projectId','pTitle','pSlug','pLocation','pYear','pCategory',
   'pDiscipline','pMaterials','pArea','pMainImage','pDescription','pGallery'].forEach(id => {
    document.getElementById(id).value = '';
  });
  delete document.getElementById('pSlug').dataset.manual;
  document.getElementById('pPublished').checked              = false;
  document.getElementById('pFeatured').checked               = false;
  document.getElementById('saveError').style.display         = 'none';
  document.getElementById('pMainImagePreview').style.display = 'none';
  renderGalleryThumbs();
  document.getElementById('pGalleryUploadStatus').style.display = 'none';
}

// Auto-slug from title
document.getElementById('pTitle').addEventListener('input', e => {
  const slugField = document.getElementById('pSlug');
  if (!slugField.dataset.manual) slugField.value = slugify(e.target.value);
});
document.getElementById('pSlug').addEventListener('input', function () {
  this.dataset.manual = 'true';
});


// ── GALLERY THUMBNAILS ────────────────────────

function renderGalleryThumbs() {
  const thumbs  = document.getElementById('pGalleryThumbs');
  const textarea = document.getElementById('pGallery');
  if (!thumbs) return;

  let gallery = [];
  try { const raw = textarea.value.trim(); if (raw) gallery = JSON.parse(raw); } catch { /* ignore */ }

  if (!gallery.length) { thumbs.innerHTML = ''; return; }

  thumbs.innerHTML = gallery.map((img, i) => `
    <div class="gallery-thumb-item" title="${img.caption || ''}">
      <img src="${img.url}" alt="${img.caption || 'Image ' + (i+1)}" loading="lazy" />
      <button type="button" class="gallery-thumb-remove" onclick="removeGalleryItem(${i})" aria-label="Remove image">&#x2715;</button>
      ${img.caption ? `<div class="gallery-thumb-caption">${img.caption}</div>` : ''}
    </div>
  `).join('');
}

window.removeGalleryItem = function(index) {
  const textarea = document.getElementById('pGallery');
  let gallery = [];
  try { gallery = JSON.parse(textarea.value.trim()); } catch { return; }
  gallery.splice(index, 1);
  textarea.value = gallery.length ? JSON.stringify(gallery, null, 2) : '';
  renderGalleryThumbs();
};

// ── IMAGE UPLOAD — MAIN IMAGE ─────────────────

document.getElementById('pMainImageFile').addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;

  const status  = document.getElementById('pMainImageStatus');
  const preview = document.getElementById('pMainImagePreview');
  const img     = document.getElementById('pMainImagePreviewImg');

  // Show local preview immediately so the user sees something right away
  img.src = URL.createObjectURL(file);
  preview.style.display = 'block';
  status.style.color    = 'var(--copper)';
  status.textContent    = 'Uploading…';

  try {
    const url = await uploadImage(file, 'projects');
    document.getElementById('pMainImage').value = url;
    status.textContent = '✓ Uploaded successfully';
    status.style.color = 'var(--patina)';
  } catch (err) {
    status.textContent = `Upload failed: ${err.message}`;
    status.style.color = '#c0392b';
  }
});

// Preview when URL is pasted manually
document.getElementById('pMainImage').addEventListener('input', function () {
  const preview = document.getElementById('pMainImagePreview');
  const img     = document.getElementById('pMainImagePreviewImg');
  if (this.value.startsWith('http')) {
    img.src = this.value;
    preview.style.display = 'block';
    document.getElementById('pMainImageStatus').textContent = '';
  } else {
    preview.style.display = 'none';
  }
});

// ── IMAGE UPLOAD — GALLERY ────────────────────

document.getElementById('pGalleryFiles').addEventListener('change', async function () {
  const files = Array.from(this.files);
  if (!files.length) return;

  const statusEl  = document.getElementById('pGalleryUploadStatus');
  const galleryEl = document.getElementById('pGallery');

  statusEl.style.display = 'block';
  statusEl.style.color   = 'var(--copper)';
  statusEl.textContent   = `Uploading ${files.length} image${files.length > 1 ? 's' : ''}…`;

  const results = [];
  let done = 0;

  for (const file of files) {
    try {
      const url = await uploadImage(file, 'gallery');
      results.push({ url, caption: '' });
      done++;
      statusEl.textContent = `Uploading… ${done}/${files.length}`;
    } catch (err) {
      console.error(`Failed to upload ${file.name}:`, err);
    }
  }

  // Merge with any existing gallery entries
  let existing = [];
  try {
    const raw = galleryEl.value.trim();
    if (raw) existing = JSON.parse(raw);
  } catch { /* ignore parse errors on existing content */ }

  galleryEl.value      = JSON.stringify([...existing, ...results], null, 2);
  statusEl.textContent = `✓ ${done} image${done > 1 ? 's' : ''} uploaded and added to gallery`;
  statusEl.style.color = 'var(--patina)';
  renderGalleryThumbs();
});

// Live-sync thumbnails when raw JSON is edited
document.getElementById('pGallery').addEventListener('input', renderGalleryThumbs);

// ── EDIT PROJECT ──────────────────────────────
// Exposed as window.editProject so inline onclick attributes can reach it

async function editProject(id) {
  try {
    // Use cached project list — no redundant network request
    const projects = _projectCache || await getAllProjectsAdmin();
    const p = projects.find(proj => proj.id === id);
    if (!p) return;

    document.getElementById('modalTitle').textContent       = 'Edit Project';
    document.getElementById('projectId').value              = p.id;
    document.getElementById('pTitle').value                 = p.title         || '';
    document.getElementById('pSlug').value                  = p.slug          || '';
    document.getElementById('pSlug').dataset.manual         = 'true';
    document.getElementById('pLocation').value              = p.location      || '';
    document.getElementById('pYear').value                  = p.year          || '';
    document.getElementById('pCategory').value              = p.category      || '';
    document.getElementById('pDiscipline').value            = p.discipline    || '';
    document.getElementById('pMaterials').value             = p.materials     || '';
    document.getElementById('pArea').value                  = p.area          || '';
    document.getElementById('pMainImage').value             = p.main_image_url || '';
    document.getElementById('pDescription').value           = p.description   || '';
    document.getElementById('pGallery').value               = p.gallery ? JSON.stringify(p.gallery, null, 2) : '';
    renderGalleryThumbs();
    document.getElementById('pPublished').checked           = p.published     || false;
    document.getElementById('pFeatured').checked            = p.featured      || false;
    document.getElementById('saveError').style.display      = 'none';
    document.getElementById('pGalleryUploadStatus').style.display = 'none';

    // Show existing main image preview
    if (p.main_image_url) {
      document.getElementById('pMainImagePreviewImg').src        = p.main_image_url;
      document.getElementById('pMainImagePreview').style.display = 'block';
      document.getElementById('pMainImageStatus').textContent    = '';
    } else {
      document.getElementById('pMainImagePreview').style.display = 'none';
  renderGalleryThumbs();
    }

    modal.classList.add('open');
  } catch (err) {
    alert('Error loading project: ' + err.message);
  }
}

// ── SAVE PROJECT ──────────────────────────────

document.getElementById('projectForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn   = document.getElementById('saveProjectBtn');
  const errEl = document.getElementById('saveError');
  btn.textContent     = 'Saving…';
  btn.disabled        = true;
  errEl.style.display = 'none';

  let gallery = [];
  try {
    const raw = document.getElementById('pGallery').value.trim();
    if (raw) gallery = JSON.parse(raw);
  } catch {
    errEl.textContent   = 'Gallery JSON is invalid. Try using the upload button instead of editing manually.';
    errEl.style.display = 'block';
    btn.textContent     = 'Save Project';
    btn.disabled        = false;
    return;
  }

  const projectData = {
    brand:          SITE_CONFIG.brand,  // single source of truth — never hardcode 'safa'
    title:          document.getElementById('pTitle').value,
    slug:           document.getElementById('pSlug').value || slugify(document.getElementById('pTitle').value),
    location:       document.getElementById('pLocation').value,
    year:           document.getElementById('pYear').value,
    category:       document.getElementById('pCategory').value,
    discipline:     document.getElementById('pDiscipline').value,
    materials:      document.getElementById('pMaterials').value,
    area:           document.getElementById('pArea').value,
    main_image_url: document.getElementById('pMainImage').value,
    description:    document.getElementById('pDescription').value,
    gallery,
    published: document.getElementById('pPublished').checked,
    featured:  document.getElementById('pFeatured').checked,
  };

  const existingId = document.getElementById('projectId').value;
  if (existingId) projectData.id = existingId;

  try {
    await upsertProject(projectData);
    _projectCache = null;  // invalidate — force fresh fetch on next load
    modal.classList.remove('open');
    await loadAdminProjects();
  } catch (err) {
    errEl.textContent   = 'Error saving: ' + err.message;
    errEl.style.display = 'block';
  } finally {
    btn.textContent = 'Save Project';
    btn.disabled    = false;
  }
});

// ── DELETE ────────────────────────────────────

async function confirmDelete(id, title) {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  try {
    await deleteProject(id);
    _projectCache = null;  // invalidate cache
    await loadAdminProjects();
  } catch (err) {
    alert('Error deleting project: ' + err.message);
  }
}

// ── MESSAGES ──────────────────────────────────

async function loadMessages() {
  const container = document.getElementById('adminMessages');
  try {
    const messages = await getAllMessages();
    if (!messages.length) {
      container.innerHTML = `<p style="color:var(--sandstone); padding:2rem 0;">No messages yet.</p>`;
      return;
    }
    container.innerHTML = messages.map(m => `
      <div class="msg-item">
        <div class="msg-meta">
          ${[m.first_name, m.last_name].filter(Boolean).join(' ')}
          &nbsp;·&nbsp; ${m.email}
          ${m.project_type ? ` &nbsp;·&nbsp; ${m.project_type}` : ''}
          &nbsp;·&nbsp; ${new Date(m.created_at).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </div>
        ${m.location ? `<div style="font-size:0.72rem; color:var(--copper); margin-bottom:0.25rem;">📍 ${m.location}</div>` : ''}
        <div class="msg-text">${m.message}</div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color:#c0392b;">Error loading messages: ${err.message}</p>`;
  }
}



// ── EXPOSE GLOBALS ──
// onclick attributes in innerHTML can only call global functions
window.editProject   = editProject;
window.deleteProject = deleteProject;
window.confirmDelete  = confirmDelete;

// ── INIT ──
checkAuth();

}); // end DOMContentLoaded
