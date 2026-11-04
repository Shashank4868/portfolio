// Stacked sections: each section pins while the next slides up over it;
// the covered one eases back (slight lift + scale) and fades to dark.
(function () {
  var ids = ['home', 'about', 'experience', 'projects', 'skills', 'contact'];
  var panels = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsSticky = window.CSS && CSS.supports && CSS.supports('position', 'sticky');
  if (!panels.length || reduce || !supportsSticky) return;

  var state = panels.map(function () { return { cur: 0, target: 0, covered: false }; });
  var enabled = false, raf = 0;

  panels.forEach(function (p, i) { p.classList.add('stack-panel'); p.style.zIndex = String(i + 1); });

  // In-flow position of a panel (getBoundingClientRect lies while panels are pinned).
  window.stackNaturalTop = function (el) {
    if (!enabled) return el.getBoundingClientRect().top + window.scrollY - document.getElementById('nav').offsetHeight + 1;
    var i = panels.indexOf(el);
    var host = panels[0].parentNode;                  // <main> is not sticky, so its offset is real
    var y = host.getBoundingClientRect().top + window.scrollY;
    for (var k = 0; k < i; k++) y += panels[k].offsetHeight;
    return y;
  };

  function ease(t) { return t * t * (3 - 2 * t); } // smoothstep

  function measure() {
    var want = window.innerHeight >= 560;  // too cramped on very short screens (phones in landscape)
    if (want !== enabled) {
      enabled = want;
      root.classList.toggle('stack-on', enabled);
      if (!enabled) panels.forEach(function (p, i) {
        p.style.top = ''; p.style.transform = ''; p.style.removeProperty('--dim');
        state[i].cur = state[i].target = 0; report(i, false);
      });
    }
    if (!enabled) return;
    var vh = window.innerHeight;
    // Panels taller than the screen scroll fully before pinning.
    panels.forEach(function (p) { p.style.top = Math.min(0, vh - p.offsetHeight) + 'px'; });
    readTargets();
    kick();
  }

  function readTargets() {
    var vh = window.innerHeight;
    panels.forEach(function (p, i) {
      var next = panels[i + 1];
      state[i].target = next ? Math.min(1, Math.max(0, 1 - next.getBoundingClientRect().top / vh)) : 0;
    });
  }

  function report(i, covered) {
    if (state[i].covered === covered) return;
    state[i].covered = covered;
    document.dispatchEvent(new CustomEvent('panelcover', { detail: { id: panels[i].id, covered: covered } }));
  }

  function step() {
    raf = 0;
    if (!enabled) return;
    readTargets();
    var moving = false;
    panels.forEach(function (p, i) {
      var s = state[i];
      s.cur += (s.target - s.cur) * 0.16;           // glide toward the scroll position
      if (Math.abs(s.target - s.cur) < 0.0015) s.cur = s.target; else moving = true;
      var e = ease(s.cur);
      p.style.transform = e > 0.0005
        ? 'translate3d(0,' + (-e * 16).toFixed(2) + 'px,0) scale(' + (1 - e * 0.03).toFixed(4) + ')'
        : '';
      p.style.setProperty('--dim', (e * 0.5).toFixed(3));
      report(i, s.target > 0.985);
    });
    if (moving) raf = requestAnimationFrame(step);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(step); }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(measure); panels.forEach(function (p) { ro.observe(p); }); }
  measure();
})();

// Navbar: mobile menu toggle, scrolled state, active link, in-page scrolling.
(function () {
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  function closeMenu() {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the nav link for the section in view, based on scroll position.
  var navAnchors = Array.prototype.slice.call(links.querySelectorAll('a:not(.btn)'));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    navAnchors.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  function currentSection() {
    var line = nav.offsetHeight + window.innerHeight * 0.3; // a line 30% down, below the navbar
    var current = sections[0];
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= line) current = s;
    });
    var doc = document.documentElement;
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) current = sections[sections.length - 1];
    return current;
  }

  var ticking = false;
  function updateActive() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (sections.length) setActive(currentSection().id);
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  // In-page links scroll by script so they work in any host and land below the sticky navbar.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var top = id === 'home' ? 0
      : window.stackNaturalTop ? window.stackNaturalTop(target)   // stacked panels: use their in-flow position
      : target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight + 1;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    if (navAnchors.some(function (n) { return n.getAttribute('href') === '#' + id; })) setActive(id);
  });
})();

// Diagram tabs (Architecture / Auth & payment flow), with arrow-key support.
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

// Footer: copy email, current year.
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

// ---------------------------------------------------------------------------
// 3D layer
// ---------------------------------------------------------------------------

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

// Paynow live 3D: load three.js only when the project section is close to the viewport.
(function () {
  var root = document.getElementById('p3d');
  var section = document.getElementById('projects');
  if (!root || !section) return;

  function fallback(msg) {
    var tab = document.getElementById('tab-3d');
    if (tab) tab.hidden = true;
    if (window.selectDiagramTab) window.selectDiagramTab('tab-arch');
    var l = root.querySelector('.p3d__loading'); if (l) l.textContent = msg;
  }
  if (!webglAvailable() || !('IntersectionObserver' in window) || !window.Promise) {
    fallback('3D view needs WebGL.');
    return;
  }

  var api = null, inView = false, tabOn = true;
  var covered = false;
  document.addEventListener('panelcover', function (e) { if (e.detail.id === 'projects') { covered = e.detail.covered; sync(); } });
  function sync() { if (api) api.setActive(inView && tabOn && !covered && !document.hidden); }
  document.addEventListener('diagramtab', function (e) { tabOn = e.detail === 'tab-3d'; sync(); });
  document.addEventListener('visibilitychange', sync);

  new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; sync(); })
    .observe(root);

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
