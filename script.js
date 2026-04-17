const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const dropdownBtn = document.getElementById("dropdown-btn");
const dropdownMenu = document.getElementById("extraMenu");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  body.classList.add("dark-theme");
}

if (themeToggle) {
  const syncThemeLabel = () => {
    themeToggle.textContent = body.classList.contains("dark-theme")
      ? "Светлая тема"
      : "Тёмная тема";
  };

  syncThemeLabel();

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-theme");
    localStorage.setItem("theme", body.classList.contains("dark-theme") ? "dark" : "light");
    syncThemeLabel();
  });
}

if (dropdownBtn && dropdownMenu) {
  dropdownBtn.addEventListener("click", () => {
    const isOpen = dropdownMenu.classList.toggle("open");
    dropdownBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    const clickInside = dropdownBtn.contains(event.target) || dropdownMenu.contains(event.target);
    if (!clickInside) {
      dropdownMenu.classList.remove("open");
      dropdownBtn.setAttribute("aria-expanded", "false");
    }
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    const insideNav = navToggle.contains(event.target) || navLinks.contains(event.target);
    if (!insideNav) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const form = document.getElementById("applicationForm");
const successMessage = document.getElementById("successMessage");

if (form && successMessage) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector(".submit-btn");
    btn.classList.add("loading");
    btn.querySelector(".btn-text").textContent = "Отправляем...";

    setTimeout(() => {
      form.style.display = "none";
      successMessage.style.display = "flex";
    }, 1500);
  });
}