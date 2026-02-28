// ============================================
// FIVE SPACE WORLD — SHARED COMPONENTS
// Nav and footer injected on every page.
// ============================================

function initComponents({ activePage = '' } = {}) {

  // ── NAV ────────────────────────────────────
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');

  // Apply gradient to nav
  nav.style.background = 'linear-gradient(90deg, #1A5276 0%, #2A7FBA 50%, #1A6A90 100%)';

  nav.innerHTML = `
    <a href="/" class="nav-logo" aria-label="Five Space World — Home">
      <img src="/assets/logo.png" alt="Five Space World" class="nav-logo-img" />
      <span class="nav-logo-text">
        <span class="nav-logo-fsw">FSW</span>
        <span class="nav-logo-sub">Five Space World</span>
      </span>
    </a>

    <ul class="nav-links" role="list">
      <li><a href="/projects" class="${activePage === 'projects' ? 'active' : ''}">Projects</a></li>
      <li><a href="/#about">About</a></li>
      <li><a href="/#contact">Contact</a></li>
      <li><a href="https://safa.zahan.one" target="_blank" rel="noopener" style="color:var(--moss-lt);">Safa Zahan ↗</a></li>
    </ul>

    <div class="nav-controls">
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">☾</button>
      <button class="nav-hamburger" id="navHamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  document.body.insertBefore(nav, document.body.firstChild);

  // ── FOOTER — must be declared before applyTheme uses it ──
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.style.background = 'linear-gradient(90deg, #1A5276 0%, #2A7FBA 100%)';
  footer.style.borderTop = '3px solid #9A9088';
  footer.innerHTML = `
    <span class="footer-brand" style="color:#C8E8F8;">Five Space World</span>
    <span class="footer-copy" style="color:rgba(200,232,248,0.6);">© ${new Date().getFullYear()} Five Space World. All rights reserved.</span>
    <a href="https://safa.zahan.one" style="font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#C4BCB4;">Safa Zahan ↗</a>
  `;
  document.body.appendChild(footer);

  // ── MOBILE DRAWER ──────────────────────────
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Navigation menu');
  drawer.innerHTML = `
    <button class="drawer-close" id="drawerClose" aria-label="Close menu">×</button>
    <a href="/projects">Projects</a>
    <a href="/#about">About</a>
    <a href="/#contact">Contact</a>
    <a href="https://safa.zahan.one" target="_blank" rel="noopener" style="color:var(--moss-lt); font-size:1.2rem;">Safa Zahan ↗</a>
  `;
  document.body.appendChild(drawer);

  document.getElementById('navHamburger').addEventListener('click', () => {
    drawer.classList.add('open');
    document.getElementById('navHamburger').setAttribute('aria-expanded', 'true');
  });
  document.getElementById('drawerClose').addEventListener('click', () => {
    drawer.classList.remove('open');
    document.getElementById('navHamburger').setAttribute('aria-expanded', 'false');
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));

  // ── NAV SCROLL ─────────────────────────────
  window.addEventListener('scroll', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const scrolled = window.scrollY > 50;
    nav.classList.toggle('scrolled', scrolled);
    if (scrolled) {
      nav.style.background = isDark
        ? 'linear-gradient(90deg, #0A2030 0%, #122840 50%, #0A2E44 100%)'
        : 'linear-gradient(90deg, #133D5A 0%, #1F6A9A 50%, #135A7A 100%)';
    } else {
      nav.style.background = isDark
        ? 'linear-gradient(90deg, #0C2E42 0%, #164860 50%, #0C3850 100%)'
        : 'linear-gradient(90deg, #1A5276 0%, #2A7FBA 50%, #1A6A90 100%)';
    }
  }, { passive: true });

  // ── DARK MODE ──────────────────────────────
  const html        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const saved       = localStorage.getItem('fs-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(dark) {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeToggle.textContent = dark ? '☀' : '☾';
    localStorage.setItem('fs-theme', dark ? 'dark' : 'light');
    // Update nav gradient for dark/light
    nav.style.background = dark
      ? 'linear-gradient(90deg, #0C2E42 0%, #164860 50%, #0C3850 100%)'
      : 'linear-gradient(90deg, #1A5276 0%, #2A7FBA 50%, #1A6A90 100%)';
    footer.style.background = dark
      ? 'linear-gradient(90deg, #0C2E42 0%, #164860 100%)'
      : 'linear-gradient(90deg, #1A5276 0%, #2A7FBA 100%)';
  }

  applyTheme(saved ? saved === 'dark' : prefersDark);
  themeToggle.addEventListener('click', () => applyTheme(html.getAttribute('data-theme') !== 'dark'));



  // ── SKIP LINK ──────────────────────────────
  const skip = document.createElement('a');
  skip.href = '#main-content';
  skip.textContent = 'Skip to main content';
  skip.style.cssText = 'position:absolute;top:-40px;left:0;background:var(--moss);color:#fff;padding:0.5rem 1rem;z-index:999;transition:top 0.2s;';
  skip.addEventListener('focus', () => skip.style.top = '0');
  skip.addEventListener('blur',  () => skip.style.top = '-40px');
  document.body.insertBefore(skip, document.body.firstChild);
}
