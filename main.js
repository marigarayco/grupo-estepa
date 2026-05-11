(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const nav = document.querySelector('.nav');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Nav: scroll states ────────────────────────────────────── */
  const hero = document.querySelector('.hero');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const heroBottom = hero ? hero.offsetHeight : window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 10);
    nav.classList.toggle('is-past-hero', y >= heroBottom - 64);
  }, { passive: true });


  if (reduceMotion) return;


  /* ══════════════════════════════════════════════════════════
     HERO — animación de entrada al cargar
  ══════════════════════════════════════════════════════════ */
  gsap.timeline({ delay: 0.15 })
    .from('.hero__meta', {
      opacity: 0, y: 14,
      duration: 0.7, ease: 'power2.out'
    })
    .from('.hero__title', {
      opacity: 0, y: 52,
      duration: 1.05, ease: 'power3.out'
    }, '-=0.35')
    .from('.hero__sub', {
      opacity: 0, x: 28,
      duration: 0.85, ease: 'power2.out'
    }, '-=0.55')
    .from('.hero__ctas .btn', {
      opacity: 0, y: 18,
      duration: 0.6, stagger: 0.1, ease: 'power2.out'
    }, '-=0.45');


  /* ══════════════════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════════════════ */
  function onScroll(targets, vars, trigger, start) {
    return gsap.from(targets, {
      ...vars,
      scrollTrigger: {
        trigger: trigger || targets,
        start: start || 'top 84%',
        once: true,
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     02. QUÉ HACEMOS — título encoge, grid sube
  ══════════════════════════════════════════════════════════ */
  const qhMM = gsap.matchMedia();

  qhMM.add('(min-width: 900px)', () => {
    gsap.set('#que-hacemos .section__title', { fontSize: '5.5rem' });
    gsap.set('#que-hacemos .block', { opacity: 0, x: 40 });

    gsap.from('#que-hacemos .section__lead', {
      autoAlpha: 0, y: 14,
      ease: 'power2.out',
      duration: 0.7,
      scrollTrigger: {
        trigger: '#que-hacemos',
        start: 'top 32%',
        once: true,
        invalidateOnRefresh: true,
      }
    });

    /* Scrub unificado: título encoge y blocks se descubren de a uno,
       todo sincronizado con el mismo scroll — sin triggers independientes
       que puedan coflictuar entre sí */
    gsap.timeline({
      scrollTrigger: {
        trigger: '#que-hacemos',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.4,
        invalidateOnRefresh: true,
      }
    })
    .to('#que-hacemos .section__title', {
      fontSize: '3.2rem',
      ease: 'power1.inOut',
      duration: 0.5,
    }, 0)
    .to('#que-hacemos .block', {
      opacity: 1,
      x: 0,
      ease: 'power2.out',
      duration: 0.3,
      stagger: 0.2,
    }, 0.2);
  });

  qhMM.add('(max-width: 899px)', () => {
    onScroll('#que-hacemos .section__title', { opacity: 0, y: 40, duration: 0.95, ease: 'power3.out' });
    onScroll('#que-hacemos .section__lead',  { opacity: 0, y: 22, duration: 0.8,  ease: 'power2.out', delay: 0.15 });
    document.querySelectorAll('#que-hacemos .block').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        opacity: 0,
        x: 52,
        duration: 0.7,
        ease: 'power3.out',
      });
    });
  });


  /* ══════════════════════════════════════════════════════════
     03. PÚBLICO + PRIVADO
  ══════════════════════════════════════════════════════════ */
  gsap.timeline({
    scrollTrigger: {
      trigger: '#publico-privado .section__title',
      start: 'top bottom',
      end: 'top 35%',
      scrub: 1.2,
      invalidateOnRefresh: true,
    }
  })
  .fromTo('.title-slide--left',  { x: () => -window.innerWidth }, { x: 0, ease: 'none', duration: 1 }, 0)
  .fromTo('.title-slide--right', { x: () => window.innerWidth  }, { x: 0, ease: 'none', duration: 1 }, 0)
  .fromTo('.title-slide--y',     { autoAlpha: 0 },                { autoAlpha: 1, ease: 'none', duration: 0.2 }, 0.8);
  onScroll('#publico-privado .section__lead', { opacity: 0, y: 22, duration: 0.8, ease: 'power2.out', delay: 0.15 });

  /* columnas del dual: toggleActions en lugar de once:true para que el trigger
     sobreviva a resize y re-mida. Sin invalidateOnRefresh porque en gsap.from()
     invalidate() re-captura el estado actual (opacity:0) como destino, rompiendo
     la animación */
  gsap.timeline({
    scrollTrigger: {
      trigger: '.dual',
      start: 'top 75%',
      toggleActions: 'play none none none',
    }
  })
    .from('.dual__col:first-child', { opacity: 0, x: -60, ease: 'power2.out', duration: 0.55 })
    .from('.dual__hinge',           { opacity: 0, scaleY: 0.4, ease: 'power2.out', duration: 0.25 }, '-=0.1')
    .from('.dual__col--b',          { opacity: 0, x: 60, ease: 'power2.out', duration: 0.55 }, '>-0.1');
  onScroll('.articulation', {
    opacity: 0, y: 24, duration: 0.8, ease: 'power2.out'
  }, '.articulation', 'top 88%');

  /* #areas tiene z-index:2 y background propio, se superpone a #publico-privado
     naturalmente al hacer scroll — no se necesita pin de GSAP. */


  /* ══════════════════════════════════════════════════════════
     04. ÁREAS
  ══════════════════════════════════════════════════════════ */
  /* Reveal palabra por palabra al hacer scroll */
  (() => {
    const titleEl = document.querySelector('#areas .section__title');
    if (!titleEl) return;

    const nodes = Array.from(titleEl.childNodes);
    titleEl.innerHTML = '';
    const wordSpans = [];

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(chunk => {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) {
            titleEl.appendChild(document.createTextNode(chunk));
          } else {
            const sp = document.createElement('span');
            sp.textContent = chunk;
            sp.style.cssText = 'display:inline-block;opacity:0.12;';
            wordSpans.push(sp);
            titleEl.appendChild(sp);
          }
        });
      } else {
        titleEl.appendChild(node.cloneNode(true));
      }
    });

    if (!reduceMotion && wordSpans.length) {
      gsap.to(wordSpans, {
        opacity: 1,
        ease: 'none',
        duration: 0.4,
        stagger: 0.18,
        scrollTrigger: {
          trigger: titleEl,
          start: 'top 82%',
          end: 'bottom 55%',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      });
    }
  })();

  onScroll('#areas .section__lead',  { opacity: 0, y: 22, duration: 0.8,  ease: 'power2.out', delay: 0.15 });

  gsap.utils.toArray('.grid-3__col').forEach((col, i) => {
    gsap.from(col, {
      opacity: 0,
      y: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.grid-3',
        start: `top+=${i * 40} 88%`,
        end: `top+=${i * 40} 52%`,
        scrub: true,
      }
    });
  });


  /* ══════════════════════════════════════════════════════════
     05. METODOLOGÍA
  ══════════════════════════════════════════════════════════ */
  const metodMM = gsap.matchMedia();

  metodMM.add('(min-width: 901px)', () => {
    onScroll('#metodologia .section__title',   { opacity: 0, y: 40, duration: 0.95, ease: 'power3.out' });
    onScroll('#metodologia .section__lead',    { opacity: 0, y: 22, duration: 0.8,  ease: 'power2.out', delay: 0.12 });
    onScroll('#metodologia .section__sublead', { opacity: 0, y: 14, duration: 0.7,  ease: 'power2.out', delay: 0.22 });

    const stageEls = gsap.utils.toArray('.stage');
    gsap.set(stageEls, { opacity: 0, x: 80 });
    gsap.set('#metodologia .section__title', { fontSize: '4.5rem' });

    const SHRINK = 1.5;

    const metodTL = gsap.timeline({
      scrollTrigger: {
        trigger: '#metodologia',
        start: 'top+=50 top',
        end: `+=${stageEls.length * 280}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    metodTL
      .to('#metodologia .section__title', { fontSize: '2.8rem', ease: 'none', duration: SHRINK }, 0)
      .to('#metodologia .section__lead, #metodologia .section__sublead', { opacity: 0.6, ease: 'none', duration: SHRINK * 0.6 }, 0);

    stageEls.forEach((stage, i) => {
      metodTL.to(stage, { opacity: 1, x: 0, ease: 'power2.out', duration: 1 }, i);
    });
  });

  metodMM.add('(max-width: 900px)', () => {
    onScroll('#metodologia .section__title',   { opacity: 0, y: 40, duration: 0.95, ease: 'power3.out' });
    onScroll('#metodologia .section__lead',    { opacity: 0, y: 22, duration: 0.8,  ease: 'power2.out', delay: 0.12 });
    onScroll('#metodologia .section__sublead', { opacity: 0, y: 14, duration: 0.7,  ease: 'power2.out', delay: 0.22 });

    gsap.utils.toArray('.stage').forEach((stage) => {
      gsap.from(stage, {
        opacity: 0,
        x: 50,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: stage, start: 'top 90%', once: true },
      });
    });

    gsap.from('.timeline-vline', {
      scaleY: 0, duration: 1.6, ease: 'power2.inOut',
      transformOrigin: 'top center',
      scrollTrigger: { trigger: '.timeline', start: 'top 80%', once: true },
    });
  });

  onScroll('.method-cta', {
    opacity: 0, y: 20, duration: 0.8, ease: 'power2.out'
  }, '.method-cta', 'top 90%');


  /* ══════════════════════════════════════════════════════════
     06. EQUIPO
  ══════════════════════════════════════════════════════════ */
  onScroll('#equipo .section__title', { opacity: 0, y: 40, duration: 0.95, ease: 'power3.out' });
  onScroll('#equipo .section__lead',  { opacity: 0, y: 22, duration: 0.8,  ease: 'power2.out', delay: 0.15 });

  gsap.from('.person', {
    opacity: 0, y: 28,
    duration: 0.85, stagger: 0.16, ease: 'power3.out',
    scrollTrigger: { trigger: '.team', start: 'top 80%', once: true }
  });

  onScroll('.network', {
    opacity: 0, y: 20, duration: 0.75, ease: 'power2.out'
  }, '.network', 'top 88%');

  /* mismo patrón que #publico-privado — pin con pinSpacing:false causa
     layout roto en mobile/tablet al hacer scroll. Se elimina. */


  /* ══════════════════════════════════════════════════════════
     07. MANIFIESTO
  ══════════════════════════════════════════════════════════ */
  onScroll('.manifesto h2', {
    opacity: 0, y: 64, duration: 1.2, ease: 'power3.out'
  }, '.manifesto', 'top 82%');

  gsap.from('.manifesto p, .manifesto__rule', {
    opacity: 0, y: 24,
    duration: 0.85, stagger: 0.13, ease: 'power2.out',
    scrollTrigger: { trigger: '.manifesto', start: 'top 72%', once: true }
  });


  /* ══════════════════════════════════════════════════════════
     08. CONTACTO
  ══════════════════════════════════════════════════════════ */
  onScroll('#contacto .section__title', { opacity: 0, y: 40, duration: 0.95, ease: 'power3.out' });
  onScroll('#contacto .section__lead',  { opacity: 0, y: 22, duration: 0.8,  ease: 'power2.out', delay: 0.12 });

  gsap.from('.direct', {
    opacity: 0, x: -22,
    duration: 0.65, stagger: 0.12, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact', start: 'top 95%', once: true }
  });
  gsap.from('.form', {
    opacity: 0, y: 24,
    duration: 0.85, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact', start: 'top 95%', once: true }
  });

  /* ── Card toggle (mobile/touch) ──────────────────────────── */
  function isCardInteractive() {
    return window.matchMedia('(max-width: 1000px)').matches ||
           window.matchMedia('(hover: none)').matches;
  }

  document.querySelectorAll('.grid-3 .card').forEach(card => {
    const btn = card.querySelector('.card__toggle');

    function toggleCard() {
      if (!isCardInteractive()) return;
      const isActive = card.classList.toggle('card--active');
      if (btn) btn.setAttribute('aria-expanded', String(isActive));
    }

    // Tap/click en cualquier parte de la card (excepto el botón, que lo maneja solo)
    card.addEventListener('click', (e) => {
      if (btn && btn.contains(e.target)) return;
      toggleCard();
    });

    // El botón maneja su propio click → accesible por teclado (Enter/Space)
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard();
      });
    }
  });

  /* ── Stage accordion (mobile ≤900px) ─────────────────────── */
  const stageBreakpoint = window.matchMedia('(max-width: 900px)');
  function updateStageFocus() {
    document.querySelectorAll('.stage__trigger').forEach(trigger => {
      trigger.tabIndex = stageBreakpoint.matches ? 0 : -1;
    });
  }
  updateStageFocus();
  stageBreakpoint.addEventListener('change', updateStageFocus);

  document.querySelectorAll('.stage__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const stage = trigger.closest('.stage');
      const isOpen = stage.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });

  /* ── Hamburger menu ───────────────────────────────────────── */
  const burger   = document.querySelector('.nav__burger');
  const panel    = document.getElementById('nav-panel');
  const backdrop = document.getElementById('nav-backdrop');

  function getFocusable() {
    return Array.from(panel.querySelectorAll('a[href], button:not([disabled])'));
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable();
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function openMenu() {
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
    panel.querySelector('.nav__panel-close').focus();
    panel.addEventListener('keydown', trapFocus);
  }

  function closeMenu() {
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
    panel.removeEventListener('keydown', trapFocus);
    burger.focus();
  }

  burger.addEventListener('click', openMenu);
  backdrop.addEventListener('click', closeMenu);
  document.querySelector('.nav__panel-close').addEventListener('click', closeMenu);

  panel.querySelectorAll('.nav__panel-menu a, .nav__panel-cta').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) closeMenu();
  });


})();


/* ── Formulario de contacto ──────────────────────────────────── */
(function () {
  const form = document.getElementById('contacto-form');
  if (!form) return;

  const RULES = [
    { id: 'f-name',  errorId: 'error-name',  msg: 'Por favor ingresá tu nombre y apellido.' },
    { id: 'f-org',   errorId: 'error-org',   msg: 'Por favor ingresá tu empresa u organización.' },
    { id: 'f-email', errorId: 'error-email', msg: 'Por favor ingresá un email válido.' },
    { id: 'f-msg',   errorId: 'error-msg',   msg: 'Por favor contanos brevemente tu consulta.' },
  ];

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function setFieldError(rule, msg) {
    const input = document.getElementById(rule.id);
    const span  = document.getElementById(rule.errorId);
    input.closest('.field').classList.add('field--error');
    span.textContent = msg || rule.msg;
  }

  function clearFieldError(rule) {
    const input = document.getElementById(rule.id);
    const span  = document.getElementById(rule.errorId);
    input.closest('.field').classList.remove('field--error');
    span.textContent = '';
  }

  function validate() {
    let ok = true;
    RULES.forEach(rule => {
      const val     = document.getElementById(rule.id).value.trim();
      const invalid = rule.id === 'f-email' ? (!val || !isValidEmail(val)) : !val;
      if (invalid) { setFieldError(rule); ok = false; }
      else          { clearFieldError(rule); }
    });
    return ok;
  }

  /* Limpiar error al escribir */
  RULES.forEach(rule => {
    const input = document.getElementById(rule.id);
    if (input) input.addEventListener('input', () => clearFieldError(rule));
  });

  const feedback  = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('form-submit');

  function showFeedback(type, msg) {
    feedback.hidden      = false;
    feedback.className   = 'form-feedback form-feedback--' + type;
    feedback.textContent = msg;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Enviando…';
    feedback.hidden       = true;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await res.json();

      if (result.success) {
        form.reset();
        showFeedback('success', '¡Gracias! Tu consulta fue enviada con éxito. Te respondemos dentro de las próximas 48 horas hábiles.');
        submitBtn.textContent = 'Consulta enviada ✓';
      } else {
        throw new Error(result.message || 'Error');
      }
    } catch {
      showFeedback('error', 'Ocurrió un error al enviar tu consulta. Por favor intentá nuevamente o contactanos directamente por WhatsApp o email.');
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Enviar consulta →';
    }
  });

  /* Recalcula posiciones de ScrollTrigger una vez que fonts e imágenes
     terminaron de cargar — el doble rAF asegura que el browser ya completó
     la restauración del scroll antes de que ScrollTrigger mida posiciones */
  window.addEventListener('load', () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh())
    )
  );
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
