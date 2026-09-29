/* ── LOADING SCREEN ────────────────────────────────────────────── */
(function () {
  /* Canvas particle system */
  const canvas  = document.getElementById('particleCanvas');
  const ctx     = canvas.getContext('2d');
  let   W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x:  Math.random() * W,
      y:  H + Math.random() * 40,
      r:  Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.7 + 0.25),
      vx: (Math.random() - .5) * 0.35,
      a:  Math.random() * 0.6 + 0.1,
      da: (Math.random() * 0.003 + 0.001) * (Math.random() < .5 ? 1 : -1),
    };
  }

  function initParticles() {
    particles = Array.from({ length: 90 }, mkParticle);
    /* scatter initial y so screen isn't empty at start */
    particles.forEach(p => { p.y = Math.random() * H; });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x  += p.vx; p.y  += p.vy;
      p.a  += p.da;
      if (p.a < .04 || p.a > .75) p.da *= -1;
      if (p.y < -10) { Object.assign(p, mkParticle()); p.y = H + 8; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(191,140,42,${p.a})`;
      ctx.fill();
    });
    if (!loaderDone) requestAnimationFrame(drawParticles);
  }

  let loaderDone = false;
  resize();
  initParticles();
  drawParticles();
  window.addEventListener('resize', resize);

  /* Letter-by-letter title reveal */
  const nameEl = document.getElementById('loaderName');
  const text   = 'KASTEEL WARMELO';
  text.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className    = 'l-char';
    span.textContent  = ch === ' ' ? '\u00A0' : ch;
    span.style.animationDelay = (0.85 + i * 0.07) + 's';
    nameEl.appendChild(span);
  });

  /* Progress bar + hide loader */
  const bar      = document.getElementById('loaderBar');
  const loader   = document.getElementById('loader');
  let   progress = 0;
  const step     = 100 / 40; /* ~40 ticks to fill */

  const interval = setInterval(() => {
    progress = Math.min(progress + step + Math.random() * step * .5, 100);
    bar.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loaderDone = true;
        loader.classList.add('hidden');
      }, 600);
    }
  }, 68);

  /* 3D mouse-tracking parallax on loader content */
  const loaderContent = document.getElementById('loaderContent');
  const loaderCrest   = document.getElementById('loaderCrest');

  /* Switch crest to idle 3D float after entry animation */
  loaderCrest.addEventListener('animationend', () => {
    loaderCrest.classList.add('idle');
  }, { once: true });

  document.addEventListener('mousemove', function onLoaderMouse(e) {
    if (loaderDone) { document.removeEventListener('mousemove', onLoaderMouse); return; }
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const rx = ((e.clientY - cy) / cy) * -10;
    const ry = ((e.clientX - cx) / cx) *  14;
    loaderContent.style.transform =
      `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
})();


/* ── NAV ───────────────────────────────────────────────────────── */
const nav     = document.getElementById('nav');
const syncNav = () => nav.classList.toggle('scrolled', window.scrollY > 64);
window.addEventListener('scroll', syncNav, { passive: true });
syncNav();


/* ── MOBILE MENU ───────────────────────────────────────────────── */
const ham     = document.getElementById('ham');
const overlay = document.getElementById('overlay');
const closer  = document.getElementById('navClose');
const openM   = () => { overlay.classList.add('open'); ham.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
const closeM  = () => { overlay.classList.remove('open'); ham.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
ham.addEventListener('click', openM);
closer.addEventListener('click', closeM);
overlay.querySelectorAll('.mlink').forEach(l => l.addEventListener('click', closeM));


/* ── HERO PARALLAX ─────────────────────────────────────────────── */
const heroMedia = document.getElementById('heroMedia');
let raf = false;
window.addEventListener('scroll', () => {
  if (!raf) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      heroMedia.style.transform = `translateY(${sy * 0.32}px)`;
      raf = false;
    });
    raf = true;
  }
}, { passive: true });


/* ── HERO TEXT 3D MOUSE TILT ──────────────────────────────────── */
const heroText = document.getElementById('heroText');
const heroSection = document.getElementById('top');
heroSection.addEventListener('mousemove', e => {
  const r  = heroSection.getBoundingClientRect();
  const x  = (e.clientX - r.left) / r.width  - .5;
  const y  = (e.clientY - r.top)  / r.height - .5;
  heroText.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
  heroText.style.transition = 'transform .1s ease-out';
});
heroSection.addEventListener('mouseleave', () => {
  heroText.style.transform = '';
  heroText.style.transition = 'transform .7s var(--spring, cubic-bezier(.16,1,.3,1))';
});


/* ── 3D TILT ON CARDS ──────────────────────────────────────────── */
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    /* Only tilt when not flipped */
    const inner = card.querySelector('.flip-inner');
    if (inner.style.transform && inner.style.transform.includes('rotateY(180')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 5}deg) scale(1.01)`;
    card.style.transition = 'transform .08s ease-out';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
  });
});


/* ── 3D TILT ON EVENT CARDS ────────────────────────────────────── */
document.querySelectorAll('.ev').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 3}deg) translateZ(6px)`;
    card.style.transition = 'transform .08s ease-out, box-shadow .3s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), box-shadow .3s';
  });
});


/* ── SCULPT GALLERY 3D MOUSE PARALLAX ─────────────────────────── */
const sculptGrid = document.getElementById('sculptGrid');
if (sculptGrid) {
  const sculptSec = sculptGrid.closest('section');
  sculptSec.addEventListener('mousemove', e => {
    const r = sculptSec.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    sculptGrid.style.transform = `perspective(1400px) rotateY(${x * 4}deg) rotateX(${-y * 2.5}deg)`;
    sculptGrid.style.transition = 'transform .1s ease-out';
  });
  sculptSec.addEventListener('mouseleave', () => {
    sculptGrid.style.transform = '';
    sculptGrid.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1)';
  });
}


/* ── SCROLL REVEAL (3D fall-in) ────────────────────────────────── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal, .rule').forEach(el => io.observe(el));


/* ── LANGUAGE SWITCHER ─────────────────────────────────────────── */
const TRANS = {
  nl: {
    'hero-sub':    'Eeuwenoud landgoed in het hart van Twente — historische tuinen, indrukwekkende zandsculpturen en een rustgevend verblijf in de Oranjerie.',
    'hero-btn1':   'Ontdek het landgoed',
    'hero-btn2':   'Verblijf boeken',
    'banner':      'Seizoen 2026&ensp;&mdash;&ensp;<strong>Opening 3 mei 2026</strong>&ensp;&mdash;&ensp;Welkom terug op Landgoed Warmelo',
    'intro-label': 'Eeuwenoud erfgoed',
    'intro-h2':    'Een landgoed dat<br><em>de eeuwen</em> doorstaan heeft',
    'intro-body':  'Kasteel Warmelo staat al eeuwenlang in het hart van Diepenheim, omgeven door historische tuinen, rietkragen en stille bossen. Het landgoed combineert erfgoed met beleving: kunst in de buitenlucht, een smaakvolle terras en een knusse vakantiewoning in de voormalige Oranjerie.',
    'venue-h2':    'Uw evenement op een <em>unieke locatie</em>',
    'venue-body':  'Kasteel Warmelo beschikt over jarenlange ervaring met het organiseren van evenementen. Een onnavolgbaar decor voor feesten, bijeenkomsten en bijzondere gelegenheden.',
    'venue-btn':   'Informeer naar verhuur',
  },
  de: {
    'hero-sub':    'Jahrhundertealtes Landgut im Herzen von Twente — historische Gärten, beeindruckende Sandskulpturen und ein erholsamer Aufenthalt in der Orangerie.',
    'hero-btn1':   'Landgut entdecken',
    'hero-btn2':   'Unterkunft buchen',
    'banner':      'Saison 2026&ensp;&mdash;&ensp;<strong>Eröffnung 3. Mai 2026</strong>&ensp;&mdash;&ensp;Herzlich willkommen auf Landgoed Warmelo',
    'intro-label': 'Jahrhundertealtes Erbe',
    'intro-h2':    'Ein Landgut, das<br><em>die Jahrhunderte</em> überdauert hat',
    'intro-body':  'Kasteel Warmelo liegt seit Jahrhunderten im Herzen von Diepenheim, umgeben von historischen Gärten, Schilfgürteln und stillen Wäldern. Das Landgut verbindet Erbe mit Erlebnis: Kunst im Freien, eine stilvolle Terrasse und ein gemütliches Ferienhaus in der ehemaligen Orangerie.',
    'venue-h2':    'Ihre Veranstaltung an einem <em>einzigartigen Ort</em>',
    'venue-body':  'Kasteel Warmelo verfügt über langjährige Erfahrung in der Ausrichtung von Veranstaltungen. Ein unvergleichliches Ambiente für Feste, Tagungen und besondere Anlässe.',
    'venue-btn':   'Informationen anfordern',
  },
  en: {
    'hero-sub':    'A centuries-old estate in the heart of Twente — historic gardens, spectacular sand sculptures and a peaceful stay in the Orangery.',
    'hero-btn1':   'Explore the estate',
    'hero-btn2':   'Book a stay',
    'banner':      'Season 2026&ensp;&mdash;&ensp;<strong>Opening 3 May 2026</strong>&ensp;&mdash;&ensp;Welcome back to Landgoed Warmelo',
    'intro-label': 'Centuries of heritage',
    'intro-h2':    'An estate that has<br>stood the test of <em>time</em>',
    'intro-body':  'Kasteel Warmelo has stood for centuries at the heart of Diepenheim, surrounded by historic gardens, reedbeds and quiet forests. The estate blends heritage with experience: open-air art, a stylish terrace and a cosy holiday cottage in the former Orangery.',
    'venue-h2':    'Your event at a <em>unique location</em>',
    'venue-body':  'Kasteel Warmelo has years of experience hosting events. An unparalleled backdrop for celebrations, gatherings and special occasions.',
    'venue-btn':   'Enquire about hire',
  },
};

function setLang(lang) {
  const t = TRANS[lang];
  if (!t) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.documentElement.lang = lang;
  localStorage.setItem('kw-lang', lang);
  ['nl','de','en'].forEach(l => {
    const btn = document.getElementById('btn-' + l);
    if (btn) btn.classList.toggle('active', l === lang);
  });
}

(function() {
  const saved = localStorage.getItem('kw-lang') || 'nl';
  if (saved !== 'nl') setLang(saved);
})();
