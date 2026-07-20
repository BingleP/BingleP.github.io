import { updateTaskbar, openWindow } from './windows';

let soundPlayed = false;

function playStartupSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [
      { freq: 392.00, time: 0.0 },
      { freq: 523.25, time: 0.18 },
      { freq: 659.25, time: 0.36 },
      { freq: 783.99, time: 0.54 },
      { freq: 1046.5, time: 0.78 },
    ];
    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.55);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.6);
    });
  } catch { /* audio not available */ }
}

document.addEventListener('click', () => {
  if (!soundPlayed) { playStartupSound(); soundPlayed = true; }
}, { once: false });
document.addEventListener('keydown', () => {
  if (!soundPlayed) { playStartupSound(); soundPlayed = true; }
}, { once: false });

(function initBoot() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;
  let bootStarted = false;

  const loadingMessages = [
    'Loading hair drivers... [NOT FOUND]',
    'Initializing vibes...',
    'Configuring baldness.exe...',
    'Starting Kerrick OS...',
  ];
  let msgIndex = 0;
  let msgInterval: ReturnType<typeof setInterval> | undefined;

  bootScreen.addEventListener('click', function () {
    if (bootStarted) return;
    bootStarted = true;

    if (!soundPlayed) { playStartupSound(); soundPlayed = true; }

    const hint = document.getElementById('boot-click-hint');
    const wrap = document.getElementById('boot-progress-wrap');
    const bar = document.getElementById('boot-progress-bar');
    const loadingText = document.getElementById('boot-loading-text');
    if (hint) hint.style.display = 'none';
    if (wrap) wrap.style.display = 'flex';
    if (bar) setTimeout(() => { bar.style.width = '100%'; }, 30);

    if (loadingText) {
      msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        loadingText.textContent = loadingMessages[msgIndex];
      }, 550);
    }

    setTimeout(() => {
      if (msgInterval) clearInterval(msgInterval);
      bootScreen.classList.add('fading');
      setTimeout(() => bootScreen.classList.add('gone'), 520);
    }, 2500);
  });
})();

if (Math.random() < 0.3) {
  setTimeout(() => {
    document.getElementById('error-popup')?.classList.add('open');
  }, 2000);
}

const SCREENSAVER_DELAY = 60000;
let ssTimeout: ReturnType<typeof setTimeout> | undefined;
let ssAnimFrame = 0;
let ssX = 0, ssY = 0, ssDX = 0, ssDY = 0;

function startScreensaver() {
  const ss = document.getElementById('screensaver');
  const bouncer = document.getElementById('screensaver-bouncer');
  if (!ss || !bouncer) return;
  ssX = Math.random() * (window.innerWidth - 250);
  ssY = Math.random() * (window.innerHeight - 250);
  ssDX = (Math.random() < 0.5 ? 1 : -1) * 1.5;
  ssDY = (Math.random() < 0.5 ? 1 : -1) * 1.5;
  bouncer.style.left = ssX + 'px';
  bouncer.style.top = ssY + 'px';
  ss.classList.add('active');
  animateBouncer(bouncer);
}

function animateBouncer(bouncer: HTMLElement) {
  ssX += ssDX;
  ssY += ssDY;
  if (ssX <= 0 || ssX >= window.innerWidth - 250) ssDX *= -1;
  if (ssY <= 0 || ssY >= window.innerHeight - 250) ssDY *= -1;
  bouncer.style.left = ssX + 'px';
  bouncer.style.top = ssY + 'px';
  ssAnimFrame = requestAnimationFrame(() => animateBouncer(bouncer));
}

function stopScreensaver() {
  document.getElementById('screensaver')?.classList.remove('active');
  cancelAnimationFrame(ssAnimFrame);
  resetScreensaverTimer();
}

function resetScreensaverTimer() {
  clearTimeout(ssTimeout);
  ssTimeout = setTimeout(startScreensaver, SCREENSAVER_DELAY);
}

['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(ev => {
  document.addEventListener(ev, () => {
    if (document.getElementById('screensaver')?.classList.contains('active')) {
      stopScreensaver();
    } else {
      resetScreensaverTimer();
    }
  }, { passive: true });
});

resetScreensaverTimer();

function updateClock() {
  const clock = document.getElementById('clock');
  if (!clock) return;
  const now = new Date();
  clock.textContent =
    now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0');
}
setInterval(updateClock, 1000);
updateClock();

if (window.innerWidth <= 700) {
  document.getElementById('bonzi-panel')?.classList.add('bonzi-hidden');
  document.querySelectorAll('.icon-item').forEach(icon => {
    icon.addEventListener('click', () => {
      const dblHandler = icon.getAttribute('data-dblclick');
      if (dblHandler) {
        const match = dblHandler.match(/^window:(.+)$/);
        if (match) openWindow(match[1]);
      }
    });
  });
}

export { startScreensaver, stopScreensaver };
