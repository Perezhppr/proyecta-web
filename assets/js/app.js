/* =====================================================================
   PROYECTA · comportamiento de la página
   Los datos (textos, planes, preguntas, reglas) están en datos.js.

   Ganchos de prueba:
     ?static  sin pantalla de carga ni historia animada (todo armado)
     ?t=0.6   congela la pantalla de carga en ese segundo
     ?dry     "Enviar" NO abre WhatsApp: deja la URL en window.__lastOrderUrl
     ?anim    fuerza animaciones aunque el sistema pida menos movimiento
     tecla R  repite la pantalla de carga
   ===================================================================== */
(function () {
'use strict';
const D = PROYECTA;
const Q = new URLSearchParams(location.search);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DRY = Q.has('dry');
const STATIC = Q.has('static') || (RM && !Q.has('anim'));
const HTML = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
const soles = n => 'S/ ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const restart = (el, c) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
const planDe = id => D.planes.find(p => p.id === id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const tramo = (p, a, b) => { const t = clamp((p - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };   // suave al entrar y al salir
const hoyLima = () => new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());

function irA(sel, foco) {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (!el) return;
  el.scrollIntoView({ behavior: STATIC ? 'auto' : 'smooth', block: 'start' });
  if (foco) setTimeout(() => foco.focus({ preventScroll: true }), STATIC ? 0 : 700);
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href').length < 2) return;
  const t = $(a.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  irA(t);
});
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('borde', scrollY > 8), { passive: true });

/* ================= PANTALLA DE CARGA: el logo se arma solo ================= */
const listo = Promise.all(['700 20px Archivo', '400 20px Kalam'].map(f => document.fonts.load(f))).catch(() => {});
let cargaAnims = [];
function cargar() {
  cargaAnims.forEach(a => a.cancel()); cargaAnims = [];
  HTML.classList.add('cargando');
  const add = (el, k, o) => { const a = el.animate(k, Object.assign({ fill: 'both' }, o)); cargaAnims.push(a); return a; };
  add($('.cm-sello'), [
    { opacity: 0, transform: 'scale(1.9) rotate(-14deg)', easing: 'cubic-bezier(.55,0,.85,.35)' },
    { opacity: 1, transform: 'scale(.9) rotate(0)', offset: .62, easing: 'cubic-bezier(.2,1.8,.4,1)' },
    { opacity: 1, transform: 'scale(1)' }], { duration: 420 });
  $$('.cm-haz').forEach((p, i) => add(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: 330 + i * 70, duration: 420, easing: 'cubic-bezier(.6,0,.3,1)' }));
  add($('.cm-marco'), [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: 560, duration: 520, easing: 'cubic-bezier(.6,0,.3,1)' });
  add($('#cargaN'), [{ fontStretch: '62%', letterSpacing: '.14em', opacity: 0 }, { fontStretch: '62%', letterSpacing: '.14em', opacity: 1, offset: .15 }, { fontStretch: '125%', letterSpacing: '.06em', opacity: 1 }], { delay: 560, duration: 760, easing: 'cubic-bezier(.3,.7,.2,1)' });
  add($('#cargaBar'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(.7)', offset: .6 }, { transform: 'scaleX(1)' }], { duration: 1250, easing: 'cubic-bezier(.4,0,.2,1)' });
  if (Q.has('t')) { const T = parseFloat(Q.get('t')) * 1000; cargaAnims.forEach(a => { a.pause(); a.currentTime = T; }); return; }
  const minimo = new Promise(r => setTimeout(r, 1300));
  Promise.race([Promise.all([minimo, listo]), new Promise(r => setTimeout(r, 2600))]).then(salir);
}
function salir() {
  const c = $('#carga');
  const a = c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.04)' }], { duration: 480, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
  $('.carga-in').animate([{ transform: 'none' }, { transform: 'scale(.9) translateY(-10px)' }], { duration: 480, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
  setTimeout(entrada, 160);
  a.finished.then(() => { HTML.classList.remove('cargando'); cargaAnims.forEach(x => x.cancel()); cargaAnims = []; a.cancel(); $('.carga-in').getAnimations().forEach(x => x.cancel()); }).catch(() => {});
}
/* Lo primero que se ve: el titular sube y el sello cae sobre el papel. */
function entrada() {
  const sube = (el, d) => el && el.animate([{ opacity: 0, transform: 'translateY(40px)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: d, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
  sube($('#t0 .ojo'), 0);
  $$('#t0 .h1-l').forEach((el, i) => sube(el, 80 + i * 90));
  sube($('#t0 .bajada'), 280);
  sube($('#t0 .acciones'), 380);
  $('#palabraMarca').animate([{ fontStretch: '62%', color: '#111322' }, { fontStretch: '125%', color: '#FF5B2E' }], { delay: 520, duration: 1000, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'backwards' });
  sellar($('.sello-in', sello), 460);
}
function sellar(el, delay = 0) {
  return el.animate([
    { opacity: 0, transform: 'translateY(-18%) rotate(-12deg) scale(1.6)', easing: 'cubic-bezier(.55,0,.85,.35)' },
    { opacity: 1, transform: 'rotate(0) scale(.95)', offset: .62, easing: 'cubic-bezier(.2,1.8,.4,1)' },
    { opacity: 1, transform: 'none' }], { duration: 560, delay, fill: 'backwards' });
}
addEventListener('keydown', e => {
  if ((e.key === 'r' || e.key === 'R') && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !STATIC) { scrollTo(0, 0); cargar(); }
});

/* ================= INICIO: el sello que se vuelve marca mientras bajas ================= */
const seccion = $('#inicio'), pin = $('#pin'), escena = $('#escena');
const sello = $('#sello');
const pz = { marca: $('#pzMarca'), post: $('#pzPost'), reel: $('#pzReel'), tarjeta: $('#pzTarjeta') };
const caps = [$('#t0'), ...$$('.t1,.t2,.t3')];
const pieEscena = $('#escenaPie');
let heroI = 0, L = null, pActual = -1, pedido = false;

function piezasDe(i) {
  const s = D.sellos[i], c = D.portafolio.find(x => x.id === s.id) || D.portafolio[0];
  const de = n => (c.piezas.find(p => p.src.includes('-' + n)) || {}).src;
  return { s, c, marca: s.marca, post: de('post'), reel: de('historia'), tarjeta: de('tarjeta') };
}
function pintar(i) {
  const k = piezasDe(i);
  $('.sello-n', sello).textContent = k.s.titulo;
  $('.sello-o', sello).textContent = k.s.oficio;
  $('.sello-r', sello).textContent = k.s.registro;
  $('#pzMarcaImg').src = k.marca;  $('#pzMarcaImg').alt = `Identidad de la marca de demostración de ${k.s.titulo}`;
  pz.post.src = k.post;      pz.post.alt = `Post de la marca de demostración de ${k.s.titulo}`;
  pz.reel.src = k.reel;      pz.reel.alt = `Portada de reel de la marca de demostración de ${k.s.titulo}`;
  pz.tarjeta.src = k.tarjeta; pz.tarjeta.alt = `Tarjeta personal de la marca de demostración de ${k.s.titulo}`;
}
D.sellos.forEach((_, i) => { const k = piezasDe(i); [k.marca, k.post, k.reel, k.tarjeta].forEach(src => { const im = new Image(); im.src = src; }); });

/* Selector Médico / Nutricionista / Psicólogo */
const chips = $('#chips');
chips.insertAdjacentHTML('beforeend', D.sellos.map((s, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${s.chip}</button>`).join(''));
function luzSeg() {
  const b = $$('button', chips)[heroI], luz = $('.seg-luz', chips);
  luz.style.width = b.offsetWidth + 'px';
  luz.style.transform = `translateX(${b.offsetLeft - 4}px)`;
}
chips.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || +b.dataset.i === heroI) return;
  heroI = +b.dataset.i;
  $$('button', chips).forEach((x, j) => x.setAttribute('aria-selected', String(j === heroI)));
  luzSeg();
  const todo = [sello, ...Object.values(pz)];
  todo.forEach(el => el.classList.add('cambia'));
  setTimeout(() => {
    pintar(heroI); medir(); pActual = -1; dibujar();
    requestAnimationFrame(() => { todo.forEach(el => el.classList.remove('cambia')); sellar($('.sello-in', sello)); });
  }, STATIC ? 0 : 190);
});

/* Medidas de la escena para el tamaño de pantalla actual. */
function medir() {
  const W = escena.clientWidth;
  const movil = W < 900;
  const pieH = pieEscena.offsetHeight + 24;
  let s, SW, H, t0b, capB;
  if (STATIC) {
    s = movil ? Math.min(W * .62, 330) : Math.min(W * .27, 420);
    H = movil ? Math.round(s * 2.15) : Math.round(s * 1.55);
    escena.style.setProperty('--escena-h', H + 'px'); HTML.style.setProperty('--escena-h', H + 'px');
    t0b = capB = 0;
  } else {
    H = escena.clientHeight;
    t0b = caps[0].offsetTop + caps[0].offsetHeight;
    capB = Math.max(...caps.slice(1).map(c => c.offsetTop + c.offsetHeight)) + 12;
    const alto = H - pieH - capB;
    s = movil ? Math.min(W * .64, alto * .6, 340) : Math.min(W * .28, alto * .8, 440);
  }
  SW = movil ? Math.min(W * .8, 400) : Math.min(W * .36, 500);
  sello.style.width = SW + 'px';
  const sh = sello.offsetHeight;
  const tam = { marca: [s, s], post: [s * .72, s * .9], reel: [s * .54, s * .96], tarjeta: [s * .8, s * .5] };
  for (const k in tam) { pz[k].style.width = tam[k][0] + 'px'; pz[k].style.height = tam[k][1] + 'px'; }
  const top = STATIC ? 0 : capB, bottom = STATIC ? H : H - pieH;
  let C;
  if (movil) {
    const cy = top + (bottom - top) * .53, cx = W / 2;
    C = {
      marca: { x: cx, y: cy, r: 0, k: 1 },
      post: { x: cx + .52 * s, y: cy - .06 * s, r: 8, k: 1 },
      reel: { x: cx - .52 * s, y: cy - .04 * s, r: -8, k: 1 },
      tarjeta: { x: cx + .14 * s, y: cy + .56 * s, r: -4, k: 1 },
      sello: { x: cx - .3 * s, y: cy - .6 * s, r: -6, k: (.66 * s) / SW },
    };
  } else {
    const cy = (top + bottom) / 2 + (STATIC ? 0 : 6), cx = W / 2;
    C = {
      marca: { x: cx + .06 * s, y: cy, r: 0, k: 1 },
      post: { x: cx + .74 * s, y: cy + .04 * s, r: 6, k: 1 },
      reel: { x: cx + 1.22 * s, y: cy, r: 10, k: 1 },
      tarjeta: { x: cx - .78 * s, y: cy + .34 * s, r: -5, k: 1 },
      sello: { x: cx - .98 * s, y: cy - .3 * s, r: -5, k: (.62 * s) / SW },
    };
  }
  // A: el sello grande, solo, debajo del titular
  const yA = clamp(t0b + 28 + sh / 2, t0b + sh / 2, Math.max(t0b + sh / 2, H - sh / 2 - 16));
  const A = { x: W / 2, y: STATIC ? 0 : yA, r: -3, k: 1 };
  L = { W, H, s, SW, sh, tam, A, C, movil };
  haz.setAttribute('viewBox', `0 0 ${W} ${H}`);
}

/* Las esquinas de una pieza (con su giro) para dibujar el haz. */
function esquinas(cx, cy, w, h, r) {
  const a = r * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}
function envolvente(pts) {   // cápsula convexa (cadena monótona)
  const p = pts.map((q, i) => [...q, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const haz = $('#haz');
function poner(el, w, h, o) {
  el.style.transform = `translate(${(o.x - w / 2).toFixed(1)}px,${(o.y - h / 2).toFixed(1)}px) rotate(${o.r.toFixed(2)}deg) scale(${o.k.toFixed(4)})`;
}
const mezcla = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), r: lerp(a.r, b.r, t), k: lerp(a.k, b.k, t) });

function progreso() {
  if (STATIC) return 1;
  const r = seccion.getBoundingClientRect();
  const recorrido = seccion.offsetHeight - pin.offsetHeight;
  return clamp(-(r.top - parseFloat(getComputedStyle(pin).top)) / recorrido, 0, 1);
}
function dibujar() {
  pedido = false;
  if (!L) return;
  const p = progreso();
  if (Math.abs(p - pActual) < .0005) return;
  pActual = p;
  // textos
  if (!STATIC) {
    const ent = (a, b) => tramo(p, a, b), sal = (a, b) => 1 - tramo(p, a, b);
    const vis = [sal(.03, .13), Math.min(ent(.11, .19), sal(.3, .37)), Math.min(ent(.35, .43), sal(.55, .61)), ent(.6, .68)];
    caps.forEach((c, i) => {
      const v = vis[i];
      c.style.opacity = v.toFixed(3);
      c.style.transform = `translateY(${((1 - v) * (i === 0 || p > [0, .25, .5, .7][i] ? -26 : 26)).toFixed(1)}px)`;
      c.style.visibility = v < .01 ? 'hidden' : 'visible';
    });
  }
  const { A, C, tam, SW, sh } = L;
  // 1) el sello se va a su esquina   2) la marca se proyecta desde él   3) llegan sus piezas
  const t1 = STATIC ? 1 : tramo(p, .17, .34);
  const t2 = STATIC ? 1 : tramo(p, .3, .5);
  const t3 = STATIC ? 1 : tramo(p, .56, .8);
  const S = mezcla(A, C.sello, t1);
  poner(sello, SW, sh, S);
  const desde = { x: C.sello.x, y: C.sello.y, r: C.sello.r, k: .08 };
  const M = mezcla(desde, C.marca, t2);
  poner(pz.marca, tam.marca[0], tam.marca[1], M);
  pz.marca.style.opacity = clamp(t2 * 2.2, 0, 1).toFixed(3);
  for (const k of ['post', 'reel', 'tarjeta']) {
    const o = mezcla({ x: C.marca.x, y: C.marca.y, r: 0, k: .62 }, C[k], t3);
    poner(pz[k], tam[k][0], tam[k][1], o);
    pz[k].style.opacity = clamp(t3 * 1.8, 0, 1).toFixed(3);
  }
  // el haz: une el sello con la marca, como en el logo
  haz.style.opacity = clamp(t2 * 1.6, 0, 1).toFixed(3);
  if (t2 > 0) {
    const ps = esquinas(S.x, S.y, SW * S.k, sh * S.k, S.r), pm = esquinas(M.x, M.y, tam.marca[0] * M.k, tam.marca[1] * M.k, M.r);
    const h = envolvente(ps.concat(pm));
    $('#hazLuz').setAttribute('points', h.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '));
    const lineas = [];
    for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length]; if ((a[2] < 4) !== (b[2] < 4)) lineas.push([a, b]); }
    ['#hazL1', '#hazL2'].forEach((id, i) => {
      const l = $(id), s = lineas[i];
      if (!s) { l.setAttribute('x1', 0); l.setAttribute('x2', 0); l.setAttribute('y1', 0); l.setAttribute('y2', 0); return; }
      l.setAttribute('x1', s[0][0]); l.setAttribute('y1', s[0][1]); l.setAttribute('x2', s[1][0]); l.setAttribute('y2', s[1][1]);
    });
  }
  pieEscena.classList.toggle('ver', STATIC || p > .3);
}
function pedir() { if (!pedido) { pedido = true; requestAnimationFrame(dibujar); } }
addEventListener('scroll', pedir, { passive: true });
let anchoPrevio = innerWidth, altoPrevio = innerHeight;
addEventListener('resize', () => {
  // el celular cambia el alto al esconder su barra: solo se re-mide si cambió el ancho o el alto cambió mucho
  if (innerWidth === anchoPrevio && Math.abs(innerHeight - altoPrevio) < 120) return;
  anchoPrevio = innerWidth; altoPrevio = innerHeight;
  medir(); pActual = -1; dibujar(); luzSeg();
});
pintar(0);

/* ================= SERVICIOS Y PAQUETES: el cuadro comparativo ================= */
const SI = '<svg class="si" viewBox="0 0 24 24" role="img" aria-label="Incluido"><path d="M5 12.6l4.4 4.4L19.2 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NO = '<span class="no" role="img" aria-label="No incluido"></span>';
const cuadro = $('#cuadro');
let planSel = 'intermedio', planReceta = null;
cuadro.insertAdjacentHTML('beforeend',
  `<colgroup><col class="c-item">${D.planes.map(() => '<col>').join('')}</colgroup>
  <thead><tr><th scope="col"><span class="cuadro-tip">Toca un plan para verlo</span></th>${D.planes.map(p => `
    <th scope="col" data-plan="${p.id}"><button type="button" class="plan-btn" data-plan="${p.id}" aria-pressed="false">
      <span class="plan-nom">${p.nombre}</span><span class="plan-pre">${soles(p.precio)}</span>
      <span class="plan-para">${p.para}</span><span class="plan-receta">Sugerido para ti</span></button></th>`).join('')}</tr></thead>
  <tbody>${D.cuadro.map(f => f.grupo
    ? `<tr class="grupo"><th colspan="${D.planes.length + 1}" scope="colgroup">${f.grupo}</th></tr>`
    : `<tr><th scope="row">${f.item}</th>${f.v.map(v => `<td>${v === true ? SI : v === false ? NO : v}</td>`).join('')}</tr>`).join('')}</tbody>`);
cuadro.addEventListener('click', e => { const b = e.target.closest('.plan-btn'); if (b) elegirPlan(b.dataset.plan, true); });
function elegirPlan(id, anim) {
  planSel = id;
  const idx = D.planes.findIndex(p => p.id === id);
  $$('.plan-btn', cuadro).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.plan === id)));
  $$('tbody tr', cuadro).forEach(tr => $$('td', tr).forEach((td, j) => td.classList.toggle('sel', j === idx)));
  $$('thead th[data-plan]', cuadro).forEach(th => th.classList.toggle('es-receta', th.dataset.plan === planReceta));
  const p = planDe(id);
  const el = $('#elegido');
  el.innerHTML = `<div class="elegido-txt"><b>${p.nombre} <span class="nw">${soles(p.precio)}</span></b><span>${p.para}${p.id === planReceta ? ' Es el que sugiere tu receta.' : ''}</span></div>
    <button type="button" class="btn tap" id="loQuiero">Lo quiero</button>`;
  if (anim) restart(el, 'elegido-anim');
  $('#loQuiero').addEventListener('click', () => { fPlan.value = id; guardarForm(); irA('#contacto', fNombre); });
}

/* ================= PORTAFOLIO: la sala de proyección ================= */
const pestanas = $('#pestanas'), caso = $('#caso'), sala = $('#portafolio');
let casoI = 0;
pestanas.insertAdjacentHTML('beforeend', D.portafolio.map((c, i) =>
  `<button class="pestana" type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${c.pestaña}</button>`).join(''));
pestanas.addEventListener('click', e => { const b = e.target.closest('.pestana'); if (b) verCaso(+b.dataset.i, true); });
pestanas.addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const n = (casoI + (e.key === 'ArrowRight' ? 1 : -1) + D.portafolio.length) % D.portafolio.length;
  verCaso(n, true); $$('.pestana', pestanas)[n].focus();
});
function verCaso(i, anim) {
  casoI = i;
  const c = D.portafolio[i], s = D.sellos.find(x => x.id === c.id) || D.sellos[0];
  $$('.pestana', pestanas).forEach((b, j) => b.setAttribute('aria-selected', String(i === j)));
  $('.pestanas-luz', pestanas).style.transform = `translateX(${i * 100}%)`;
  caso.innerHTML = `
    <div class="caso-top">
      <div class="caso-antes">
        <div class="sello" aria-hidden="true"><div class="sello-in"><b class="sello-n">${s.titulo}</b><span class="sello-o">${s.oficio}</span><span class="sello-r">${s.registro}</span></div></div>
        <div><span class="caso-et">Antes</span><p>${c.antes}</p></div>
      </div>
      <div class="caso-despues">
        <span class="caso-et">Después</span>
        <h3 class="caso-quien">${c.persona}<small>${c.oficio}</small></h3>
        <p class="caso-idea">${c.idea}</p>
        <span class="demo-et">Marca de demostración · persona ficticia</span>
      </div>
    </div>
    <div class="galeria">
      <div class="piezas" id="piezas">${c.piezas.map((p, j) => `
        <button type="button" class="pieza${anim ? ' pieza-entra' : ''}" style="animation-delay:${j * 80}ms" data-j="${j}">
          <span class="pieza-img" style="aspect-ratio:${p.w}/${p.h}"><img src="${p.src}" width="${p.w}" height="${p.h}" alt="${p.pie} de la marca de demostración de ${c.persona}" loading="lazy" decoding="async"></span>
          <span>${p.pie}</span></button>`).join('')}</div>
      <div class="galeria-pie">
        <p class="piezas-guia">Desliza para ver las piezas · toca una para agrandarla</p>
        <div class="flechas"><button type="button" class="flecha" data-dir="-1" aria-label="Anterior">‹</button><button type="button" class="flecha" data-dir="1" aria-label="Siguiente">›</button></div>
      </div>
    </div>`;
  const fila = $('#piezas');
  const estado = () => { const [a, b] = $$('.flecha', caso); a.disabled = fila.scrollLeft < 4; b.disabled = fila.scrollLeft + fila.clientWidth > fila.scrollWidth - 4; };
  fila.addEventListener('scroll', estado, { passive: true }); requestAnimationFrame(estado);
  $$('.flecha', caso).forEach(f => f.addEventListener('click', () => fila.scrollBy({ left: +f.dataset.dir * fila.clientWidth * .7, behavior: STATIC ? 'auto' : 'smooth' })));
  if (anim && !STATIC) {
    restart(sala, 'parpadeo');
    $('.caso-antes .sello', caso).animate([{ opacity: 0, transform: 'rotate(-14deg) scale(1.5)', easing: 'cubic-bezier(.55,0,.85,.35)' }, { opacity: 1, transform: 'rotate(-4deg) scale(.95)', offset: .65, easing: 'cubic-bezier(.2,1.8,.4,1)' }, { opacity: 1, transform: 'rotate(-4deg) scale(1)' }], { duration: 520 });
  }
}
caso.addEventListener('click', e => {
  const b = e.target.closest('.pieza'); if (!b) return;
  const p = D.portafolio[casoI].piezas[+b.dataset.j];
  abrirHoja(p.src, `${p.pie} · ${D.portafolio[casoI].persona} (demostración)`);
});

/* hoja para ver una pieza en grande */
const hoja = $('#hoja'); let hojaT;
function abrirHoja(src, pie) {
  $('#hojaImg').src = src; $('#hojaImg').alt = pie; $('#hojaPie').textContent = pie;
  clearTimeout(hojaT); hoja.hidden = false; document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => hoja.classList.add('abierta')));
  $('#hojaX').focus({ preventScroll: true });
}
function cerrarHoja() {
  if (hoja.hidden) return;
  hoja.classList.remove('abierta'); document.body.style.overflow = '';
  hojaT = setTimeout(() => { hoja.hidden = true; }, STATIC ? 0 : 320);
}
hoja.addEventListener('click', e => { if (e.target === hoja || e.target.closest('#hojaX')) cerrarHoja(); });
addEventListener('keydown', e => { if (e.key === 'Escape') cerrarHoja(); });

/* ================= REVISIÓN RÁPIDA ================= */
const P = D.preguntas;
const consulta = $('#consulta'), preg = $('#pregunta'), receta = $('#receta');
let resp = store.get('proyecta.resp', {});
if (typeof resp !== 'object' || !resp) resp = {};
let paso = 0;
const respondidas = () => P.filter(q => Number.isInteger(resp[q.id]) && q.opciones[resp[q.id]]).length;
$('#recetaFecha').textContent = hoyLima();
$('#selloFecha').textContent = hoyLima();

function avance(f) { $('#testLuz').style.transform = `scaleX(${f.toFixed(3)})`; }
function pintarPregunta(dir) {
  const q = P[paso];
  $('#testCuenta').textContent = `${paso + 1} de ${P.length}`;
  avance(paso / P.length);
  preg.innerHTML = `<h3 id="pq">${q.texto}</h3>
    <div class="opciones" role="group" aria-labelledby="pq">${q.opciones.map((o, i) =>
      `<button type="button" class="opcion${resp[q.id] === i ? ' marcada' : ''}" data-i="${i}">${o.t}</button>`).join('')}</div>`;
  if (!STATIC) restart(preg, dir < 0 ? 'pregunta-vuelve' : 'pregunta-entra');
  $('#testAtras').hidden = paso === 0;
}
preg.addEventListener('click', e => {
  const b = e.target.closest('.opcion'); if (!b || preg.dataset.ocupado) return;
  const q = P[paso];
  resp[q.id] = +b.dataset.i; store.set('proyecta.resp', resp);
  $$('.opcion', preg).forEach(o => o.classList.toggle('marcada', o === b));
  if (q.id === 'profesion') { $('#recProfesion').textContent = q.opciones[resp[q.id]].v; fProfesion.value = q.opciones[resp[q.id]].v; guardarForm(); }
  preg.dataset.ocupado = '1';
  avance((paso + 1) / P.length);
  setTimeout(() => {
    delete preg.dataset.ocupado;
    if (paso < P.length - 1) { paso++; pintarPregunta(1); }
    else terminar(true);
  }, STATIC ? 0 : 320);
});
$('#testAtras').addEventListener('click', () => { if (paso > 0) { paso--; pintarPregunta(-1); } });
$('#testSaltar').addEventListener('click', () => irA('#contacto', fNombre));

/* Las reglas fijas del resultado. */
function calcular() {
  const pts = { identidad: 0, constancia: 0, claridad: 0, captacion: 0 };
  const porPregunta = {};
  let total = 0;
  P.forEach(q => {
    if (!q.dim) return;
    const p = q.opciones[resp[q.id]].p;
    pts[q.dim] += p; porPregunta[q.id] = p; total += p;
  });
  const etapa = D.etapas.find(e => total <= e.hasta) || D.etapas[D.etapas.length - 1];
  const nivel = D.signos.map(s => ({ ...s, v: pts[s.id], r: pts[s.id] / s.max }));
  const min = Math.min(...nivel.map(n => n.r));
  const debil = min >= 1 ? 'ninguno' : nivel.find(n => n.r === min).id;
  const objetivo = P.find(q => q.id === 'objetivo').opciones[resp.objetivo];
  const profesion = P.find(q => q.id === 'profesion').opciones[resp.profesion];
  // Indicaciones: primero lo más bajo; se agregan las de su objetivo y, si sobra espacio, video.
  const cand = ['identidad', 'coherencia', 'constancia', 'claridad', 'captacion']
    .map((k, orden) => ({ k, p: porPregunta[k], orden }))
    .filter(c => c.p <= 1)
    .sort((a, b) => a.p - b.p || a.orden - b.orden)
    .map(c => D.indicaciones[c.k]);
  if (objetivo.v === 'Lanzar un servicio o curso') cand.splice(1, 0, D.indicaciones.lanzar);
  if (cand.length < 3) cand.push(D.indicaciones.video);
  if (cand.length < 3 && !cand.includes(D.indicaciones.lanzar)) cand.push(D.indicaciones.lanzar);
  if (cand.length < 3) cand.push(D.indicaciones.medir);
  // Plan: falta identidad pero el contenido va bien → Básico; quiere crecer → Completo; si no → Intermedio.
  const faltaIdentidad = pts.identidad <= 2;
  const faltaContenido = pts.constancia <= 1 || pts.claridad <= 1;
  const plan = faltaIdentidad && !faltaContenido ? 'basico' : objetivo.crecer ? 'completo' : 'intermedio';
  const dx = `${etapa.dx}: ${D.requiere[debil]}.`;
  return { total, etapa: etapa.dx, requiere: D.requiere[debil], dx, nivel, indicaciones: cand.slice(0, 3), plan, objetivo: objetivo.v, profesion: profesion.v };
}
function ecg(r) {
  const a = 3 + 10 * r;                // la altura del latido sube con el puntaje
  let d = 'M1 15', x = 0;
  for (let i = 0; i < 3; i++) { d += ` L${x + 30} 15 L${x + 35} ${15 - a * .35} L${x + 40} 15 L${x + 45} 15 L${x + 48} ${15 + a * .3} L${x + 53} ${15 - a} L${x + 58} ${15 + a * .45} L${x + 63} 15`; x += 66; }
  return d + ' L199 15';
}
let resultado = null;
function terminar(anim) {
  resultado = calcular();
  const r = resultado;
  avance(1);
  $('#testCuenta').textContent = 'Listo';
  preg.innerHTML = `<div class="test-hecho"><h3>Tu receta está lista.</h3>
    <p>${r.etapa}. La calculamos con tus 7 respuestas; nadie la ve hasta que tú la envíes.</p>
    <button type="button" class="link tap" id="repetir">Repetir la revisión</button></div>`;
  $('#testAtras').hidden = true;
  $('#repetir').addEventListener('click', () => {
    resp = {}; store.del('proyecta.resp'); resultado = null; paso = 0; planReceta = null;
    consulta.classList.remove('hecha'); receta.classList.add('vacia'); receta.classList.remove('lista');
    $('#recetaDx').textContent = 'Completa la revisión para ver tu diagnóstico'; $('#recetaReq').textContent = '';
    $('#rpLista').innerHTML = '<li class="vacio"></li><li class="vacio"></li><li class="vacio"></li>';
    $('#recetaPlan').innerHTML = ''; $('#signos').innerHTML = ''; $('#fResultado').textContent = 'Sin revisión';
    elegirPlan(planSel, false); pintarPregunta(1);
  });
  consulta.classList.add('hecha');
  receta.classList.remove('vacia');
  receta.classList.add('visto');
  $('#recProfesion').textContent = r.profesion;
  $('#recetaDx').textContent = r.etapa;
  $('#recetaReq').textContent = r.requiere.charAt(0).toUpperCase() + r.requiere.slice(1) + '.';
  $('#signos').innerHTML = r.nivel.map(n => {
    const t = n.r < .5 ? 'Bajo' : n.r < 1 ? 'Medio' : 'Alto';
    return `<div class="signo${n.r < .5 ? ' bajo' : ''}"><b>${n.nombre}</b>
      <svg class="signo-ecg" viewBox="0 0 200 26" preserveAspectRatio="none" aria-hidden="true"><path d="${ecg(n.r)}" pathLength="1"/></svg>
      <span>${t}</span></div>`;
  }).join('');
  $('#rpLista').innerHTML = r.indicaciones.map(t => `<li>${t}</li>`).join('');
  const p = planDe(r.plan);
  planReceta = p.id;
  $('#recetaPlan').innerHTML = `<a href="#planes" id="verPlan"><span><small>Plan sugerido</small><b>${p.nombre} · ${soles(p.precio)}</b></span><i>Ver en el cuadro ›</i></a>`;
  $('#verPlan').addEventListener('click', () => elegirPlan(p.id, true));
  elegirPlan(p.id, false);
  fProfesion.value = r.profesion; fObjetivo.value = r.objetivo; fPlan.value = p.id;
  $('#fResultado').textContent = r.dx;
  guardarForm();
  receta.classList.remove('lista'); void receta.offsetWidth; receta.classList.add('lista');
  if (anim && !STATIC) {
    restart($('#selloProy'), 'sello-cae');
    if (matchMedia('(max-width:959px)').matches) setTimeout(() => irA(receta), 80);
  }
}

/* ================= CONTACTO → WhatsApp ================= */
const form = $('#contacto');
const fNombre = $('#fNombre'), fProfesion = $('#fProfesion'), fRedes = $('#fRedes'), fObjetivo = $('#fObjetivo'), fPlan = $('#fPlan');
fProfesion.innerHTML = '<option value="">Elige tu profesión</option>' + P[0].opciones.map(o => `<option>${o.v}</option>`).join('');
fObjetivo.innerHTML = '<option value="">Elige tu objetivo</option>' + P.find(q => q.id === 'objetivo').opciones.map(o => `<option>${o.v}</option>`).join('');
fPlan.innerHTML = '<option value="">Aún no lo sé</option>' + D.planes.map(p => `<option value="${p.id}">${p.nombre} · ${soles(p.precio)}</option>`).join('');
const canal = () => (form.querySelector('input[name="canal"]:checked') || {}).value || 'whatsapp';
function guardarForm() {
  store.set('proyecta.form', { nombre: fNombre.value, profesion: fProfesion.value, redes: fRedes.value, objetivo: fObjetivo.value, plan: fPlan.value, canal: canal() });
}
function pacienteEnReceta() { $('#recPaciente').textContent = fNombre.value.trim() || ' '; }
(function restaurar() {
  const f = store.get('proyecta.form', {}) || {};
  fNombre.value = f.nombre || ''; fRedes.value = f.redes || '';
  if (f.profesion) fProfesion.value = f.profesion;
  if (f.objetivo) fObjetivo.value = f.objetivo;
  if (f.plan) fPlan.value = f.plan;
  if (f.canal === 'meet') { form.querySelector('input[value="meet"]').checked = true; $('#fCanal').classList.add('der'); }
  pacienteEnReceta();
  if (fProfesion.value) $('#recProfesion').textContent = fProfesion.value;
})();
form.addEventListener('input', e => {
  if (e.target === fNombre) { pacienteEnReceta(); fNombre.closest('.campo').classList.remove('falta'); }
  if (e.target === fProfesion) $('#recProfesion').textContent = fProfesion.value || ' ';
  if (e.target.name === 'canal') $('#fCanal').classList.toggle('der', canal() === 'meet');
  guardarForm();
});
form.addEventListener('change', guardarForm);

function mensaje() {
  const p = planDe(fPlan.value);
  const l = ['Hola, PROYECTA. Quiero trabajar mi marca personal.', ''];
  l.push(`*Nombre:* ${fNombre.value.trim()}`);
  if (fProfesion.value) l.push(`*Profesión:* ${fProfesion.value}`);
  if (fRedes.value.trim()) l.push(`*Redes:* ${fRedes.value.trim()}`);
  if (fObjetivo.value) l.push(`*Objetivo:* ${fObjetivo.value}`);
  l.push(`*Plan que me interesa:* ${p ? `${p.nombre} (${soles(p.precio)})` : 'Aún no lo sé'}`);
  if (resultado) {
    l.push('', `*Resultado de mi revisión:* ${resultado.dx}`);
    l.push(...resultado.nivel.map(n => `• ${n.nombre}: ${n.r < .5 ? 'bajo' : n.r < 1 ? 'medio' : 'alto'}`));
  } else l.push('', '*Resultado de mi revisión:* todavía no la hice.');
  l.push('', canal() === 'meet' ? 'Prefiero conversar por una videollamada de Google Meet. ¿Qué horarios tienen?' : 'Prefiero que conversemos por aquí, por WhatsApp.');
  return l.join('\n');
}
const waUrl = t => `https://api.whatsapp.com/send?phone=${D.whatsapp}&text=${encodeURIComponent(t)}`;
form.addEventListener('submit', e => {
  e.preventDefault();
  if (fNombre.value.trim().length < 2) {
    const c = fNombre.closest('.campo'); c.classList.add('falta'); restart(c, 'bad');
    fNombre.focus(); return;
  }
  const url = waUrl(mensaje());
  if (DRY) { window.__lastOrderUrl = url; console.log('[dry]', url); }
  const t = $('#enviarTxt');
  t.textContent = 'Abriendo WhatsApp…';
  if (resultado && !STATIC) restart($('#selloProy'), 'sello-cae');
  setTimeout(() => {
    t.textContent = 'Enviar por WhatsApp';
    if (!DRY) location.href = url;
  }, STATIC ? 0 : 700);
});
$('#waDirecto').href = `https://api.whatsapp.com/send?phone=${D.whatsapp}`;
$('#waDirecto').textContent = D.whatsappVisible;

/* ================= PIE ================= */
const links = [`<li><a href="https://api.whatsapp.com/send?phone=${D.whatsapp}" target="_blank" rel="noopener">WhatsApp ${D.whatsappVisible}</a></li>`];
if (D.redes.instagram) links.push(`<li><a href="${D.redes.instagram}" target="_blank" rel="noopener">Instagram</a></li>`);
if (D.redes.tiktok) links.push(`<li><a href="${D.redes.tiktok}" target="_blank" rel="noopener">TikTok</a></li>`);
if (D.redes.correo) links.push(`<li><a href="mailto:${D.redes.correo}">${D.redes.correo}</a></li>`);
$('#pieLinks').innerHTML = links.join('');

/* La palabra grande se "proyecta": pasa de angosta a ancha al aparecer. Su tamaño se mide para que, ya ancha, no se salga. */
const pieG = $('#pieGrande');
function ajustarPie() {
  const cajaW = pieG.parentElement.clientWidth - 32;
  const m = document.createElement('span');
  m.textContent = pieG.textContent;
  m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-weight:900;font-stretch:125%;font-size:100px;letter-spacing:0;font-family:Archivo';
  document.body.appendChild(m);
  const w = m.getBoundingClientRect().width; m.remove();
  if (w) pieG.style.setProperty('--fit', Math.min(260, cajaW / w * 100 * .98).toFixed(1) + 'px');
}
if (STATIC) pieG.classList.add('abierta');
else new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { pieG.classList.add('abierta'); o.disconnect(); } }, { threshold: .6 }).observe(pieG);

/* Aparición suave de cada bloque al bajar. */
if (!STATIC && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: .06 });
  $$('.rv').forEach(el => io.observe(el));
}

/* ================= arranque ================= */
elegirPlan(planSel, false);
verCaso(0, false);
const n = respondidas();
if (n === P.length) terminar(false);
else { paso = Math.min(n, P.length - 1); pintarPregunta(1); }

const armar = () => { medir(); pActual = -1; dibujar(); luzSeg(); ajustarPie(); };
armar();
listo.then(armar);
addEventListener('load', armar);
if (!STATIC) cargar();
})();
