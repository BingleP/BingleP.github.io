  // ── MTG.exe ───────────────────────────────────────────────────
  async function loadMTGCard() {
    const wrap = document.getElementById('mtg-card-wrap');
    wrap.innerHTML = '<div style="padding:20px;color:var(--text-mid);">Drawing a card...</div>';
    try {
      const res = await fetch('https://api.scryfall.com/cards/random');
      const card = await res.json();
      const img = card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;
      if (!img) throw new Error('no image');
      wrap.innerHTML = `<img class="mtg-card-img" src="${img}" alt="${card.name}">
        <div style="font-family:'VT323';font-size:18px;color:var(--accent);">${card.name}</div>
        <div style="font-size:10px;color:var(--text-mid);margin-top:3px;">${card.set_name} · ${card.rarity}</div>`;
    } catch {
      wrap.innerHTML = '<div style="padding:16px;color:var(--text-mid);">Could not draw a card. Try again!</div>';
    }
  }
