import './style.css';
import { initWindows, openWindow, closeWindow, minimizeWindow, refreshDesktop, toggleStart, closeContextMenu } from './windows';
import { startScreensaver } from './system';
import { bonziSend, bonziTogglePanel, bonziToggleTTS, callBonziFromMenu, sendBonziHome, floatBonziSend } from './bonzi';
import { loadSteamData } from './steam';
import { winampInit, winampPlay, winampPause, winampStop, winampNext, winampPrev, winampLoadTrack } from './winamp';
import { loadProjects } from './projects';
import { loadMTGCard } from './mtg';
import { Solitaire } from './solitaire';
import { pt73Season } from './pt73';
import { stopScreensaver } from './system';

type ClickHandler = (param: string, e: Event) => void;
const clickActions: Record<string, ClickHandler> = {
  'window:': (p) => openWindow(p),
  'close:': (p) => closeWindow(p),
  'minimize:': (p) => minimizeWindow(p),
  'bonzi:send': () => bonziSend(),
  'bonzi:toggle-tts': () => bonziToggleTTS(),
  'bonzi:toggle-panel': () => bonziTogglePanel(),
  'bonzi:call': () => callBonziFromMenu(),
  'bonzi:send-home': () => sendBonziHome(),
  'float-bonzi:send': () => floatBonziSend(),
  'steam:load': () => loadSteamData(),
  'mtg:load': () => loadMTGCard(),
  'projects:load': () => loadProjects(),
  'solitaire:undo': () => Solitaire.undo(),
  'solitaire:new-game': () => Solitaire.init(),
  'winamp:play': () => winampPlay(),
  'winamp:pause': () => winampPause(),
  'winamp:stop': () => winampStop(),
  'winamp:next': () => winampNext(),
  'winamp:prev': () => winampPrev(),
  'system:refresh': () => refreshDesktop(),
  'system:screensaver': () => startScreensaver(),
  'system:stop-screensaver': () => stopScreensaver(),
  'start:toggle': () => toggleStart(),
  'context:close': () => closeContextMenu(),
  'error:close': () => document.getElementById('error-popup')?.classList.remove('open'),
  'link:': (p) => window.open(p, '_blank'),
  'pt73:season:': (p) => pt73Season(parseInt(p)),
  'winamp:load': () => winampLoadTrack(0, false),
};

const dblclickActions: Record<string, ClickHandler> = {
  'window:': (p) => openWindow(p),
};

document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest('[data-click]') as HTMLElement | null;
  if (!el) return;
  const action = el.dataset.click;
  if (!action) return;
  for (const [prefix, handler] of Object.entries(clickActions)) {
    const isPrefix = prefix.endsWith(':');
    if (action === prefix) {
      handler('', e);
      return;
    }
    if (isPrefix && action.startsWith(prefix)) {
      handler(action.slice(prefix.length), e);
      return;
    }
  }
});

document.addEventListener('dblclick', (e) => {
  const el = (e.target as Element).closest('[data-dblclick]') as HTMLElement | null;
  if (!el) return;
  const action = el.dataset.dblclick;
  if (!action) return;
  for (const [prefix, handler] of Object.entries(dblclickActions)) {
    const isPrefix = prefix.endsWith(':');
    if (action === prefix) {
      handler('', e);
      return;
    }
    if (isPrefix && action.startsWith(prefix)) {
      handler(action.slice(prefix.length), e);
      return;
    }
  }
});

const keydownActions: Record<string, (el: HTMLElement, e: KeyboardEvent) => void> = {
  'bonzi:send': (el, e) => { if (e.key === 'Enter') { bonziSend(); e.preventDefault(); } },
  'float-bonzi:send': (el, e) => { if (e.key === 'Enter') { floatBonziSend(); e.preventDefault(); } },
};

document.addEventListener('keydown', (e) => {
  const el = (e.target as Element).closest('[data-keydown]') as HTMLElement | null;
  if (!el) return;
  const action = el.dataset.keydown;
  if (!action) return;
  const handler = keydownActions[action];
  if (handler) handler(el, e);
});

document.addEventListener('error', (e) => {
  const img = e.target as HTMLImageElement;
  if (img.tagName !== 'IMG') return;
  const fallback = img.dataset.error;
  if (fallback) {
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const fb = parent.querySelector('.bonzi-char-fallback') as HTMLElement | null;
      if (fb) fb.style.display = 'block';
    }
  }
}, true);

initWindows();
winampInit();
Solitaire.init();
