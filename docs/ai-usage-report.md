# AI Usage Report — Assignment 3

> **Before submitting:** replace every line marked **TODO (student)** with your own words. Those parts describe your own review, learning and changes, so they must come from you.

## Overview

AI was used in this assignment. I used Claude Code to plan and write the Assignment 3 features on top of my Assignment 2 portfolio, compress the images, test the site automatically, and draft the documentation. I then reviewed, tested and adjusted the result.

## Tools Used & Use Cases

| Tool | How I used it |
|---|---|
| **Claude Code** (Anthropic, model Claude Opus 5.5), cloud session linked to my computer | Read my Assignment 2 code and the Assignment 3 instructions, proposed which features would meet each requirement, wrote the HTML/CSS/JS changes, resized the images with Python (Pillow), ran automated browser tests with Playwright and a Lighthouse audit, and drafted `README.md`, this report and `docs/technical-documentation.md`. |

## Benefits & Challenges

**Benefits**

- Turned the requirement list (API, complex logic, state, performance) into a concrete feature plan quickly, building on code I already had instead of starting over.
- Found the biggest performance problem: my project images were about 2.6 MB each (10.8 MB total). Resizing them took Lighthouse Performance from 65 to 100.
- Wrote automated tests that check every feature (sorting, filters, saved state, API error, form gating), which is faster and more repeatable than clicking through by hand.
- Suggested robustness details I had not thought of: a timeout for `fetch`, different error messages for rate limits vs. being offline, caching GitHub data to stay under the 60 requests/hour limit, and escaping API text before inserting it as HTML.

**Challenges / limitations**

- The AI did not know my real project dates or difficulty levels, so it put in estimates that I had to check and correct.
- The cloud session could not call the GitHub API for my account directly, so the API was tested with mocked responses; I had to check the live GitHub section myself in the browser.
- It produced a lot of code at once, so I had to read it carefully to make sure I understand and can explain every part.
- TODO (student): add any other difficulty you had.

## Learning Outcomes

TODO (student): write what you learned, in your own words. Ideas to reflect on:

- How the project list uses one state object and a filter → level → search → sort pipeline.
- How `AbortController` adds a timeout to `fetch`, and why different HTTP status codes deserve different messages.
- `localStorage` vs `sessionStorage`, and why every storage call is wrapped in `try/catch`.
- How `IntersectionObserver` can delay work (the API call) until it is needed.
- How image size dominated page load time, and how Lighthouse measures it.

## Responsible Use & Modifications

- I checked that the features meet each part of the assignment and that the site works on desktop and mobile widths.
- I verified the AI's claims by running the tests and Lighthouse myself rather than trusting the summary.
- I kept my existing content (projects, experience, education, skills); the AI only added features and compressed images, it did not invent new portfolio content.
- TODO (student): confirm or correct the project dates and levels in `index.html` (they were AI estimates: CVU Nov 2025 / Intermediate, NEO Mar 2025 / Beginner, Colorization Feb 2026 / Intermediate, Transformer Jun 2026 / Advanced).
- TODO (student): list anything else you changed after reviewing the AI's code, and how you tested it.

## Usage Log

| ID | Tool (model) | Date | Purpose | Files affected | What you changed and how you verified it |
|----|--------------|------|---------|----------------|------------------------------------------|
| C01 | Claude Code (Claude Opus 5.5) | 2026-11-21 | Build Assignment 3 from Assignment 2: project level/sort/reset, GitHub profile + repo filter/sort with timeout, error messages and caching, visitor name, show/hide sections, contact form gating and counter, visit timer, image compression, docs | `index.html`, `css/styles.css`, `js/script.js`, `assets/images/*`, `.gitignore`, `README.md`, `docs/*` | AI verification: `node --check`, automated Playwright tests (sorting, level + topic filters, empty state, saved view, Reset, visitor name, repo language filter/sort, HTML escaping, 403 error + Try again, hidden section after reload, form gating and submit, timer), mobile 375 px overflow check, Lighthouse (Performance 100, Accessibility 100, SEO 100). TODO (student): what you changed and how you checked it yourself (e.g. corrected project dates, tested live GitHub section in Chrome/Edge/Firefox/phone). |
| A01 | Claude Code (Claude Opus 5.5) | 2026-11-21 | AI-generated version of the site before my edits | all of the above | Included in the evidence ZIP under `artifacts/`. |

## AI Usage Declaration

> I declare that this report and the attached evidence document all of my AI use in this assignment, with complete and unedited conversations, and that I understand and can explain all the code I submitted. I understand that undeclared AI use or a false declaration will be treated as plagiarism according to KFUPM regulations.

Name: Abdulaziz Saleh  
ID: 202456880  
Date: 2026-11-21
