// Shashank Raj · Portfolio
// Theme switch, nav, sticky story,
// tabs, on-demand 3D loader and copy email. No libraries.

var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   Light / dark switch
   Follows the system until the visitor picks; the pick is remembered.
   --------------------------------------------------------------- */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  var meta = document.getElementById('themeColor');
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var dark = theme === 'dark';
    if (btn) {
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', String(dark));
    }
    if (meta) meta.setAttribute('content', dark ? '#0b0b0c' : '#fbfbfd');
  }

  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  if (btn) btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  var onSystem = function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); };
  if (media.addEventListener) media.addEventListener('change', onSystem);
  else if (media.addListener) media.addListener(onSystem);
})();

/* ---------------------------------------------------------------
   Navigation: frosted bar, mobile menu, active link, smooth jumps
   --------------------------------------------------------------- */
(function () {
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  function closeMenu() {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  var navAnchors = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
  var sections = navAnchors.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);

  var ticking = false;
  function update() {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > 4);
    var line = nav.offsetHeight + window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    navAnchors.forEach(function (a) { a.classList.toggle('is-active', !!current && a.getAttribute('href') === '#' + current.id); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    var top = id === 'home' ? 0 : target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight + 1;
    window.scrollTo({ top: Math.max(0, top), behavior: REDUCE ? 'auto' : 'smooth' });
  });
})();

/* ---------------------------------------------------------------
   Sticky story: the step nearest the middle of the screen lights up
   its part of the architecture
   --------------------------------------------------------------- */
(function () {
  var story = document.getElementById('story');
  if (!story || !('IntersectionObserver' in window)) return;
  var steps = Array.prototype.slice.call(story.querySelectorAll('.step'));
  var narrow = window.matchMedia('(max-width: 900px)');

  function setStep(n) {
    if (narrow.matches) { story.removeAttribute('data-step'); return; }
    if (n) story.setAttribute('data-step', n); else story.removeAttribute('data-step');
    steps.forEach(function (s) { s.classList.toggle('is-current', s.getAttribute('data-step') === n); });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) setStep(en.target.getAttribute('data-step')); });
  }, { rootMargin: '-68% 0px -12% 0px' });   // the reading zone below the pinned diagram
  steps.forEach(function (s) { io.observe(s); });

  // Leaving the story (above the first step) clears the highlight.
  new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) setStep(null);
  }, { rootMargin: '-60% 0px -10% 0px' }).observe(story.querySelector('.story__steps'));
})();

/* ---------------------------------------------------------------
   Tabs (Live 3D / sequence), with arrow-key support
   --------------------------------------------------------------- */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs [role="tab"]'));
  if (!tabs.length) return;
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    document.dispatchEvent(new CustomEvent('diagramtab', { detail: tab.id }));
  }
  window.selectDiagramTab = function (id) { var t = document.getElementById(id); if (t) select(t); };
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next); next.focus();
    });
  });
})();

/* ---------------------------------------------------------------
   Paynow live 3D: three.js loads only when the project is near
   --------------------------------------------------------------- */
function webglAvailable() {
  try {
    var c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = src; s.async = false;
    s.onload = resolve;
    s.onerror = function () { reject(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  });
}
(function () {
  var root = document.getElementById('p3d');
  var section = document.getElementById('projects');
  if (!root || !section) return;

  function fallback(msg) {
    var tab = document.getElementById('tab-3d');
    if (tab) tab.hidden = true;
    if (window.selectDiagramTab) window.selectDiagramTab('tab-seq');
    var l = root.querySelector('.p3d__loading'); if (l) l.textContent = msg;
  }
  if (!webglAvailable() || !('IntersectionObserver' in window) || !window.Promise) { fallback('3D view needs WebGL.'); return; }

  var api = null, inView = false, tabOn = true;
  function sync() { if (api) api.setActive(inView && tabOn && !document.hidden); }
  document.addEventListener('diagramtab', function (e) { tabOn = e.detail === 'tab-3d'; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(function (en) { inView = en[0].isIntersecting; sync(); }).observe(root);

  var started = false;
  new IntersectionObserver(function (entries, obs) {
    if (started || !entries[0].isIntersecting) return;
    started = true; obs.disconnect();
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
      .then(function () { return loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'); })
      .then(function () { return loadScript('js/paynow3d.js'); })
      .then(function () { api = window.initPaynow3D(root); sync(); })
      .catch(function () { fallback('3D view could not load.'); });
  }, { rootMargin: '600px 0px' }).observe(section);
})();

/* ---------------------------------------------------------------
   Copy email, current year
   --------------------------------------------------------------- */
(function () {
  var btn = document.getElementById('copyEmail');
  var text = document.getElementById('emailText');
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  if (!btn || !text) return;
  function selectText() {
    var r = document.createRange(); r.selectNodeContents(text);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    btn.textContent = 'Selected';
  }
  btn.addEventListener('click', function () {
    try {
      navigator.clipboard.writeText(text.textContent.trim()).then(function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
      }, selectText);
    } catch (e) { selectText(); }
  });
})();
