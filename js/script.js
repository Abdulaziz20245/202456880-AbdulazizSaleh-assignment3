"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".nav-links");
const navigationLinks = document.querySelectorAll(".nav-links a");
const themeToggle = document.querySelector(".theme-toggle");

// Keep the mobile menu's visual and accessibility states synchronized.
function setMenuState(isOpen) {
  navigation.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));

  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

  setMenuState(!isOpen);
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setMenuState(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

const THEME_STORAGE_KEY = "portfolio-theme";

// Use a saved preference when available; otherwise respect the system theme.
function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function updateThemeButton(theme) {
  const nextTheme = theme === "dark" ? "light" : "dark";

  themeToggle.textContent = nextTheme === "dark" ? "Dark" : "Light";

  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeButton(theme);
}

const initialTheme = getPreferredTheme();

setTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");

  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
});

// Reset the mobile menu when the layout switches back to desktop.
const mobileBreakpoint = window.matchMedia("(max-width: 650px)");

mobileBreakpoint.addEventListener("change", (event) => {
  if (!event.matches) {
    setMenuState(false);
  }
});

// ---------- Project filtering and live search ----------
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.querySelector("#project-search");
const projectCards = document.querySelectorAll(".project-card");
const emptyState = document.querySelector("#empty-state");
const resultsCount = document.querySelector("#results-count");

const FILTER_KEY = "portfolio-filter";
const SEARCH_KEY = "portfolio-search";

let activeFilter = "all";

// Restore the saved filter and search.
try {
  const savedFilter = localStorage.getItem(FILTER_KEY);

  const validFilter = [...filterButtons].some(
    (button) => button.dataset.filter === savedFilter,
  );

  if (validFilter) activeFilter = savedFilter;

  searchInput.value = localStorage.getItem(SEARCH_KEY) || "";
} catch {
  // Keep the defaults if reading fails.
}

// Update every button to match the restored filter.
filterButtons.forEach((button) => {
  const isActive = button.dataset.filter === activeFilter;
  button.classList.toggle("is-active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
});

function applyProjectFilters() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;

  projectCards.forEach((card) => {
    const tags = (card.dataset.tags || "").split(",").map((t) => t.trim());
    const matchesFilter = activeFilter === "all" || tags.includes(activeFilter);
    const matchesSearch = card.textContent.toLowerCase().includes(query);
    const show = matchesFilter && matchesSearch;

    card.classList.toggle("is-hidden", !show);
    if (show) visible += 1;
  });

  emptyState.hidden = visible > 0;
  resultsCount.textContent = `Showing ${visible} of ${projectCards.length} projects`;

  try {
    localStorage.setItem(FILTER_KEY, activeFilter);
    localStorage.setItem(SEARCH_KEY, searchInput.value);
  } catch {
    // Filtering still works if saving fails.
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((b) => {
      const isActive = b === button;
      b.classList.toggle("is-active", isActive);
      b.setAttribute("aria-pressed", String(isActive));
    });

    applyProjectFilters();
  });
});

searchInput.addEventListener("input", applyProjectFilters);
applyProjectFilters();

// ---------- GitHub repositories (public API) ----------
const GITHUB_USER = "Abdulaziz20245";
const repoList = document.querySelector("#repo-list");
const repoStatus = document.querySelector("#repo-status");

function escapeText(value) {
  const span = document.createElement("span");
  span.textContent = value ?? "";
  return span.innerHTML;
}

function showRepoError() {
  repoStatus.innerHTML =
    "Couldn't load repositories right now. Check your connection and ";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "Try again";
  retry.addEventListener("click", loadRepos);
  repoStatus.append(retry);
}

async function loadRepos() {
  repoList.innerHTML = "";
  repoStatus.innerHTML =
    '<span class="loading-spinner" aria-hidden="true"></span>Loading repositories…';

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`,
    );

    if (!response.ok) {
      throw new Error(`GitHub responded with ${response.status}`);
    }

    const repos = await response.json();

    if (repos.length === 0) {
      repoStatus.textContent = "No public repositories to show yet.";
      return;
    }

    repoStatus.textContent = "";
    repoList.innerHTML = repos
      .map(
        (repo) => `
        <li>
          <a href="${escapeText(repo.html_url)}" target="_blank" rel="noopener noreferrer">
            <h3>${escapeText(repo.name)}</h3>
            <p>${escapeText(repo.description) || "No description provided."}</p>
            <span class="repo-meta">${escapeText(repo.language) || "Various"} · ★ ${repo.stargazers_count}</span>
          </a>
        </li>`,
      )
      .join("");
  } catch (error) {
    showRepoError();
  }
}

loadRepos();

// ---------- Scroll reveal ----------
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// ---------- Contact form validation ----------
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validators = {
  name: (v) => (v.trim().length < 2 ? "Please enter your name (at least 2 characters)." : ""),
  email: (v) => (emailPattern.test(v.trim()) ? "" : "Please enter a valid email, like name@example.com."),
  message: (v) => (v.trim().length < 10 ? "Please write a message of at least 10 characters." : ""),
};

function validateField(field) {
  const error = validators[field.name](field.value);
  const errorEl = document.querySelector(`#${field.id}-error`);

  errorEl.textContent = error;
  field.classList.toggle("is-invalid", Boolean(error));
  field.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
}

contactForm.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.classList.contains("is-invalid")) validateField(field);
  });
});

function setFormStatus(message, type) {
  formStatus.className = `form-status is-${type}`;
  formStatus.textContent = message;
}

// The assignment requires no backend, so a valid submission is only confirmed locally.
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const fields = [...contactForm.querySelectorAll("input, textarea")];
  const results = fields.map(validateField);

  if (results.includes(false)) {
    fields[results.indexOf(false)].focus();
    setFormStatus("Some fields need attention. Fix the highlighted fields and try again.", "error");
    return;
  }

  setFormStatus("Thanks for your message! This demo form does not send data yet.", "success");
  contactForm.reset();
});
