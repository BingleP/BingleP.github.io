  // ── Error popup ────────────────────────────────────────────────
  if (Math.random() < 0.3) {
    setTimeout(() => {
      document.getElementById('error-popup').classList.add('open');
    }, 2000);
  }

  // ── Startup sound (Web Audio API) ──────────────────────────────
  function playStartupSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [
        { freq: 392.00, time: 0.0 },   // G4
        { freq: 523.25, time: 0.18 },  // C5
        { freq: 659.25, time: 0.36 },  // E5
        { freq: 783.99, time: 0.54 },  // G5
        { freq: 1046.5, time: 0.78 },  // C6
      ];
      notes.forEach(({ freq, time }) => {
        const osc  = ctx.createOscillator();
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
    } catch (e) {}
  }

  // Play on first user interaction (browser autoplay policy)
  let soundPlayed = false;
  document.addEventListener('click', () => {
    if (!soundPlayed) { playStartupSound(); soundPlayed = true; }
  }, { once: false });
  document.addEventListener('keydown', () => {
    if (!soundPlayed) { playStartupSound(); soundPlayed = true; }
  }, { once: false });

  // ── Boot screen ────────────────────────────────────────────────
  (function() {
    const bootScreen = document.getElementById('boot-screen');
    let bootStarted = false;

    const loadingMessages = [
      'Loading hair drivers... [NOT FOUND]',
      'Initializing vibes...',
      'Configuring baldness.exe...',
      'Starting Kerrick OS...',
    ];
    let msgIndex = 0;
    let msgInterval;

    bootScreen.addEventListener('click', function() {
      if (bootStarted) return;
      bootStarted = true;

      // Play startup sound now (counts as first interaction)
      if (!soundPlayed) { playStartupSound(); soundPlayed = true; }

      // Swap hint for progress bar
      document.getElementById('boot-click-hint').style.display = 'none';
      const wrap = document.getElementById('boot-progress-wrap');
      wrap.style.display = 'flex';

      // Animate progress bar
      setTimeout(() => {
        document.getElementById('boot-progress-bar').style.width = '100%';
      }, 30);

      // Cycle loading messages
      const loadingText = document.getElementById('boot-loading-text');
      msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        loadingText.textContent = loadingMessages[msgIndex];
      }, 550);

      // Fade out and remove after ~2.5s
      setTimeout(() => {
        clearInterval(msgInterval);
        bootScreen.classList.add('fading');
        setTimeout(() => bootScreen.classList.add('gone'), 520);
      }, 2500);
    });
  })();

  // ── Screensaver ────────────────────────────────────────────────
  const SCREENSAVER_DELAY = 60000; // 1 minute
  let ssTimeout;
  let ssAnimFrame;
  let ssX, ssY, ssDX, ssDY;

  function resetScreensaverTimer() {
    clearTimeout(ssTimeout);
    ssTimeout = setTimeout(startScreensaver, SCREENSAVER_DELAY);
  }

  function startScreensaver() {
    const ss = document.getElementById('screensaver');
    const bouncer = document.getElementById('screensaver-bouncer');
    ssX  = Math.random() * (window.innerWidth  - 250);
    ssY  = Math.random() * (window.innerHeight - 250);
    ssDX = (Math.random() < 0.5 ? 1 : -1) * 1.5;
    ssDY = (Math.random() < 0.5 ? 1 : -1) * 1.5;
    bouncer.style.left = ssX + 'px';
    bouncer.style.top  = ssY + 'px';
    ss.classList.add('active');
    animateBouncer();
  }

  function animateBouncer() {
    const bouncer = document.getElementById('screensaver-bouncer');
    ssX += ssDX;
    ssY += ssDY;
    if (ssX <= 0 || ssX >= window.innerWidth  - 250) ssDX *= -1;
    if (ssY <= 0 || ssY >= window.innerHeight - 250) ssDY *= -1;
    bouncer.style.left = ssX + 'px';
    bouncer.style.top  = ssY + 'px';
    ssAnimFrame = requestAnimationFrame(animateBouncer);
  }

  function stopScreensaver() {
    document.getElementById('screensaver').classList.remove('active');
    cancelAnimationFrame(ssAnimFrame);
    resetScreensaverTimer();
  }

  ['mousemove','mousedown','keydown','touchstart'].forEach(ev => {
    document.addEventListener(ev, () => {
      if (document.getElementById('screensaver').classList.contains('active')) {
        stopScreensaver();
      } else {
        resetScreensaverTimer();
      }
    }, { passive: true });
  });

  resetScreensaverTimer();

  // ── Clock ──────────────────────────────────────────────────────
  function updateClock() {
    const now = new Date();
    document.getElementById('clock').textContent =
      now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0');
  }
  setInterval(updateClock, 1000);
  updateClock();
  updateTaskbar();

  // ── Mobile tweaks ─────────────────────────────────────────────
  if (window.innerWidth <= 700) {
    document.getElementById('bonzi-panel').classList.add('bonzi-hidden');

    document.querySelectorAll('.icon-item').forEach(icon => {
      const dblHandler = icon.getAttribute('ondblclick');
      if (dblHandler) {
        const id = /openWindow\('([^']+)'\)/.exec(dblHandler)?.[1];
        if (id) icon.addEventListener('click', () => openWindow(id));
      }
    });
  }

  // BonziBUDDY starts open
  // (panel is visible by default, tray button hides it)
