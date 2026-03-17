# kerrick.ca — personal site

A retro Windows 98-style personal homepage for [kerrick.ca](https://kerrick.ca).

## Features

### Desktop & OS Chrome
- Draggable, minimizable, focusable windows with retro 3D borders
- Desktop icons (double-click to open)
- Taskbar with Start menu and live clock
- Right-click context menu on the desktop
- Boot screen animation on first load
- Bouncing screensaver (activates after 1 minute of inactivity)
- Startup sound via Web Audio API

### Windows
- **User.exe** — profile card with avatar and online status
- **Welcome.txt** — Notepad-style about page
- **Train.png** — image viewer (VIA Rail Turbotrain)
- **Steam.lnk** — live Steam profile stats for binglepuss (games, achievements, recent activity)
- **PT-73** — McHale's Navy episode browser: all 138 episodes across 4 seasons with embedded YouTube player
- **Solitaire** — fully playable Klondike solitaire (ported from [BingleP/Solitaire](https://github.com/BingleP/Solitaire))
- **About This PC** — fake system specs (Windows 98 SE, Pentium III, etc.)

### BonziBUDDY
- Pinned chat panel (bottom-right) backed by a Cloudflare Worker AI endpoint
- Floating draggable BonziBUDDY via right-click context menu
- Chat history (last 20 messages), speech bubbles, and text-to-speech

### Start Menu
- Links to GitHub projects: BinglesHTTPServer, Solitaire, LiberalBot, jellyfin-invidious-channel
- About This PC shortcut
- GitHub profile link

## Stack

Pure HTML, CSS, and vanilla JS — no frameworks, no build steps. Backend is a single Cloudflare Worker for BonziBUDDY AI responses.
