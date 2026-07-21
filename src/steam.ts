import { BONZI_WORKER_URL } from './config';
import type { SteamPlayer } from './types';

let cachedData: SteamPlayer | null = null;

export async function loadSteamData() {
  const nameEl = document.getElementById('steam-name');
  const lvlEl = document.getElementById('steam-level');
  const yearsEl = document.getElementById('steam-years');
  const gamesEl = document.getElementById('steam-games');
  const statusEl = document.getElementById('steam-status');
  const recentEl = document.getElementById('steam-recent');

  if (cachedData && nameEl) {
    renderSteam(cachedData);
    return;
  }

  try {
    const res = await fetch(BONZI_WORKER_URL + 'steam');
    if (!res.ok) { showError(); return; }
    const d: SteamPlayer = await res.json();
    if ((d as any).error) { showError(); return; }
    cachedData = d;
    renderSteam(d);
  } catch { showError(); }

  function showError() {
    if (nameEl) nameEl.textContent = "COULDN'T LOAD";
    if (statusEl) { statusEl.textContent = '○ Profile unavailable'; statusEl.style.color = '#888'; }
    if (recentEl) recentEl.innerHTML = '<div style="opacity:0.5;">Worker may be down. Try again later.</div>';
  }

  function renderSteam(d: SteamPlayer) {
    if (nameEl) nameEl.textContent = d.name.toUpperCase();
    if (lvlEl) lvlEl.textContent = String(d.level);
    if (gamesEl) gamesEl.textContent = d.gameCount.toLocaleString();
    if (yearsEl && d.timecreated) {
      const yrs = Math.floor((Date.now() / 1000 - d.timecreated) / (365.25 * 24 * 3600));
      yearsEl.textContent = `${yrs} year${yrs !== 1 ? 's' : ''}`;
    }
    if (statusEl) {
      statusEl.textContent = d.online ? `● ${d.status}` : `○ ${d.status}`;
      statusEl.style.color = d.online ? '#7ac47a' : '#888888';
    }
    if (recentEl) {
      recentEl.innerHTML = d.recentGames.length
        ? d.recentGames.map(g => `<div>${g.name} <span style="opacity:0.6;">— ${g.hours} hrs</span></div>`).join('')
        : '<div style="opacity:0.5;">No recent activity</div>';
    }
  }
}
