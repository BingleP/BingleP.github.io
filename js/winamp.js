  // ── Winamp.exe ────────────────────────────────────────────────
  // Update track IDs here to change the playlist
  const winampTracks = [
    { title: 'Rick Astley — Never Gonna Give You Up', id: 'dQw4w9WgXcQ' },
    { title: 'Darude — Sandstorm',                   id: 'y6120QOlsfU' },
    { title: 'Smash Mouth — All Star',               id: 'L_jWHffIx5E' },
    { title: 'PSY — Gangnam Style',                  id: '9bZkp7q19f0' },
  ];
  let waCurrent = -1;
  let waPlaying = false;

  (function initWinamp() {
    const list = document.getElementById('wa-playlist');
    winampTracks.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'wa-track';
      div.textContent = `${String(i+1).padStart(2,'0')}. ${t.title}`;
      div.onclick = () => winampLoadTrack(i, true);
      list.appendChild(div);
    });
  })();

  function winampLoadTrack(i, autoplay) {
    waCurrent = i;
    waPlaying = autoplay;
    const t = winampTracks[i];
    document.getElementById('wa-track-display').textContent = `♫ ${t.title} ♫`;
    document.getElementById('winamp-iframe').src =
      `https://www.youtube.com/embed/${t.id}?enablejsapi=1${autoplay ? '&autoplay=1' : ''}`;
    document.querySelectorAll('.wa-track').forEach((el, idx) => {
      el.classList.toggle('playing', idx === i);
    });
  }

  function winampPlay()  {
    if (waCurrent < 0) { winampLoadTrack(0, true); return; }
    document.getElementById('winamp-iframe').contentWindow
      .postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    waPlaying = true;
  }
  function winampPause() {
    document.getElementById('winamp-iframe').contentWindow
      .postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    waPlaying = false;
  }
  function winampStop() {
    document.getElementById('winamp-iframe').src = '';
    document.getElementById('wa-track-display').textContent = '♫ stopped ♫';
    document.querySelectorAll('.wa-track').forEach(el => el.classList.remove('playing'));
    waPlaying = false; waCurrent = -1;
  }
  function winampNext() { winampLoadTrack((waCurrent + 1) % winampTracks.length, waPlaying || waCurrent >= 0); }
  function winampPrev() { winampLoadTrack((waCurrent - 1 + winampTracks.length) % winampTracks.length, waPlaying || waCurrent >= 0); }
