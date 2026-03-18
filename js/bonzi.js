  function bonziTogglePanel() {
    document.getElementById('bonzi-panel').classList.toggle('bonzi-hidden');
  }

  let bonziHistory = [];
  let bonziTTS = true;

  function bonziToggleTTS() {
    bonziTTS = !bonziTTS;
    document.getElementById('bonzi-tts-toggle').textContent = bonziTTS ? '🔊' : '🔇';
    if (!bonziTTS) speechSynthesis.cancel();
  }

  function bonziSpeak(text) {
    if (!bonziTTS || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.1;
    utt.pitch = 0.7;
    speechSynthesis.speak(utt);
  }

  function bonziAddMessage(role, text) {
    const chat = document.getElementById('bonzi-chat');
    const div = document.createElement('div');
    div.className = 'bonzi-msg ' + role;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  async function bonziSend() {
    const input = document.getElementById('bonzi-input');
    const message = input.value.trim();
    if (!message) return;
    input.value = '';
    bonziAddMessage('user', message);

    const chat = document.getElementById('bonzi-chat');
    const thinking = document.createElement('div');
    thinking.className = 'bonzi-msg bonzi';
    thinking.textContent = '...';
    thinking.id = 'bonzi-thinking';
    chat.appendChild(thinking);
    chat.scrollTop = chat.scrollHeight;

    try {
      const res = await fetch(BONZI_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: bonziHistory }),
      });
      const data = await res.json();
      document.getElementById('bonzi-thinking')?.remove();
      if (!res.ok || !data.reply) {
        console.error('BonziBUDDY worker error:', data);
        bonziAddMessage('bonzi', 'Uh oh! Something went wrong. Check the browser console for details!');
        return;
      }
      const reply = data.reply;
      bonziAddMessage('bonzi', reply);
      const speechEl = document.getElementById('bonzi-speech');
      speechEl.textContent = reply.length > 60 ? reply.slice(0, 57) + '...' : reply;
      bonziHistory.push(
        { role: 'user',  parts: [{ text: message }] },
        { role: 'model', parts: [{ text: reply }] }
      );
      if (bonziHistory.length > 20) bonziHistory = bonziHistory.slice(-20);
      bonziSpeak(reply);
    } catch {
      document.getElementById('bonzi-thinking')?.remove();
      bonziAddMessage('bonzi', 'Uh oh! My modem disconnected! (Check the worker URL in the console)');
    }
  }

  // ── Floating BonziBUDDY ────────────────────────────────────────
  let bubbleFadeTimer = null;

  function showFloatBubble(text) {
    const bubble = document.getElementById('float-bubble');
    bubble.textContent = text;
    bubble.classList.add('visible');
    if (bubbleFadeTimer) clearTimeout(bubbleFadeTimer);
    // Random between 10-20 seconds
    const delay = 10000 + Math.random() * 10000;
    bubbleFadeTimer = setTimeout(() => bubble.classList.remove('visible'), delay);
  }

  function callBonziFromMenu() {
    const fb = document.getElementById('floating-bonzi');
    const fw = 190, fh = 220;
    let x = Math.min(Math.max(ctxClickX - fw / 2, 10), window.innerWidth  - fw - 10);
    let y = Math.min(Math.max(ctxClickY - fh / 2, 10), window.innerHeight - fh - 50);
    fb.style.left = x + 'px';
    fb.style.top  = y + 'px';
    fb.classList.add('active');
    document.getElementById('bonzi-panel').classList.add('bonzi-hidden');
    document.getElementById('ctx-call-bonzi').style.display = 'none';
    document.getElementById('ctx-send-home').style.display  = 'block';
    showFloatBubble("Hiya! Whatcha need? 🦍");
  }

  function sendBonziHome() {
    document.getElementById('floating-bonzi').classList.remove('active');
    document.getElementById('float-bubble').classList.remove('visible');
    document.getElementById('bonzi-panel').classList.remove('bonzi-hidden');
    document.getElementById('ctx-call-bonzi').style.display = 'block';
    document.getElementById('ctx-send-home').style.display  = 'none';
    if (bubbleFadeTimer) { clearTimeout(bubbleFadeTimer); bubbleFadeTimer = null; }
  }

  async function floatBonziSend() {
    const input = document.getElementById('float-bonzi-input');
    const message = input.value.trim();
    if (!message) return;
    input.value = '';
    bonziAddMessage('user', message);
    showFloatBubble('...');
    try {
      const res = await fetch(BONZI_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: bonziHistory }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) { showFloatBubble('Uh oh! Something went wrong!'); bonziAddMessage('bonzi', 'Uh oh! Something went wrong!'); return; }
      const reply = data.reply;
      showFloatBubble(reply);
      bonziAddMessage('bonzi', reply);
      bonziHistory.push(
        { role: 'user',  parts: [{ text: message }] },
        { role: 'model', parts: [{ text: reply }] }
      );
      if (bonziHistory.length > 20) bonziHistory = bonziHistory.slice(-20);
      bonziSpeak(reply);
    } catch {
      showFloatBubble("My modem disconnected! 📡");
      bonziAddMessage('bonzi', 'My modem disconnected! 📡');
    }
  }

  // Drag the floating Bonzi by his image
  (function() {
    const fb = document.getElementById('floating-bonzi');
    const handle = document.getElementById('float-bonzi-img');
    let dragging = false, ox = 0, oy = 0;
    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      ox = e.clientX - fb.offsetLeft;
      oy = e.clientY - fb.offsetTop;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      fb.style.left = Math.max(0, Math.min(e.clientX - ox, window.innerWidth  - 200)) + 'px';
      fb.style.top  = Math.max(0, Math.min(e.clientY - oy, window.innerHeight - 240)) + 'px';
    });
    document.addEventListener('mouseup', () => dragging = false);
  })();
