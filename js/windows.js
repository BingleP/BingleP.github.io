  // ── Window management ──────────────────────────────────────────
  const windows = document.querySelectorAll('.window');
  const taskbarItems = document.getElementById('taskbar-items');

  windows.forEach(win => {
    const titlebar = win.querySelector('.titlebar');
    let isDragging = false;
    let offset = { x: 0, y: 0 };

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
