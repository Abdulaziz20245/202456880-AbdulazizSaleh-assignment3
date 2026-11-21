# AI Usage Report — Assignment 3

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

- The AI did not know my real project dates or difficulty levels, so it put in estimates that I had to review.
- The cloud session could not call the GitHub API for my account directly, so the API was tested with mocked responses; I had to check the live GitHub section myself in the browser.
- It produced a lot of code at once, so I had to read it carefully to make sure I understand and can explain every part.
- One challenge was understanding how all the new JavaScript features worked together. Since AI generated several features at once, it took me some time to follow the code, especially the filtering logic, API requests, and saved preferences. I needed to review these parts carefully to understand how they worked and how they affected the website.

## Learning Outcomes

Through this assignment, I learned how to build more interactive websites using JavaScript. I learned how to fetch data from an external API and display it dynamically, as well as how to handle errors when an API request fails. I also gained a better understanding of filtering and sorting data based on multiple conditions, such as project difficulty, topic, and search keywords.

Another important thing I learned was the difference between `localStorage` and `sessionStorage`, and how they can be used to remember user preferences. I also learned how `IntersectionObserver` can improve performance by delaying API requests until they are needed.

Finally, I learned how important website performance is. I saw how large images can slow down a website and how compressing them can improve Lighthouse scores. Overall, this assignment helped me understand more advanced JavaScript concepts and how to apply them to a real website.

## Responsible Use & Modifications

- I reviewed the AI-generated code and compared the implemented features with the assignment requirements to make sure nothing was missing.
- I checked the project information and kept the estimated dates and difficulty levels for demonstrating the filtering and sorting features.
- I tested the website manually by trying the project filters, sorting options, reset button, theme switching, and contact form validation.
- I also checked whether user preferences were saved correctly after refreshing the page and whether the layout worked properly on smaller screens.
- I reviewed the GitHub API section to understand how repository information was retrieved and displayed.
- My existing portfolio content (projects, experience, education, skills) was kept; the AI only added features and compressed images, it did not invent new portfolio content.

## Usage Log

| ID | Tool (model) | Date | Purpose | Files affected | What you changed and how you verified it |
|----|--------------|------|---------|----------------|------------------------------------------|
| C01 | Claude Code (Claude Opus 5.5) | 2026-11-21 | Build Assignment 3 from Assignment 2: project level/sort/reset, GitHub profile + repo filter/sort with timeout, error messages and caching, visitor name, show/hide sections, contact form gating and counter, visit timer, image compression, docs | `index.html`, `css/styles.css`, `js/script.js`, `assets/images/*`, `.gitignore`, `README.md`, `docs/*` | AI verification: `node --check`, automated Playwright tests (sorting, level + topic filters, empty state, saved view, Reset, visitor name, repo language filter/sort, HTML escaping, 403 error + Try again, hidden section after reload, form gating and submit, timer), mobile 375 px overflow check, Lighthouse (Performance 100, Accessibility 100, SEO 100). Student review: After the AI generated the code, I reviewed the implementation and checked it against the assignment requirements. I kept the estimated project dates and difficulty levels for the demonstration features. I manually tested the filtering and sorting options, reset button, theme preferences, saved settings, contact form validation, and GitHub repository section. I also refreshed the page to check whether preferences were saved and checked the layout at different screen sizes. These checks helped me understand the generated code and verify that the features worked as expected. |
| A01 | Claude Code (Claude Opus 5.5) | 2026-11-21 | AI-generated version of the site before my edits | all of the above | Included in the evidence ZIP under `artifacts/`. |

## AI Usage Declaration

> I declare that this report and the attached evidence document all of my AI use in this assignment, with complete and unedited conversations, and that I understand and can explain all the code I submitted. I understand that undeclared AI use or a false declaration will be treated as plagiarism according to KFUPM regulations.

Name: Abdulaziz Saleh  
ID: 202456880  
Date: 2026-11-21
