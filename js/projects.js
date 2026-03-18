  // ── Projects.exe ──────────────────────────────────────────────
  async function loadProjects() {
    const body = document.getElementById('projects-body');
    if (body.dataset.loaded) return;
    try {
      const res = await fetch('https://api.github.com/users/BingleP/repos?sort=updated&per_page=20');
      const repos = await res.json();
      const filtered = repos.filter(r => !r.fork && r.name !== 'BingleP.github.io');
      if (!filtered.length) { body.innerHTML = '<div style="padding:16px;color:var(--text-mid);">No repositories found.</div>'; return; }
      body.innerHTML = filtered.map(r => `
        <a class="project-card" href="${r.html_url}" target="_blank">
          <div class="project-name">${r.name}</div>
          ${r.description ? `<div class="project-desc">${r.description}</div>` : ''}
          <div class="project-meta">
            ${r.language ? `<span class="project-lang">${r.language}</span>` : ''}
            ${r.stargazers_count > 0 ? `<span>⭐ ${r.stargazers_count}</span>` : ''}
            ${r.topics?.length ? r.topics.slice(0,3).map(t=>`<span style="opacity:0.6;">#${t}</span>`).join('') : ''}
          </div>
        </a>`).join('');
      body.dataset.loaded = '1';
    } catch {
      body.innerHTML = '<div style="padding:16px;color:var(--text-mid);">Could not load repositories.</div>';
    }
  }
