// ===================== NAVEGACIÓN POR PESTAÑAS =====================
const tabs = document.querySelectorAll('.tab');
const navLinks = document.querySelectorAll('[data-tab-link]');
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const crowdSection = document.querySelector('.crowd-section');
let uiAudioContext;

function playUiSound(type){
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  uiAudioContext ||= new AudioContext();
  const oscillator = uiAudioContext.createOscillator();
  const gain = uiAudioContext.createGain();
  const now = uiAudioContext.currentTime;
  const frequency = type === 'select' ? 520 : 360;
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.45, now + .07);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.035, now + .012);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .11);
  oscillator.connect(gain);
  gain.connect(uiAudioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + .12);
  uiAudioContext.resume();
}

function goToTab(name){
  tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
  if (crowdSection) crowdSection.classList.toggle('is-visible', name === 'contacto');
  if (name === 'contacto') requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  navLinks.forEach(l => {
    if (l.classList.contains('nav__link')){
      l.classList.toggle('is-active', l.dataset.tabLink === name);
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  nav.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  history.replaceState(null, '', '#' + name);
  runFlowReveal();
  runRevealObservers();
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    goToTab(link.dataset.tabLink);
  });
});

document.querySelectorAll('.feature-tab, .pick-card, .nav__link').forEach(control => {
  control.addEventListener('click', () => playUiSound(control.classList.contains('feature-tab') ? 'select' : 'tap'));
});

// ===================== FORMULARIO PERSONALIZADO DE WHATSAPP =====================
const leadModal = document.getElementById('leadModal');
const leadForm = document.getElementById('leadForm');
const leadService = document.getElementById('leadService');
const leadCloseButtons = document.querySelectorAll('[data-lead-close]');
let lastLeadTrigger;

function detectLeadService(link){
  const featureLabel = link.closest('.feature-product')?.querySelector('[data-feature-eyebrow]')?.textContent;
  const context = [link.dataset.service, link.textContent, featureLabel, link.closest('.plan-card, .duo-card, .service-hero, .cta-band')?.textContent].filter(Boolean).join(' ').toLowerCase();
  if (context.includes('ia') || context.includes('inteligencia')) return 'Asesoría en IA';
  if (context.includes('chatbot')) return 'Chatbot';
  if (context.includes('whatsapp')) return 'WhatsApp Business';
  if (context.includes('qr') || context.includes('código')) return 'Código QR';
  if (context.includes('flyer') || context.includes('diseño') || context.includes('menú')) return 'Flyers y diseño';
  if (context.includes('web') || context.includes('página')) return 'Página Web Profesional';
  return 'Consulta general';
}

function openLeadModal(trigger){
  if (!leadModal || !leadForm) return;
  lastLeadTrigger = trigger;
  leadService.value = detectLeadService(trigger);
  leadModal.hidden = false;
  document.body.classList.add('modal-open');
  leadForm.querySelector('input[name="personName"]').focus();
}

function closeLeadModal(){
  if (!leadModal) return;
  leadModal.hidden = true;
  document.body.classList.remove('modal-open');
  lastLeadTrigger?.focus();
}

document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    openLeadModal(link);
  });
});
leadCloseButtons.forEach(button => button.addEventListener('click', closeLeadModal));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && leadModal && !leadModal.hidden) closeLeadModal(); });
leadForm?.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const message = [
    'Hola, quiero una propuesta personalizada de TECNOPATA.',
    '',
    `Nombre: ${formData.get('personName')}`,
    `Negocio: ${formData.get('businessName')}`,
    `Rubro: ${formData.get('businessType')}`,
    `Servicio: ${formData.get('service')}`,
    `¿Cuenta con una idea?: ${formData.get('hasIdea')}`
  ].join('\n');
  window.open(`https://wa.me/51955713075?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  closeLeadModal();
});

burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});

// Abrir la pestaña según el hash de la URL al cargar
const initial = window.location.hash.replace('#', '');
if (initial && document.getElementById('tab-' + initial)){
  goToTab(initial);
}

// ===================== INTRO: quitar del DOM tras la animación =====================
const intro = document.getElementById('intro');
if (intro){
  setTimeout(() => { intro.style.display = 'none'; }, 3350);
}

// ===================== CONTADORES ANIMADOS (stats del hero) =====================
function animateCount(el){
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
document.querySelectorAll('.stat__num').forEach(animateCount);

// ===================== PALABRAS ROTATIVAS DEL HERO =====================
const words = ['en internet', 'con chatbot', 'en WhatsApp', 'con más ventas'];
const wordSwapEl = document.getElementById('wordSwap');
if (wordSwapEl){
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % words.length;
    wordSwapEl.style.opacity = 0;
    wordSwapEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      wordSwapEl.textContent = words[idx];
      wordSwapEl.style.transition = 'opacity .4s ease, transform .4s ease';
      wordSwapEl.style.opacity = 1;
      wordSwapEl.style.transform = 'translateY(0)';
    }, 220);
  }, 2600);
}

// ===================== EFECTO "CORTINA" AL REVELAR LAS FOTOS =====================
function runRevealObservers(){
  const frames = document.querySelectorAll('.photo-frame.reveal:not(.is-revealed)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  frames.forEach(f => observer.observe(f));
}
runRevealObservers();

// ===================== REVELADO DE PASOS (flow) AL HACER SCROLL =====================
function runFlowReveal(){
  const steps = document.querySelectorAll('.tab.is-active .flow__step');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('in-view'), i * 140);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  steps.forEach(s => observer.observe(s));
}
runFlowReveal();

// ===================== BARRA DE PROGRESO DE SCROLL =====================
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress(){
  if (!scrollProgress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

// ===================== SPOTLIGHT (brillo que sigue al cursor en los hero) =====================
document.querySelectorAll('.spotlight').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// ===================== BOTONES MAGNÉTICOS (se acercan levemente al cursor) =====================
document.querySelectorAll('.btn--magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ===================== TARJETAS CON INCLINACIÓN 3D SUAVE =====================
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${py * -8}deg) rotateY(${px * 10}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ===================== SELECTOR DE SOLUCIONES =====================
const featureProduct = document.querySelector('[data-feature-product]');
if (featureProduct){
  const featureData = {
    web: { accent:'var(--c-web)', soft:'var(--c-web-soft)', eyebrow:'Web profesional', title:'Tu negocio siempre abierto', description:'Una página clara para que tus clientes te encuentren, confíen y te escriban.', cta:'Cotizar esta solución', link:'https://wa.me/51955713075?text=Hola%2C%20quiero%20cotizar%20mi%20pagina%20web', index:'01' },
    ia: { accent:'var(--c-ia)', soft:'var(--c-ia-soft)', eyebrow:'Asesoría IA', title:'Haz más en menos tiempo', description:'Aprende a usar la inteligencia artificial para responder, crear y organizarte mejor.', cta:'Agendar asesoría', link:'https://wa.me/51955713075?text=Hola%2C%20quiero%20una%20sesion%20de%20asesoria%20en%20IA', index:'02' },
    chatbot: { accent:'var(--c-chat)', soft:'var(--c-chat-soft)', eyebrow:'Chatbot', title:'Responde aunque tú no estés', description:'Un asistente que atiende preguntas frecuentes y captura oportunidades a cualquier hora.', cta:'Crear mi chatbot', link:'https://wa.me/51955713075?text=Hola%2C%20quiero%20un%20chatbot%20para%20mi%20negocio', index:'03' },
    whatsapp: { accent:'var(--c-wa)', soft:'var(--c-wa-soft)', eyebrow:'WhatsApp Business', title:'Convierte chats en clientes', description:'Ordena tus mensajes, catálogo y respuestas para que ninguna consulta se pierda.', cta:'Ordenar mi WhatsApp', link:'https://wa.me/51955713075?text=Hola%2C%20quiero%20ordenar%20mi%20WhatsApp%20Business', index:'04' },
    qr: { accent:'var(--c-qr)', soft:'var(--c-qr-soft)', eyebrow:'QR y flyers', title:'Del papel al celular', description:'Diseños que llevan a tus clientes directo a tu menú, catálogo o canal de contacto.', cta:'Pedir mi diseño', link:'https://wa.me/51955713075?text=Hola%2C%20quiero%20un%20codigo%20QR%20o%20flyer', index:'05' }
  };
  const eyebrow = featureProduct.querySelector('[data-feature-eyebrow]');
  const title = featureProduct.querySelector('[data-feature-title]');
  const description = featureProduct.querySelector('[data-feature-description]');
  const link = featureProduct.querySelector('[data-feature-link]');
  const index = featureProduct.querySelector('[data-feature-index]');
  const tabs = featureProduct.parentElement.querySelectorAll('[data-feature]');
  function selectFeature(name){
    const feature = featureData[name];
    if (!feature) return;
    featureProduct.className = 'feature-product feature--' + name;
    featureProduct.style.setProperty('--feature-accent', feature.accent);
    featureProduct.style.setProperty('--feature-accent-soft', feature.soft);
    eyebrow.textContent = feature.eyebrow;
    title.textContent = feature.title;
    description.textContent = feature.description;
    link.textContent = feature.cta;
    link.href = feature.link;
    index.textContent = feature.index;
    tabs.forEach(tab => {
      const active = tab.dataset.feature === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  }
  tabs.forEach(tab => tab.addEventListener('click', () => selectFeature(tab.dataset.feature)));
}

// ===================== CROWD CANVAS / SKIPER39 =====================
const crowdCanvas = document.querySelector('[data-crowd-canvas]');
if (crowdCanvas){
  const crowdContext = crowdCanvas.getContext('2d');
  if (crowdContext){
    const crowdStage = crowdCanvas.parentElement;
    const sprite = new Image();
    const allPeeps = [];
    const availablePeeps = [];
    const crowd = [];
    const rows = 15;
    const cols = 7;
    const neonColors = ['#24FF72', '#2D6BFF', '#16F1E8'];
    const random = (min, max) => min + Math.random() * (max - min);
    let stageWidth = 0;
    let stageHeight = 0;
    let pixelRatio = 1;
    let animationFrame;
    let previousTime = 0;
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function createTintedFrame(rect, color){
      const frame = document.createElement('canvas');
      frame.width = rect[2];
      frame.height = rect[3];
      const frameContext = frame.getContext('2d');
      if (!frameContext) return frame;
      frameContext.drawImage(sprite, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
      const pixels = frameContext.getImageData(0, 0, frame.width, frame.height);
      for (let index = 0; index < pixels.data.length; index += 4){
        const luminance = pixels.data[index] * .299 + pixels.data[index + 1] * .587 + pixels.data[index + 2] * .114;
        const ink = Math.max(0, Math.min(1, (230 - luminance) / 190));
        pixels.data[index] = parseInt(color.slice(1, 3), 16);
        pixels.data[index + 1] = parseInt(color.slice(3, 5), 16);
        pixels.data[index + 2] = parseInt(color.slice(5, 7), 16);
        pixels.data[index + 3] = pixels.data[index + 3] * ink;
      }
      frameContext.putImageData(pixels, 0, 0);
      return frame;
    }

    function createPeep(rect, index){
      const color = neonColors[index % neonColors.length];
      return {
        frame:createTintedFrame(rect, color), rect, width:rect[2], height:rect[3], x:0, y:0, anchorY:0,
        scale:random(.72, 1), direction:index % 2 === 0 ? 1 : -1,
        color, phase:random(0, Math.PI * 2), line:index % 3,
        speed:random(100, 150), startX:0, endX:0, startY:0,
      };
    }

    function buildPeeps(){
      allPeeps.length = 0;
      const frameWidth = sprite.naturalWidth / rows;
      const frameHeight = sprite.naturalHeight / cols;
      for (let index = 0; index < rows * cols; index += 1){
        allPeeps.push(createPeep([(index % rows) * frameWidth, Math.floor(index / rows) * frameHeight, frameWidth, frameHeight], index));
      }
    }

    function resetPeep(peep){
      const lineScale = random(.95, 1.12);
      const lineBase = peep.line === 0 ? .72 : peep.line === 1 ? .86 : 1;
      peep.scale = lineScale * Math.min(1, stageHeight / 360);
      peep.width = peep.rect[2] * peep.scale;
      peep.height = peep.rect[3] * peep.scale;
      peep.startY = stageHeight * lineBase - peep.height;
      peep.startX = peep.direction === 1 ? -peep.width : stageWidth + peep.width;
      peep.endX = peep.direction === 1 ? stageWidth : 0;
      peep.x = peep.startX;
      peep.y = peep.startY;
      peep.anchorY = peep.startY;
    }

    function addPeep(peep){ resetPeep(peep); crowd.push(peep); }

    function initializeCrowd(){
      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);
      const targetCount = stageWidth < 600 ? 24 : 42;
      for (let index = 0; index < targetCount; index += 1){
        const peepIndex = Math.floor(Math.random() * availablePeeps.length);
        const peep = availablePeeps.splice(peepIndex, 1)[0];
        peep.line = index % 3;
        peep.direction = peep.line % 2 === 0 ? 1 : -1;
        peep.color = neonColors[Math.floor(index / 3) % neonColors.length];
        peep.frame = createTintedFrame(peep.rect, peep.color);
        addPeep(peep);
        peep.x = (index / targetCount) * stageWidth + random(-30, 30);
      }
      crowd.sort((first, second) => first.anchorY - second.anchorY);
    }

    function resizeCrowd(){
      const bounds = crowdStage.getBoundingClientRect();
      stageWidth = bounds.width;
      stageHeight = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      crowdCanvas.width = stageWidth * pixelRatio;
      crowdCanvas.height = stageHeight * pixelRatio;
      crowdContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (allPeeps.length) initializeCrowd();
    }

    function drawPeep(peep, time){
      const walk = Math.sin(time * .008 + peep.phase) * 4 * peep.scale;
      const bob = Math.abs(Math.sin(time * .008 + peep.phase)) * 2 * peep.scale;
      peep.y = peep.anchorY - bob;
      crowdContext.save();
      crowdContext.translate(peep.x, peep.y);
      crowdContext.scale(peep.direction, 1);
      crowdContext.globalAlpha = .72 + peep.scale * .28;
      crowdContext.shadowColor = peep.color;
      crowdContext.shadowBlur = 12;
      const floorLift = stageHeight * .1;
      crowdContext.drawImage(peep.frame, walk, floorLift, peep.width, peep.height);
      crowdContext.restore();
    }

    function renderCrowd(time){
      const elapsed = Math.min(time - previousTime, 40);
      previousTime = time;
      crowdContext.clearRect(0, 0, stageWidth, stageHeight);
      crowd.sort((first, second) => first.anchorY - second.anchorY);
      crowd.forEach(peep => {
        if (!reducedMotion){
          peep.x += peep.speed * peep.direction * elapsed / 1000;
          if (peep.direction === 1 && peep.x > stageWidth + peep.width) peep.x = -peep.width;
          if (peep.direction === -1 && peep.x < -peep.width) peep.x = stageWidth + peep.width;
        }
        drawPeep(peep, time);
      });
      animationFrame = requestAnimationFrame(renderCrowd);
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    sprite.onload = () => { buildPeeps(); resizeCrowd(); animationFrame = requestAnimationFrame(renderCrowd); };
    sprite.src = 'assets/all-peeps.png';
    const handleMotionPreference = event => { reducedMotion = event.matches; };
    window.addEventListener('resize', resizeCrowd);
    motionQuery.addEventListener?.('change', handleMotionPreference);
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCrowd);
      motionQuery.removeEventListener?.('change', handleMotionPreference);
    }, { once:true });
  }
}

