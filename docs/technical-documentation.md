# Technical Documentation

## Overview
Static single-page site (HTML/CSS/JS). Assignment 1 code is the base; only additions are described here.

## JavaScript (`js/script.js`)
- **Project filter + search**: each `.project-card` has `data-tags`. `applyProjectFilters()` combines the active filter button with the search text (case-insensitive match on card text), toggles `.is-hidden`, shows `#empty-state` when nothing matches and updates the `aria-live` result count.
- **Remembered filter and search**: the active filter and search text are saved to `localStorage` (`portfolio-filter`, `portfolio-search`) at the end of `applyProjectFilters()` and restored on load before the first render. The saved filter is validated against the real buttons, and all storage calls are wrapped in `try/catch`.
- **GitHub API**: `loadRepos()` fetches `https://api.github.com/users/Abdulaziz20245/repos?sort=updated&per_page=6`. States: loading (spinner), success (cards), empty ("No public repositories"), failure (message + "Try again" button). API text is escaped via `escapeText()` before insertion.
- **Scroll reveal**: `IntersectionObserver` adds `.is-visible` to `.reveal` sections once; falls back to showing everything if unsupported.
- **Form validation**: `novalidate` form; per-field validators (name ≥ 2 chars, email regex, message ≥ 10 chars) run on blur/submit, set `aria-invalid`, show messages in `#<field>-error`, focus the first invalid field, and show a success message on valid submit. No data is sent (no backend).
- **Theme**: unchanged from Assignment 1 (`localStorage` key `portfolio-theme`).

## CSS (`css/styles.css`)
New "Assignment 2: Interactivity" block: filter buttons, search input, empty/repo states, repo cards, spinner and `pop-in` keyframes, `.reveal` transitions, form error styles. `prefers-reduced-motion` disables the reveal transform/opacity.

## Accessibility
Filter buttons use `aria-pressed`; status regions use `aria-live`; the search input has a visually hidden label; invalid fields use `aria-invalid`.

## Testing
Verified headlessly (Chromium/Playwright): filter updates the count, search with no match shows the empty state, empty submit shows field errors, API failure shows the retry message, no console errors. Manual browser/device checks are still recommended.

## Limitations
Unauthenticated GitHub API calls are rate limited (60/hour per IP); the error state covers this.
