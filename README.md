# Abdulaziz Saleh — Portfolio (Assignment 3: Advanced Functionality)

Assignment 3 of **SWE 363 — Web Engineering & Development** at KFUPM. This single-page portfolio builds on Assignments 1 and 2 and adds more complex logic, a richer GitHub API integration, state that is remembered between visits, and performance work. It is built with plain HTML, CSS and JavaScript, with no frameworks and no build step.

## Features

| Requirement | What the site does |
|---|---|
| **API integration** | Loads my GitHub profile (name, public repo count, followers) and my repositories from the GitHub REST API. Visitors can filter repos by language and sort them by last update, stars or name. Forks are hidden. |
| **API error handling** | A loading spinner while waiting, an 8 second timeout, and a specific message for each failure (offline, too slow, GitHub rate limit, account not found, other errors), each with a **Try again** button. |
| **Complex logic** | Projects pass through four steps: topic filter, then experience level (Beginner, Intermediate, Advanced), then search text, then sorting (newest, oldest, A–Z, Z–A). Each level shows its own message, an empty result shows a hint, and **Reset** is only enabled when something differs from the default. |
| **Contact form checks** | Name, email (format check), subject and message (10–500 characters with a live counter). The **Send** button stays disabled until every field is valid, then a simulated send shows "Sending…" and a confirmation. |
| **Timer / counter** | The footer shows how long you have been on the page (it pauses when the tab is hidden) and which visit this is. |
| **State management** | Remembered light/dark theme, visitor name greeting (also pre-fills the contact form), show/hide buttons for Experience, Education and Skills, and the last project filter, level, sort and search. |
| **Performance** | Images resized and compressed (10.8 MB to about 0.25 MB), GitHub data cached for 10 minutes and only fetched when the section is about to scroll into view, lazy-loaded images, deferred script, duplicate CSS removed. |

### Lighthouse (desktop, local server)

| | Assignment 2 | Assignment 3 |
|---|---|---|
| Performance | 65 | **100** |
| Largest Contentful Paint | 4.6 s | **1.8 s** |
| Total page weight | 10,826 KiB | **317 KiB** |
| Accessibility / SEO | — | 100 / 100 |

## How to use the site

- **Say hello:** type your first name in the box at the top and press **Save**. The site greets you by name on later visits. Use **Not you? Change name** to clear it.
- **Explore projects:** pick a topic button, an experience level and a sort order, or type in the search box. Press **Reset** to go back to the default view. Your choices are remembered.
- **Browse GitHub:** scroll to *Latest on GitHub* and use the Language and Sort menus.
- **Tidy the page:** use **Hide** / **Show** next to Experience, Education or Skills.
- **Theme:** press the **Dark** / **Light** button in the top bar.
- **Contact:** fill in all four fields. The Send button turns on when everything is valid. The form is a demo and does not send email.

## Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Abdulaziz20245/202456880-AbdulazizSaleh-assignment3.git
   cd 202456880-AbdulazizSaleh-assignment3
   ```

2. Open `index.html` in any modern browser, **or** (recommended) serve the folder so it behaves like a real website:

   ```bash
   python -m http.server 8000
   ```

   Then visit <http://localhost:8000>. In VS Code, the *Live Server* extension works too.

3. An internet connection is needed for the GitHub section. Without one, the page shows a friendly error and a **Try again** button, and everything else still works.

To reset everything the site remembers, clear this site's data in your browser (or run `localStorage.clear()` in the console).

## Project structure

```
202456880-AbdulazizSaleh-assignment3/
├── README.md
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── assets/
│   ├── documents/My_Resume.pdf
│   └── images/            (portrait + project images, compressed)
├── docs/
│   ├── ai-usage-report.md
│   └── technical-documentation.md
└── .gitignore
```

## Browser support

Tested in Chromium (desktop 1280 px and mobile 375 px widths, automated) and manually in Firefox, with no console errors from the site and no horizontal scrolling. The code uses standard features supported by current Chrome, Edge, Firefox and Safari (`fetch`, `AbortController`, `IntersectionObserver`, `localStorage`). If `IntersectionObserver` is missing, sections simply appear without animation and GitHub data loads immediately.

## AI use (summary)

Claude Code (Anthropic, Claude Opus 5.5) was used to plan and write the Assignment 3 features, compress the images, run automated browser and Lighthouse tests, and draft the documentation. I reviewed and tested the result. The full log, my changes and the declaration are in [`docs/ai-usage-report.md`](docs/ai-usage-report.md). Commits with AI-assisted code carry an `Assisted-by:` line.

## Documentation

- [Technical documentation](docs/technical-documentation.md)
- [AI usage report](docs/ai-usage-report.md)
