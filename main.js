/* ================================================================
   GRUPO ESTEPA — main.js
   Animación del logo flotante sincronizada con el scroll.

   Lógica:
   ─ Al cargar: logo grande (START_WIDTH px) anclado al fondo-izquierda
     del viewport (sobre el hero).
   ─ Al scrollear: el logo sube y achica progresivamente hasta quedar
     posicionado y dimensionado dentro del navbar (izquierda).
   ─ La transición se completa al 62 % del scroll del hero para que
     el logo ya esté en el navbar antes de que la sección siguiente
     entre en pantalla.
   ================================================================ */
(function () {
  'use strict';

  /* ── Referencias DOM ──────────────────────────────────────── */
  const logoEl  = document.getElementById('logo-float');
  const navEl   = document.getElementById('navbar');
  const heroEl  = document.getElementById('hero');

  if (!logoEl || !navEl || !heroEl) return;

  /* ── Constantes de layout ─────────────────────────────────── */
  const START_WIDTH = 800;    // px — ancho del logo en el hero (gigante)
  const END_WIDTH   = 100;    // px — ancho del logo en el navbar
                              //      (debe coincidir con .nav-logo-slot en CSS)
  // Ratio real del SVG: viewBox="535 140 855 260" → 855/260 ≈ 3.288
  const SVG_RATIO   = 855 / 260;

  /* ── Helpers ──────────────────────────────────────────────── */
  function lerp(a, b, t)       { return a + (b - a) * t; }
  function clamp(v, lo, hi)    { return Math.min(Math.max(v, lo), hi); }

  // Ease in-out cúbico (Hermite)
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ── Ratio de aspecto real (fallback al del SVG) ──────────── */
  function getAspectRatio() {
    const img = logoEl.querySelector('img');
    return (img && img.naturalWidth > 0)
      ? img.naturalWidth / img.naturalHeight
      : SVG_RATIO;
  }

  /* ── Padding lateral del hero (usado para alinear el logo) ── */
  function getPadLeft() {
    // paddingLeft computado del hero (valor en px siempre)
    return parseFloat(getComputedStyle(heroEl).paddingLeft) || 40;
  }

  /* ── Actualización frame a frame ─────────────────────────── */
  function update() {
    const scrollY = window.scrollY;
    const heroH   = heroEl.offsetHeight;
    const navH    = navEl.offsetHeight;
    const vh      = window.innerHeight;
    const ar      = getAspectRatio();
    const padLeft = getPadLeft();

    // Progreso normalizado [0, 1]
    // Completa al 62 % del alto del hero
    const rawProg = scrollY / (heroH * 0.62);
    const prog    = clamp(rawProg, 0, 1);
    const eased   = easeInOutCubic(prog);

    /* ── Tamaño ── */
    const currentW = lerp(START_WIDTH, END_WIDTH, eased);

    /* ── Posición vertical ──
       Inicio → logo anclado al fondo del viewport:
         top = vh - bottomGap - alturaLogoInicio
       Fin   → logo centrado verticalmente en el navbar:
         top = (navH - alturaLogoFin) / 2
    */
    const startLogoH = START_WIDTH / ar;
    const endLogoH   = END_WIDTH   / ar;

    const startTop = vh - 80 - startLogoH;
    const endTop   = (navH - endLogoH) / 2;

    const currentTop = lerp(startTop, endTop, eased);

    /* ── Aplicar al DOM ── */
    logoEl.style.width = currentW + 'px';
    logoEl.style.top   = currentTop + 'px';
    logoEl.style.left  = padLeft + 'px';

    /* ── Estado del navbar ──
       Mostrar border cuando el logo llegó a su posición final
       (cuando el progreso es ~100%, es decir, cuando termina la animación)
    */
    const showNavBorder = prog >= 0.95;  // Activar cuando está casi completo
    navEl.classList.toggle('is-scrolled', showNavBorder);

    /* ── El hero solo tiene el logo, sin contenido que desvanecer ── */
  }

  /* ── Inicialización ───────────────────────────────────────── */
  function init() {
    // Posicionar el logo antes de mostrarlo (evita flash)
    update();
    // Revelar el logo con una micro-transición
    requestAnimationFrame(function () {
      logoEl.classList.add('is-ready');
    });
  }

  // Esperar a que la imagen del logo cargue para tener naturalWidth correcto
  const img = logoEl.querySelector('img');
  if (img) {
    if (img.complete && img.naturalWidth > 0) {
      init();
    } else {
      img.addEventListener('load',  init, { once: true });
      img.addEventListener('error', init, { once: true }); // fallback
    }
  } else {
    init();
  }

  /* ── Listeners ────────────────────────────────────────────── */
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });

})();


/* ================================================================
   SCROLL-DRIVEN ANIMATIONS
   Fallback para navegadores sin soporte de animation-timeline: view()
   ================================================================ */
(function () {
  'use strict';

  // Detectar soporte nativo de animation-timeline
  const supportsAnimationTimeline = CSS.supports('animation-timeline', 'view()');

  if (supportsAnimationTimeline) {
    // Navegadores modernos: las animaciones ya funcionan con CSS
    return;
  }

  // Fallback: usar Intersection Observer + clase .is-visible
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -15% 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Agregar clase al elemento cuando entra en viewport
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  // Observar todos los elementos marcados con [data-animate]
  document.querySelectorAll('[data-animate]').forEach((el) => {
    observer.observe(el);
  });

})();




/* ================================================================
   STAGGER INDEX
   Asigna custom property --index a cada item para animaciones escalonadas
   ================================================================ */
(function () {
  'use strict';

  document.querySelectorAll('.nosotros-value').forEach((el, index) => {
    el.style.setProperty('--index', index);
  });

})();
