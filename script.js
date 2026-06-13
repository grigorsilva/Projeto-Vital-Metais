/* ═══════════════════════════════════
   VITAL METAIS — script.js (Produção)
═══════════════════════════════════ */

/* ================== CARROSSEL "SOBRE NÓS" ================== */
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

/* ================== TABS LOGÍSTICA ================== */
function st(idx, el) {
  document.querySelectorAll('.tbtn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tc').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.tc')[idx].classList.add('active');
}

/* ================== CERTIFICAÇÕES ================== */
function toggleCert(el) {
  const wasActive = el.classList.contains('active');
  document.querySelectorAll('.cert-item').forEach(c => c.classList.remove('active'));
  if (!wasActive) el.classList.add('active');
}

/* ================== FORMULÁRIO DE CONTATO (API) ================== */
async function submitForm() {
  const required = ['fn', 'fem', 'fe', 'fm'];
  if (required.some(id => !document.getElementById(id).value.trim())) {
    alert('Preencha os campos obrigatórios: Nome, E-mail, Empresa e Material.');
    return;
  }

  const btn = document.querySelector('.btn-sub');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  const payload = {
    nome:     document.getElementById('fn').value.trim(),
    empresa:  document.getElementById('fe').value.trim(),
    email:    document.getElementById('fem').value.trim(),
    telefone: document.getElementById('ft').value.trim(),
    material: document.getElementById('fm').value,
    mensagem: document.getElementById('fmsg').value.trim(),
  };

  try {
    const res  = await fetch('enviar.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.ok) {
      const toast = document.getElementById('toast');
      if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4500); }
      ['fn', 'fe', 'fem', 'ft', 'fmsg'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('fm').selectedIndex = 0;
    } else {
      alert('Erro: ' + data.msg);
    }
  } catch {
    alert('Não foi possível enviar. Verifique sua conexão ou ligue para (11) 4146-2057.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar Mensagem'; }
  }
}

/* ================== SCROLL SUAVE ================== */
function initSmoothScroll() {
  document.querySelectorAll('#page-main a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      if (href === '#top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ================== INICIALIZAÇÃO UNIFICADA ================== */
document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initSmoothScroll();

  // Menu Hambúrguer (Mobile)
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

  // Glide.js (Produtos)
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


/* ================== POP-UP INTENÇÃO DE SAÍDA ================== */
document.addEventListener('DOMContentLoaded', () => {
  let popupMostrado = false;
  
  document.addEventListener('mouseout', (e) => {
    if (e.clientY <= 0 && !popupMostrado) {
      const popup = document.getElementById('popup-saida');
      if (popup) {
        popup.classList.add('ativo');
        popupMostrado = true; 
      }
    }
  });
});

function fecharPopupSaida() {
  const popup = document.getElementById('popup-saida');
  if (popup) {
    popup.classList.remove('ativo');
  }
}