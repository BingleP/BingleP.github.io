const mq = window.matchMedia('(max-width: 700px), (max-height: 500px)');

export function isMobileLayout(): boolean {
  return mq.matches;
}

export function onLayoutChange(cb: (mobile: boolean) => void): void {
  mq.addEventListener('change', (e) => cb(e.matches));
}
