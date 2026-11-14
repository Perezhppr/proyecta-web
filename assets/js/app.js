/* =====================================================================
   PROYECTA · comportamiento de la página
   Los datos (textos, planes, preguntas, reglas) están en datos.js.

   Ganchos de prueba:
     ?static  sin animación de entrada        ?t=0.6  congela la entrada en ese segundo
     ?dry     "Enviar" NO abre WhatsApp: deja la URL en window.__lastOrderUrl
     ?anim    fuerza animaciones aunque el sistema pida menos movimiento
     tecla R  repite la animación de entrada
   ===================================================================== */
(function () {
'use strict';
const D = PROYECTA;
const Q = new URLSearchParams(location.search);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DRY = Q.has('dry');
const STATIC = Q.has('static') || (RM && !Q.has('anim'));
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
const hoyLima = () => {
  const p = new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  return p;
};
function irA(sel, foco) {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (!el) return;
  el.scrollIntoView({ behavior: STATIC ? 'auto' : 'smooth', block: 'start' });
  if (foco) setTimeout(() => foco.focus({ preventScroll: true }), STATIC ? 0 : 650);
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href').length < 2) return;
  const t = $(a.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  irA(t);
});

/* ================= INICIO: el sello que se proyecta en marca ================= */
const sello = $('#sello'), pantalla = $('#pantalla'), pantallaImg = $('#pantallaImg'), haz = $('#haz'), lienzo = $('#lienzo');
const palabra = $('#palabraMarca');
let heroI = 0, heroAuto = true, heroVisible = true, cambiando = false, introAnims = [];
D.sellos.forEach(s => { const i = new Image(); i.src = s.marca; });

function pintarSello(el, s) {
  $('.sello-n', el).textContent = s.titulo;
  $('.sello-o', el).textContent = s.oficio;
  $('.sello-r', el).textContent = s.registro;
}
const chips = $('.chips');
chips.innerHTML = D.sellos.map((s, i) => `<button class="chip" type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${s.chip}</button>`).join('');
chips.addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  heroAuto = false;
  mostrar(+b.dataset.i);
});

/* El haz une las esquinas del sello con las de la pantalla (como el logo). */
function geometria() {
  const L = lienzo.getBoundingClientRect();
  const s = $('.sello-in', sello).getBoundingClientRect();
  const p = pantalla.getBoundingClientRect();
  const x = v => (v - L.left).toFixed(1), y = v => (v - L.top).toFixed(1);
  haz.setAttribute('viewBox', `0 0 ${L.width.toFixed(1)} ${L.height.toFixed(1)}`);
  $('#hazLuz').setAttribute('points', [
    [x(s.left), y(s.top)], [x(s.right), y(s.top)], [x(p.right), y(p.top)],
    [x(p.right), y(p.bottom)], [x(p.left), y(p.bottom)], [x(s.left), y(s.bottom)],
  ].map(q => q.join(',')).join(' '));
  const l1 = $('#hazL1'), l2 = $('#hazL2');
  l1.setAttribute('x1', x(s.right)); l1.setAttribute('y1', y(s.top)); l1.setAttribute('x2', x(p.right)); l1.setAttribute('y2', y(p.top));
  l2.setAttribute('x1', x(s.left)); l2.setAttribute('y1', y(s.bottom)); l2.setAttribute('x2', x(p.left)); l2.setAttribute('y2', y(p.bottom));
}

/* La proyección: el sello cae, el haz se dibuja y la marca se abre desde la esquina. */
function proyectar(conPalabra) {
  const anims = [];
  const add = (el, k, o) => { const a = el.animate(k, Object.assign({ fill: 'both' }, o)); anims.push(a); return a; };
  add(sello, [
    { opacity: 0, transform: 'translate(-6%,-18%) rotate(-16deg) scale(1.55)', easing: 'cubic-bezier(.55,0,.85,.35)' },
    { opacity: 1, transform: 'rotate(-5deg) scale(.95)', offset: .62, easing: 'cubic-bezier(.2,1.8,.4,1)' },
    { opacity: 1, transform: 'rotate(-5deg) scale(1)' },
  ], { duration: 560 });
  add(haz, [{ opacity: 0 }, { opacity: 1 }], { delay: 380, duration: 260, easing: 'ease-out' });
  $$('line', haz).forEach((l, i) => add(l, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { delay: 400 + i * 60, duration: 480, easing: 'cubic-bezier(.6,0,.3,1)' }));
  add(pantalla, [
    { opacity: 0, transform: 'scale(.42)', clipPath: 'inset(0 100% 100% 0 round 18px)', easing: 'cubic-bezier(.2,.8,.2,1)' },
    { opacity: 1, transform: 'scale(1)', clipPath: 'inset(0 0% 0% 0 round 18px)' },
  ], { delay: 560, duration: 720 });
  if (conPalabra) add(palabra, [{ fontStretch: '62%', color: '#121633' }, { fontStretch: '125%', color: '#FF5B2E' }], { delay: 420, duration: 900, easing: 'cubic-bezier(.3,.7,.2,1)' });
  return anims;
}
function intro() {
  introAnims.forEach(a => a.cancel());
  const h = document.documentElement; h.classList.add('intro-on');
  geometria();
  introAnims = proyectar(true);
  if (Q.has('t')) { const T = parseFloat(Q.get('t')) * 1000; introAnims.forEach(a => { a.pause(); a.currentTime = T; }); return; }
  Promise.all(introAnims.map(a => a.finished)).then(() => { h.classList.remove('intro-on'); introAnims.forEach(a => a.cancel()); introAnims = []; }).catch(() => {});
}
function mostrar(i) {
  if (cambiando || i === heroI) { if (i === heroI) marcarChip(i); return; }
  cambiando = true;
  heroI = i; marcarChip(i);
  const s = D.sellos[i];
  const fin = () => {
    pintarSello(sello, s);
    pantallaImg.src = s.marca;
    pantallaImg.alt = `Marca de demostración de ${s.titulo}, ${s.oficio.toLowerCase()}`;
    geometria();
    if (STATIC) { cambiando = false; return; }
    const an = proyectar(false);
    Promise.all(an.map(a => a.finished)).then(() => { an.forEach(a => a.cancel()); cambiando = false; }).catch(() => { cambiando = false; });
  };
  if (STATIC) return fin();
  const o1 = sello.animate([{ opacity: 1, transform: 'rotate(-5deg)' }, { opacity: 0, transform: 'translateY(-14%) rotate(-9deg) scale(1.1)' }], { duration: 220, easing: 'ease-in', fill: 'both' });
  const o2 = pantalla.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(.94)' }], { duration: 220, easing: 'ease-in', fill: 'both' });
  const o3 = haz.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'both' });
  o1.finished.then(() => { fin(); requestAnimationFrame(() => { o1.cancel(); o2.cancel(); o3.cancel(); }); });
}
function marcarChip(i) { $$('.chip', chips).forEach((c, j) => c.setAttribute('aria-selected', String(i === j))); }

pintarSello(sello, D.sellos[0]);
let anchoPrevio = innerWidth;
addEventListener('resize', () => { if (innerWidth !== anchoPrevio) { anchoPrevio = innerWidth; geometria(); } });
const listo = Promise.all(['800 20px Archivo', '400 20px Kalam'].map(f => document.fonts.load(f))).catch(() => {});
if (STATIC) { geometria(); listo.then(geometria); }
else { listo.then(intro); setTimeout(() => { if (!introAnims.length && document.documentElement.classList.contains('intro-on')) intro(); }, 1200); }
addEventListener('load', geometria);
addEventListener('keydown', e => {
  if ((e.key === 'r' || e.key === 'R') && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !STATIC) { scrollTo(0, 0); intro(); }
});
/* Pasa solo de un sello a otro mientras el inicio se ve; se detiene si la persona elige uno. */
new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; }, { threshold: .25 }).observe($('#escena'));
if (!STATIC && !Q.has('t')) setInterval(() => {
  if (heroAuto && heroVisible && !document.hidden && !introAnims.length) mostrar((heroI + 1) % D.sellos.length);
}, 5200);

/* ================= SERVICIOS Y PAQUETES: el cuadro comparativo ================= */
const SI = '<svg class="si" viewBox="0 0 24 24" role="img" aria-label="Incluido"><path d="M4.5 12.8l4.6 4.6L19.6 6.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-6 12 12)"/></svg>';
const NO = '<span class="no" role="img" aria-label="No incluido"></span>';
const cuadro = $('#cuadro');
let planSel = 'intermedio', planReceta = null;
cuadro.insertAdjacentHTML('beforeend',
  `<colgroup><col class="c-item">${D.planes.map(() => '<col>').join('')}</colgroup>
  <thead><tr><th scope="col"><span class="cuadro-tip">Toca un plan para verlo</span></th>${D.planes.map(p => `
    <th scope="col" data-plan="${p.id}"><button type="button" class="plan-btn" data-plan="${p.id}" aria-pressed="false">
      <span class="plan-nom">${p.nombre}</span><span class="plan-pre">${soles(p.precio)}</span>
      <span class="plan-para">${p.para}</span><span class="plan-receta">Tu receta</span></button></th>`).join('')}</tr></thead>
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
    <button type="button" class="btn btn-luz tap" id="loQuiero">Lo quiero</button>`;
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
    <div class="piezas" id="piezas">${c.piezas.map((p, j) => `
      <button type="button" class="pieza${anim ? ' pieza-entra' : ''}" style="animation-delay:${j * 70}ms" data-j="${j}">
        <span class="pieza-img" style="aspect-ratio:${p.w}/${p.h}"><img src="${p.src}" width="${p.w}" height="${p.h}" alt="${p.pie} de la marca de demostración de ${c.persona}" loading="lazy" decoding="async"></span>
        <span>${p.pie}</span></button>`).join('')}</div>
    <p class="piezas-guia">Desliza para ver las piezas · toca una para agrandarla</p>`;
  if (anim && !STATIC) {
    restart(sala, 'parpadeo');
    const st = $('.caso-antes .sello', caso);
    st.animate([{ opacity: 0, transform: 'rotate(-14deg) scale(1.5)', easing: 'cubic-bezier(.55,0,.85,.35)' }, { opacity: 1, transform: 'rotate(-4deg) scale(.95)', offset: .65, easing: 'cubic-bezier(.2,1.8,.4,1)' }, { opacity: 1, transform: 'rotate(-4deg) scale(1)' }], { duration: 520 });
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
const consulta = $('#consulta'), test = $('#test'), preg = $('#pregunta'), receta = $('#receta');
let resp = store.get('proyecta.resp', {});
if (typeof resp !== 'object' || !resp) resp = {};
let paso = 0;
const respondidas = () => P.filter(q => Number.isInteger(resp[q.id]) && q.opciones[resp[q.id]]).length;
$('#recetaFecha').textContent = hoyLima();
$('#selloFecha').textContent = hoyLima();

function avance(f) {
  const X = 12 + 288 * f;
  $('#testLuz').setAttribute('points', `12,13 ${X.toFixed(1)},${(13 - 13 * f).toFixed(1)} ${X.toFixed(1)},${(23 + 13 * f).toFixed(1)} 12,23`);
}
function pintarPregunta(dir) {
  const q = P[paso];
  $('#testCuenta').textContent = `Pregunta ${paso + 1} de ${P.length}`;
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
  $('#testCuenta').textContent = 'Revisión completa';
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
  $('#recetaPlan').innerHTML = `<a href="#planes" id="verPlan"><span><small>Plan sugerido</small><b>${p.nombre} · ${soles(p.precio)}</b></span><i>Ver en el cuadro →</i></a>`;
  $('#verPlan').addEventListener('click', () => elegirPlan(p.id, true));
  elegirPlan(p.id, false);
  // el formulario se llena con lo que ya respondió
  fProfesion.value = r.profesion; fObjetivo.value = r.objetivo; fPlan.value = p.id;
  $('#fResultado').textContent = r.dx;
  guardarForm();
  receta.classList.remove('lista'); void receta.offsetWidth; receta.classList.add('lista');
  const st = $('#selloProy');
  if (anim && !STATIC) {
    restart(st, 'sello-cae');
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
  const b = $('#enviar'); const txt = b.innerHTML;
  b.lastChild.textContent = ' Abriendo WhatsApp…';
  if (resultado && !STATIC) restart($('#selloProy'), 'sello-cae');
  setTimeout(() => {
    b.innerHTML = txt;
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

/* La palabra grande se "proyecta": pasa de angosta a ancha al aparecer. */
const pieG = $('#pieGrande');
/* Su tamaño se calcula para que, ya ancha, ocupe el ancho del pie sin salirse. */
function ajustarPie() {
  const caja = pieG.parentElement.clientWidth - 32;
  const m = document.createElement('span');
  m.textContent = pieG.textContent;
  m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-weight:900;font-stretch:125%;font-size:100px;letter-spacing:0;font-family:Archivo';
  document.body.appendChild(m);
  const w = m.getBoundingClientRect().width; m.remove();
  if (w) pieG.style.setProperty('--fit', Math.min(250, caja / w * 100 * .98).toFixed(1) + 'px');
}
listo.then(ajustarPie); ajustarPie();
addEventListener('resize', () => ajustarPie());
if (STATIC) pieG.classList.add('abierta');
else new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { pieG.classList.add('abierta'); o.disconnect(); } }, { threshold: .6 }).observe(pieG);

/* Botón flotante: solo cuando no se ve el inicio ni la revisión ni el pie. */
const flota = $('#flota'); const vis = new Map();
const obsF = new IntersectionObserver(es => {
  es.forEach(e => vis.set(e.target.id, e.isIntersecting));
  const tapa = vis.get('inicio') || vis.get('revision') || vis.get('pie');
  flota.classList.toggle('ver', vis.size === 3 && !tapa);
}, { threshold: 0 });
['inicio', 'revision', 'pie'].forEach(id => obsF.observe($('#' + id)));
/* Al bajar leyendo se esconde; al subir vuelve. */
let yPrev = scrollY;
addEventListener('scroll', () => {
  const y = scrollY, d = y - yPrev;
  if (Math.abs(d) > 6) { flota.classList.toggle('baja', d > 0); yPrev = y; }
}, { passive: true });

/* Aparición suave de cada bloque al bajar. */
if (!STATIC && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.cab, .cuadro-caja, .caso, .test, .receta, .contacto').forEach(el => { el.classList.add('aparece'); io.observe(el); });
}

/* ================= arranque ================= */
elegirPlan(planSel, false);
verCaso(0, false);
const n = respondidas();
if (n === P.length) { terminar(false); }
else { paso = Math.min(n, P.length - 1); pintarPregunta(1); }
})();
