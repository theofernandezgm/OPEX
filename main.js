(function () {
  "use strict";

  var root = document.documentElement;
  var LANG_KEY = "opex-lang";
  var LANGS = ["es", "en"];
  var DEFAULT_LANG = "es";

  /* Language: a choice made with the toggle (localStorage) wins; otherwise the
     first of the browser's preferred languages that is ES or EN; otherwise ES.
     The inline <head> script applies the same rule before first paint. */

  function detectLang() {
    var prefs = navigator.languages || [navigator.language];
    for (var i = 0; i < prefs.length; i++) {
      var primary = String(prefs[i]).slice(0, 2).toLowerCase();
      if (LANGS.indexOf(primary) !== -1) return primary;
    }
    return DEFAULT_LANG;
  }

  function getLang() {
    var stored = null;
    try { stored = localStorage.getItem(LANG_KEY); } catch (e) {}
    return LANGS.indexOf(stored) !== -1 ? stored : detectLang();
  }

  function applyLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    var toggles = document.querySelectorAll("[data-lang-toggle]");
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].textContent = lang === "es" ? "EN" : "ES";
      toggles[i].setAttribute("aria-label", lang === "es" ? "Switch to English" : "Cambiar a español");
    }
    var fields = document.querySelectorAll("[data-ph-es]");
    for (var j = 0; j < fields.length; j++) {
      var v = fields[j].getAttribute("data-ph-" + lang);
      if (v !== null) fields[j].setAttribute("placeholder", v);
    }
  }

  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyLang(lang);
  }

  applyLang(getLang());

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-lang-toggle]");
    if (!t) return;
    setLang(root.getAttribute("data-lang") === "es" ? "en" : "es");
  });

  /* Mobile navigation */

  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".mobile-nav");

  if (toggle && menu) {
    function closeMenu() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    var links = menu.querySelectorAll("a");
    for (var k = 0; k < links.length; k++) {
      links[k].addEventListener("click", closeMenu);
    }

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  /* Contact form (Web3Forms) */

  var form = document.querySelector("[data-contact-form]");

  if (form) {
    var successBox = document.querySelector(".form__message--success");
    var errorBox = document.querySelector(".form__message--error");

    function showSuccess() {
      if (errorBox) errorBox.classList.remove("is-visible");
      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.scrollIntoView({ block: "center" });
      }
      var controls = form.querySelectorAll("input, textarea, button");
      for (var i = 0; i < controls.length; i++) {
        controls[i].setAttribute("disabled", "true");
      }
    }

    function showError() {
      if (errorBox) {
        errorBox.classList.add("is-visible");
        errorBox.scrollIntoView({ block: "center" });
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var keyField = form.querySelector('[name="access_key"]');
      var key = keyField ? keyField.value : "";
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
          showError();
          if (btn) btn.removeAttribute("disabled");
        });
    });
  }

  /* Footer year */

  var years = document.querySelectorAll("[data-year]");
  for (var y = 0; y < years.length; y++) {
    years[y].textContent = new Date().getFullYear();
  }
})();
