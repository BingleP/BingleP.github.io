# kerrick.ca

Personal homepage styled after Windows 98. Lives at [kerrick.ca](https://kerrick.ca).

---

## What's on it

The desktop has draggable, minimizable windows, a taskbar with a live clock, a Start menu, and a right-click context menu. On first load there's a boot screen (click to proceed). After a minute of inactivity a bouncing screensaver kicks in. The startup sound is generated with the Web Audio API — no audio file.

### Windows

| Icon | What it is |
|------|------------|
| `User.exe` | Profile card with avatar and status |
| `Welcome.txt` | Notepad-style about page |
| `Train.png` | Image viewer — VIA Rail 154 Turbotrain |
| `Steam.exe` | Live Steam profile stats (see below) |
| `Solitaire.exe` | Playable Klondike solitaire (see below) |
| `PT-73.lnk` | McHale's Navy episode browser (see below) |
| `Projects.exe` | GitHub repo list, pulled live from the API |
| `Winamp.exe` | Music player backed by YouTube (see below) |
| `MTG.exe` | Random Magic: The Gathering card via Scryfall |
| `ISS.lnk` | Embedded NASA ISS live stream |
| `About This PC` | Fake system specs |

---

## How the interesting bits work

### BonziBUDDY

The gorilla in the bottom-right is backed by a Cloudflare Worker that proxies requests to an AI model. It keeps the last 20 messages of conversation history so it remembers what you were talking about within a session. Responses are read aloud using the browser's `SpeechSynthesis` API (rate 1.1, pitch 0.7 — sounds vaguely correct). TTS can be toggled with the speaker button.

Via the right-click context menu you can "call" BonziBUDDY onto the desktop as a draggable floating widget with a speech bubble. Sending him home moves him back to the panel.

### PT-73

All 138 episodes of McHale's Navy across 4 seasons. The episode data is hardcoded in `js/pt73.js` — title, season, episode number, and YouTube video ID for each one. Clicking an episode loads it into an embedded YouTube player in the same window. The season tabs on the left filter the list.

### Solitaire

Fully playable Klondike solitaire. Ported from [BingleP/Solitaire](https://github.com/BingleP/Solitaire) (originally Python) into vanilla JS. Has undo, score tracking, and win detection. Card rendering is pure HTML/CSS — no images.

### Steam.exe

Fetches live profile data (display name, level, game count, online status, recent games) from the same Cloudflare Worker used for BonziBUDDY, which proxies the Steam API to keep the key off the client.

### Winamp.exe

A Winamp-skinned window with a scrolling track display, playlist, and ▶ ⏸ ⏹ ⏮ ⏭ controls. The audio comes from a YouTube iframe. Play/pause/stop work by sending `postMessage` commands to the iframe using YouTube's `enablejsapi=1` interface — no YouTube IFrame API script required. Track list is hardcoded in `js/winamp.js` and easy to swap out.

### Projects.exe

Calls `https://api.github.com/users/BingleP/repos` on open and renders the results as a scrollable list. Forks and the site repo itself are filtered out. Results are cached for the session so reopening the window doesn't re-fetch.

### MTG.exe

Calls `https://api.scryfall.com/cards/random` each time the window opens or you click "Draw Another". Displays the card image from Scryfall's CDN. Works for double-faced cards by falling back to `card_faces[0]`.

---

## Stack

Pure HTML, CSS, and vanilla JS. No frameworks, no build step, no dependencies.

The only backend is a single Cloudflare Worker (`worker/index.js`) that handles two things: proxying the Steam Web API (to keep the key server-side) and proxying BonziBUDDY AI requests.

```
index.html
style.css
js/
  windows.js    — window management, drag, taskbar
  system.js     — boot, screensaver, clock, startup sound
  steam.js      — Steam API fetch
  bonzi.js      — BonziBUDDY chat, floating mode, TTS
  winamp.js     — Winamp player
  projects.js   — GitHub repos
  mtg.js        — Scryfall random card
  solitaire.js  — Klondike solitaire game
  pt73.js       — McHale's Navy episode data + player
worker/
  index.js      — Cloudflare Worker (Steam + BonziBUDDY proxy)
```
