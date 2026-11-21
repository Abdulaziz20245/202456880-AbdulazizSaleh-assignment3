# Technical Documentation — Assignment 3

## 1. Overview

A static single-page portfolio: `index.html`, one stylesheet (`css/styles.css`) and one script (`js/script.js`, loaded with `defer`). There is no backend and no build step. Assignment 3 keeps the Assignment 1 layout and the Assignment 2 interactions, and adds the features below.

## 2. Architecture of `js/script.js`

The script is split into commented blocks, each owning one feature:

| Block | Responsibility |
|---|---|
| Storage helpers | `storage.get / set / remove` wrap `localStorage` in `try/catch`, so private browsing or blocked storage never breaks the page. All keys live in one `KEYS` object. |
| Mobile navigation | Opens/closes the menu, syncs `aria-expanded`, closes on link click, Escape, or resize to desktop. |
| Theme | Saved choice → OS preference fallback. Sets `data-theme` on `<html>`. |
| Visitor name | Name form, greeting, "change name" button. |
| Projects | Filter → level → search → sort pipeline. |
| GitHub API | Profile + repos, caching, errors, language filter and sort. |
| Show/hide sections | Collapsible Experience, Education, Skills. |
| Scroll reveal | `IntersectionObserver` fade-in. |
| Contact form | Validation rules, submit gating, simulated send. |
| Visit timer | Time on page and visit counter. |

## 3. Features in detail

### 3.1 Projects: filter, level, search and sort

Each card carries its data in attributes:

```html
<article class="project-card" data-date="2026-06" data-level="advanced" data-tags="NLP, Machine Learning">
```

State is one object:

```js
projectView = { filter: "all", level: "all", sort: "newest", search: "" }
```

Every control calls `updateProjectView(changes)`, which merges the change, updates the controls (`syncProjectControls`) and re-renders (`renderProjects`). Rendering:

1. `cardMatches(card)` returns true only if the **topic**, the **level** and the **search text** all match.
2. Non-matching cards get `.is-hidden`.
3. All cards are re-appended in the order given by `SORTERS[sort]` (`localeCompare` on `YYYY-MM` dates or titles). Appending an existing node moves it, so no cards are recreated.
4. The level message (`LEVEL_MESSAGES`), result count, empty state and Reset button state are updated.
5. `projectView` is saved as JSON. On load, `loadProjectView()` only accepts saved values that still exist on the page (unknown filters, levels or sorts fall back to the default).

### 3.2 GitHub API

- Endpoints: `GET /users/Abdulaziz20245` and `GET /users/Abdulaziz20245/repos?sort=pushed&per_page=100`, requested together with `Promise.all`.
- `fetchJson(url)` adds an 8 s timeout using `AbortController` and converts status codes into named errors (`403/429 → rate-limit`, `404 → not-found`, other non-OK → `http`).
- `errorMessage(error)` maps each case (offline, timeout, rate limit, not found, other) to a plain-language message. `showRepoError` adds a **Try again** button that skips the cache.
- **Caching:** the combined result is stored in `sessionStorage` with a timestamp and reused for 10 minutes, because unauthenticated GitHub requests are limited to 60 per hour per IP.
- **Lazy loading:** an `IntersectionObserver` with a 300 px margin starts the request only when the section is about to appear, so the API is not called during the initial page load.
- Forks are removed. The language menu is built from the languages found in the data. Repos can be sorted by `pushed_at`, stars (ties broken by name) or name; the first 6 are shown.
- All API text goes through `escapeText()` (uses `textContent`) before it is inserted as HTML, which prevents HTML injection from repository names or descriptions.

### 3.3 Contact form

- `validators` holds one rule per field (`name`, `email`, `subject`, `message`); each returns an error string or `""`.
- `validateField(field, showError)` can check silently. `updateSubmitState()` checks all fields silently on every `input`/`change` and enables **Send** only when all pass; a hint explains why it is disabled.
- Errors are shown after a visitor leaves a field they typed in (`blur`) and update live once shown. Invalid fields get `aria-invalid="true"`.
- The message has `maxlength="500"` and a live counter that turns red above 90 %.
- Submit is a three-step `async` handler: validate again (in case the button was forced on with dev tools), show "Sending…" during a simulated 0.9 s request, then show a personalised confirmation and reset the form.

### 3.4 State management summary

| Key | Storage | Value |
|---|---|---|
| `portfolio-theme` | localStorage | `"light"` / `"dark"` |
| `portfolio-visitor-name` | localStorage | visitor's first name |
| `portfolio-project-view` | localStorage | JSON `{filter, level, sort, search}` |
| `portfolio-hidden-sections` | localStorage | JSON array of hidden section body ids |
| `portfolio-visit-count` | localStorage | number of visits |
| `portfolio-github-cache` | sessionStorage | `{savedAt, profile, repos}` |

The visitor name is validated with a Unicode-aware pattern (`/^[\p{L}][\p{L} '-]{0,29}$/u`) so Arabic and English names both work, and it is always written with `textContent`.

### 3.5 Show/hide sections

Each toggle button has `aria-controls` pointing to its section body and `aria-expanded` for screen readers. Hidden ids are kept in a `Set` and saved as an array.

### 3.6 Visit timer

A one-second `setInterval` counts seconds only while the tab is visible (`visibilitychange` stops and restarts it). `formatDuration` prints `45s`, `3m 07s` or `1h 12m`.

## 4. CSS

New styles are grouped under the "Assignment 3: Advanced Functionality" header: shared `.control-row` toolbar, greeting box, level message, GitHub profile, collapsible section headers, character counter, disabled button states and the footer timer. A `.visually-hidden` utility and a global `[hidden] { display: none !important; }` rule were added. Under 650 px the toolbars stack to full width. The existing `prefers-reduced-motion` block still disables animations.

## 5. Performance

| Change | Effect |
|---|---|
| Project images resized from 2816×1536 to 800×436, portrait from 2773×4160 to 600×900, JPEG quality ~80, progressive | 10.8 MB → about 0.25 MB of images |
| `width`/`height` attributes match the new files | No layout shift (CLS 0) |
| `loading="lazy"` on project images, `fetchpriority="high"` on the portrait | Above-the-fold image first |
| GitHub request deferred until near view, cached 10 min | Faster first load, fewer API calls |
| Script loaded with `defer`, duplicate CSS rule merged | No render blocking |

Lighthouse 12 (desktop preset, local server): Performance 65 → **100**, LCP 4.6 s → **1.8 s**, total weight 10,826 KiB → **317 KiB**, Accessibility 100, SEO 100. The remaining suggestions (minify, server caching headers, text compression) depend on the host; GitHub Pages already compresses text.

## 6. Accessibility

Visible labels on every control, `aria-pressed` on topic buttons, `aria-live` regions for the result count, level message, greeting, API status and form status, `aria-invalid` on invalid fields, `aria-expanded`/`aria-controls` on section toggles, a skip link, and focus outlines on all interactive elements.

## 7. Testing

Automated with Playwright (Chromium) against a local server, with GitHub responses mocked:

- Sorting (newest, name A–Z, oldest) gives the expected card order; level + topic combinations, including an empty result, behave correctly; the view is restored after reload; Reset returns to 4 projects and disables itself.
- Visitor name is saved, greeted after reload and copied into the contact form.
- Repos: forks hidden, language menu built from data, sort by stars and language filter work, HTML in descriptions is escaped.
- A `403` response shows the rate-limit message and **Try again** button.
- Hidden Skills section stays hidden after reload.
- Send is disabled until all fields are valid; a bad email shows its error; a valid submission shows "Sending…" and then the confirmation.
- Timer and visit counter update. No page errors. No horizontal scroll at 375 px.

## 8. Known limitations

- Project dates and levels are set by hand in `index.html`.
- The contact form does not send messages (no backend).
- Without an internet connection the GitHub section can only show its error state.
