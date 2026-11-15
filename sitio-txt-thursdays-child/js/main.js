/* =========================================================
   minisode 2: Thursday's Child — interacciones
   1. Tema día / noche            5. Concept photos: escenario desde Figma
   2. Header: sección actual      6. Carruseles (solo uno activo a la vez)
   7b. Tracklist: audio + vinilo
   9. Merch: filtros, álbumes (hover de Figma) y camisetas
   3. Grietas y triángulos        7. Parallax (textos, fondo, fotos + logos)
   4. Hero: la foto se rompe al hacer scroll
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  root.classList.add('js');

  /* ---------- 0. Siempre abrir en el top hero ----------
     Los navegadores (sobre todo en el celular) recuerdan dónde ibas o siguen el #enlace de la URL
     y abren la página a mitad de camino. Aquí se desactiva eso y se vuelve al inicio. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  const alInicio = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  alInicio();
  window.addEventListener('load', alInicio);
  window.addEventListener('pageshow', e => { if (e.persisted) alInicio(); });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Tema ---------- */
  const themeBtns = $$('[data-set-theme]');
  function setTheme(t) {
    // Cambiar de modo cambia algunas alturas (fotos, tarjetas): se conserva el punto donde estabas
    const y = window.scrollY;
    root.setAttribute('data-theme', t);
    const volver = () => { if (Math.abs(window.scrollY - y) > 2) window.scrollTo({ top: y, behavior: 'instant' }); };
    requestAnimationFrame(volver); setTimeout(volver, 250);
    // La foto del hero es un fondo CSS: su texto alternativo cambia con el modo
    const fondo = $('.hero__fondo');
    if (fondo) fondo.setAttribute('aria-label', t === 'light' ? fondo.dataset.altDia : fondo.dataset.altNoche);
    themeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setTheme === t)));
    try { localStorage.setItem('tema', t); } catch (e) {}
  }
  themeBtns.forEach(b => b.addEventListener('click', () => setTheme(b.dataset.setTheme)));
  setTheme(root.getAttribute('data-theme') || 'dark');

  /* ---------- 2. Header: menú mobile + sección actual ---------- */
  const menuBtn = $('.menu-btn');
  const nav = $('#nav');
  const actualTxt = $('.header__actual-txt');
  function cerrarMenu() {
    nav.classList.remove('is-abierto');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    menuBtn.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  }
  menuBtn.addEventListener('click', () => {
    const abierto = nav.classList.toggle('is-abierto');
    menuBtn.setAttribute('aria-expanded', String(abierto));
    menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    menuBtn.innerHTML = abierto ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
  });
  $$('a', nav).forEach(a => a.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-abierto')) { cerrarMenu(); menuBtn.focus(); } });

  // La sección actual es la que cruza la línea a ~35 % de la pantalla
  const navLinks = $$('.nav__link');
  const secciones = ['inicio', 'about', 'concept', 'tracklist', 'merch', 'suscribete'].map(id => document.getElementById(id)).filter(Boolean);
  const NOMBRES = { inicio: 'Inicio', about: 'About', concept: 'Concept photos', tracklist: 'Tracklist', merch: 'Merch', suscribete: 'Suscríbete' };
  let seccionActual = '';
  function marcarSeccion() {
    const linea = window.innerHeight * .35;
    let id = secciones[0].id;
    secciones.forEach(s => { if (s.getBoundingClientRect().top <= linea) id = s.id; });
    // al llegar al final de la página, la última sección
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = secciones[secciones.length - 1].id;
    if (id === seccionActual) return;
    seccionActual = id;
    navLinks.forEach(l => {
      const on = l.getAttribute('href') === '#' + id;
      l.setAttribute('aria-current', String(on));
    });
    actualTxt.textContent = NOMBRES[id] || '';
  }

  /* ---------- 3. Grietas (mismo algoritmo y semilla que en Figma) y triángulos ---------- */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pts = arr => 'M ' + arr.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ');
  function build(W, H, ox, oy, a0, a1, n) {
    const lines = [];
    const inB = (x, y) => x >= 0 && x <= W && y >= 0 && y <= H;
    const line = (p, w) => lines.push(`<path class="g-linea" pathLength="1" stroke-width="${w}" d="${pts(p)}"/>`);
    for (let i = 0; i < n; i++) {
      let ang = a0 + (a1 - a0) * (i + .5) / n + (rnd() - .5) * .3, x = ox, y = oy; const p = [[x, y]]; const thick = i % 3 === 0; let guard = 0;
      while (guard++ < 40) {
        const L = 40 + rnd() * 90; ang += (rnd() - .5) * .6; x += Math.cos(ang) * L; y += Math.sin(ang) * L;
        if (!inB(x, y)) { x = Math.max(0, Math.min(W, x)); y = Math.max(0, Math.min(H, y)); p.push([x, y]); break; }
        p.push([x, y]);
        if (rnd() < .35) {
          let tx = x, ty = y, ta = ang + (rnd() < .5 ? 1 : -1) * (.6 + rnd() * .6); const tp = [[tx, ty]];
          for (let k = 0; k < 2 + Math.floor(rnd() * 2); k++) { const l = 30 + rnd() * 60; ta += (rnd() - .5) * .5; tx += Math.cos(ta) * l; ty += Math.sin(ta) * l; if (!inB(tx, ty)) break; tp.push([tx, ty]); }
          if (tp.length > 1) line(tp, 1);
        }
      }
      line(p, thick ? 3 : 1.4);
    }
    for (let i = 0; i < 14; i++) { const x = rnd() * W, y = rnd() * H, a = rnd() * Math.PI, l = 40 + rnd() * 80; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; if (inB(x2, y2)) line([[x, y], [x2, y2]], 1); }
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" focusable="false">${lines.join('')}</svg>`;
  }
  for (let i = 0; i < 14; i++) rnd();
  const GRIETA = {
    radial: build(1000, 900, 500, 450, 0, Math.PI * 2, 13),
    lateral: build(700, 900, 0, 450, -1.25, 1.25, 9)
  };
  $$('[data-grieta]').forEach(el => { el.innerHTML = GRIETA[el.dataset.grieta] || ''; });

  // Triángulo del vidrio (misma forma del "Fragmento" de Figma)
  const TRI = '<svg viewBox="0 0 62 51" preserveAspectRatio="none" focusable="false"><path class="tri" d="M62 41.7 L0 51 L17.4 0 Z"/></svg>';
  let semillaTri = 3;
  const rTri = () => { semillaTri = (semillaTri * 16807) % 2147483647; return (semillaTri - 1) / 2147483646; };
  // Cada triángulo es su propio SVG: mantiene la forma sin importar el tamaño del contenedor
  function nubeTriangulos(n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = 2 + rTri() * 90, y = 2 + rTri() * 86, w = 5 + rTri() * 8, r = rTri() * 360;
      s += `<span class="tri-s" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:clamp(16px, ${(w * .26).toFixed(2)}vw, ${Math.round(w * 5)}px);transform:rotate(${r.toFixed(0)}deg)">${TRI}</span>`;
    }
    return s;
  }
  $$('[data-triangulos]').forEach(el => { el.innerHTML = nubeTriangulos(+el.dataset.triangulos || 8); });

  // Dibujar grietas al entrar en pantalla
  // Hero: se dibuja al abrir la página
  function observarDibujo() { const h = $('.grieta--hero'); if (h) h.classList.add('is-dibujada'); }
  // Demás grietas: se dibujan al bajar y se borran al subir, siguiendo el scroll
  function scrubGrietas() {
    const vh = window.innerHeight;
    $$('[data-scrub]').forEach(el => {
      if (el.closest('[hidden]')) return;
      const r = el.getBoundingClientRect();
      // Empieza al asomar por abajo y termina cuando el centro de la grieta llega a ~35 % de la pantalla
      const fin = vh * .35 - r.height / 2;
      const t = Math.min(1, Math.max(0, (vh - r.top) / (vh - fin)));
      const d = reduceMotion ? 1 : t * t * (3 - 2 * t);
      el.style.setProperty('--d', d.toFixed(3));
    });
  }
  observarDibujo();

  /* ---------- 4. Hero: la foto se rompe al hacer scroll ---------- */
  const hero = $('.hero');
  const vidrio = $('.hero__vidrio');
  let fragmentos = [];
  function crearVidrio() {
    const mobile = window.innerWidth <= 900;
    const cx = mobile ? 99 : 84, cy = mobile ? 42 : 56;               // punto de impacto (% de la foto) = centro de la grieta
    let s = 21; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const N = 13, anillos = [0, 14, 34, 64, 220];
    const ang = Array.from({ length: N }, (_, i) => (i + .5 + (r() - .5) * .6) / N * Math.PI * 2);
    const B = ang.map(a => anillos.map((rad, k) => { const j = k === 0 ? 0 : rad * (.85 + r() * .3); return [cx + Math.cos(a) * j, cy + Math.sin(a) * j * 1.15]; }));
    vidrio.innerHTML = ''; fragmentos = [];
    for (let i = 0; i < N; i++) {
      const i2 = (i + 1) % N;
      for (let k = 0; k < anillos.length - 1; k++) {
        const p = k === 0 ? [B[i][0], B[i][1], B[i2][1]] : [B[i][k], B[i][k + 1], B[i2][k + 1], B[i2][k]];
        const d = document.createElement('div');
        d.className = 'fragmento';
        d.style.clipPath = 'polygon(' + p.map(q => q[0].toFixed(2) + '% ' + q[1].toFixed(2) + '%').join(',') + ')';
        const mx = p.reduce((a, q) => a + q[0], 0) / p.length, my = p.reduce((a, q) => a + q[1], 0) / p.length;
        d.style.transformOrigin = mx.toFixed(1) + '% ' + my.toFixed(1) + '%';
        const dir = Math.atan2(my - cy, mx - cx);
        fragmentos.push({ el: d, dx: Math.cos(dir), dy: Math.sin(dir), dist: (40 + k * 70) * (.7 + r() * .6), rot: (r() - .5) * 18 * (k + 1) / 2 });
        vidrio.appendChild(d);
      }
    }
  }
  function updateVidrio() {
    const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * .9)));
    const e = p * p * (3 - 2 * p);
    fragmentos.forEach(f => {
      f.el.style.setProperty('--tx', (f.dx * f.dist * e * 1.7).toFixed(1) + 'px');
      f.el.style.setProperty('--ty', (f.dy * f.dist * e * 1.7).toFixed(1) + 'px');
      f.el.style.setProperty('--rot', (f.rot * e).toFixed(2) + 'deg');
    });
  }
  crearVidrio();

  /* ---------- 5. Concept photos: composición de Figma ---------- */
  // Fotos exactas de Figma (Foto concept: Era × Miembro × Número)
  const MIEMBROS = ['Soobin', 'Yeonjun', 'Beomgyu', 'Taehyun', 'Hueningkai'];
  const SEL = {
    END: { Soobin: [2, 4, 5], Yeonjun: [2, 4, 5], Beomgyu: [2, 4, 5], Taehyun: [2, 4, 5], Hueningkai: [2, 4, 5] },
    MESS: { Soobin: [1, 3, 4], Yeonjun: [1, 2, 4], Beomgyu: [1, 3, 4], Taehyun: [1, 2, 4], Hueningkai: [1, 3, 4] },
    HATE: { Soobin: [1, 3, 4], Yeonjun: [1, 3, 2], Beomgyu: [1, 3, 5], Taehyun: [1, 2, 5], Hueningkai: [1, 3, 5] }
  };
  const fotosDe = (era, m) => m === 'Grupal'
    ? MIEMBROS.map(x => `assets/img/fotos/${x.toLowerCase()}_hate-6.jpg`)
    : SEL[era][m].map(n => `assets/img/fotos/${m.toLowerCase()}_${era.toLowerCase()}-${n}.jpg`);

  // Composiciones (px de Figma; r = rotación de Figma). "lejos" = foto desenfocada (más atrás).
  const LEJOS = { END: ['Soobin', 'Hueningkai'], HATE: ['Soobin', 'Taehyun'], MESS: ['Beomgyu', 'Taehyun'] };
  const LAYOUT = {
    desktop: {
      W: 1920, pad: 16, pie: 64, pol: [320, 420], grupal: [720, 460], stk: 140,
      panel: [1805, 91, 1680, 1710, -89],
      tres: [120, 72, 200, 190], final: [307, 202, 120, 120],
      tabs: [[120, 359], [347, 359], [574, 359]], tab: [195, 67],
      grietas: [[-37, 482, 433, 556, 0], [1699, 2060, 433, 556, 132]],
      palabraLH: 190,
      eras: {
        END: {
          palabras: [['END', 400, 1191, 395, -13], ['HATE', 350, 270, 973, 20], ['MESS', 300, 979, 1284, -24]],
          pol: { Soobin: [139, 565, 12], Beomgyu: [280, 1317, -11], Yeonjun: [770, 862, 9], Taehyun: [1420, 490, -18], Hueningkai: [1315, 1185, -7] },
          stk: { Yeonjun: [994, 784, 16], Taehyun: [1343, 462, 16], Soobin: [401, 427, -14], Beomgyu: [209, 1247, 0], Hueningkai: [1579, 1143, -22] },
          frag: '1669,818,62,51,0 1664,919,43,44,-51 1213,1236,60,60,0 493,1228,67,56,0 760,1105,28,31,0 503,563,59,68,0 1136,900,28,34,0 819,1296,46,44,0 1312,1099,62,51,0 1628,1295,60,60,0 653,1422,67,56,-57 1259,739,28,31,0 1273,897,59,68,0 544,690,28,34,0 594,1611,46,44,0 555,812,69,76,0'
        },
        HATE: {
          palabras: [['END', 300, 1193, 288, -13], ['HATE', 400, 152, 1066, 20], ['MESS', 350, 960, 1297, -24]],
          pol: { Beomgyu: [773, 1195, 8], Grupal: [605, 531, -5], Hueningkai: [1459, 467, -13], Soobin: [45, 619, 22], Taehyun: [1453, 1272, -6], Yeonjun: [256, 1272, -17] },
          stk: { Yeonjun: [475, 1300, 0], Beomgyu: [690, 1173, 24], Taehyun: [1352, 1327, 61], Hueningkai: [1725, 454, -24], Soobin: [322, 441, -24] },
          frag: '1456,1202,62,51,0 1701,961,43,44,-51 1157,1151,60,60,0 442,1216,67,56,0 1076,517,28,31,0 503,563,59,68,0 1241,888,28,34,0 727,1455,46,44,0 810,1038,69,76,0'
        },
        MESS: {
          palabras: [['END', 350, 1191, 395, -13], ['HATE', 300, 180, 883, 20], ['MESS', 400, 989, 1227, -24]],
          pol: { Beomgyu: [163, 1400, 19], Hueningkai: [1457, 1067, -22], Soobin: [263, 572, -24], Taehyun: [1485, 360, -17], Yeonjun: [733, 906, 8] },
          stk: { Yeonjun: [975, 789, -14], Taehyun: [1387, 346, 28], Beomgyu: [91, 1352, 12], Hueningkai: [1616, 1106, 12], Soobin: [507, 613, -23] },
          frag: '1676,826,62,51,0 1738,765,43,44,-51 1252,1449,60,60,0 1011,741,67,56,0 1084,841,28,31,0 386,531,59,68,0 1338,1168,28,34,0 728,1239,46,44,0 1435,1010,62,51,0 1628,1295,60,60,0 656,1615,67,56,-57 1324,710,28,31,0 1366,1061,59,68,0 448,604,28,34,0 563,1739,46,44,0 374,1083,69,76,0'
        }
      }
    },
    mobile: {
      W: 393, pad: 10, pie: 44, pol: [176, 236], grupal: [215, 144], stk: 64,
      panel: [370, 1724, 353, 1679, 180],
      tres: [19, 29, 64, 70], final: [92, 69, 40, 44],
      tabs: [[20, 139], [145, 139], [270, 139]], tab: [103, 43],
      grietas: [[347, 539, 268, 344, 159], [85, 716, 268, 344, -37], [336, 1918, 268, 344, 159]],
      palabraLH: 70,
      eras: {
        END: {
          palabras: [['END', 128, 200, 444, -14], ['HATE', 112, 33, 1096, -14], ['MESS', 98, 160, 1661, 14]],
          pol: { Soobin: [26, 299, 14], Yeonjun: [179, 546, -17], Beomgyu: [48, 885, 10], Taehyun: [174, 1150, -9], Hueningkai: [28, 1463, 11] },
          stk: { Yeonjun: [168, 502, -31], Beomgyu: [179, 844, 23], Taehyun: [175, 1105, -43], Hueningkai: [194, 1390, -43], Soobin: [156, 245, 21] }
        },
        HATE: {
          palabras: [['END', 98, 221, 401, -14], ['HATE', 128, 17, 898, -14], ['MESS', 112, 161, 1694, 14]],
          pol: { Taehyun: [22, 1247, 18], Hueningkai: [155, 1475, -19], Soobin: [25, 256, 13], Yeonjun: [201, 468, -16], Grupal: [25, 797, 15], Beomgyu: [174, 920, -17] },
          stk: { Yeonjun: [347, 471, -31], Beomgyu: [287, 952, 23], Taehyun: [36, 1198, -43], Hueningkai: [316, 1487, -43], Soobin: [148, 210, 21] }
        },
        MESS: {
          palabras: [['END', 112, 200, 444, -14], ['HATE', 98, 33, 1096, -14], ['MESS', 128, 85, 1679, 14]],
          pol: { Soobin: [21, 306, 24], Beomgyu: [69, 869, 10], Yeonjun: [154, 533, -16], Taehyun: [120, 1152, -19], Hueningkai: [100, 1459, -16] },
          stk: { Yeonjun: [312, 532, -31], Beomgyu: [26, 846, 23], Taehyun: [283, 1155, -43], Hueningkai: [92, 1414, -43], Soobin: [140, 223, 21] }
        }
      }
    }
  };
  // En mobile los fragmentos se reparten a partir de los de desktop
  ['END', 'HATE', 'MESS'].forEach(era => {
    LAYOUT.mobile.eras[era].frag = LAYOUT.desktop.eras[era].frag.split(' ').map(t => {
      const [x, y, w, h, r] = t.split(',').map(Number);
      return [Math.round(x * 393 / 1920), Math.round(y * 1769 / 1882), Math.round(w * .55), Math.round(h * .55), r].join(',');
    }).join(' ');
  });

  // Velocidades de parallax por capa (1 = se mueve con la página)
  const VEL = { panel: .92, palabra: .55, grieta: .75, frag: 1.3, titulo: 1, lejos: .8, cerca: [1.12, 1.22, 1.16], grupal: 1.05 };

  const cp = $('.cp');
  const escenario = $('.cp__escenario');
  let modo = '';
  let eraActual = 'END';
  const indices = {};               // foto visible de cada carrusel: { 'END-Soobin': 0, ... }
  let polActiva = null;

  const css = (el, o) => { Object.entries(o).forEach(([k, v]) => el.style.setProperty(k, v)); return el; };
  function it(tag, cls, x, y, w, h, r, extra) {
    const el = document.createElement(tag);
    el.className = 'it ' + cls;
    css(el, { '--x': x, '--y': y, '--w': w, '--h': h, '--r': (-(r || 0)) + 'deg' });
    if (extra) css(el, extra);
    return el;
  }

  // Texto alternativo de cada foto (describe lo que se ve)
  const ALT_FOTOS = {
      "beomgyu_end-2": "Beomgyu en primer plano, con cabello castaño rojizo y camiseta blanca, sobre un fondo lila suave",
      "beomgyu_end-4": "Beomgyu de frente entre dos integrantes vistos de espaldas, todos con camisetas blancas sin mangas",
      "beomgyu_end-5": "Retrato en blanco y negro de Beomgyu con camiseta blanca sin mangas",
      "hueningkai_end-2": "Hueningkai en primer plano con camiseta blanca, sobre un fondo lila suave",
      "hueningkai_end-4": "Hueningkai de frente entre dos integrantes vistos de espaldas, con camisetas blancas",
      "hueningkai_end-5": "Retrato en blanco y negro de Hueningkai con camiseta blanca",
      "soobin_end-2": "Soobin en primer plano con camiseta blanca y mirada seria, sobre un fondo lila",
      "soobin_end-4": "Soobin de frente entre dos integrantes vistos de espaldas, con camisetas blancas sin mangas",
      "soobin_end-5": "Retrato en blanco y negro de Soobin con camiseta blanca",
      "taehyun_end-2": "Taehyun en primer plano con camiseta blanca, sobre un fondo lila suave",
      "taehyun_end-4": "Taehyun apoya la cabeza en el hombro de un integrante de cabello rubio; ambos llevan camisetas blancas",
      "taehyun_end-5": "Retrato en blanco y negro de Taehyun con camiseta blanca",
      "yeonjun_end-2": "Yeonjun, de cabello rubio, en primer plano con camiseta blanca sin mangas",
      "yeonjun_end-4": "Yeonjun, de cabello rubio, apoya el brazo en el hombro de otro integrante; ambos con camisetas blancas",
      "yeonjun_end-5": "Retrato en blanco y negro de Yeonjun con el cabello claro y camiseta sin mangas",
      "group_end-1": "Los cinco integrantes de TXT acostados sobre una tela blanca arrugada, con camisetas blancas y pantalones negros",
      "group_end-12": "Los cinco integrantes de TXT juntos con camisetas blancas, sosteniendo rosas rojas",
      "beomgyu_hate-1": "Beomgyu con chaqueta de cuero negro sostiene una rosa roja junto a su rostro",
      "beomgyu_hate-3": "Beomgyu sentado en un sillón negro frente a una pared blanca con pintura negra chorreada y la palabra HATE",
      "beomgyu_hate-5": "Beomgyu mira a la cámara detrás de un vidrio roto, con ropa de cuero negro",
      "hueningkai_hate-1": "Hueningkai sentado con ropa de cuero negro en una habitación blanca manchada de pintura negra",
      "hueningkai_hate-3": "Hueningkai sentado en el suelo entre objetos rotos, frente a una pared con grafitis negros",
      "hueningkai_hate-5": "Hueningkai mira a través de un vidrio roto, con chaqueta de cuero negro",
      "soobin_hate-1": "Soobin con chaqueta de cuero negro sostiene un encendedor encendido",
      "soobin_hate-3": "Soobin recostado en un sofá de cuero negro, vestido de cuero",
      "soobin_hate-4": "Soobin con la mano cerca del rostro, frente a una pared blanca con pintura negra chorreada",
      "taehyun_hate-1": "Taehyun en primer plano con chaqueta de cuero negro y correas",
      "taehyun_hate-2": "Taehyun sentado en una silla frente a una pared con la palabra HATE y pintura negra chorreada",
      "taehyun_hate-5": "Taehyun mira a la cámara a través de un vidrio roto",
      "yeonjun_hate-1": "Yeonjun, de cabello rubio y collar de cuero, exhala humo",
      "yeonjun_hate-2": "Yeonjun, de cabello rubio, con ropa de cuero negro y correas junto a un vidrio roto",
      "yeonjun_hate-3": "Yeonjun agachado con ropa de cuero negro frente a una pared con pintura negra chorreada",
      "beomgyu_hate-6": "Foto grupal: los cinco integrantes de TXT con ropa de cuero negro, reunidos alrededor de una rosa roja",
      "hueningkai_hate-6": "Foto grupal: los cinco integrantes de TXT con chaquetas de cuero negro, muy juntos, uno sostiene una rosa roja",
      "soobin_hate-6": "Foto grupal: los cinco integrantes de TXT de cuero negro, mirando a la cámara alrededor de una rosa roja",
      "taehyun_hate-6": "Foto grupal: los cinco integrantes de TXT con ropa de cuero negro, de pie y juntos frente a una pared clara",
      "yeonjun_hate-6": "Foto grupal: los cinco integrantes de TXT inclinados hacia la rosa roja que sostiene uno de ellos",
      "beomgyu_mess-1": "Beomgyu en primer plano con collar de cadena y chaqueta clara, bajo una luz roja",
      "beomgyu_mess-3": "Beomgyu de pie con traje blanco en un callejón, junto a osos de peluche",
      "beomgyu_mess-4": "Beomgyu acostado sobre bolsas de basura negras dentro de un contenedor",
      "group_mess-1": "Los cinco integrantes de TXT de pie en un callejón oscuro, vestidos de negro",
      "group_mess-1v": "Los cinco integrantes de TXT de pie en un pasillo oscuro con paredes de metal, vestidos de negro",
      "group_mess-2": "Los cinco integrantes de TXT sentados y recostados en un callejón iluminado con luz roja",
      "group_mess-2v": "Los cinco integrantes de TXT en un callejón con luz roja, vistos desde arriba",
      "hueningkai_mess-1": "Hueningkai en primer plano con la mano en el mentón y un collar de cadena",
      "hueningkai_mess-3": "Hueningkai con chaqueta de estampado de leopardo en un callejón",
      "hueningkai_mess-4": "Hueningkai acostado sobre bolsas de basura dentro de un contenedor",
      "soobin_mess-1": "Soobin en primer plano con chaqueta de jean frente a un letrero luminoso rojo",
      "soobin_mess-3": "Soobin de pie con chaleco de jean en un callejón con basura",
      "soobin_mess-4": "Soobin acostado sobre bolsas de basura dentro de un contenedor",
      "taehyun_mess-1": "Taehyun en primer plano con chaqueta negra, apoyado en una pared",
      "taehyun_mess-2": "Taehyun sentado en el suelo de un callejón con grafitis",
      "taehyun_mess-4": "Taehyun acostado sobre bolsas de basura dentro de un contenedor",
      "yeonjun_mess-1": "Yeonjun, de cabello rubio, con gorra y abrigo peludo bajo una luz roja",
      "yeonjun_mess-2": "Yeonjun con abrigo peludo blanco y camisa de encaje en un callejón",
      "yeonjun_mess-4": "Yeonjun con abrigo blanco, acostado sobre bolsas de basura dentro de un contenedor"
  };

  function crearPolaroid(era, m, x, y, r, L, lejos, vel) {
    const grupal = m === 'Grupal';
    const [w, h] = grupal ? L.grupal : L.pol;
    const wrap = it('div', 'pol' + (lejos ? ' pol--lejos' : ''), x, y, w, h, r, { '--pad': L.pad, '--pie': L.pie });
    wrap.dataset.speed = vel;
    wrap.dataset.miembro = m;
    const key = era + '-' + m;
    if (!(key in indices)) indices[key] = 0;
    const fotos = fotosDe(era, m);
    const nombre = grupal ? 'TXT' : m.toUpperCase();
    const etiqueta = grupal ? `Los cinco integrantes, concepto ${era}` : `${m}, concepto ${era}`;

    const pol = document.createElement('div');
    pol.className = 'polaroid';
    pol.tabIndex = 0;
    pol.setAttribute('role', 'group');
    pol.setAttribute('aria-roledescription', 'carrusel');
    pol.setAttribute('aria-label', `${grupal ? 'TXT' : m} · ${era}. Activa para ver las flechas.`);
    pol.setAttribute('aria-pressed', 'false');

    const marco = document.createElement('div');
    marco.className = 'pol__foto';
    fotos.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src; img.alt = `${ALT_FOTOS[src.split('/').pop().replace(/\.\w+$/, '')] || etiqueta}. Concepto ${era} (foto ${i + 1} de ${fotos.length})`; img.loading = 'lazy'; img.decoding = 'async';
      if (i === indices[key]) img.classList.add('is-visible'); else img.setAttribute('aria-hidden', 'true');
      marco.appendChild(img);
    });
    const pie = document.createElement('div');
    pie.className = 'pol__pie';
    pie.innerHTML = (modo === 'mobile'
      ? `<span class="pol__nombre">${nombre}<small>${era}</small></span>`
      : `<span class="pol__nombre">${nombre} · ${era}</span>`)
      + `<span class="pol__puntos" aria-hidden="true">${fotos.map((_, i) => `<i${i === indices[key] ? ' class="is-activo"' : ''}></i>`).join('')}</span>`;
    const prev = document.createElement('button');
    prev.type = 'button'; prev.className = 'pol__flecha pol__flecha--prev'; prev.setAttribute('aria-label', 'Foto anterior'); prev.tabIndex = -1;
    prev.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'pol__flecha pol__flecha--next'; next.setAttribute('aria-label', 'Foto siguiente'); next.tabIndex = -1;
    next.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
    const vivo = document.createElement('span');
    vivo.className = 'sr-only'; vivo.setAttribute('aria-live', 'polite');

    pol.append(marco, pie, prev, next, vivo);
    wrap.appendChild(pol);

    const mover = d => {
      const imgs = $$('img', marco), dots = $$('.pol__puntos i', pie);
      imgs[indices[key]].classList.remove('is-visible'); imgs[indices[key]].setAttribute('aria-hidden', 'true');
      dots[indices[key]].classList.remove('is-activo');
      indices[key] = (indices[key] + d + fotos.length) % fotos.length;
      imgs[indices[key]].classList.add('is-visible'); imgs[indices[key]].removeAttribute('aria-hidden');
      dots[indices[key]].classList.add('is-activo');
      vivo.textContent = `Foto ${indices[key] + 1} de ${fotos.length}`;
    };
    prev.addEventListener('click', e => { e.stopPropagation(); mover(-1); });
    next.addEventListener('click', e => { e.stopPropagation(); mover(1); });
    pol.addEventListener('click', () => activar(wrap));
    pol.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activar(wrap); }
      else if (wrap.classList.contains('is-activa') && e.key === 'ArrowRight') { e.preventDefault(); mover(1); }
      else if (wrap.classList.contains('is-activa') && e.key === 'ArrowLeft') { e.preventDefault(); mover(-1); }
      else if (e.key === 'Escape') activar(null);
    });
    return wrap;
  }

  // Solo un carrusel activo: al activar otro, el anterior pierde las flechas
  function activar(wrap) {
    const mismo = wrap && wrap === polActiva;
    if (polActiva) {
      polActiva.classList.remove('is-activa');
      const p = $('.polaroid', polActiva); p.setAttribute('aria-pressed', 'false');
      $$('.pol__flecha', polActiva).forEach(b => { b.tabIndex = -1; });
      const st = polActiva._sticker; if (st) st.classList.remove('is-activa');
    }
    polActiva = null;
    if (!wrap || mismo) return;
    polActiva = wrap;
    wrap.classList.add('is-activa');
    $('.polaroid', wrap).setAttribute('aria-pressed', 'true');
    $$('.pol__flecha', wrap).forEach(b => { b.tabIndex = 0; });
    if (wrap._sticker) wrap._sticker.classList.add('is-activa');
  }
  document.addEventListener('click', e => { if (polActiva && !polActiva.contains(e.target)) activar(null); });

  function construir() {
    const nuevo = window.innerWidth <= 900 ? 'mobile' : 'desktop';
    if (nuevo === modo) return;
    modo = nuevo;
    polActiva = null;
    const L = LAYOUT[modo];
    cp.classList.toggle('is-mobile', modo === 'mobile');
    escenario.innerHTML = '';

    // Capa fija: título superpuesto + pestañas (iguales en las tres eras)
    const fija = document.createElement('div');
    fija.className = 'cp__capa cp__fija';
    const t1 = it('p', 'cp__tres', L.tres[0], L.tres[1], 0, 0, 0, { '--fs': L.tres[2] });
    t1.style.lineHeight = `calc(var(--k) * ${L.tres[3]})`; t1.textContent = 'Tres caras'; t1.dataset.speed = VEL.titulo; t1.setAttribute('aria-hidden', 'true');
    const t2 = it('p', 'cp__final', L.final[0], L.final[1], 0, 0, 0, { '--fs': L.final[2] });
    t2.style.lineHeight = `calc(var(--k) * ${L.final[3]})`; t2.textContent = 'De un mismo final'; t2.dataset.speed = VEL.titulo; t2.setAttribute('aria-hidden', 'true');
    const lista = document.createElement('div');
    lista.className = 'cp__tablist'; lista.setAttribute('role', 'tablist'); lista.setAttribute('aria-label', 'Eras');
    ['END', 'HATE', 'MESS'].forEach((era, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tab'; b.id = 'tab-' + era; b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'panel-' + era);
      css(b, { '--x': L.tabs[i][0], '--y': L.tabs[i][1], '--w': L.tab[0], '--h': L.tab[1] });
      b.innerHTML = `<img class="logo-w" src="assets/img/logos/${era.toLowerCase()}_logo-white.png" alt="Logo de la versión ${era}"><img class="logo-b" src="assets/img/logos/${era.toLowerCase()}_logo-black.png" alt="Logo de la versión ${era}">`;
      b.addEventListener('click', () => mostrarEra(era));
      b.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const eras = ['END', 'HATE', 'MESS'];
        const sig = eras[(eras.indexOf(era) + (e.key === 'ArrowRight' ? 1 : 2)) % 3];
        mostrarEra(sig); $('#tab-' + sig).focus();
      });
      lista.appendChild(b);
    });
    fija.append(t1, t2, lista);

    // Una capa por era
    ['END', 'HATE', 'MESS'].forEach(era => {
      const E = L.eras[era];
      const capa = document.createElement('div');
      capa.className = 'cp__capa cp__era';
      capa.id = 'panel-' + era; capa.setAttribute('role', 'tabpanel'); capa.setAttribute('aria-labelledby', 'tab-' + era);
      capa.hidden = era !== eraActual;

      const panel = it('div', 'cp__panel', ...L.panel); panel.dataset.speed = VEL.panel; capa.appendChild(panel);
      E.palabras.forEach(([txt, fs, x, y, r]) => {
        const p = it('span', 'cp__palabra', x, y, 0, 0, r, { '--fs': fs });
        p.style.lineHeight = `calc(var(--k) * ${L.palabraLH})`; p.textContent = txt; p.dataset.speed = VEL.palabra; p.setAttribute('aria-hidden', 'true');
        capa.appendChild(p);
      });
      L.grietas.forEach(([x, y, w, h, r]) => {
        const g = it('div', 'cp__grieta grieta', x, y, w, h, r); g.innerHTML = GRIETA.lateral; g.dataset.speed = VEL.grieta; g.setAttribute('aria-hidden', 'true');
        g.setAttribute('data-dibujar', ''); g.setAttribute('data-scrub', ''); capa.appendChild(g);
      });
      E.frag.split(' ').forEach(t => {
        const [x, y, w, h, r] = t.split(',').map(Number);
        const f = it('div', 'cp__tri', x, y, w, h, r); f.innerHTML = TRI; f.dataset.speed = VEL.frag; f.setAttribute('aria-hidden', 'true');
        capa.appendChild(f);
      });
      let nCerca = 0;
      Object.entries(E.pol).forEach(([m, [x, y, r]]) => {
        const lejos = LEJOS[era].includes(m);
        const vel = m === 'Grupal' ? VEL.grupal : lejos ? VEL.lejos : VEL.cerca[nCerca++ % VEL.cerca.length];
        const pol = crearPolaroid(era, m, x, y, r, L, lejos, vel);
        capa.appendChild(pol);
        // El logo del miembro se mueve a la par con su foto (misma velocidad)
        if (E.stk[m]) {
          const [sx, sy, sr] = E.stk[m];
          const st = it('div', 'sticker' + (lejos ? ' sticker--lejos' : ''), sx, sy, L.stk, L.stk, sr);
          st.dataset.speed = vel;
          st.innerHTML = `<img src="assets/img/logos/${m.toLowerCase()}_${era.toLowerCase()}-logo.png" alt="Logo de ${m} para la versión ${era}">`;
          pol._sticker = st;
          capa.appendChild(st);
        }
      });
      escenario.appendChild(capa);
    });
    escenario.appendChild(fija);
    cp.dataset.era = eraActual;
    marcarTabs();
    scrubGrietas();
    updateParallax();
  }

  function marcarTabs() {
    $$('.tab', escenario).forEach(b => {
      const on = b.id === 'tab-' + eraActual;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }
  function mostrarEra(era) {
    if (era === eraActual) return;
    activar(null);
    eraActual = era;
    cp.dataset.era = era;
    $$('.cp__era', escenario).forEach(c => { c.hidden = c.id !== 'panel-' + era; });
    marcarTabs();
    updateParallax();
    scrubGrietas();
  }

  /* ---------- 7. Parallax ---------- */
  function updateParallax() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    const r = escenario.getBoundingClientRect();
    if (r.bottom < -400 || r.top > vh + 400) return;
    const k = modo === 'mobile' ? .08 : .35;
    $$('[data-speed]', escenario).forEach(el => {
      if (el.closest('[hidden]')) return;
      const offset = (r.top + el.offsetTop + el.offsetHeight / 2) - vh / 2;   // distancia al centro de la pantalla
      const speed = parseFloat(el.dataset.speed) || 1;
      el.style.setProperty('--py', (offset * (speed - 1) * k).toFixed(1) + 'px');
    });
  }


  /* ---------- 8. Tracklist: fragmentos de la preview + vinilo ---------- */
  // Tramos de la preview (segundos) que le corresponden a cada canción
  const PISTAS = {
    '01': [11, 26],   // Opening Sequence           0:11 – 0:26
    '02': [100, 111], // Good Boy Gone Bad          1:40 – 1:51
    '03': [28, 52],   // Trust Fund Baby            0:28 – 0:52
    '04': [77, 95],   // Lonely Boy                 1:17 – 1:35
    '05': [53, 74]    // Thursday's Child Has Far…  0:53 – 1:14
  };
  const tl = $('.tl-seccion');
  const audio = $('.tl__audio');
  const filas = $$('.cancion');
  let sonando = null, vigilante = 0, fade = 0;

  function marcar(id) {
    sonando = id;
    tl.classList.toggle('is-sonando', !!id);
    filas.forEach(b => {
      const on = b.dataset.pista === id;
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.cancion__accion').textContent = on ? 'Pausar fragmento' : 'Reproducir fragmento';
    });
  }
  function volumen(a, b, ms, fin) {
    cancelAnimationFrame(fade);
    const t0 = performance.now();
    const paso = t => {
      const p = Math.min(1, (t - t0) / ms);
      audio.volume = a + (b - a) * p;
      if (p < 1) fade = requestAnimationFrame(paso); else if (fin) fin();
    };
    fade = requestAnimationFrame(paso);
  }
  function detener() {
    cancelAnimationFrame(vigilante);
    marcar(null);
    volumen(audio.volume, 0, 250, () => audio.pause());
  }
  function vigilar() {
    if (!sonando) return;
    const fin = PISTAS[sonando][1];
    if (audio.currentTime >= fin - .3) { detener(); return; }
    vigilante = requestAnimationFrame(vigilar);
  }
  function reproducir(id) {
    if (sonando === id) { detener(); return; }
    cancelAnimationFrame(vigilante); cancelAnimationFrame(fade);
    audio.currentTime = PISTAS[id][0];
    audio.volume = 0;
    const p = audio.play();
    marcar(id);
    const ok = () => { volumen(0, 1, 300); vigilar(); };
    if (p && p.then) p.then(ok).catch(() => marcar(null)); else ok();
  }
  if (tl && audio) {
    filas.forEach(b => b.addEventListener('click', () => reproducir(b.dataset.pista)));
    audio.addEventListener('ended', () => marcar(null));
  }


  /* ---------- 9. Merch: filtros, álbumes (hover de Figma) y camisetas ---------- */
  const mc = $('.mc-seccion');
  const tactil = window.matchMedia('(hover: none)');

  // Filtros Todo / Álbumes / Ropa
  $$('.filtro', mc).forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filtro;
    $$('.filtro', mc).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $$('.mc__grilla > .producto', mc).forEach(p => { p.hidden = f !== 'todo' && p.dataset.cat !== f; });
    ropa.hidden = f === 'albumes';
    $('.mc', mc).classList.toggle('solo-ropa', f === 'ropa');
    cerrarAlbumes();
  }));

  // Tipo de puntero del último toque/clic. Safari (iPhone) reporta el "click" de un toque como mouse,
  // así que se usa el pointerdown, que sí dice "touch".
  let ultimoPuntero = 'mouse';
  document.addEventListener('pointerdown', e => { ultimoPuntero = e.pointerType || 'mouse'; }, true);
  const esMouse = () => ultimoPuntero === 'mouse' && !tactil.matches;

  // --- Álbumes (Figma): hover / tap cambia la portada por la foto del contenido ---
  const albumes = $$('.album', mc);
  function abrirAlbum(al) {
    albumes.forEach(o => { if (o !== al) cerrarAlbum(o); });
    al.classList.add('is-abierto');
    $('.album__boton', al).setAttribute('aria-expanded', 'true');
  }
  function cerrarAlbum(al) {
    al.classList.remove('is-abierto');
    $('.album__boton', al).setAttribute('aria-expanded', 'false');
  }
  function cerrarAlbumes() { albumes.forEach(cerrarAlbum); }
  albumes.forEach(al => {
    al.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') abrirAlbum(al); });
    al.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') cerrarAlbum(al); });
    $('.album__boton', al).addEventListener('click', e => {
      if (esMouse()) return;   // con mouse ya lo hace el hover
      al.classList.contains('is-abierto') ? cerrarAlbum(al) : abrirAlbum(al);
    });
    $('.album__boton', al).addEventListener('blur', () => { if (!al.matches(':hover')) cerrarAlbum(al); });
  });
  document.addEventListener('pointerdown', e => { if (!e.target.closest('.album')) cerrarAlbumes(); });

  // --- Camisetas: carrusel horizontal de 10 tarjetas ---
  const ropa = $('.mc__ropa', mc);
  const pista = $('.mc__pista', mc);
  // Con mouse se puede arrastrar la fila (en táctil y trackpad el scroll ya es nativo)
  let arr = null;
  pista.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    arr = { x: e.clientX, s: pista.scrollLeft, movio: false };
  });
  window.addEventListener('pointermove', e => {
    if (!arr) return;
    const dx = e.clientX - arr.x;
    if (!arr.movio && Math.abs(dx) > 5) { arr.movio = true; pista.classList.add('is-arrastrando'); }
    if (arr.movio) pista.scrollLeft = arr.s - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!arr) return;
    if (arr.movio) {
      pista.classList.remove('is-arrastrando');
      // encaja en la tarjeta más cercana
      const t = $('.producto--camiseta', pista), paso = t.offsetWidth + parseFloat(getComputedStyle(pista).columnGap || 0);
      pista.scrollTo({ left: Math.round(pista.scrollLeft / paso) * paso, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    arr = null;
  });
  // Tap / teclado: voltea la camiseta (con mouse lo hace el hover)
  $$('.camiseta__lado', mc).forEach(b => b.addEventListener('click', () => {
    if (esMouse()) return;
    const on = b.getAttribute('aria-pressed') !== 'true';
    $$('.camiseta__lado', mc).forEach(x => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', String(on));
  }));


  /* ---------- 10. Suscríbete (sin servidor: solo valida y confirma) ---------- */
  const sub = $('.sub__form');
  if (sub) {
    const correo = $('#sub-correo'), ayuda = $('#sub-ayuda'), sec = $('.sub-seccion');
    const base = ayuda.textContent;
    sub.addEventListener('submit', e => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.value.trim());
      sec.classList.toggle('is-error', !ok);
      ayuda.classList.toggle('is-error', !ok);
      ayuda.classList.toggle('is-ok', ok);
      correo.setAttribute('aria-invalid', String(!ok));
      ayuda.textContent = ok ? '¡Listo! Te avisaremos cuando llegue el próximo drop.' : 'Escribe un correo válido, por ejemplo tucorreo@ejemplo.com';
      if (ok) sub.reset(); else correo.focus();
    });
    correo.addEventListener('input', () => {
      if (!sec.classList.contains('is-error')) return;
      sec.classList.remove('is-error'); ayuda.classList.remove('is-error'); ayuda.textContent = base; correo.removeAttribute('aria-invalid');
    });
  }

  /* ---------- Bucle de scroll / resize ---------- */
  construir();
  let ticking = false;
  function onScroll() { marcarSeccion(); scrubGrietas(); if (!reduceMotion) { updateVidrio(); updateParallax(); } ticking = false; }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  let rT;
  // En el celular la barra del navegador cambia el alto al hacer scroll y dispara "resize":
  // solo se reconstruye cuando cambia el ancho (si no, el parallax se reinicia mientras bajas).
  let anchoPrevio = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      if (window.innerWidth !== anchoPrevio) { anchoPrevio = window.innerWidth; construir(); crearVidrio(); }
      onScroll();
    }, 120);
  });
  // En línea (GitHub Pages) las fuentes e imágenes llegan después: se recalcula al terminar de cargar
  window.addEventListener('load', onScroll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onScroll);
  onScroll();
})();
