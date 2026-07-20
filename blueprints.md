# blueprints.md — adding things to kerrick.ca

Reference for adding new windows, features, and content without having to re-read the whole codebase each time.

---

## Architecture overview

The site uses **TypeScript + Vite + Bun**. All inline event handlers and inline styles have been removed for CSP compliance — everything is wired via `data-click`, `data-dblclick`, `data-keydown` attributes in the HTML, dispatched by `src/main.ts`.

No inline `<script>` blocks, no `onclick=""`, no `style=""` attributes. The only `<script>` in `index.html` is `<script type="module" src="/src/main.ts">`.

---

## Adding a new window

### 1. The window HTML — `index.html`

Drop the window `<div>` anywhere inside `#desktop`. All windows follow this pattern:

```html
<div id="win-YOURNAME" class="window" data-win-width="400" data-win-top="80" data-win-left="200" data-win-hidden="1">
  <div class="titlebar">
    <div class="titlebar-left"><span>🔥</span><span class="titlebar-text">YourWindow</span></div>
    <div class="titlebar-right">
      <div class="win-btn" data-click="minimize:win-YOURNAME">_</div>
      <div class="win-btn" data-click="close:win-YOURNAME">✕</div>
    </div>
  </div>
  <div class="window-body">
    <!-- content here -->
  </div>
</div>
```

**ID convention:** always `win-` prefix. The `data-win-width/top/left` attributes are read by `windows.ts` `initWindowGeometry()` and applied via JS (CSSOM) to avoid inline styles. `data-win-hidden="1"` makes it start hidden; omit it for visible-by-default windows.

**Omit the minimize button** if the window shouldn't be minimizable (e.g. `win-about`).

#### Window theme colors (titlebar gradient)

Add one of these classes alongside `window`:

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
| Content that needs to flush to the edges | `<div class="window-body window-body-flush">` |
| Window body with a sidebar + scrollable list | Use `flex:1; min-height:0; padding:0` — see the PT-73 pattern in `style.css` |

---

### 2. Desktop icon — `index.html`

Icons sit in one of two `<div class="desktop-icons">` containers inside `#desktop`.

- **Left column** — main apps
- **Right column** — `class="desktop-icons desktop-icons-right"` — games/links/extras

```html
<div class="icon-item" data-dblclick="window:win-YOURNAME">
  <div class="icon-img">🔥</div>
  <span class="icon-text">YourName.exe</span>
</div>
```

For single-click external links:
```html
<div class="icon-item" data-click="link:https://example.com">
  <div class="icon-img">🔗</div>
  <span class="icon-text">Link.lnk</span>
</div>
```

**File extension conventions:**
- `.exe` — interactive app or tool
- `.lnk` — external link or embedded stream
- `.txt` — plain text / notes style
- `.png` — image viewer

---

### 3. Start menu entry — `index.html`

Find `<div id="start-menu">` near the bottom of `index.html`. Three sections separated by dividers:

1. **Windows** (apps that open a window)
2. **GitHub links** (external links)
3. **System** (About This PC, GitHub profile)

Add a window entry:
```html
<div class="start-menu-item" data-click="window:win-YOURNAME">
  <span class="item-icon">🔥</span>
  <div class="start-menu-label">YourName.exe<small>one line description</small></div>
</div>
```

---

### 4. Taskbar icon — `src/windows.ts`

Find the `TASK_ICONS` record and add your window's icon:

```ts
if (win.id === 'win-YOURNAME') icon = '🔥';
```

The taskbar label uses the first word of the titlebar text.

---

### 5. Load hook (if needed) — `src/main.ts`

Add an entry in the `clickActions` dispatch map:

```ts
'yourname:load': () => loadYourData(),
```

Or if the window loads data when opened, add it in `openWindow()` in `src/windows.ts`:

```ts
if (id === 'win-YOURNAME') loadYourData();
```

---

## Adding a new JS/TS module

Create `src/modules/yourfeature.ts` and:
1. Export any functions you need
2. Import it in `src/main.ts`
3. Add any `data-click` entries for it in the dispatch map in `main.ts`
4. No script tags needed — Vite handles bundling

---

## API-backed windows

The Cloudflare Worker at `worker/index.js` handles two things: Steam API proxy and BonziBUDDY AI proxy. For new server-side API keys or CORS bypass, add routes there.

Windows that go direct to public APIs (no key needed):
- **Projects.exe** → `api.github.com/users/BingleP/repos`
- **MTG.exe** → `api.scryfall.com/cards/random`

Session-caching pattern (so reopening the window doesn't re-fetch):
```ts
const body = document.getElementById('your-content');
if (!body) return;
if (body.dataset.loaded) return;
body.dataset.loaded = '1';
// fetch and render...
```

---

## The event dispatch system

`src/main.ts` contains three dispatch tables:

- `clickActions` — for `data-click` attributes. Keys are exact matches or namespace prefixes ending with `:`.
- `dblclickActions` — for `data-dblclick` attributes.
- `keydownActions` — for `data-keydown` attributes (usually "Enter" key check).

Example: `data-click="window:win-steam"` matches the prefix `window:` and calls `openWindow("win-steam")`.

To add a new action, just add an entry in the relevant table.

---

## Known gotchas

**CSS caching**
Vite hashes asset filenames (`index-HASH.css`, `index-HASH.js`), so cache-busting is automatic. The nginx config sets 1h expiry for CSS/JS and `-1` (no-cache) for `index.html`.

**Window resize**
All windows get a 20×20px resize handle injected by `windows.ts` on desktop. The PT-73 window uses a `ResizeObserver` to maintain 4:3 aspect ratio for the video player. Solitaire uses a `ResizeObserver` for CSS zoom scaling.

**Mobile**
Below 700px the desktop collapses to a stacked layout. Windows switch to `position:relative`. Drag and resize are disabled. The mobile media queries are at the bottom of `style.css`.

**`display:none` windows and APIs**
`ResizeObserver` and layout measurements don't work on `display:none` elements. The geometry is set before the first paint via `initWindowGeometry()` to avoid this issue. `data-win-hidden` windows start with `display: none` (set by JS in the module's initialization).

**Self-hosted fonts**
VT323 and Nunito are bundled via Vite in `src/assets/fonts/`. The `@font-face` rules in `style.css` reference them. If you add a new Google Font, download the Latin woff2 and add a `@font-face` declaration — don't add a `<link>` tag.

**CSP**
The nginx CSP is strict (`script-src 'self'`, `style-src 'self'`, no `'unsafe-inline'`). That's why there are no inline event handlers or style attributes. All styling goes through CSS classes or JS CSSOM. All event handlers go through the `data-click` dispatch system.
