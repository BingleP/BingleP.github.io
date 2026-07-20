let activeDragWin: HTMLElement | null = null;
let isDragging = false;
let dragStartX = 0, dragStartY = 0, baseLeft = 0, baseTop = 0;

let isResizing = false;
let resizeWin: HTMLElement | null = null;
let rsX = 0, rsY = 0, rsW = 0, rsH = 0;

let ctxClickX = 0, ctxClickY = 0;

export function getContextClickPos() {
  return { x: ctxClickX, y: ctxClickY };
}

export function getWindows(): NodeListOf<HTMLElement> {
  return document.querySelectorAll<HTMLElement>('.window');
}

export function focusWindow(id: string) {
  const windows = getWindows();
  windows.forEach(w => { w.classList.remove('active'); w.classList.add('inactive'); });
  const win = document.getElementById(id);
  if (win) {
    win.classList.add('active');
    win.classList.remove('inactive');
  }
  updateTaskbar();
}

export function minimizeWindow(id: string) {
  const win = document.getElementById(id);
  if (win) win.classList.add('minimized');
  updateTaskbar();
}

export function closeWindow(id: string) {
  const win = document.getElementById(id);
  if (win) win.style.display = 'none';
  updateTaskbar();
}

export function openWindow(id: string) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'flex';
  win.classList.remove('minimized');
  focusWindow(id);
}

const TASK_ICONS: Record<string, string> = {
  'win-steam': '🎮',
  'win-train': '🚂',
  'win-profile': '👤',
  'win-about': '🖥️',
  'win-iss': '🛰️',
  'win-projects': '📁',
  'win-winamp': '🎵',
  'win-mtg': '🧙',
};

export function updateTaskbar() {
  const container = document.getElementById('taskbar-items');
  if (!container) return;
  container.innerHTML = '';
  getWindows().forEach(win => {
    if (win.style.display === 'none') return;
    const titleEl = win.querySelector('.titlebar-text');
    if (!titleEl) return;
    const title = titleEl.textContent || '';
    const btn = document.createElement('div');
    const isActive = win.classList.contains('active') && !win.classList.contains('minimized');
    btn.className = `task-item ${isActive ? 'active' : ''}`;
    const icon = TASK_ICONS[win.id] || '📁';
    btn.innerHTML = `<span>${icon}</span> ${title.split(' ')[0]}`;
    btn.addEventListener('click', () => {
      if (win.classList.contains('minimized') || !win.classList.contains('active')) {
        openWindow(win.id);
      } else {
        minimizeWindow(win.id);
      }
    });
    container.appendChild(btn);
  });
}

export function refreshDesktop() {
  getWindows().forEach(w => {
    w.classList.remove('active', 'inactive', 'minimized');
  });
  updateTaskbar();
}

export function toggleStart() {
  document.getElementById('start-menu')?.classList.toggle('open');
}

export function closeContextMenu() {
  document.getElementById('context-menu')?.classList.remove('open');
}

function initWindowDrag(win: HTMLElement) {
  const titlebar = win.querySelector<HTMLElement>('.titlebar');
  if (!titlebar) return;

  if (window.innerWidth > 700) {
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    win.appendChild(handle);

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizeWin = win;
      rsX = e.clientX; rsY = e.clientY;
      rsW = win.offsetWidth; rsH = win.offsetHeight;
      e.preventDefault(); e.stopPropagation();
    });
  }

  titlebar.addEventListener('mousedown', (e) => {
    if (window.innerWidth <= 700) return;
    isDragging = true;
    activeDragWin = win;
    baseLeft = win.offsetLeft;
    baseTop = win.offsetTop;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    focusWindow(win.id);
  });

  let tDragStartX = 0, tDragStartY = 0, tBaseLeft = 0, tBaseTop = 0;
  titlebar.addEventListener('touchstart', (e) => {
    if (window.innerWidth <= 700) return;
    const t = e.touches[0];
    isDragging = true;
    activeDragWin = win;
    tBaseLeft = win.offsetLeft;
    tBaseTop = win.offsetTop;
    tDragStartX = t.clientX;
    tDragStartY = t.clientY;
    focusWindow(win.id);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || !activeDragWin) return;
    const t = e.touches[0];
    const dx = t.clientX - tDragStartX;
    const dy = t.clientY - tDragStartY;
    activeDragWin.style.transform = `translate(${dx}px, ${dy}px)`;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!isDragging || !activeDragWin) return;
    isDragging = false;
    const c = (e as TouchEvent).changedTouches[0];
    const dx = c.clientX - tDragStartX;
    const dy = c.clientY - tDragStartY;
    activeDragWin.style.left = (tBaseLeft + dx) + 'px';
    activeDragWin.style.top = (tBaseTop + dy) + 'px';
    activeDragWin.style.transform = '';
    activeDragWin = null;
  });

  win.addEventListener('mousedown', () => focusWindow(win.id));
  win.addEventListener('touchstart', () => focusWindow(win.id), { passive: true });
}

document.addEventListener('mousemove', (e) => {
  if (isResizing && resizeWin) {
    resizeWin.style.width = Math.max(200, rsW + e.clientX - rsX) + 'px';
    resizeWin.style.height = Math.max(80, rsH + e.clientY - rsY) + 'px';
    return;
  }
  if (!isDragging || !activeDragWin) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  activeDragWin.style.transform = `translate(${dx}px, ${dy}px)`;
});

document.addEventListener('mouseup', (e) => {
  if (isResizing && resizeWin) {
    isResizing = false;
    resizeWin = null;
    return;
  }
  if (!isDragging || !activeDragWin) return;
  isDragging = false;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  activeDragWin.style.left = (baseLeft + dx) + 'px';
  activeDragWin.style.top = (baseTop + dy) + 'px';
  activeDragWin.style.transform = '';
  activeDragWin = null;
});

document.addEventListener('click', (e) => {
  const menu = document.getElementById('start-menu');
  if (menu && !menu.contains(e.target as Node) && !(e.target as Element).closest('.start-btn')) {
    menu.classList.remove('open');
  }
  closeContextMenu();
});

document.getElementById('desktop')?.addEventListener('contextmenu', (e) => {
  if ((e.target as Element).closest('.window') || (e.target as Element).closest('.desktop-icons')) return;
  e.preventDefault();
  ctxClickX = e.clientX;
  ctxClickY = e.clientY;
  const ctxMenu = document.getElementById('context-menu');
  if (!ctxMenu) return;
  ctxMenu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
  ctxMenu.style.top = Math.min(e.clientY, window.innerHeight - 150) + 'px';
  ctxMenu.classList.add('open');
});

const pt73Win = document.getElementById('win-pt73');
if (pt73Win && window.innerWidth > 700) {
  let lastW = 0;
  new ResizeObserver(() => {
    const w = pt73Win.offsetWidth;
    if (w === lastW) return;
    lastW = w;
    const t = pt73Win.querySelector<HTMLElement>('.titlebar');
    const sidebar = pt73Win.querySelector<HTMLElement>('.pt73-sidebar');
    const player = pt73Win.querySelector<HTMLElement>('.pt73-player');
    const nowplaying = pt73Win.querySelector<HTMLElement>('.pt73-nowplaying');
    if (!t || !sidebar || !player || !nowplaying) return;
    const cs = getComputedStyle(player);
    const padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const gap = parseFloat(cs.gap) || 8;
    const videoW = w - sidebar.offsetWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const videoH = videoW * (3 / 4);
    pt73Win.style.height = Math.round(t.offsetHeight + padV + gap + videoH + nowplaying.offsetHeight + 4) + 'px';
  }).observe(pt73Win);
}

if (window.innerWidth > 700) {
  const solWin = document.getElementById('win-solitaire');
  const solBody = document.getElementById('sol-game-body');
  if (solWin && solBody) {
    let baseW = 0;
    new ResizeObserver(() => {
      if (!baseW) baseW = solWin.clientWidth;
      solBody.style.zoom = String(solWin.clientWidth / baseW);
    }).observe(solWin);
  }
}

function initWindowGeometry(win: HTMLElement) {
  const w = win.dataset.winWidth;
  const h = win.dataset.winHeight;
  const top = win.dataset.winTop;
  const left = win.dataset.winLeft;
  const hidden = win.dataset.winHidden;
  if (w) win.style.width = w + 'px';
  if (h) win.style.height = h + 'px';
  if (top) win.style.top = top + 'px';
  if (left) win.style.left = left + 'px';
  if (hidden !== undefined) win.style.display = 'none';
}

export function initWindows() {
  getWindows().forEach(win => {
    initWindowGeometry(win);
    initWindowDrag(win);
  });
  updateTaskbar();
}
