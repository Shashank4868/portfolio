/* Paynow live 3D architecture (Three.js r128 + OrbitControls, loaded on demand by main.js).
   window.initPaynow3D(root) builds the scene inside .p3d root and returns { setActive(bool) }.
   It is a client-side simulation of the request flow; it does not call a backend. */
(function () {
  window.initPaynow3D = function (root) {
    var THREE = window.THREE;
    var stage = root.querySelector('.p3d__stage');
    var labelsEl = root.querySelector('.p3d__labels');
    var hintEl = root.querySelector('.p3d__hint');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var coarse = window.matchMedia('(pointer: coarse)').matches;

    /* ---------- Scene ---------- */
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    stage.insertBefore(renderer.domElement, labelsEl);

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x070B1A, 26, 48);
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(-0.6, 14, 19);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(-0.4, 0.4, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;          // the page scrolls; zoom uses the +/- buttons instead
    controls.enableRotate = !coarse;      // on phones a swipe scrolls the page; rotate with buttons
    controls.minDistance = 9;
    controls.maxDistance = 34;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.35;
    controls.addEventListener('start', function () { controls.autoRotate = false; });
    if (coarse) renderer.domElement.style.touchAction = 'pan-y';
    hintEl.textContent = coarse ? 'Tap a service' : 'Drag to rotate · click a service';

    scene.add(new THREE.HemisphereLight(0xb9b2ff, 0x0b1124, 0.75));
    var key = new THREE.DirectionalLight(0xffffff, 0.8); key.position.set(6, 14, 8); scene.add(key);
    var rim = new THREE.PointLight(0x7a6cff, 1.1, 40); rim.position.set(-4, 6, -8); scene.add(rim);

    var grid = new THREE.GridHelper(40, 40, 0x2a3566, 0x161f3d);
    grid.material.transparent = true; grid.material.opacity = 0.55;
    scene.add(grid);

    /* ---------- Nodes ---------- */
    var INFO = {
      client: ['Client', 'Web or mobile UI. Logs in through Keycloak, then sends payments with the JWT as a bearer token.'],
      keycloak: ['Keycloak', 'Identity provider (OAuth2/OIDC). Verifies credentials and issues JWT access tokens. The gateway fetches its signing keys (JWKS) to validate tokens.'],
      gateway: ['API Gateway', 'Spring Cloud Gateway running as a Spring Security resource server. Checks JWT signature, expiry, issuer and audience, rejects bad tokens with <code>401</code>, and forwards the caller identity taken from token claims.'],
      profile: ['User profile / auth', 'User-profile/auth service behind the gateway.'],
      payment: ['Payment service', 'REST API: <code>POST /payments/create-payment</code>, <code>GET /payments/{id}</code>. Validates input, enforces idempotency keys, saves payments as pending, publishes <code>payment.created</code> and applies decisions from <code>payment.decision</code> with status-transition rules.'],
      postgres: ['PostgreSQL', 'The <code>payments</code> database. Liquibase manages the schema; a uniqueness constraint on the idempotency key blocks duplicate payments (<code>409</code>).'],
      kafka: ['Apache Kafka', 'Asynchronous backbone between services. Topics: <code>payment.created</code>, <code>payment.decision</code> and the notification topic.'],
      fraud: ['Fraud detection', 'Consumes <code>payment.created</code>, evaluates fraud rules, then publishes an approve or flag decision to <code>payment.decision</code> and an event for the notification service.'],
      notification: ['Notification service', 'Consumes notification events and sends the email over SMTP.']
    };

    var NODE_DEF = {
      client:       { p: [-9.6, -0.2], s: [1.9, 0.9, 1.4], c: 0x8b93b8 },
      keycloak:     { p: [-5.6, -4.4], s: [2.4, 1.0, 1.6], c: 0x3ddc97 },
      gateway:      { p: [-5.6,  0.0], s: [2.4, 1.3, 1.7], c: 0x7a6cff },
      profile:      { p: [-5.6,  4.4], s: [2.4, 1.0, 1.6], c: 0x6f7aa6 },
      payment:      { p: [-1.2,  0.0], s: [2.6, 1.5, 1.9], c: 0x7a6cff },
      fraud:        { p: [ 6.6, -2.8], s: [2.6, 1.3, 1.7], c: 0xf3a86b },
      notification: { p: [ 6.6,  3.0], s: [2.6, 1.1, 1.7], c: 0x7fd3c5 }
    };

    var pickables = [];
    var nodes = {};
    var labelItems = [];

    function addLabel(id, text, pos, cls) {
      var el = document.createElement('div');
      el.className = 'p3d__lbl' + (cls ? ' ' + cls : '');
      el.textContent = text;
      labelsEl.appendChild(el);
      var item = { el: el, pos: pos, id: id };
      labelItems.push(item);
      return item;
    }

    Object.keys(NODE_DEF).forEach(function (id) {
      var d = NODE_DEF[id];
      var geo = new THREE.BoxGeometry(d.s[0], d.s[1], d.s[2]);
      var mat = new THREE.MeshStandardMaterial({
        color: 0x10172f, emissive: d.c, emissiveIntensity: 0.16, roughness: 0.45, metalness: 0.2,
        transparent: id === 'client', opacity: id === 'client' ? 0.55 : 1
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(d.p[0], d.s[1] / 2, d.p[1]);
      mesh.userData.id = id;
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: d.c })));
      scene.add(mesh);
      pickables.push(mesh);
      nodes[id] = { mesh: mesh, mat: mat, anchor: new THREE.Vector3(d.p[0], d.s[1] * 0.55, d.p[1]), flash: 0, baseY: d.s[1] / 2 };
      addLabel(id, INFO[id][0], new THREE.Vector3(d.p[0], d.s[1] + 0.35, d.p[1]));
    });

    (function () { // PostgreSQL
      var geo = new THREE.CylinderGeometry(0.95, 0.95, 1.3, 40);
      var mat = new THREE.MeshStandardMaterial({ color: 0x10172f, emissive: 0x4f8cc9, emissiveIntensity: 0.18, roughness: 0.4, metalness: 0.25 });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-1.2, 0.65, 4.4);
      mesh.userData.id = 'postgres';
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: 0x4f8cc9 })));
      scene.add(mesh); pickables.push(mesh);
      nodes.postgres = { mesh: mesh, mat: mat, anchor: new THREE.Vector3(-1.2, 0.8, 4.4), flash: 0, baseY: 0.65 };
      addLabel('postgres', 'PostgreSQL', new THREE.Vector3(-1.2, 1.65, 4.4));
    })();

    var KX = 2.7, KY = 1.0;
    var TOPICS = { t_created: -2.8, t_decision: 0.0, t_notif: 3.0 };
    var TOPIC_NAMES = { t_created: 'payment.created', t_decision: 'payment.decision', t_notif: 'notification' };
    (function () { // Kafka
      var len = 9.4;
      var geo = new THREE.CylinderGeometry(0.62, 0.62, len, 40, 1, true);
      var mat = new THREE.MeshStandardMaterial({ color: 0x5b4be8, emissive: 0x5b4be8, emissiveIntensity: 0.35, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
      var tube = new THREE.Mesh(geo, mat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(KX, KY, 0.1);
      tube.userData.id = 'kafka';
      scene.add(tube); pickables.push(tube);
      var core = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8), new THREE.MeshBasicMaterial({ color: 0x9b8cff, transparent: true, opacity: 0.5 }));
      core.rotation.x = Math.PI / 2; core.position.copy(tube.position); scene.add(core);
      [-3.8, 3.9].forEach(function (z) {
        var leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, KY - 0.4, 0.12), new THREE.MeshStandardMaterial({ color: 0x2a3566 }));
        leg.position.set(KX, (KY - 0.4) / 2, z); scene.add(leg);
      });
      nodes.kafka = { mesh: tube, mat: mat, anchor: new THREE.Vector3(KX, KY, 0), flash: 0, isKafka: true };
      addLabel('kafka', 'Apache Kafka', new THREE.Vector3(KX, KY + 1.15, -5.0));
      Object.keys(TOPICS).forEach(function (t) {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.07, 10, 48), new THREE.MeshBasicMaterial({ color: 0x9b8cff }));
        ring.position.set(KX, KY, TOPICS[t]);
        scene.add(ring);
        nodes[t] = { mesh: ring, mat: ring.material, anchor: new THREE.Vector3(KX, KY, TOPICS[t]), flash: 0, isTopic: true };
        var item = addLabel(t, TOPIC_NAMES[t], new THREE.Vector3(KX, KY + 0.95, TOPICS[t]), 'is-topic');
        if (t === 't_decision') item.portraitPos = new THREE.Vector3(KX + 1.4, KY - 0.2, TOPICS[t]);
      });
    })();

    /* ---------- Edges ---------- */
    var curves = {};
    function edgeKey(a, b) { return a + '>' + b; }
    function addEdge(a, b, opts) {
      opts = opts || {};
      var A = nodes[a].anchor, B = nodes[b].anchor;
      var mid = A.clone().add(B).multiplyScalar(0.5);
      mid.y += opts.lift != null ? opts.lift : 0.7 + A.distanceTo(B) * 0.09;
      var curve = new THREE.QuadraticBezierCurve3(A.clone(), mid, B.clone());
      var len = curve.getLength();
      curves[edgeKey(a, b)] = { curve: curve, rev: false, len: len };
      curves[edgeKey(b, a)] = { curve: curve, rev: true, len: len };
      var g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
      var m = opts.dashed
        ? new THREE.LineDashedMaterial({ color: 0x3ddc97, dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.7 })
        : new THREE.LineBasicMaterial({ color: 0x6b76b8, transparent: true, opacity: 0.9 });
      var line = new THREE.Line(g, m);
      if (opts.dashed) line.computeLineDistances();
      scene.add(line);
    }
    addEdge('client', 'keycloak');
    addEdge('client', 'gateway');
    addEdge('gateway', 'keycloak', { dashed: true });
    addEdge('gateway', 'profile');
    addEdge('gateway', 'payment');
    addEdge('payment', 'postgres');
    addEdge('payment', 't_created');
    addEdge('t_created', 'fraud');
    addEdge('fraud', 't_decision');
    addEdge('t_decision', 'payment', { lift: 0.5 });
    addEdge('fraud', 't_notif');
    addEdge('t_notif', 'notification');

    /* ---------- Packets ---------- */
    var COLORS = { req: 0x9b8cff, ok: 0x3ddc97, bad: 0xff6b7a, warn: 0xf3a86b };
    var packets = [];
    var SPEED = reduceMotion ? 4.2 : 6.5;
    var sphereGeo = new THREE.SphereGeometry(0.2, 16, 12);
    var glowGeo = new THREE.SphereGeometry(0.36, 16, 12);

    function makePacket(steps, colorKey) {
      var group = new THREE.Group();
      var core = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: COLORS[colorKey] }));
      var glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color: COLORS[colorKey], transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false }));
      group.add(core); group.add(glow);
      scene.add(group);
      group.position.copy(nodes[steps[0].from || steps[0].at].anchor);
      packets.push({ group: group, core: core, glow: glow, steps: steps, i: 0, t: 0, wait: 0, started: false });
    }
    function setColor(pk, k) { pk.core.material.color.setHex(COLORS[k]); pk.glow.material.color.setHex(COLORS[k]); }
    function flash(id) { if (nodes[id]) nodes[id].flash = 1; }

    function updatePackets(dt) {
      for (var k = packets.length - 1; k >= 0; k--) {
        var pk = packets[k], st = pk.steps[pk.i], done = false;
        if (!pk.started) {
          pk.started = true;
          if (st.color) setColor(pk, st.color);
          if (st.onStart) st.onStart();
          if (st.at) { pk.wait = st.wait || 0.3; flash(st.at); }
        }
        if (st.at) {
          pk.wait -= dt;
          done = pk.wait <= 0;
        } else {
          var c = curves[edgeKey(st.from, st.to)];
          pk.t = Math.min(1, pk.t + dt * SPEED / c.len);
          c.curve.getPoint(c.rev ? 1 - pk.t : pk.t, pk.group.position);
          done = pk.t >= 1;
        }
        if (done) {
          if (!st.at) flash(st.to);
          if (st.log) log(st.log[0], st.log[1], st.log[2]);
          if (st.onArrive) st.onArrive();
          pk.i++; pk.t = 0; pk.started = false;
          if (pk.i >= pk.steps.length) {
            scene.remove(pk.group);
            pk.core.material.dispose(); pk.glow.material.dispose();
            packets.splice(k, 1);
          }
        }
      }
    }

    /* ---------- Log + stats ---------- */
    var logEl = root.querySelector('.p3d__log');
    function log(tag, text, tone) {
      var li = document.createElement('li');
      if (tone) li.className = tone;
      li.innerHTML = '<b>' + tag + '</b> ' + text;
      logEl.insertBefore(li, logEl.firstChild);
      while (logEl.children.length > 40) logEl.removeChild(logEl.lastChild);
    }
    var stats = { sent: 0, ok: 0, flag: 0, rej: 0 };
    function bump(k) { stats[k]++; root.querySelector('[data-stat="' + k + '"]').textContent = stats[k]; }

    /* ---------- Journeys ---------- */
    var seq = 1040, lastId = null;

    function login() {
      makePacket([
        { from: 'client', to: 'keycloak', log: ['login', 'credentials sent to Keycloak'] },
        { from: 'keycloak', to: 'client', color: 'ok', log: ['login', 'JWT access token issued', 'ok'] }
      ], 'req');
    }
    function payment() {
      var id = 'PAY-' + (++seq);
      lastId = id;
      var flagged = Math.random() < 0.22;
      bump('sent');
      makePacket([
        { from: 'client', to: 'gateway', log: [id, '<code>POST /payments/create-payment</code> + Bearer JWT'] },
        { at: 'gateway', wait: 0.25, log: [id, 'JWT valid: signature, expiry, issuer, audience'] },
        { from: 'gateway', to: 'payment', log: [id, 'request valid, idempotency key is new'] },
        { from: 'payment', to: 'postgres', log: [id, 'saved as <code>PENDING</code>'] },
        { from: 'postgres', to: 'payment', log: [id, '<code>201 Created</code> returned to client'] },
        { from: 'payment', to: 't_created', log: [id, 'published to <code>payment.created</code>'] },
        { from: 't_created', to: 'fraud' },
        { at: 'fraud', wait: 0.45, log: [id, 'fraud rules evaluated'] },
        {
          from: 'fraud', to: 't_decision', color: flagged ? 'bad' : 'ok',
          onStart: function () {
            makePacket([
              { from: 'fraud', to: 't_notif' },
              { from: 't_notif', to: 'notification', log: [id, 'email notification sent'] }
            ], flagged ? 'bad' : 'ok');
          },
          log: [id, flagged ? 'decision: <code>FLAG</code>' : 'decision: <code>APPROVE</code>', flagged ? 'bad' : 'ok']
        },
        { from: 't_decision', to: 'payment' },
        {
          from: 'payment', to: 'postgres',
          log: [id, 'status → ' + (flagged ? '<code>FLAGGED</code>' : '<code>APPROVED</code>'), flagged ? 'bad' : 'ok'],
          onArrive: function () { bump(flagged ? 'flag' : 'ok'); }
        }
      ], 'req');
    }
    function invalidToken() {
      makePacket([
        { from: 'client', to: 'gateway', log: ['auth', 'payment request with expired/forged token'] },
        { from: 'gateway', to: 'keycloak', log: ['auth', 'gateway fetches signing keys (JWKS)'] },
        { from: 'keycloak', to: 'gateway' },
        { at: 'gateway', wait: 0.3, color: 'bad', log: ['auth', 'token signature check failed', 'bad'] },
        { from: 'gateway', to: 'client', log: ['auth', '<code>401 Unauthorized</code>', 'bad'], onArrive: function () { bump('rej'); } }
      ], 'req');
    }
    function duplicate() {
      var id = lastId || ('PAY-' + seq);
      makePacket([
        { from: 'client', to: 'gateway', log: [id, 'retry with the same idempotency key'] },
        { from: 'gateway', to: 'payment' },
        { from: 'payment', to: 'postgres' },
        { at: 'postgres', wait: 0.3, color: 'warn', log: [id, 'unique constraint hit: key already used', 'warn'] },
        { from: 'postgres', to: 'payment' },
        { from: 'payment', to: 'gateway' },
        { from: 'gateway', to: 'client', log: [id, '<code>409 Conflict</code>, no double charge', 'warn'], onArrive: function () { bump('rej'); } }
      ], 'req');
    }

    var auto = !reduceMotion, autoTimer = 0.6, autoCount = 0;
    var autoBtn = root.querySelector('[data-act="auto"]');
    function renderAuto() { autoBtn.setAttribute('aria-pressed', String(auto)); autoBtn.textContent = 'Auto traffic: ' + (auto ? 'on' : 'off'); }
    renderAuto();
    function autoTick(dt) {
      if (!auto) return;
      autoTimer -= dt;
      if (autoTimer > 0) return;
      autoTimer = 2.3;
      autoCount++;
      if (autoCount % 9 === 0) invalidToken();
      else if (autoCount % 13 === 0) duplicate();
      else payment();
    }

    /* ---------- Camera buttons ---------- */
    var sph = new THREE.Spherical();
    function orbit(dAz, scale) {
      var off = camera.position.clone().sub(controls.target);
      sph.setFromVector3(off);
      sph.theta += dAz;
      sph.radius = Math.min(controls.maxDistance, Math.max(controls.minDistance, sph.radius * scale));
      off.setFromSpherical(sph);
      camera.position.copy(controls.target).add(off);
      controls.autoRotate = false;
    }

    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var a = b.getAttribute('data-act');
      if (a === 'pay') payment();
      else if (a === 'login') login();
      else if (a === 'bad') invalidToken();
      else if (a === 'dup') duplicate();
      else if (a === 'auto') { auto = !auto; autoTimer = 0; renderAuto(); }
      else if (a === 'zin') orbit(0, 0.85);
      else if (a === 'zout') orbit(0, 1.18);
      else if (a === 'rl') orbit(-0.4, 1);
      else if (a === 'rr') orbit(0.4, 1);
    });

    /* ---------- Picking + inspector ---------- */
    var ray = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    var hovered = null, selected = null, downAt = null;
    var infoEl = root.querySelector('.p3d__info');

    function pick(ev) {
      var r = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(pointer, camera);
      var hit = ray.intersectObjects(pickables, false)[0];
      return hit ? hit.object.userData.id : null;
    }
    function select(id) {
      selected = id;
      labelItems.forEach(function (l) { l.el.classList.toggle('is-on', l.id === id); });
      if (id) infoEl.innerHTML = '<h4>' + INFO[id][0] + '</h4><p>' + INFO[id][1] + '</p>';
    }
    renderer.domElement.addEventListener('pointermove', function (ev) {
      if (ev.pointerType !== 'mouse') return;
      hovered = pick(ev);
      renderer.domElement.style.cursor = hovered ? 'pointer' : '';
    });
    renderer.domElement.addEventListener('pointerdown', function (ev) { downAt = [ev.clientX, ev.clientY]; });
    renderer.domElement.addEventListener('pointerup', function (ev) {
      if (!downAt) return;
      var moved = Math.abs(ev.clientX - downAt[0]) + Math.abs(ev.clientY - downAt[1]);
      downAt = null;
      if (moved > 6) return;
      var id = pick(ev);
      if (id) select(id);
    });

    /* ---------- Resize ---------- */
    var portrait = false;
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var p = w / h < 1;
      camera.fov = p ? 46 : 38;
      camera.updateProjectionMatrix();
      stage.classList.toggle('is-portrait', p);
      if (p !== portrait) {
        portrait = p;
        // Portrait: look along the x axis so the flow runs top to bottom.
        if (p) { camera.position.set(17, 22, 0.01); controls.target.set(-1.2, 0, 0); }
        else { camera.position.set(-0.6, 14, 19); controls.target.set(-0.4, 0.4, 0); }
      }
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    window.addEventListener('resize', resize);
    resize();

    /* ---------- Loop (runs only while visible) ---------- */
    var tmp = new THREE.Vector3();
    var clock = new THREE.Clock();
    var time = 0, running = false, rafId = 0;

    function frame() {
      rafId = 0;
      if (!running) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      time += dt;
      controls.update();
      autoTick(dt);
      updatePackets(dt);

      Object.keys(nodes).forEach(function (id) {
        var n = nodes[id];
        n.flash = Math.max(0, n.flash - dt * 2.2);
        var on = (id === hovered || id === selected) ? 0.25 : 0;
        if (n.isTopic) {
          var s = 1 + n.flash * 0.35; n.mesh.scale.set(s, s, s);
        } else if (n.isKafka) {
          n.mat.opacity = 0.22 + n.flash * 0.2 + on * 0.4;
        } else {
          n.mat.emissiveIntensity = 0.16 + n.flash * 0.7 + on;
          n.mesh.position.y = n.baseY + n.flash * 0.12 + (reduceMotion ? 0 : Math.sin(time * 1.4 + n.anchor.x) * 0.03);
        }
      });
      packets.forEach(function (pk) { var s = 1 + Math.sin(time * 10) * 0.12; pk.glow.scale.set(s, s, s); });

      renderer.render(scene, camera);

      var w = stage.clientWidth, h = stage.clientHeight;
      labelItems.forEach(function (l) {
        tmp.copy(portrait && l.portraitPos ? l.portraitPos : l.pos).project(camera);
        var visible = tmp.z < 1 && tmp.x > -1.2 && tmp.x < 1.2 && tmp.y > -1.2 && tmp.y < 1.2;
        l.el.style.display = visible ? '' : 'none';
        if (visible) l.el.style.transform = 'translate(' + ((tmp.x + 1) / 2 * w) + 'px,' + ((1 - tmp.y) / 2 * h) + 'px) translate(-50%,-100%)';
      });

      rafId = requestAnimationFrame(frame);
    }

    function setActive(on) {
      if (on === running) return;
      running = on;
      if (on) { resize(); clock.getDelta(); if (!rafId) rafId = requestAnimationFrame(frame); }
    }

    login();
    log('system', 'services up · Kafka topics ready');
    select('payment');
    root.classList.add('is-ready');
    return { setActive: setActive };
  };
})();
