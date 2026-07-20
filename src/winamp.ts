import type { WinampTrack } from './types';

const winampTracks: WinampTrack[] = [
  { title: 'Love and Rockets — No New Tale to Tell',        id: 'Bo3R3LBjDek' },
  { title: 'Nathaniel Rateliff & The Night Sweats — S.O.B.', id: '1iAYhQsQhSY' },
  { title: 'Sublime — What I Got',                          id: '0Uc3ZrmhDN4' },
  { title: 'Talking Heads — This Must Be the Place',        id: 'Fb2q141rMNE' },
  { title: 'Alabama Shakes — Hold On',                      id: 'Le-3MIBxQTw' },
  { title: 'Blind Melon — No Rain',                         id: '3qVPNONdF58' },
  { title: 'TOOL — The Pot',                                id: 'civuoU_NE38' },
  { title: 'XTC — Making Plans For Nigel',                  id: 'AiIlcew-GVM' },
  { title: 'Siouxsie And The Banshees — Spellbound',        id: 'TjvvK-Rj0WI' },
  { title: 'CAKE — Comfort Eagle',                          id: 'ezoOnI95BpE' },
  { title: 'Fugazi — Waiting Room',                         id: 'SGJFWirQ3ks' },
  { title: 'They Might Be Giants — Birdhouse in Your Soul', id: 'LdgRYMdPSZQ' },
  { title: 'Ween — Ocean Man',                              id: 'vcaPiiFZu2o' },
  { title: 'Violent Femmes — Blister In The Sun',           id: '2aljlKYesT4' },
  { title: 'The Specials — Ghost Town',                     id: 'RZ2oXzrnti4' },
  { title: 'The Smiths — There Is a Light That Never Goes Out', id: 'INgXzChwipY' },
  { title: 'Operation Ivy — Sound System',                  id: '-vDTtIIxE2E' },
  { title: 'Modest Mouse — Float On',                       id: 'CTAud5O7Qqk' },
  { title: 'The Stranglers — Golden Brown',                 id: 'uyEDUnGNHQ8' },
  { title: 'A Tribe Called Quest — Can I Kick It?',         id: 'D-uV8TGjaGU' },
  { title: 'Jack White — Lazaretto',                        id: 'qI-95cTMeLM' },
];

let waCurrent = -1;
let waPlaying = false;

export function winampInit() {
  const list = document.getElementById('wa-playlist');
  if (!list) return;
  winampTracks.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'wa-track';
    div.textContent = `${String(i + 1).padStart(2, '0')}. ${t.title}`;
    div.addEventListener('click', () => winampLoadTrack(i, true));
    list.appendChild(div);
  });
}

export function winampLoadTrack(i: number, autoplay: boolean) {
  waCurrent = i;
  waPlaying = autoplay;
  const t = winampTracks[i];
  const display = document.getElementById('wa-track-display');
  if (display) display.textContent = `♫ ${t.title} ♫`;
  const iframe = document.getElementById('winamp-iframe') as HTMLIFrameElement;
  if (iframe) iframe.src = `https://www.youtube.com/embed/${t.id}?enablejsapi=1${autoplay ? '&autoplay=1' : ''}`;
  document.querySelectorAll('.wa-track').forEach((el, idx) => {
    el.classList.toggle('playing', idx === i);
  });
}

export function winampPlay() {
  if (waCurrent < 0) { winampLoadTrack(0, true); return; }
  const iframe = document.getElementById('winamp-iframe') as HTMLIFrameElement;
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
  }
  waPlaying = true;
}

export function winampPause() {
  const iframe = document.getElementById('winamp-iframe') as HTMLIFrameElement;
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }
  waPlaying = false;
}

export function winampStop() {
  const iframe = document.getElementById('winamp-iframe') as HTMLIFrameElement;
  if (iframe) iframe.src = '';
  const display = document.getElementById('wa-track-display');
  if (display) display.textContent = '♫ stopped ♫';
  document.querySelectorAll('.wa-track').forEach(el => el.classList.remove('playing'));
  waPlaying = false;
  waCurrent = -1;
}

export function winampNext() {
  winampLoadTrack((waCurrent + 1) % winampTracks.length, waPlaying || waCurrent >= 0);
}

export function winampPrev() {
  winampLoadTrack((waCurrent - 1 + winampTracks.length) % winampTracks.length, waPlaying || waCurrent >= 0);
}
