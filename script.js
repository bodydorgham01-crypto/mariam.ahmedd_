/* ======================================================
   EDITABLE SETTINGS — change these to personalize
====================================================== */
const CORRECT_PASSWORD = "1/6";            // <-- set your password here
const START_DATE = new Date("2026-03-16T22:30:00"); // <-- counting up from this date
const TARGET_LABEL = "first mwssage";        // <-- label shown above the counter

/* ======================================================
   ELEMENT REFERENCES
====================================================== */
const loginScreen   = document.getElementById('loginScreen');
const loadingScreen = document.getElementById('loadingScreen');
const mainPage       = document.getElementById('mainPage');
const loginForm      = document.getElementById('loginForm');
const passwordInput  = document.getElementById('passwordInput');
const errorMsg       = document.getElementById('errorMsg');

/* ======================================================
   FLOATING EMBERS / HEARTS BACKGROUND
====================================================== */
const embersContainer = document.getElementById('embers');
const HEART_GLYPHS = ['&#10084;', '&#10084;', '&#10084;'];

function spawnEmber(){
  const ember = document.createElement('span');
  ember.className = 'ember';
  ember.innerHTML = HEART_GLYPHS[Math.floor(Math.random() * HEART_GLYPHS.length)];
  const left = Math.random() * 100;
  const size = 8 + Math.random() * 16;
  const duration = 7 + Math.random() * 8;
  const drift = (Math.random() * 120 - 60) + 'px';

  ember.style.left = left + 'vw';
  ember.style.fontSize = size + 'px';
  ember.style.animationDuration = duration + 's';
  ember.style.setProperty('--drift', drift);

  embersContainer.appendChild(ember);
  setTimeout(() => ember.remove(), duration * 1000 + 200);
}

// gentle continuous stream
setInterval(spawnEmber, 650);
for (let i = 0; i < 6; i++) setTimeout(spawnEmber, i * 300);

/* ======================================================
   LOGIN LOGIC
====================================================== */
function showScreen(el){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

const WRONG_PASSWORD_MESSAGES = [
  "لا غلط",
  "لا ركزي، في ايه ده سهل",
  "يووه تاريخ ميلاد يا كنج",
  "تاريخ ميلادك يا ستي قرفتينا"
];
let wrongAttempts = 0;

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = passwordInput.value.trim();

  if (value === CORRECT_PASSWORD){
    errorMsg.classList.remove('show');
    wrongAttempts = 0;
    showScreen(loadingScreen);

    // simulate a soft "opening the door" beat before revealing the main page
    setTimeout(() => {
      showScreen(mainPage);
      startMusic();
    }, 1600);

  } else {
    const msgIndex = wrongAttempts % WRONG_PASSWORD_MESSAGES.length;
    errorMsg.textContent = WRONG_PASSWORD_MESSAGES[msgIndex];
    wrongAttempts++;

    errorMsg.classList.add('show');
    passwordInput.classList.remove('shake');
    // restart shake animation
    void passwordInput.offsetWidth;
    passwordInput.classList.add('shake');
    passwordInput.value = '';
    passwordInput.focus();
  }
});

/* ======================================================
   COUNT-UP TIMER
====================================================== */
const elDays  = document.getElementById('cd-days');
const elHours = document.getElementById('cd-hours');
const elMins  = document.getElementById('cd-mins');
const elSecs  = document.getElementById('cd-secs');
document.getElementById('targetDateLabel').textContent = TARGET_LABEL;

function pad(n){ return String(n).padStart(2, '0'); }

function updateCountdown(){
  const now = new Date().getTime();
  let diff = now - START_DATE.getTime();

  if (diff < 0) diff = 0;

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins  = Math.floor((diff / (1000 * 60)) % 60);
  const secs  = Math.floor((diff / 1000) % 60);

  elDays.textContent  = pad(days);
  elHours.textContent = pad(hours);
  elMins.textContent  = pad(mins);
  elSecs.textContent  = pad(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ======================================================
   MUSIC CONTROL
====================================================== */
const bgMusic     = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const iconPlaying = document.getElementById('iconPlaying');
const iconPaused  = document.getElementById('iconPaused');
let musicIsPlaying = false;

function startMusic(){
  bgMusic.volume = 0.55;
  const playPromise = bgMusic.play();
  if (playPromise !== undefined){
    playPromise.then(() => {
      musicIsPlaying = true;
      reflectMusicIcon();
    }).catch(() => {
      // autoplay blocked by browser — wait for user interaction
      musicIsPlaying = false;
      reflectMusicIcon();
    });
  }
}

function reflectMusicIcon(){
  iconPlaying.style.display = musicIsPlaying ? 'block' : 'none';
  iconPaused.style.display  = musicIsPlaying ? 'none'  : 'block';
  musicToggle.setAttribute('aria-label', musicIsPlaying ? 'Pause music' : 'Play music');
}

musicToggle.addEventListener('click', () => {
  if (musicIsPlaying){
    bgMusic.pause();
    musicIsPlaying = false;
  } else {
    bgMusic.play().catch(() => {});
    musicIsPlaying = true;
  }
  reflectMusicIcon();
});

/* ======================================================
   GALLERY — swipe / drag / arrow navigation
====================================================== */
const galleryTrack = document.getElementById('galleryTrack');
const galPrev = document.getElementById('galPrev');
const galNext = document.getElementById('galNext');
const galDotsWrap = document.getElementById('galDots');
const galCards = Array.from(galleryTrack.querySelectorAll('.gal-card'));

// build dots
galCards.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.className = 'gal-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => scrollToCard(i));
  galDotsWrap.appendChild(dot);
});
const dots = Array.from(galDotsWrap.children);

function cardScrollAmount(){
  return galCards[0].getBoundingClientRect().width + 18; // width + gap
}

function scrollToCard(i){
  galleryTrack.scrollTo({ left: i * cardScrollAmount(), behavior: 'smooth' });
}

galPrev.addEventListener('click', () => {
  galleryTrack.scrollBy({ left: -cardScrollAmount(), behavior: 'smooth' });
});
galNext.addEventListener('click', () => {
  galleryTrack.scrollBy({ left: cardScrollAmount(), behavior: 'smooth' });
});

// active dot on scroll
let scrollTimeout;
galleryTrack.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    const idx = Math.round(galleryTrack.scrollLeft / cardScrollAmount());
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, 80);
});

// mouse-drag support for desktop (touch works natively via overflow-x + snap)
let isDown = false, startX = 0, scrollStart = 0;

galleryTrack.addEventListener('mousedown', (e) => {
  isDown = true;
  galleryTrack.classList.add('dragging');
  startX = e.pageX;
  scrollStart = galleryTrack.scrollLeft;
});
window.addEventListener('mouseup', () => {
  isDown = false;
  galleryTrack.classList.remove('dragging');
});
window.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const walk = (e.pageX - startX);
  galleryTrack.scrollLeft = scrollStart - walk;
});

/* ======================================================
   FULLSCREEN IMAGE MODAL
====================================================== */
const modal      = document.getElementById('imgModal');
const modalImg   = document.getElementById('modalImg');
const modalClose = document.getElementById('modalClose');
const modalPrev  = document.getElementById('modalPrev');
const modalNext  = document.getElementById('modalNext');
let currentModalIndex = 0;

function openModal(index){
  currentModalIndex = index;
  renderModalImage();
  modal.classList.add('open');
}
function closeModal(){
  modal.classList.remove('open');
}
function renderModalImage(){
  const img = galCards[currentModalIndex].querySelector('img');
  modalImg.src = img.src;
  modalImg.alt = img.alt;
}
function showNextImage(){
  currentModalIndex = (currentModalIndex + 1) % galCards.length;
  renderModalImage();
}
function showPrevImage(){
  currentModalIndex = (currentModalIndex - 1 + galCards.length) % galCards.length;
  renderModalImage();
}

galCards.forEach((card, i) => {
  card.addEventListener('click', () => openModal(i));
});
modalClose.addEventListener('click', closeModal);
modalNext.addEventListener('click', showNextImage);
modalPrev.addEventListener('click', showPrevImage);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowRight') showNextImage();
  if (e.key === 'ArrowLeft') showPrevImage();
});

/* ======================================================
   INIT
====================================================== */
showScreen(loginScreen);
passwordInput.focus();