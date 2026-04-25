// ============================================
// FIVE SPACE WORLD — PROJECTS PAGE JS
// ============================================

let allProjects = [];

// ── Canonical Five Spaces categories ──────────
const CANONICAL_CATEGORIES = [
  'Knowledge Spaces',
  'Community Spaces',
  'Learning Spaces',
  'Productive Spaces',
  'Residential Spaces',
];

// Maps legacy DB values → canonical names
const CATEGORY_MAP = {
  'Knowledge':             'Knowledge Spaces',
  'Community':             'Community Spaces',
  'Learning':              'Learning Spaces',
  'Work':                  'Productive Spaces',
  'Commerce':              'Productive Spaces',
  'Residential':           'Residential Spaces',
  'Residential Interiors': 'Residential Spaces',
};

function normalizeCategory(cat) {
  if (!cat) return '';
  return CATEGORY_MAP[cat] || cat;
}

function renderProjects(projects) {
  const container = document.getElementById('allProjects');
  if (!container) return;

  if (projects.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding: 6rem 0;">
        <p style="font-family: var(--font-display); font-size: 1.8rem; font-style: italic; color: var(--sandstone);">No projects found in this category.</p>
      </div>`;
    return;
  }

  container.innerHTML = projects.map(project => `
    <a class="project-card"
       href="project.html?slug=${project.slug}"
       aria-label="View project: ${project.title}">
      <div style="overflow:hidden; position:relative;">
        <img class="project-card-img"
          src="${project.main_image_url || 'assets/placeholder.jpg'}"
          alt="${project.title}"
          loading="lazy"
        />
        <div class="project-card-overlay" aria-hidden="true">
          <span>View Project →</span>
        </div>
      </div>
      <div class="project-card-info">
        <h3 class="project-card-title">${project.title}</h3>
        <p class="project-card-meta">${[project.location, project.year, project.category, project.area].filter(Boolean).join(' · ')}</p>
      </div>
    </a>
  `).join('');
}

async function loadProjects() {
  const container = document.getElementById('allProjects');
  const filterBar = document.getElementById('filterBar');

  try {
    allProjects = await getProjects(false);

    // Normalize any legacy category values in place
    allProjects = allProjects.map(p => ({ ...p, category: normalizeCategory(p.category) }));

    // Build filter buttons from canonical list — only show categories that have projects
    const usedCats = new Set(allProjects.map(p => p.category).filter(Boolean));
    CANONICAL_CATEGORIES.filter(c => usedCats.has(c)).forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.setAttribute('data-cat', cat);
      btn.textContent = cat;
      filterBar.appendChild(btn);
    });

    // Filter click handlers
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-cat');
      const filtered = cat === 'all' ? allProjects : allProjects.filter(p => p.category === cat);
      renderProjects(filtered);
    });

    renderProjects(allProjects);

  } catch (err) {
    console.error('Error loading projects:', err);
    container.innerHTML = `<p style="grid-column:1/-1; color:var(--earth); opacity:0.5; padding:4rem 0;">Unable to load projects at this time.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadProjects);
