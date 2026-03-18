  // ── Window management ──────────────────────────────────────────
  const windows = document.querySelectorAll('.window');
  const taskbarItems = document.getElementById('taskbar-items');


  windows.forEach(win => {
    const titlebar = win.querySelector('.titlebar');
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    // ── Resize handle ──────────────────────────────────────────────
    if (window.innerWidth > 700) {
      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      win.appendChild(handle);

      let isResizing = false, rsX, rsY, rsW, rsH;
      handle.addEventListener('mousedown', (e) => {
        isResizing = true;
        rsX = e.clientX; rsY = e.clientY;
        rsW = win.offsetWidth; rsH = win.offsetHeight;
        e.preventDefault(); e.stopPropagation();
      });
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        win.style.width  = Math.max(200, rsW + e.clientX - rsX) + 'px';
        win.style.height = Math.max(80,  rsH + e.clientY - rsY) + 'px';
      });
      document.addEventListener('mouseup', () => isResizing = false);
    }

    // Mouse drag
    titlebar.addEventListener('mousedown', (e) => {
      if (window.innerWidth <= 700) return;
      isDragging = true;
      offset.x = e.clientX - win.offsetLeft;
      offset.y = e.clientY - win.offsetTop;
      focusWindow(win.id);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      win.style.left = (e.clientX - offset.x) + 'px';
      win.style.top  = (e.clientY - offset.y) + 'px';
    });

    document.addEventListener('mouseup', () => isDragging = false);

    // Touch drag
    titlebar.addEventListener('touchstart', (e) => {
      if (window.innerWidth <= 700) return;
      const t = e.touches[0];
      isDragging = true;
      offset.x = t.clientX - win.offsetLeft;
      offset.y = t.clientY - win.offsetTop;
      focusWindow(win.id);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const t = e.touches[0];
      win.style.left = (t.clientX - offset.x) + 'px';
      win.style.top  = (t.clientY - offset.y) + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => isDragging = false);

    win.addEventListener('mousedown', () => focusWindow(win.id));
    win.addEventListener('touchstart', () => focusWindow(win.id), { passive: true });
  });

  function focusWindow(id) {
    windows.forEach(w => { w.classList.remove('active'); w.classList.add('inactive'); });
    const win = document.getElementById(id);
    win.classList.add('active');
    win.classList.remove('inactive');
    updateTaskbar();
  }

  function minimizeWindow(id) {
    document.getElementById(id).classList.add('minimized');
    updateTaskbar();
  }

  function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
    updateTaskbar();
  }

  function openWindow(id) {
    const win = document.getElementById(id);
    win.style.display = 'flex';
    win.classList.remove('minimized');
    focusWindow(id);
    if (id === 'win-steam')    loadSteamData();
    if (id === 'win-projects') loadProjects();
    if (id === 'win-mtg')      loadMTGCard();
  }

  function updateTaskbar() {
    taskbarItems.innerHTML = '';
    windows.forEach(win => {
      if (win.style.display !== 'none') {
        const title = win.querySelector('.titlebar-text').innerText;
        const btn = document.createElement('div');
        btn.className = `task-item ${win.classList.contains('active') && !win.classList.contains('minimized') ? 'active' : ''}`;

        let icon = '📁';
        if (win.id === 'win-steam')    icon = '🎮';
        if (win.id === 'win-train')    icon = '🚂';
        if (win.id === 'win-profile')  icon = '👤';
        if (win.id === 'win-about')    icon = '🖥️';
        if (win.id === 'win-iss')      icon = '🛰️';
        if (win.id === 'win-projects') icon = '📁';
        if (win.id === 'win-winamp')   icon = '🎵';
        if (win.id === 'win-mtg')      icon = '🧙';

        btn.innerHTML = `<span>${icon}</span> ${title.split(' ')[0]}`;
        btn.onclick = () => {
          if (win.classList.contains('minimized') || !win.classList.contains('active')) {
            openWindow(win.id);
          } else {
            minimizeWindow(win.id);
          }
        };
        taskbarItems.appendChild(btn);
      }
    });
  }

  // ── Start menu ─────────────────────────────────────────────────
  function toggleStart() {
    document.getElementById('start-menu').classList.toggle('open');
  }

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    if (!menu.contains(e.target) && !e.target.closest('.start-btn')) {
      menu.classList.remove('open');
    }
    closeContextMenu();
  });

  // ── Right-click context menu ───────────────────────────────────
  const ctxMenu = document.getElementById('context-menu');
  let ctxClickX = 0, ctxClickY = 0;

  document.getElementById('desktop').addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window') || e.target.closest('.desktop-icons')) return;
    e.preventDefault();
    ctxClickX = e.clientX;
    ctxClickY = e.clientY;
    ctxMenu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
    ctxMenu.style.top  = Math.min(e.clientY, window.innerHeight - 150) + 'px';
    ctxMenu.classList.add('open');
  });

  function closeContextMenu() { ctxMenu.classList.remove('open'); }

  function refreshDesktop() {
    windows.forEach(w => {
      w.classList.remove('active', 'inactive', 'minimized');
    });
    updateTaskbar();
  }

  // ── PT-73: maintain 4:3 aspect ratio when window width changes ──
  const pt73Win = document.getElementById('win-pt73');
  if (pt73Win && window.innerWidth > 700) {
    let lastPt73W = 0;
    new ResizeObserver(() => {
      const w = pt73Win.offsetWidth;
      if (w === lastPt73W) return;
      lastPt73W = w;
      const titlebar   = pt73Win.querySelector('.titlebar');
      const sidebar    = pt73Win.querySelector('.pt73-sidebar');
      const player     = pt73Win.querySelector('.pt73-player');
      const nowplaying = pt73Win.querySelector('.pt73-nowplaying');
      const cs         = getComputedStyle(player);
      const padV       = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const gap        = parseFloat(cs.gap) || 8;
      const videoW     = w - sidebar.offsetWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const videoH     = videoW * (3 / 4);
      pt73Win.style.height = Math.round(titlebar.offsetHeight + padV + gap + videoH + nowplaying.offsetHeight + 4) + 'px';
    }).observe(pt73Win);
  }

  // ── Solitaire scaling ───────────────────────────────────────────
  if (window.innerWidth > 700) {
    const solWin  = document.getElementById('win-solitaire');
    const solBody = document.getElementById('sol-game-body');
    if (solWin && solBody) {
      let baseW = 0;
      new ResizeObserver(() => {
        if (!baseW) baseW = solWin.clientWidth;
        solBody.style.zoom = solWin.clientWidth / baseW;
      }).observe(solWin);
    }
  }
