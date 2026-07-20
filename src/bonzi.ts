import { BONZI_WORKER_URL } from './config';
import type { BonziMessage } from './types';
import { getContextClickPos } from './windows';

let bonziHistory: BonziMessage[] = [];
let bonziTTS = true;
let bubbleFadeTimer: ReturnType<typeof setTimeout> | null = null;

export function bonziTogglePanel() {
  document.getElementById('bonzi-panel')?.classList.toggle('bonzi-hidden');
}

export function bonziToggleTTS() {
  bonziTTS = !bonziTTS;
  const btn = document.getElementById('bonzi-tts-toggle');
  if (btn) btn.textContent = bonziTTS ? '🔊' : '🔇';
  if (!bonziTTS) speechSynthesis.cancel();
}

function bonziSpeak(text: string) {
  if (!bonziTTS || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.1;
  utt.pitch = 0.7;
  speechSynthesis.speak(utt);
}

function bonziAddMessage(role: string, text: string) {
  const chat = document.getElementById('bonzi-chat');
  if (!chat) return;
  const div = document.createElement('div');
  div.className = 'bonzi-msg ' + role;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

export async function bonziSend() {
  const input = document.getElementById('bonzi-input') as HTMLInputElement | null;
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  bonziAddMessage('user', message);

  const chat = document.getElementById('bonzi-chat');
  if (!chat) return;
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
    const reply: string = data.reply;
    bonziAddMessage('bonzi', reply);
    const speechEl = document.getElementById('bonzi-speech');
    if (speechEl) speechEl.textContent = reply.length > 60 ? reply.slice(0, 57) + '...' : reply;
    bonziHistory.push(
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: reply }] }
    );
    if (bonziHistory.length > 20) bonziHistory = bonziHistory.slice(-20);
    bonziSpeak(reply);
  } catch {
    document.getElementById('bonzi-thinking')?.remove();
    bonziAddMessage('bonzi', 'Uh oh! My modem disconnected! (Check the worker URL in the console)');
  }
}

function showFloatBubble(text: string) {
  const bubble = document.getElementById('float-bubble');
  if (!bubble) return;
  bubble.textContent = text;
  bubble.classList.add('visible');
  if (bubbleFadeTimer) clearTimeout(bubbleFadeTimer);
  const delay = 10000 + Math.random() * 10000;
  bubbleFadeTimer = setTimeout(() => bubble.classList.remove('visible'), delay);
}

export function callBonziFromMenu() {
  const fb = document.getElementById('floating-bonzi');
  if (!fb) return;
  const fw = 190, fh = 220;
  const pos = getContextClickPos();
  const x = Math.min(Math.max(pos.x - fw / 2, 10), window.innerWidth - fw - 10);
  const y = Math.min(Math.max(pos.y - fh / 2, 10), window.innerHeight - fh - 50);
  fb.style.left = x + 'px';
  fb.style.top = y + 'px';
  fb.classList.add('active');
  document.getElementById('bonzi-panel')?.classList.add('bonzi-hidden');
  const callEl = document.getElementById('ctx-call-bonzi');
  const homeEl = document.getElementById('ctx-send-home');
  if (callEl) callEl.style.display = 'none';
  if (homeEl) homeEl.style.display = 'block';
  showFloatBubble("Hiya! Whatcha need? 🦍");
}

export function sendBonziHome() {
  const fb = document.getElementById('floating-bonzi');
  if (fb) fb.classList.remove('active');
  document.getElementById('float-bubble')?.classList.remove('visible');
  document.getElementById('bonzi-panel')?.classList.remove('bonzi-hidden');
  const callEl = document.getElementById('ctx-call-bonzi');
  const homeEl = document.getElementById('ctx-send-home');
  if (callEl) callEl.style.display = 'block';
  if (homeEl) homeEl.style.display = 'none';
  if (bubbleFadeTimer) { clearTimeout(bubbleFadeTimer); bubbleFadeTimer = null; }
}

export async function floatBonziSend() {
  const input = document.getElementById('float-bonzi-input') as HTMLInputElement | null;
  if (!input) return;
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
    const reply: string = data.reply;
    showFloatBubble(reply);
    bonziAddMessage('bonzi', reply);
    bonziHistory.push(
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: reply }] }
    );
    if (bonziHistory.length > 20) bonziHistory = bonziHistory.slice(-20);
    bonziSpeak(reply);
  } catch {
    showFloatBubble("My modem disconnected! 📡");
    bonziAddMessage('bonzi', 'My modem disconnected! 📡');
  }
}

(function initFloatingDrag() {
  const fb = document.getElementById('floating-bonzi');
  const handle = document.getElementById('float-bonzi-img');
  if (!fb || !handle) return;
  let dragging = false, ox = 0, oy = 0;
  handle.addEventListener('mousedown', (e) => {
    dragging = true;
    ox = e.clientX - fb.offsetLeft;
    oy = e.clientY - fb.offsetTop;
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    fb.style.left = Math.max(0, Math.min(e.clientX - ox, window.innerWidth - 200)) + 'px';
    fb.style.top = Math.max(0, Math.min(e.clientY - oy, window.innerHeight - 240)) + 'px';
  });
  document.addEventListener('mouseup', () => dragging = false);
})();
