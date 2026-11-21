"use strict";

/* =========================================================
   Storage helpers
   localStorage can throw (private mode, blocked cookies), so
   every read and write goes through these two functions and
   the site keeps working with defaults if storage fails.
   ========================================================= */

const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore: the feature still works for this visit.
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  },
};

const KEYS = {
  theme: "portfolio-theme",
  visitorName: "portfolio-visitor-name",
  projects: "portfolio-project-view",
  hiddenSections: "portfolio-hidden-sections",
  visits: "portfolio-visit-count",
};

/* =========================================================
   Mobile navigation
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".nav-links");

// Keep the menu's visual and accessibility states in sync.
function setMenuState(isOpen) {
  navigation.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
}

menuToggle.addEventListener("click", () => {
  setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});

// Close the mobile menu when the layout switches back to desktop.
window.matchMedia("(max-width: 650px)").addEventListener("change", (event) => {
  if (!event.matches) setMenuState(false);
});

/* =========================================================
   Theme (state: remembered light/dark mode)
   ========================================================= */

const themeToggle = document.querySelector(".theme-toggle");

// A saved choice wins; otherwise follow the operating system setting.
function getPreferredTheme() {
  const saved = storage.get(KEYS.theme);
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme) {
  const nextTheme = theme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = nextTheme === "dark" ? "Dark" : "Light";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
}

setTheme(getPreferredTheme());

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  setTheme(next);
  storage.set(KEYS.theme, next);
});

/* =========================================================
   Visitor name (state: store and display a name)
   ========================================================= */

const greetingText = document.querySelector("#greeting-text");
const nameForm = document.querySelector("#name-form");
const nameInput = document.querySelector("#visitor-name");
const forgetNameButton = document.querySelector("#forget-name");

// Letters (any language), spaces, hyphens and apostrophes only.
const namePattern = /^[\p{L}][\p{L} '-]{0,29}$/u;

// Pick a greeting that matches the visitor's local time of day.
function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function renderGreeting(justSaved = false) {
  const name = storage.get(KEYS.visitorName);
  const hasName = Boolean(name);

  nameForm.hidden = hasName;
  forgetNameButton.hidden = !hasName;
  greetingText.textContent = hasName
    ? `${timeOfDayGreeting()}, ${name}! ${justSaved ? "Nice to meet you." : "Welcome back."}`
    : "Welcome! What should I call you?";

  // Reuse the saved name in the contact form if that field is still empty.
  const contactName = document.querySelector("#name");
  if (hasName && contactName && !contactName.value) contactName.value = name;
}

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();

  if (!namePattern.test(name)) {
    greetingText.textContent =
      "Please use letters only (up to 30 characters).";
    nameInput.focus();
    return;
  }

  storage.set(KEYS.visitorName, name);
  nameInput.value = "";
  renderGreeting(true);
});

forgetNameButton.addEventListener("click", () => {
  storage.remove(KEYS.visitorName);
  renderGreeting();
  nameInput.focus();
});

renderGreeting();

/* =========================================================
   Projects: topic filter + level + search + sort
   Each card goes through the same steps in order:
   1. topic filter  2. level  3. search text  4. sort the rest
   ========================================================= */

const projectGrid = document.querySelector("#project-grid");
const projectCards = [...projectGrid.querySelectorAll(".project-card")];
const filterButtons = document.querySelectorAll(".filter-btn");
const levelSelect = document.querySelector("#project-level");
const sortSelect = document.querySelector("#project-sort");
const searchInput = document.querySelector("#project-search");
const resetButton = document.querySelector("#reset-projects");
const levelMessage = document.querySelector("#level-message");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");

const DEFAULT_VIEW = { filter: "all", level: "all", sort: "newest", search: "" };

// A different message for each level the visitor picks.
const LEVEL_MESSAGES = {
  all: "",
  beginner:
    "Beginner: first machine learning projects using classic models and clean data pipelines.",
  intermediate:
    "Intermediate: deep learning projects that train neural networks on image data.",
  advanced:
    "Advanced: models built from scratch to understand how modern architectures work inside.",
};

const SORTERS = {
  newest: (a, b) => b.dataset.date.localeCompare(a.dataset.date),
  oldest: (a, b) => a.dataset.date.localeCompare(b.dataset.date),
  "name-asc": (a, b) => cardTitle(a).localeCompare(cardTitle(b)),
  "name-desc": (a, b) => cardTitle(b).localeCompare(cardTitle(a)),
};

function cardTitle(card) {
  return card.querySelector("h3").textContent.trim();
}

// Restore the last view, but only keep values that still exist on the page.
function loadProjectView() {
  let saved = {};
  try {
    saved = JSON.parse(storage.get(KEYS.projects, "{}")) || {};
  } catch {
    saved = {};
  }

  const validFilters = [...filterButtons].map((b) => b.dataset.filter);
  const validLevels = [...levelSelect.options].map((o) => o.value);

  return {
    filter: validFilters.includes(saved.filter) ? saved.filter : DEFAULT_VIEW.filter,
    level: validLevels.includes(saved.level) ? saved.level : DEFAULT_VIEW.level,
    sort: saved.sort in SORTERS ? saved.sort : DEFAULT_VIEW.sort,
    search: typeof saved.search === "string" ? saved.search : DEFAULT_VIEW.search,
  };
}

let projectView = loadProjectView();

// Make every control show the current state.
function syncProjectControls() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === projectView.filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  levelSelect.value = projectView.level;
  sortSelect.value = projectView.sort;
  searchInput.value = projectView.search;
}

function cardMatches(card) {
  const tags = card.dataset.tags.split(",").map((tag) => tag.trim());
  const query = projectView.search.trim().toLowerCase();

  const topicOk = projectView.filter === "all" || tags.includes(projectView.filter);
  const levelOk = projectView.level === "all" || card.dataset.level === projectView.level;
  const searchOk = !query || card.textContent.toLowerCase().includes(query);

  return topicOk && levelOk && searchOk;
}

function renderProjects() {
  const visibleCards = [];

  projectCards.forEach((card) => {
    const show = cardMatches(card);
    card.classList.toggle("is-hidden", !show);
    if (show) visibleCards.push(card);
  });

  // Re-append in sorted order; appending an existing node moves it.
  [...projectCards].sort(SORTERS[projectView.sort]).forEach((card) => {
    projectGrid.append(card);
  });

  const count = visibleCards.length;
  levelMessage.textContent = LEVEL_MESSAGES[projectView.level];
  levelMessage.hidden = !LEVEL_MESSAGES[projectView.level];
  resultsCount.textContent = `Showing ${count} of ${projectCards.length} projects`;
  emptyState.hidden = count > 0;

  const isDefault = Object.keys(DEFAULT_VIEW).every(
    (key) => projectView[key] === DEFAULT_VIEW[key],
  );
  resetButton.disabled = isDefault;

  storage.set(KEYS.projects, JSON.stringify(projectView));
}

function updateProjectView(changes) {
  projectView = { ...projectView, ...changes };
  syncProjectControls();
  renderProjects();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateProjectView({ filter: button.dataset.filter });
  });
});

levelSelect.addEventListener("change", () => {
  updateProjectView({ level: levelSelect.value });
});

sortSelect.addEventListener("change", () => {
  updateProjectView({ sort: sortSelect.value });
});

searchInput.addEventListener("input", () => {
  updateProjectView({ search: searchInput.value });
});

resetButton.addEventListener("click", () => {
  updateProjectView({ ...DEFAULT_VIEW });
});

syncProjectControls();
renderProjects();

/* =========================================================
   GitHub API: profile + repositories
   Responses are cached in sessionStorage for 10 minutes so
   reloading the page does not use up the 60 requests/hour
   limit GitHub gives to visitors without an account.
   ========================================================= */

const GITHUB_USER = "Abdulaziz20245";
const GITHUB_API = "https://api.github.com";
const CACHE_KEY = "portfolio-github-cache";
const CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;

const repoList = document.querySelector("#repo-list");
const repoStatus = document.querySelector("#repo-status");
const repoControls = document.querySelector("#repo-controls");
const repoLanguage = document.querySelector("#repo-language");
const repoSort = document.querySelector("#repo-sort");
const githubProfile = document.querySelector("#github-profile");

let repos = [];

// Escape API text before putting it into HTML.
function escapeText(value) {
  const span = document.createElement("span");
  span.textContent = value ?? "";
  return span.innerHTML;
}

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached;
  } catch {
    // No usable cache.
  }
  return null;
}

function writeCache(profile, repoData) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), profile, repos: repoData }),
    );
  } catch {
    // Caching is optional.
  }
}

// fetch() has no timeout of its own, so abort slow requests.
async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    });

    if (response.status === 403 || response.status === 429) {
      throw new Error("rate-limit");
    }
    if (response.status === 404) throw new Error("not-found");
    if (!response.ok) throw new Error("http");

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Turn each kind of failure into a message a visitor can understand.
function errorMessage(error) {
  if (!navigator.onLine) return "You seem to be offline. Check your connection and";
  if (error.name === "AbortError") return "GitHub is taking too long to answer. Please";
  if (error.message === "rate-limit") {
    return "GitHub's hourly request limit was reached. Wait a few minutes, then";
  }
  if (error.message === "not-found") return "That GitHub account was not found. You can";
  return "Couldn't load repositories right now. Please";
}

function showRepoError(error) {
  repoControls.hidden = true;
  githubProfile.hidden = true;
  repoList.innerHTML = "";
  repoStatus.textContent = `${errorMessage(error)} `;

  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "Try again";
  retry.addEventListener("click", () => loadGitHub({ skipCache: true }));
  repoStatus.append(retry);
}

function renderProfile(profile) {
  githubProfile.innerHTML = `
    <img src="${escapeText(profile.avatar_url)}&s=96" alt="" width="48" height="48" loading="lazy" />
    <p>
      <strong>${escapeText(profile.name || profile.login)}</strong>
      <span>${profile.public_repos} public repositories · ${profile.followers} followers</span>
    </p>
    <a href="${escapeText(profile.html_url)}" target="_blank" rel="noopener noreferrer">View profile</a>`;
  githubProfile.hidden = false;
}

// Fill the language menu from the languages the repos actually use.
function fillLanguageOptions() {
  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();

  repoLanguage.innerHTML =
    '<option value="all">All languages</option>' +
    languages
      .map((lang) => `<option value="${escapeText(lang)}">${escapeText(lang)}</option>`)
      .join("");
}

const REPO_SORTERS = {
  updated: (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at),
  stars: (a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
};

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderRepos() {
  const language = repoLanguage.value;
  const shown = repos
    .filter((repo) => language === "all" || repo.language === language)
    .sort(REPO_SORTERS[repoSort.value])
    .slice(0, 6);

  if (shown.length === 0) {
    repoList.innerHTML = "";
    repoStatus.textContent = "No repositories use this language yet.";
    return;
  }

  repoStatus.textContent = "";
  repoList.innerHTML = shown
    .map(
      (repo) => `
      <li>
        <a href="${escapeText(repo.html_url)}" target="_blank" rel="noopener noreferrer">
          <h3>${escapeText(repo.name)}</h3>
          <p>${escapeText(repo.description) || "No description provided."}</p>
          <span class="repo-meta">
            ${escapeText(repo.language) || "Various"} · ★ ${repo.stargazers_count} · Updated ${formatDate(repo.pushed_at)}
          </span>
        </a>
      </li>`,
    )
    .join("");
}

async function loadGitHub({ skipCache = false } = {}) {
  repoList.innerHTML = "";
  repoControls.hidden = true;
  repoStatus.innerHTML =
    '<span class="loading-spinner" aria-hidden="true"></span>Loading repositories…';

  try {
    let data = skipCache ? null : readCache();

    if (!data) {
      // Both requests run at the same time.
      const [profile, repoData] = await Promise.all([
        fetchJson(`${GITHUB_API}/users/${GITHUB_USER}`),
        fetchJson(`${GITHUB_API}/users/${GITHUB_USER}/repos?sort=pushed&per_page=100`),
      ]);
      data = { profile, repos: repoData };
      writeCache(profile, repoData);
    }

    // Hide forks so only my own work is listed.
    repos = data.repos.filter((repo) => !repo.fork);
    renderProfile(data.profile);

    if (repos.length === 0) {
      repoStatus.textContent = "No public repositories to show yet.";
      return;
    }

    fillLanguageOptions();
    repoControls.hidden = false;
    renderRepos();
  } catch (error) {
    showRepoError(error);
  }
}

repoLanguage.addEventListener("change", renderRepos);
repoSort.addEventListener("change", renderRepos);

// Only call the API when the section is about to be seen.
const githubSection = document.querySelector("#github");

if ("IntersectionObserver" in window) {
  const githubObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        githubObserver.disconnect();
        loadGitHub();
      }
    },
    { rootMargin: "300px" },
  );
  githubObserver.observe(githubSection);
} else {
  loadGitHub();
}

/* =========================================================
   Show / hide sections (state: remembered between visits)
   ========================================================= */

function readHiddenSections() {
  try {
    const list = JSON.parse(storage.get(KEYS.hiddenSections, "[]"));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

const hiddenSections = new Set(readHiddenSections());

function setSectionOpen(button, isOpen) {
  const body = document.getElementById(button.getAttribute("aria-controls"));
  const title = button.closest("header").querySelector("h2").textContent;

  body.hidden = !isOpen;
  button.setAttribute("aria-expanded", String(isOpen));
  button.textContent = isOpen ? "Hide" : "Show";
  button.setAttribute("aria-label", `${isOpen ? "Hide" : "Show"} ${title}`);
}

document.querySelectorAll(".section-toggle").forEach((button) => {
  const id = button.getAttribute("aria-controls");
  setSectionOpen(button, !hiddenSections.has(id));

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    setSectionOpen(button, !isOpen);

    if (isOpen) hiddenSections.add(id);
    else hiddenSections.delete(id);
    storage.set(KEYS.hiddenSections, JSON.stringify([...hiddenSections]));
  });
});

/* =========================================================
   Scroll reveal
   ========================================================= */

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* =========================================================
   Contact form: validate every field, then allow submission
   ========================================================= */

const contactForm = document.querySelector("#contact-form");
const formFields = [...contactForm.querySelectorAll("input, select, textarea")];
const submitButton = document.querySelector("#submit-button");
const formHint = document.querySelector("#form-hint");
const formStatus = document.querySelector("#form-status");
const messageField = document.querySelector("#message");
const messageCount = document.querySelector("#message-count");

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;

// Each rule returns an error message, or "" when the value is fine.
const validators = {
  name(value) {
    const v = value.trim();
    if (!v) return "Please enter your name.";
    if (v.length < 2) return "Your name needs at least 2 characters.";
    return "";
  },
  email(value) {
    const v = value.trim();
    if (!v) return "Please enter your email.";
    if (!emailPattern.test(v)) return "That email doesn't look right, e.g. name@example.com.";
    return "";
  },
  subject(value) {
    return value ? "" : "Please choose a subject.";
  },
  message(value) {
    const length = value.trim().length;
    if (!length) return "Please write a message.";
    if (length < MESSAGE_MIN) return `Add ${MESSAGE_MIN - length} more character(s).`;
    return "";
  },
};

// Show or clear the error for one field. Returns true when valid.
function validateField(field, showError = true) {
  const error = validators[field.name](field.value);

  if (showError) {
    document.querySelector(`#${field.id}-error`).textContent = error;
    field.classList.toggle("is-invalid", Boolean(error));
    field.setAttribute("aria-invalid", String(Boolean(error)));
  }
  return !error;
}

// The Send button is only enabled when every field passes.
function updateSubmitState() {
  const allValid = formFields.every((field) => validateField(field, false));
  submitButton.disabled = !allValid;
  formHint.hidden = allValid;
}

function updateCharCount() {
  const length = messageField.value.length;
  messageCount.textContent = `${length} / ${MESSAGE_MAX}`;
  messageCount.classList.toggle("is-near-limit", length > MESSAGE_MAX * 0.9);
}

formFields.forEach((field) => {
  // Show errors once the visitor leaves a field they've typed in.
  field.addEventListener("blur", () => {
    if (field.value) validateField(field);
  });

  field.addEventListener("input", () => {
    if (field.classList.contains("is-invalid")) validateField(field);
    updateSubmitState();
  });

  field.addEventListener("change", updateSubmitState);
});

messageField.addEventListener("input", updateCharCount);

function setFormStatus(message, type) {
  formStatus.className = `form-status is-${type}`;
  formStatus.textContent = message;
}

// No backend: pretend to send so the visitor sees each step.
function fakeSend() {
  return new Promise((resolve) => setTimeout(resolve, 900));
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Step 1: check everything again (the button could be forced on).
  const results = formFields.map((field) => validateField(field));
  const firstInvalid = results.indexOf(false);

  if (firstInvalid !== -1) {
    formFields[firstInvalid].focus();
    setFormStatus("Some fields need attention. Fix the highlighted fields and try again.", "error");
    return;
  }

  // Step 2: "send" while the button shows progress.
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  await fakeSend();

  // Step 3: confirm, then clear the form for the next message.
  const name = document.querySelector("#name").value.trim().split(" ")[0];
  setFormStatus(`Thanks, ${name}! Your message is ready. This demo form does not send data yet.`, "success");
  contactForm.reset();
  submitButton.textContent = "Send Message";
  updateCharCount();
  updateSubmitState();
  renderGreeting();
});

updateCharCount();
updateSubmitState();

/* =========================================================
   Visit timer and visit counter
   The timer only counts while the tab is visible.
   ========================================================= */

const visitTimer = document.querySelector("#visit-timer");
const visitCount = document.querySelector("#visit-count");

const visits = Number(storage.get(KEYS.visits, "0")) + 1;
storage.set(KEYS.visits, String(visits));
visitCount.textContent =
  visits === 1 ? "This is your first visit" : `Visit number ${visits}`;

let secondsOnPage = 0;
let timerId = null;

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

function startTimer() {
  if (timerId) return;
  timerId = setInterval(() => {
    secondsOnPage += 1;
    visitTimer.textContent = `You've been here for ${formatDuration(secondsOnPage)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopTimer();
  else startTimer();
});

if (!document.hidden) startTimer();
