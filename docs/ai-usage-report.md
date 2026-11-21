# AI Usage Report — Assignment 2

## Overview
AI was used for this assignment. I used it to plan and draft the interactive features and documentation, then reviewed and tested the result.

## Tools
- **Claude Code (Anthropic, Claude Opus 5.5 / Sonnet 5.5)**: code generation, testing, documentation.

## Usage Log

| ID | Tool (model) | Date | Purpose | Files affected | What you changed and how you verified it |
|----|--------------|------|---------|----------------|------------------------------------------|
| C01 | Claude Code (Claude Opus 5.5 / Sonnet 5.5) | 2026-10-19 | Read the Assignment 2 guidelines; build filter + live search, GitHub API section with loading/error states, scroll-reveal animation, form validation; draft README and docs | `index.html`, `css/styles.css`, `js/script.js`, `README.md`, `docs/*` | Student changes: none to this AI-generated code yet except the remember-filter feature in C02; student reviewed the code and chose which features to keep (removed an AI-suggested sort dropdown). Verification: `node --check` on `script.js` and an automated headless Chromium test covering the filter buttons, live search with the empty state, empty-form validation errors and the GitHub API failure message with retry button. |
| C02 | Claude Code (Claude Sonnet 5.5) | 2026-10-19 | Suggested remembering the filter/search (my choice from AI suggestions); outlined the steps; reviewed my draft and pointed out the save block ran at load, before the restore | `js/script.js`, `README.md`, `docs/technical-documentation.md` | I wrote the restore and save logic myself (key constants, validating the saved filter against the buttons, restoring the search text, syncing button states, try/catch). AI review found the save block was outside `applyProjectFilters()`, so it would have overwritten saved values on load; the save now runs at the end of that function. AI moved my code into the file. Verification: `node --check` and an automated headless Chromium test: pick the NLP filter, type "trans" in the search, reload, and confirm both are restored with the NLP button active; an invalid saved filter falls back to All. |

## Declaration
> I declare that this report and the attached evidence document all of my AI use in this assignment, with complete and unedited conversations, and that I understand and can explain all the code I submitted. I understand that undeclared AI use or a false declaration will be treated as plagiarism according to KFUPM regulations.

Name: Abdulaziz Saleh  
ID: 202456880  
Date: 2026-10-19
