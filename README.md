# Abdulaziz Saleh — Interactive Portfolio (Assignment 2)

Assignment 2 of **SWE 363 — Web Engineering & Development**. It extends the Assignment 1 portfolio with interactive features, data handling, animation and user feedback. Built with plain HTML, CSS and JavaScript (no frameworks).

## New in Assignment 2

| Requirement | Implementation |
|---|---|
| Dynamic content | Project filter buttons (All / Computer Vision / Machine Learning / NLP) plus live search while typing, with a result count; the last filter and search are remembered between visits |
| Data handling | Public API (GitHub REST API) listing my latest repositories; `localStorage` theme preference; validated contact form |
| Animation | Fade/slide-in of sections on scroll, hover lift on cards, spinner, animated success/error messages (all disabled under `prefers-reduced-motion`) |
| Feedback | Loading indicator, friendly API error with a "Try again" button, empty-state message, per-field form errors, confirmation message |

## Run locally

No build step. Either open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

An internet connection is needed for the GitHub repositories section; without it the page shows an error message and a retry button.

## Structure

```
index.html
css/styles.css
js/script.js
assets/
docs/ai-usage-report.md
docs/technical-documentation.md
```

## AI use (summary)

Claude Code (Anthropic) was used to plan and write the filtering, API, validation and animation code, and the documentation. Details, the usage log and the declaration are in [`docs/ai-usage-report.md`](docs/ai-usage-report.md).
