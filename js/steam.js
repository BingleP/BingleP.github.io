  // ── BonziBUDDY ────────────────────────────────────────────────
  const BONZI_WORKER_URL = 'https://bonzi-proxy.bonzibuddy.workers.dev/';

  async function loadSteamData() {
    try {
      const res = await fetch(BONZI_WORKER_URL + 'steam');
      if (!res.ok) return;
      const d = await res.json();
      if (d.error) return;

      const name   = document.getElementById('steam-name');
      const lvl    = document.getElementById('steam-level');
      const years  = document.getElementById('steam-years');
      const games  = document.getElementById('steam-games');
      const status = document.getElementById('steam-status');
      const recent = document.getElementById('steam-recent');

      if (name)   name.textContent = d.name.toUpperCase();
      if (lvl)    lvl.textContent  = d.level;
      if (games)  games.textContent = d.gameCount.toLocaleString();
      if (years && d.timecreated) {
        const yrs = Math.floor((Date.now() / 1000 - d.timecreated) / (365.25 * 24 * 3600));
        years.textContent = `${yrs} year${yrs !== 1 ? 's' : ''}`;
      }
      if (status) {
        status.textContent = d.online ? `● ${d.status}` : `○ ${d.status}`;
        status.style.color = d.online ? '#7ac47a' : '#888888';
      }
      if (recent) {
        recent.innerHTML = d.recentGames.length
          ? d.recentGames.map(g => `<div>${g.name} <span style="opacity:0.6;">— ${g.hours} hrs</span></div>`).join('')
          : '<div style="opacity:0.5;">No recent activity</div>';
      }
    } catch {}
  }

  loadSteamData();
