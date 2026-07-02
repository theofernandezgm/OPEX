/* =================================================================
   OPEX — site behaviour
   Lean, no dependencies. Calm, intentional motion only.
   ================================================================= */
(function () {
  "use strict";

  /* ---- Language (Spanish primary, English toggle) ------------- */
  var STORE_KEY = "opex-lang";
  var root = document.documentElement;

  function getLang() {
    try { return localStorage.getItem(STORE_KEY) || "es"; }
    catch (e) { return "es"; }
  }
  // Apply a language WITHOUT saving it (used on load; storage only holds
  // a value once the visitor has explicitly chosen — mirrors the theme).
  function applyLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      // button shows the language you'd switch TO
      btn.textContent = lang === "es" ? "EN" : "ES";
      btn.setAttribute("aria-label",
        lang === "es" ? "Switch to English" : "Cambiar a Español");
    });
    // translate input placeholders
    document.querySelectorAll("[data-ph-es]").forEach(function (el) {
      var v = el.getAttribute("data-ph-" + lang);
      if (v != null) el.setAttribute("placeholder", v);
    });
  }
  // An explicit click is a deliberate choice — that one we remember.
  function setLang(lang) {
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    applyLang(lang);
  }
  // apply stored language as early as possible
  applyLang(getLang());

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-lang-toggle]");
    if (!t) return;
    setLang(root.getAttribute("data-lang") === "es" ? "en" : "es");
  });

  /* ---- Theme (dark / light — follows the device until you choose) */
  var THEME_KEY = "opex-theme";
  var themeColor = document.querySelector('meta[name="theme-color"]');
  var darkMQ = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function activeTheme() {
    return storedTheme() || (darkMQ.matches ? "dark" : "light");
  }
  // Apply a theme WITHOUT saving it (used on load and when following the system).
  function applyTheme(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#0F1A2B" : "#F5F1E8");
    }
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label",
        theme === "dark" ? "Cambiar a modo claro / Switch to light mode"
                         : "Cambiar a modo oscuro / Switch to dark mode");
    });
  }

  applyTheme(activeTheme());

  // An explicit click is a deliberate choice — that one we remember.
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch (ex) {}
    applyTheme(next);
  });

  // Keep following the device while the visitor hasn't picked a theme themselves.
  function onSystemChange(e) {
    if (storedTheme()) return;
    applyTheme(e.matches ? "dark" : "light");
  }
  try { darkMQ.addEventListener("change", onSystemChange); }
  catch (e) { try { darkMQ.addListener(onSystemChange); } catch (ex) {} }

  /* ---- Header scroll state ------------------------------------ */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile menu -------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    var closeMenu = function () {
      toggle.classList.remove("is-open");
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    };
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
    // keep keyboard focus cycling between the toggle and the open menu
    window.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !menu.classList.contains("is-open")) return;
      var items = [toggle].concat(
        Array.prototype.slice.call(menu.querySelectorAll("a, button")));
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  /* ---- Reveal on scroll (restrained) -------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal], [data-flow-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-revealed"); });
  }

  /* ---- Contact form (Web3Forms) ------------------------------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var successBox = document.querySelector(".form-success");
    var errorBox = document.querySelector(".form-error");

    var showSuccess = function () {
      if (errorBox) errorBox.classList.remove("is-visible");
      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.querySelectorAll("input, textarea, button").forEach(function (el) {
        if (el.type !== "button") el.setAttribute("disabled", "true");
      });
    };
    var showError = function () {
      if (errorBox) {
        errorBox.classList.add("is-visible");
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var keyField = form.querySelector('[name="access_key"]');
      var key = keyField ? keyField.value : "";
      // Access key not configured yet — show the error box (it points to the
      // direct email address) instead of sending a request that must fail.
      if (!key || key.indexOf("PASTE_YOUR") === 0) {
        showError();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.setAttribute("disabled", "true");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.success) showSuccess();
          else { showError(); if (btn) btn.removeAttribute("disabled"); }
        })
        .catch(function () {
          showError(); if (btn) btn.removeAttribute("disabled");
        });
    });
  }

  /* ---- Footer year -------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
