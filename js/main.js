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
        ? 'translate3d(0,' + (-e * 28).toFixed(2) + 'px,0) scale(' + (1 - e * 0.05).toFixed(4) + ')'
        : '';
      p.style.setProperty('--dim', (e * 0.62).toFixed(3));
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
var REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

// Hero: a slowly rotating 3D network of nodes (plain canvas, no library).
(function () {
  var canvas = document.getElementById('heroNet');
  var hero = document.getElementById('home');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, DPR = 1, pts = [], links = [], pulses = [];
  var rotY = 0, tiltX = 0.35, mouseX = 0, mouseY = 0, running = false, raf = 0, last = 0;

  function build() {
    var n = W < 700 ? 46 : 78;
    pts = []; links = [];
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      var j = 0.82 + Math.random() * 0.3;
      pts.push([Math.cos(th) * r * j, y * j, Math.sin(th) * r * j]);
    }
    for (var a = 0; a < n; a++) {
      var near = [];
      for (var b = 0; b < n; b++) if (a !== b) {
        var dx = pts[a][0] - pts[b][0], dy = pts[a][1] - pts[b][1], dz = pts[a][2] - pts[b][2];
        near.push([dx * dx + dy * dy + dz * dz, b]);
      }
      near.sort(function (p, q) { return p[0] - q[0]; });
      for (var k = 0; k < 3; k++) if (a < near[k][1]) links.push([a, near[k][1]]);
    }
  }
  function resize() {
    var r = hero.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    build();
    if (!running) draw(0);
  }
  function project(p, cx, cy, R) {
    var cosY = Math.cos(rotY + mouseX * 0.5), sinY = Math.sin(rotY + mouseX * 0.5);
    var x = p[0] * cosY - p[2] * sinY, z = p[0] * sinY + p[2] * cosY;
    var t = tiltX + mouseY * 0.3, cosX = Math.cos(t), sinX = Math.sin(t);
    var y = p[1] * cosX - z * sinX; z = p[1] * sinX + z * cosX;
    var f = 3.2 / (3.2 + z);
    return [cx + x * R * f, cy + y * R * f, z, f];
  }
  function draw(dt) {
    var narrow = W < 960;
    var cx = narrow ? W * 0.5 : W * 0.72, cy = narrow ? H * 0.72 : H * 0.47;
    var R = Math.min(narrow ? W * 0.62 : W * 0.34, H * 0.62);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var P = pts.map(function (p) { return project(p, cx, cy, R); });
    ctx.lineWidth = 1;
    links.forEach(function (l) {
      var a = P[l[0]], b = P[l[1]], depth = (2 - (a[2] + b[2]) / 2) / 3;
      ctx.strokeStyle = 'rgba(122,108,255,' + (0.08 + depth * 0.22).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    });
    P.forEach(function (p) {
      var depth = (1.2 - p[2]) / 2.4;
      ctx.fillStyle = 'rgba(201,194,255,' + (0.25 + depth * 0.6).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p[0], p[1], 1.2 + p[3] * 1.6, 0, Math.PI * 2); ctx.fill();
    });
    // packets travelling along links
    if (dt) {
      if (pulses.length < (narrow ? 4 : 8) && Math.random() < 0.06) pulses.push({ l: links[(Math.random() * links.length) | 0], t: 0, ok: Math.random() > 0.2 });
      pulses = pulses.filter(function (q) { q.t += dt * 0.7; return q.t < 1; });
    }
    pulses.forEach(function (q) {
      var a = P[q.l[0]], b = P[q.l[1]];
      var x = a[0] + (b[0] - a[0]) * q.t, y = a[1] + (b[1] - a[1]) * q.t;
      ctx.fillStyle = q.ok ? 'rgba(61,220,151,.9)' : 'rgba(255,107,122,.9)';
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
    });
  }
  function loop(ts) {
    raf = 0;
    if (!running) return;
    var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0; last = ts;
    rotY += dt * 0.12;
    draw(dt);
    raf = requestAnimationFrame(loop);
  }
  function setRunning(on) {
    if (REDUCE_MOTION) on = false;
    if (on === running) return;
    running = on; last = 0;
    if (on && !raf) raf = requestAnimationFrame(loop);
  }

  if (FINE_POINTER) hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / r.width - 0.5;
    mouseY = (e.clientY - r.top) / r.height - 0.5;
  });
  window.addEventListener('resize', resize);
  resize();
  if ('IntersectionObserver' in window) {
    var heroVisible = true, heroCovered = false;
    var heroSync = function () { setRunning(heroVisible && !heroCovered && !document.hidden); };
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; heroSync(); }).observe(hero);
    document.addEventListener('panelcover', function (e) { if (e.detail.id === 'home') { heroCovered = e.detail.covered; heroSync(); } });
  } else setRunning(true);
  document.addEventListener('visibilitychange', function () { if (document.hidden) setRunning(false); });
})();

// Hero: parallax depth on the photo, circle and code card (mouse only).
(function () {
  if (!FINE_POINTER || REDUCE_MOTION) return;
  var hero = document.getElementById('home');
  var layers = Array.prototype.slice.call(document.querySelectorAll('#heroVisual [data-depth]'));
  if (!hero || !layers.length) return;
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    var mx = (e.clientX - r.left) / r.width - 0.5, my = (e.clientY - r.top) / r.height - 0.5;
    layers.forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-depth'));
      el.style.translate = (-mx * d * 18).toFixed(1) + 'px ' + (-my * d * 14).toFixed(1) + 'px';
    });
  });
  hero.addEventListener('pointerleave', function () { layers.forEach(function (el) { el.style.translate = ''; }); });
})();

// Cards: subtle 3D tilt under the cursor (mouse only).
(function () {
  if (!FINE_POINTER || REDUCE_MOTION) return;
  Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'), function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add('is-tilting');
      el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg) translateY(-3px)';
    });
    el.addEventListener('pointerleave', function () { el.classList.remove('is-tilting'); el.style.transform = ''; });
  });
})();
