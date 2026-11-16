/* =====================================================================
   PROYECTA · TODO LO EDITABLE ESTÁ AQUÍ
   Textos, planes, preguntas, reglas del resultado y número de WhatsApp.
   Los datos son de prueba (inventados), como pide el enunciado.
   ===================================================================== */

const PROYECTA = {

  /* WhatsApp que recibe los mensajes: código de país + número, sin espacios ni "+". */
  whatsapp: '51932299893',
  whatsappVisible: '932 299 893',

  /* Redes de PROYECTA. Si un campo queda vacío, no se muestra en la página. */
  redes: {
    instagram: '',   // ej. 'https://www.instagram.com/proyecta.marca'
    tiktok: '',      // ej. 'https://www.tiktok.com/@proyecta.marca'
    correo: '',      // ej. 'hola@proyecta.pe'
  },

  /* ---------- Inicio: los sellos que se proyectan en marca (personas ficticias) ---------- */
  sellos: [
    { id: 'salud',        chip: 'Médico',     titulo: 'Dr. Andrés Salazar', oficio: 'Médico cardiólogo',     registro: 'C.M.P. 00000 · R.N.E. 00000', marca: 'assets/img/portafolio/salud-identidad.webp' },
    { id: 'derecho',      chip: 'Abogada',    titulo: 'Abg. Lucía Paredes', oficio: 'Abogada laboralista',   registro: 'Reg. C.A.L. 00000',           marca: 'assets/img/portafolio/derecho-identidad.webp' },
    { id: 'arquitectura', chip: 'Arquitecto', titulo: 'Arq. Diego Ramos',   oficio: 'Arquitecto',            registro: 'Reg. C.A.P. 00000',           marca: 'assets/img/portafolio/arquitectura-identidad.webp' },
  ],

  /* ---------- Servicios y paquetes ---------- */
  planes: [
    { id: 'basico',     nombre: 'Básico',     precio: 390,  nota: 'pago único', para: 'Para tener tu identidad propia.' },
    { id: 'intermedio', nombre: 'Intermedio', precio: 790,  nota: 'pago único', para: 'Para que todo lo que publiques se vea tuyo.' },
    { id: 'completo',   nombre: 'Completo',   precio: 1490, nota: 'pago único', para: 'Para salir a buscar clientes con tu marca lista.' },
  ],
  /* Cada fila del cuadro: qué incluye cada plan [básico, intermedio, completo].
     true = incluido · false = no · texto = cantidad o detalle. */
  cuadro: [
    { grupo: 'Identidad' },
    { item: 'Logo y su versión corta',                 v: [true, true, true] },
    { item: 'Paleta de colores y tipografías',         v: [true, true, true] },
    { item: 'Guía de marca (PDF)',                     v: [true, true, true] },
    { item: 'Bio de redes en una línea',               v: [true, true, true] },
    { grupo: 'Contenido' },
    { item: 'Plantillas editables en Canva',           v: ['6', '15', '15'] },
    { item: 'Portadas de reels e historias',           v: [false, true, true] },
    { item: 'Pilares de contenido (de qué hablar)',    v: [false, true, true] },
    { item: 'Guía para tus fotos con celular',         v: [false, true, true] },
    { item: 'Tarjeta personal y firma de correo',      v: [false, true, true] },
    { item: 'Primer mes de posts listos',              v: [false, false, '12 posts'] },
    { item: 'Reels editados en CapCut',                v: [false, false, '4 reels'] },
    { item: 'Calendario de 30 días',                   v: [false, false, true] },
    { grupo: 'Acompañamiento' },
    { item: 'Reuniones por Google Meet',               v: ['1', '2', '3'] },
    { item: 'Entrega',                                 v: ['7 días', '12 días', '20 días'] },
  ],

  /* ---------- Portafolio (marcas de demostración, personas ficticias) ----------
     Para cambiar por las piezas de Canva: exporta en WebP con el mismo nombre y medida. */
  portafolio: [
    {
      id: 'salud', pestaña: 'Salud',
      persona: 'Dr. Andrés Salazar', oficio: 'Médico cardiólogo',
      antes: 'Solo su sello y posts que cambiaban de color cada semana.',
      idea: 'Un pulso que dibuja sus iniciales: serio, cercano y fácil de reconocer en el feed.',
      piezas: [
        { src: 'assets/img/portafolio/salud-identidad.webp',  w: 720, h: 720,  pie: 'Identidad' },
        { src: 'assets/img/portafolio/salud-post.webp',       w: 720, h: 900,  pie: 'Post del feed' },
        { src: 'assets/img/portafolio/salud-historia.webp',   w: 540, h: 960,  pie: 'Portada de reel' },
        { src: 'assets/img/portafolio/salud-tarjeta.webp',    w: 720, h: 450,  pie: 'Tarjeta personal' },
      ],
    },
    {
      id: 'derecho', pestaña: 'Derecho',
      persona: 'Abg. Lucía Paredes', oficio: 'Abogada laboralista',
      antes: 'Su firma, su sello y un perfil sin foto que nadie relacionaba con ella.',
      idea: 'El signo de artículo (§) como logo: lo legal explicado en artículos cortos y claros.',
      piezas: [
        { src: 'assets/img/portafolio/derecho-identidad.webp', w: 720, h: 720, pie: 'Identidad' },
        { src: 'assets/img/portafolio/derecho-post.webp',      w: 720, h: 900, pie: 'Post del feed' },
        { src: 'assets/img/portafolio/derecho-historia.webp',  w: 540, h: 960, pie: 'Portada de reel' },
        { src: 'assets/img/portafolio/derecho-tarjeta.webp',   w: 720, h: 450, pie: 'Tarjeta personal' },
      ],
    },
    {
      id: 'arquitectura', pestaña: 'Arquitectura',
      persona: 'Arq. Diego Ramos', oficio: 'Arquitecto',
      antes: 'Renders sueltos sin su nombre y planos que solo veían sus clientes.',
      idea: 'Una casa dibujada con una sola línea, como un trazo de plano: simple, exacta y suya.',
      piezas: [
        { src: 'assets/img/portafolio/arquitectura-identidad.webp', w: 720, h: 720, pie: 'Identidad' },
        { src: 'assets/img/portafolio/arquitectura-post.webp',      w: 720, h: 900, pie: 'Post del feed' },
        { src: 'assets/img/portafolio/arquitectura-historia.webp',  w: 540, h: 960, pie: 'Portada de reel' },
        { src: 'assets/img/portafolio/arquitectura-tarjeta.webp',   w: 720, h: 450, pie: 'Tarjeta personal' },
      ],
    },
  ],

  /* ---------- Revisión rápida: 7 preguntas cerradas ----------
     dim = qué indicador suma la respuesta · p = puntos (0 a 2). */
  preguntas: [
    { id: 'profesion', texto: '¿Cuál es tu profesión?',
      opciones: [
        { v: 'Salud (médico, nutricionista, psicólogo…)', t: 'Salud' },
        { v: 'Abogado(a)', t: 'Derecho' },
        { v: 'Arquitecto(a) o ingeniero(a)', t: 'Arquitectura o ingeniería' },
        { v: 'Contador(a) o administrador(a)', t: 'Contabilidad o negocios' },
        { v: 'Docente', t: 'Educación' },
        { v: 'Otra profesión', t: 'Otra profesión' },
      ] },
    { id: 'identidad', dim: 'identidad', texto: '¿Tienes logo o identidad visual?',
      opciones: [
        { p: 0, t: 'No, solo mi nombre (y mi sello)' },
        { p: 1, t: 'Tengo un logo que hice yo' },
        { p: 2, t: 'Sí, logo y colores hechos por un diseñador' },
      ] },
    { id: 'coherencia', dim: 'identidad', texto: 'Si alguien ve tres posts tuyos seguidos, ¿se nota que son tuyos?',
      opciones: [
        { p: 0, t: 'No, cada uno se ve distinto' },
        { p: 1, t: 'Más o menos, uso plantillas variadas' },
        { p: 2, t: 'Sí: mismos colores y mismas letras' },
      ] },
    { id: 'constancia', dim: 'constancia', texto: '¿Cada cuánto publicas?',
      opciones: [
        { p: 0, t: 'Casi nunca' },
        { p: 1, t: 'Cuando puedo, 1 o 2 veces al mes' },
        { p: 2, t: 'Todas las semanas' },
      ] },
    { id: 'claridad', dim: 'claridad', texto: '¿Tu perfil dice en una línea qué haces y para quién?',
      opciones: [
        { p: 0, t: 'No' },
        { p: 1, t: 'Más o menos' },
        { p: 2, t: 'Sí, clarísimo' },
      ] },
    { id: 'captacion', dim: 'captacion', texto: '¿Cómo te llegan hoy tus clientes?',
      opciones: [
        { p: 0, t: 'Solo por recomendación' },
        { p: 1, t: 'A veces me escriben por redes' },
        { p: 2, t: 'Muchos llegan por redes' },
      ] },
    { id: 'objetivo', texto: '¿Qué quieres lograr primero?',
      opciones: [
        { v: 'Conseguir más clientes', t: 'Conseguir más clientes', crecer: true },
        { v: 'Verme más profesional', t: 'Verme más profesional' },
        { v: 'Lanzar un servicio o curso', t: 'Lanzar un servicio o curso', crecer: true },
        { v: 'Ordenar mi contenido', t: 'Ordenar mi contenido' },
      ] },
  ],

  /* Los cuatro indicadores de la marca y su máximo. */
  signos: [
    { id: 'identidad',  nombre: 'Identidad visual', max: 4 },
    { id: 'constancia', nombre: 'Constancia',       max: 2 },
    { id: 'claridad',   nombre: 'Claridad',         max: 2 },
    { id: 'captacion',  nombre: 'Captación',        max: 2 },
  ],

  /* Diagnóstico según el puntaje total (0 a 10). */
  etapas: [
    { hasta: 3,  dx: 'Marca en etapa inicial' },
    { hasta: 6,  dx: 'Marca en construcción' },
    { hasta: 8,  dx: 'Marca en crecimiento' },
    { hasta: 10, dx: 'Marca consolidada' },
  ],
  /* Lo que "se requiere" según el indicador más bajo. */
  requiere: {
    identidad:  'se requiere coherencia visual',
    constancia: 'se requiere un plan de contenido constante',
    claridad:   'se requiere un mensaje claro: qué haces y para quién',
    captacion:  'se requiere convertir tus redes en un canal de clientes',
    ninguno:    'se recomienda escalar con video y lanzamientos',
  },
  /* Pasos a seguir para cada punto débil. Salen los de los indicadores más bajos. */
  indicaciones: {
    identidad:  'Logo, paleta y tipografías propios, para que te reconozcan antes de leer tu nombre.',
    coherencia: 'Plantillas fijas: que cada post se vea tuyo sin pensarlo.',
    constancia: 'Un calendario realista: dos publicaciones por semana, preparadas con anticipación.',
    claridad:   'Bio en una línea: qué haces, para quién y cómo agendar contigo.',
    captacion:  'Un botón de contacto claro en todas tus redes (WhatsApp o agenda).',
    video:      'Reels cortos con tu cara y tu voz: la confianza se gana mirando a la cámara.',
    lanzar:     'Una campaña propia para tu servicio o curso, con su portada y su mensaje.',
    medir:      'Cada mes, revisa qué publicaciones te trajeron clientes y repite lo que funcionó.',
  },
};
