/* ═══════════════════════════════════
   VITAL METAIS — script.js
═══════════════════════════════════ */

/* ══════════════════════════════
   SLIDES — PÁGINA EMPRESA
══════════════════════════════ */
const TOTAL_SLIDES = 8;
let curSlide = 1;

function initDots() {
  const dotsEl = document.getElementById('dots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  for (let i = 1; i <= TOTAL_SLIDES; i++) {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 1 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + i);
    d.onclick = () => goSlide(i);
    dotsEl.appendChild(d);
  }
}

function goSlide(n) {
  // 1. Limpa TODOS os slides primeiro (Garante que nenhum fica encravado na frente)
  for (let i = 1; i <= TOTAL_SLIDES; i++) {
    const slide = document.getElementById('sl-' + i);
    if (slide) {
      slide.classList.remove('active');
    }
  }
  
  // Limpa também todas as bolinhas
  const dotsEl = document.getElementById('dots');
  if (dotsEl) {
    Array.from(dotsEl.children).forEach(dot => dot.classList.remove('active'));
  }

  // 2. Atualiza o número do slide atual
  curSlide = n;

  // 3. Ativa EXATAMENTE o slide pedido e traz para a frente
  const nextSlide = document.getElementById('sl-' + curSlide);
  if (nextSlide) {
    nextSlide.classList.add('active');
  }

  // 4. Pinta a bolinha correta
  if (dotsEl && dotsEl.children[curSlide - 1]) {
    dotsEl.children[curSlide - 1].classList.add('active');
  }

  // 5. Bloqueia/Desbloqueia os botões Anterior e Próximo
  const btnP = document.getElementById('btnPrev');
  const btnN = document.getElementById('btnNext');
  if (btnP) btnP.disabled = (curSlide === 1);
  if (btnN) btnN.disabled = (curSlide === TOTAL_SLIDES);
}

function nextSlide() { if (curSlide < TOTAL_SLIDES) goSlide(curSlide + 1); }
function prevSlide() { if (curSlide > 1) goSlide(curSlide - 1); }



/* ══════════════════════════════
   PAGE TRANSITION
══════════════════════════════ */
function abrirEmpresa() {
  goSlide(1);
  document.getElementById('page-empresa').classList.add('visible');
  document.getElementById('page-main').classList.add('hidden');
  document.getElementById('page-empresa').scrollTo({ top: 0, behavior: 'instant' });
}

function voltarHome() {
  document.getElementById('page-empresa').classList.remove('visible');
  document.getElementById('page-main').classList.remove('hidden');
}

/* ══════════════════════════════
   CARROSSEL "SOBRE NÓS"
══════════════════════════════ */
let acCur = 0;
let acTotal = 0;
let acTimer = null;

function initCarousel() {
  const track = document.getElementById('acTrack');
  const dotsEl = document.getElementById('acDots');
  if (!track || !dotsEl) return;

  const slides = track.querySelectorAll('.ac-slide');
  acTotal = slides.length;
  if (acTotal === 0) return;

  dotsEl.innerHTML = '';
  for (let i = 0; i < acTotal; i++) {
    const d = document.createElement('button');
    d.className = 'ac-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => acGo(i);
    dotsEl.appendChild(d);
  }

  acGo(0);
  acStart();
}

function acGo(n) {
  const track = document.getElementById('acTrack');
  const dotsEl = document.getElementById('acDots');
  if (!track) return;
  acCur = (n + acTotal) % acTotal;
  track.style.transform = 'translateX(-' + (acCur * 100) + '%)';
  if (dotsEl) {
    dotsEl.querySelectorAll('.ac-dot').forEach((d, i) => {
      d.classList.toggle('active', i === acCur);
    });
  }
}

function acMove(dir) {
  acGo(acCur + dir);
  acReset();
}

function acStart() {
  acTimer = setInterval(() => acGo(acCur + 1), 4000);
}

function acReset() {
  clearInterval(acTimer);
  acStart();
}

/* ══════════════════════════════
   TABS LOGÍSTICA
══════════════════════════════ */
function st(idx, el) {
  document.querySelectorAll('.tbtn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tc').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.tc')[idx].classList.add('active');
}

/* ══════════════════════════════
   CERTIFICAÇÕES — TOGGLE COR
══════════════════════════════ */
function toggleCert(el) {
  const wasActive = el.classList.contains('active');
  document.querySelectorAll('.cert-item').forEach(c => c.classList.remove('active'));
  if (!wasActive) el.classList.add('active');
}

/* ══════════════════════════════
   FORMULÁRIO DE CONTATO
══════════════════════════════ */
function submitForm() {
  const required = ['fn', 'fem', 'fe', 'fm'];
  if (required.some(id => !document.getElementById(id).value.trim())) {
    alert('Preencha os campos obrigatórios: Nome, E-mail, Empresa e Material.');
    return;
  }
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
  ['fn', 'fe', 'fem', 'ft', 'fmsg'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fm').selectedIndex = 0;
}

/* ══════════════════════════════
   MERCADO LME — YAHOO FINANCE
══════════════════════════════ */

/*
  Símbolos Yahoo Finance usados:
  ALI=F  → Alumínio Futuro (USD/lb × 2204.62 = USD/t)
  HG=F   → Cobre Futuro   (USD/lb × 2204.62 = USD/t)
  PB=F   → Chumbo         (USD/t direto via LME ticker)
  ZNC=F  → Zinco Futuro   (USD/t)
  SN=F   → Estanho        (USD/t via LME)
  NI=F   → Níquel Futuro  (USD/t)
  BRL=X  → USD/BRL câmbio

  Usamos o proxy público allorigins.win para contornar CORS.
  Em produção, recomenda-se um backend próprio ou a API paga do Yahoo Finance.
*/

const YAHOO_METALS = [
  { id: 'al',  ticker: 'ALI=F',  label: 'Alumínio', unit: 'USD/t',  factor: 2204.62 },
  { id: 'cu',  ticker: 'HG=F',   label: 'Cobre',    unit: 'USD/t',  factor: 2204.62 },
  { id: 'pb',  ticker: 'PB=F',   label: 'Chumbo',   unit: 'USD/t',  factor: 1       },
  { id: 'zn',  ticker: 'ZNC=F',  label: 'Zinco',    unit: 'USD/t',  factor: 1       },
  { id: 'sn',  ticker: 'SN=F',   label: 'Estanho',  unit: 'USD/t',  factor: 1       },
  { id: 'ni',  ticker: 'NI=F',   label: 'Níquel',   unit: 'USD/t',  factor: 1       },
  { id: 'usd', ticker: 'BRL=X',  label: 'Dólar',    unit: 'BRL',    factor: 1       },
];

const PROXY = 'https://api.allorigins.win/get?url=';

async function fetchYahoo(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`;
  const res = await fetch(PROXY + encodeURIComponent(url), { signal: AbortSignal.timeout(8000) });
  const wrap = await res.json();
  const data = JSON.parse(wrap.contents);
  const meta = data.chart.result[0].meta;
  const price = meta.regularMarketPrice;
  const prev  = meta.chartPreviousClose || meta.previousClose || price;
  return { price, prev };
}

async function loadLME() {
  /* Atualiza timestamp */
  const tsEl = document.getElementById('lme-timestamp');
  if (tsEl) {
    const now = new Date();
    tsEl.textContent = 'Atualizado: ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  for (const m of YAHOO_METALS) {
    try {
      const { price, prev } = await fetchYahoo(m.ticker);
      const realPrice = price * m.factor;
      const realPrev  = prev  * m.factor;
      const decimals  = m.id === 'usd' ? 4 : 0;
      renderCard(m.id, realPrice, realPrev, decimals);
    } catch {
      /* fallback: mostra último valor conhecido */
      const fallbacks = { al: 2480, cu: 9640, pb: 2010, zn: 2750, sn: 28500, ni: 16800, usd: 5.68 };
      const decimals  = m.id === 'usd' ? 4 : 0;
      renderCard(m.id, fallbacks[m.id], fallbacks[m.id], decimals, true);
    }
  }
}

function renderCard(id, price, prev, decimals, isOffline = false) {
  const valEl = document.getElementById('lv-'   + id);
  const chgEl = document.getElementById('lchg-' + id);
  if (!valEl || !chgEl) return;

  const fmt  = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  valEl.textContent = fmt.format(price);

  if (isOffline) {
    chgEl.textContent = '—';
    chgEl.className = 'lme-chg';
    return;
  }

  const diff = price - prev;
  const pct  = ((diff / prev) * 100).toFixed(2);
  const sign = diff >= 0 ? '+' : '';
  const arrow = diff >= 0 ? ' ▲' : ' ▼';
  chgEl.textContent = sign + pct + '%' + arrow;
  chgEl.className   = 'lme-chg ' + (diff >= 0 ? 'up' : 'down');
}

/* ══════════════════════════════
   SMOOTH SCROLL
══════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('#page-main a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      if (href === '#top') {
        document.getElementById('page-main').scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initDots();
  initCarousel();
  initSmoothScroll();
  loadLME();
})

/* ══════════════════════════════
   MENU HAMBÚRGUER (MOBILE)
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (mainNav.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });

    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      });
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('#glide-produtos')) {
    new Glide('#glide-produtos', {
      type: 'carousel',
      perView: 4,
      gap: 20,
      autoplay: 3500,
      breakpoints: {
        1200: { perView: 3 },
        800: { perView: 2 },
        500: { perView: 1 }
      }
    }).mount();
  }
  
});

/* ── MODO ESCURO / CLARO (THEME TOGGLE) ── */
