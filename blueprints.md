# blueprints.md — adding things to kerrick.ca

Reference for adding new windows, icons, and other content without having to re-read the whole codebase each time.

---

## Adding a new window

There are five places to touch for every new window.

### 1. The window HTML — `index.html`

Drop the window `<div>` anywhere in `#desktop`, before the `<div id="start-menu">` block. All existing windows are grouped together there.

```html
<div id="win-YOURNAME" class="window" style="width:400px; top:80px; left:200px; display:none;">
  <div class="titlebar">
    <div class="titlebar-left"><span>🔥</span><span class="titlebar-text">YourWindow</span></div>
    <div class="titlebar-right">
      <div class="win-btn" onclick="minimizeWindow('win-YOURNAME')">_</div>
      <div class="win-btn" onclick="closeWindow('win-YOURNAME')">✕</div>
    </div>
  </div>
  <div class="window-body">
    <!-- content here -->
  </div>
</div>
```

**ID convention:** always `win-` prefix. This is how `openWindow`, `closeWindow`, etc. find the element.

**Omit the minimize button** if the window shouldn't be minimizable (e.g. `win-about`).

#### Window theme colors (titlebar gradient)

Add one of these classes alongside `window` to get a coloured titlebar:

| Class | Colour |
|-------|--------|
| *(none)* | Default dark grey |
| `pink` | Deep red/maroon |
| `lavender` | Dark purple |
| `mint` | Dark green |
| `steam` | Steam navy |
| `navy` | Dark navy blue |
| `cards` | Dark green (solitaire felt) |

#### Window body variants

| Situation | What to use |
|-----------|-------------|
| Normal content with padding | `<div class="window-body">` |
| Content that needs to flush to the edges (no padding) | `<div class="window-body window-body-flush">` |
| Fixed-height body that must not grow (e.g. sidebar + scroll area) | Add `flex:none` via a specific CSS rule AND set explicit `height` on the window — see the PT-73 pattern below |

#### The PT-73 fixed-height pattern

When the window contains a scrollable sidebar or any layout where you need an exact height:

1. Set explicit height on the window: `style="width:600px; height:360px; ..."`
2. In CSS, target the body with a double-class selector (so it beats `.window-body { flex:1 }`):
   ```css
   .window-body.your-body-class { flex: none; height: 300px; }
   ```
3. Make sure any scrollable child has `flex:1; min-height:0; overflow-y:auto` and its parent column container has `min-height:0; overflow:hidden`.

#### If the window has a coloured background that should fill extra height

Apply the background colour to both the game/content element AND the `.window-body` itself:
```css
#win-YOURNAME .window-body { background: #your-colour; }
```
This covers any gap that appears when the window is resized taller.

---

### 2. Desktop icon — `index.html`

Icons sit in one of two `<div class="desktop-icons">` containers at the top of `#desktop`.

- **Left column** — main apps (User.exe, Welcome.txt, Projects.exe, Steam.exe, Train.png)
- **Right column** — has `class="desktop-icons desktop-icons-right"` — games/links/extras

```html
<div class="icon-item" ondblclick="openWindow('win-YOURNAME')">
  <div class="icon-img">🔥</div>
  <span class="icon-text">YourName.exe</span>
</div>
```

**File extension conventions used on the site:**
- `.exe` — interactive app or tool
- `.lnk` — external link or embedded stream
- `.txt` — plain text / notes style
- `.png` — image viewer

---

### 3. Start menu entry — `index.html`

Find `<div id="start-menu">` near the bottom of `index.html`. There are three sections separated by `<div class="start-menu-divider">`:

1. **Windows** (apps that open a window)
2. **GitHub links** (external links to repos)
3. **System** (About This PC, GitHub profile)

Add a window entry in section 1:
```html
<div class="start-menu-item" onclick="openWindow('win-YOURNAME'); toggleStart()">
  <span class="item-icon">🔥</span>
  <div class="start-menu-label">YourName.exe<small>one line description</small></div>
</div>
```

Add an external link in section 2:
```html
<a class="start-menu-item" href="https://..." target="_blank" onclick="toggleStart()">
  <span class="item-icon">🔗</span>
  <div class="start-menu-label">Link Name<small>what it is</small></div>
</a>
```

---

### 4. Taskbar icon — `js/windows.js`

Find the `updateTaskbar()` function. Add an emoji mapping for your window ID:

```js
if (win.id === 'win-YOURNAME') icon = '🔥';
```

The taskbar label uses the first word of the titlebar text, so name accordingly.

---

### 5. Load hook (if needed) — `js/windows.js`

If your window fetches data when opened, add a call in `openWindow()`:

```js
if (id === 'win-YOURNAME') loadYourData();
```

Then put `loadYourData()` in its own JS file (see below).

---

## Adding a new JS file

Create `js/yourfeature.js` and add a script tag at the bottom of `index.html`, **before** `</body>`, alongside the other script tags. Include a cache-buster version that you increment whenever you make changes:

```html
<script src="js/yourfeature.js?v=1"></script>
```

**Current version in use:** all scripts are at `?v=3`, CSS at `?v=3`.

Increment the version number any time you change the file — GitHub Pages (Fastly CDN) caches aggressively and will serve stale files otherwise. This has caused bugs before.

---

## API-backed windows

The Cloudflare Worker at `worker/index.js` handles two things: Steam API proxy and BonziBUDDY AI proxy. If a new window needs a server-side API key or CORS bypass, add a new route there rather than hitting APIs directly from the client.

Windows that go direct to public APIs (no key needed):
- **Projects.exe** → `api.github.com/users/BingleP/repos`
- **MTG.exe** → `api.scryfall.com/cards/random`

Pattern for caching an API response for the session so reopening the window doesn't re-fetch:
```js
async function loadYourData() {
  const body = document.getElementById('your-content');
  if (body.dataset.loaded) return;   // already fetched this session
  body.dataset.loaded = '1';
  // fetch and render...
}
```

---

## Known gotchas

**Flex height and scrolling**
The `.window-body` rule sets `flex:1` which overrides any `height` you set on the body element — `flex-basis` beats `height` in the flex algorithm. To fix:
- Give the **window** an explicit height, or
- Use `.window-body.your-class { flex:none; }` (double-class selector to beat specificity)
- Any scrollable column inside a flex container needs `min-height:0` on itself and its flex parent, or it will refuse to shrink and stretch the window instead

**CSS caching**
Bump `style.css?v=N` in the `<link>` tag whenever you change the stylesheet. Same for any JS files you change. GitHub Pages CDN will serve stale content indefinitely otherwise.

**Window resize**
All windows get a 20×20px resize handle (bottom-right corner) injected by `windows.js` on desktop. No action needed — it's automatic. If a window's content should scale with its width (like solitaire), use a `ResizeObserver` + CSS `zoom` in `windows.js`.

**Mobile**
Below 700px the desktop layout collapses to a stacked scrollable list. Windows switch to `position:relative`. Drag and resize are disabled. Any fixed pixel heights in window bodies may need a `@media (max-width:700px)` override in `style.css` — see existing PT-73 and solitaire overrides at the bottom of the file for examples.

**`display:none` windows and APIs**
`ResizeObserver` and layout measurements don't work on `display:none` elements. If you need to measure a window on open, do it inside `openWindow()` after `win.style.display = 'flex'`.
