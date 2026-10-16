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

    /* Attributes/content the visible-span toggle doesn't reach: <title>,
       meta description, og:title/og:description, aria-labels, alt text,
       hidden form values. Each element carries the ES/EN text as
       data-i18n-es/-en; data-i18n-attr names the attribute to set
       ("content", "aria-label", "alt", "value"); with no data-i18n-attr,
       <title> gets document.title and anything else gets textContent. */
    var i18nEls = document.querySelectorAll("[data-i18n-en]");
    for (var m = 0; m < i18nEls.length; m++) {
      var el = i18nEls[m];
      var val = el.getAttribute("data-i18n-" + lang);
      if (val === null) continue;
      var attr = el.getAttribute("data-i18n-attr");
      if (attr === "content" || attr === "aria-label" || attr === "alt") {
        el.setAttribute(attr, val);
      } else if (attr === "value") {
        el.value = val;
      } else if (el.tagName === "TITLE") {
        document.title = val;
      } else {
        el.textContent = val;
      }
    }
  }

  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyLang(lang);
  }

  /* Only the bilingual 404 page opts in (it ships <html data-lang>). Every other
     page is a single-language URL (ES at the root, EN under /en/) and must keep
     the lang attribute and placeholders it was served with. */
  var bilingual = root.hasAttribute("data-lang");
  if (bilingual) applyLang(getLang());

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-lang-toggle]");
    if (!t || !bilingual) return;
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
      var controls = form.querySelectorAll("input, select, textarea, button");
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
      if (!key) {
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

    /* Non-JS or failed-fetch submissions post straight to Web3Forms, which
       redirects back to the "redirect" hidden field's URL. Show the same
       success state when that lands here. */
    if (/[?&]enviado=1(&|$)/.test(window.location.search)) {
      showSuccess();
    }
  }

  /* Footer year */

  var years = document.querySelectorAll("[data-year]");
  for (var y = 0; y < years.length; y++) {
    years[y].textContent = new Date().getFullYear();
  }
})();

/* 2026-10-16 refresh: parallax photos, see-through header, rotating headline,
   Método scroll line, Servicios rail, console note, blueprint mode (Konami).
   CSP-safe: no inline styles; only CSSOM properties and classes. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var body = document.body;
  doc.classList.add("js");

  var isEn = (doc.getAttribute("lang") || "es").slice(0, 2) === "en";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  function reduced() { return !!(reduce && reduce.matches); }

  /* Parallax photos */
  var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));

  function parallaxOn() {
    return !reduced() && window.innerWidth >= 768;
  }

  function updateParallax(vh) {
    var on = parallaxOn();
    for (var i = 0; i < layers.length; i++) {
      var img = layers[i];
      var box = img.parentNode.getBoundingClientRect();
      if (!on) { img.style.transform = ""; continue; }
      if (box.bottom < -200 || box.top > vh + 200) continue;
      var offset = (box.top + box.height / 2) - vh / 2;
      img.style.transform = "translate3d(0," + (offset * -0.22).toFixed(1) + "px,0)";
    }
  }

  /* See-through header */
  var header = document.querySelector(".site-header");
  var photoTop = body.classList.contains("photo-top");
  var mobileMenu = document.querySelector(".mobile-nav");

  function updateHeader() {
    if (!header || !photoTop) return;
    var open = mobileMenu && mobileMenu.classList.contains("is-open");
    header.classList.toggle("is-solid", open || window.pageYOffset > 40);
  }

  if (mobileMenu && photoTop) {
    var toggleBtn = document.querySelector(".menu-toggle");
    if (toggleBtn) toggleBtn.addEventListener("click", function () { setTimeout(updateHeader, 0); });
  }

  /* Método: line down the phases */
  var phaseList = document.querySelector(".phases--track");
  var phaseItems = [], phaseNums = [], track = null, fill = null;

  if (phaseList) {
    phaseItems = Array.prototype.slice.call(phaseList.querySelectorAll(".phase"));
    for (var p = 0; p < phaseItems.length; p++) {
      phaseNums.push(phaseItems[p].querySelector(".phase__number"));
    }
    track = document.createElement("div");
    track.className = "phases__track";
    track.setAttribute("aria-hidden", "true");
    fill = document.createElement("div");
    fill.className = "phases__fill";
    track.appendChild(fill);
    phaseList.appendChild(track);
  }

  function centerY(el, rootTop) {
    var r = el.getBoundingClientRect();
    return r.top + r.height / 2 - rootTop;
  }

  function updatePhases(vh) {
    if (!phaseList || !phaseNums.length) return;
    var listTop = phaseList.getBoundingClientRect().top;
    var first = centerY(phaseNums[0], listTop);
    var last = centerY(phaseNums[phaseNums.length - 1], listTop);
    var numLeft = phaseNums[0].getBoundingClientRect().left - phaseList.getBoundingClientRect().left;
    track.style.top = first + "px";
    track.style.height = Math.max(0, last - first) + "px";
    track.style.left = (numLeft + phaseNums[0].offsetWidth / 2 - 1) + "px";

    var anchor = vh * 0.6 - listTop;
    var progress = (anchor - first) / Math.max(1, last - first);
    progress = Math.max(0, Math.min(1, progress));
    fill.style.transform = "scaleY(" + progress.toFixed(4) + ")";
    for (var i = 0; i < phaseItems.length; i++) {
      phaseItems[i].classList.toggle("is-reached", centerY(phaseNums[i], listTop) <= anchor + 1);
    }
  }

  /* Servicios: rail that follows the sections */
  var rail = document.querySelector(".section-rail");
  var railItems = [], railTargets = [];

  if (rail) {
    var links = rail.querySelectorAll("a[href^='#']");
    for (var r = 0; r < links.length; r++) {
      var t = document.getElementById(links[r].getAttribute("href").slice(1));
      if (t) { railItems.push(links[r].parentNode); railTargets.push(t); }
    }
  }

  function updateRail(vh) {
    if (!rail || !railTargets.length) return;
    var line = vh * 0.4, current = -1;
    for (var i = 0; i < railTargets.length; i++) {
      if (railTargets[i].getBoundingClientRect().top <= line) current = i;
    }
    var lastBox = railTargets[railTargets.length - 1].getBoundingClientRect();
    var visible = railTargets[0].getBoundingClientRect().top < vh * 0.7 && lastBox.bottom > vh * 0.3;
    rail.classList.toggle("is-visible", visible);
    for (var j = 0; j < railItems.length; j++) {
      railItems[j].classList.toggle("is-current", j === current);
      railItems[j].classList.toggle("is-done", j < current);
      var a = railItems[j].querySelector("a");
      if (j === current) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    }
  }

  /* One scroll loop for all of the above */
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight || doc.clientHeight;
    updateParallax(vh);
    updateHeader();
    updatePhases(vh);
    updateRail(vh);
  }
  function request() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  window.addEventListener("load", request);
  if (reduce && reduce.addEventListener) reduce.addEventListener("change", request);
  frame();

  /* Rotating headline: "Digitalizamos y automatizamos" + one phrase at a time.
     Screen readers and search engines keep the original sentence. Stops after
     two rounds, pauses on hover, and does not rotate with reduced motion. */
  var rot = document.querySelector("[data-rotator]");
  if (rot && !reduced()) {
    var h1 = rot.closest("h1");
    var words = [rot.textContent.trim()].concat((rot.getAttribute("data-words") || "").split("|").filter(Boolean));
    if (h1 && words.length > 1) {
      var sr = document.createElement("span");
      sr.className = "visually-hidden";
      sr.textContent = h1.textContent.replace(/\s+/g, " ").trim();
      var visual = document.createElement("span");
      visual.setAttribute("aria-hidden", "true");
      while (h1.firstChild) visual.appendChild(h1.firstChild);
      h1.appendChild(sr);
      h1.appendChild(visual);

      rot.textContent = "";
      rot.classList.add("rotator");
      var spans = words.map(function (w, i) {
        var s = document.createElement("span");
        s.className = "rotator__word" + (i === 0 ? " is-active" : "");
        s.textContent = w;
        rot.appendChild(s);
        return s;
      });
      var idx = 0, steps = 0, paused = false, maxSteps = words.length * 2;
      h1.addEventListener("mouseenter", function () { paused = true; });
      h1.addEventListener("mouseleave", function () { paused = false; });
      var timer = setInterval(function () {
        if (paused || document.hidden) return;
        spans[idx].classList.remove("is-active");
        idx = (idx + 1) % spans.length;
        spans[idx].classList.add("is-active");
        steps++;
        if (steps >= maxSteps) clearInterval(timer);
      }, 2600);
    }
  }

  /* Console note for anyone reading the code */
  try {
    console.log("%cOPEX", "font: 600 26px 'IBM Plex Sans', Helvetica, Arial, sans-serif; color: #0f2a47; letter-spacing: .06em");
    console.log(
      "%c" + (isEn
        ? "Reading the source? So do we.\nIf you'd like us to look at your company's: info.opex@opexxai.info\n(Hint: ↑ ↑ ↓ ↓ ← → ← → B A)"
        : "¿Lees el código? Nosotros también.\nSi quieres que revisemos el de tu empresa: info.opex@opexxai.info\n(Pista: ↑ ↑ ↓ ↓ ← → ← → B A)"),
      "font: 14px 'IBM Plex Sans', Helvetica, Arial, sans-serif; color: #174a80; line-height: 1.5"
    );
  } catch (e) {}

  /* Blueprint mode: ↑ ↑ ↓ ↓ ← → ← → B A */
  var code = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  var pos = 0, note = null;

  function blueprintOff() {
    doc.classList.remove("blueprint");
    if (note && note.parentNode) note.parentNode.removeChild(note);
    note = null;
  }

  function blueprintOn() {
    doc.classList.add("blueprint");
    note = document.createElement("div");
    note.className = "blueprint-note";
    note.setAttribute("role", "status");
    var text = document.createElement("span");
    text.textContent = isEn
      ? "Blueprint mode. This is how we see your company before we build."
      : "Modo plano. Así vemos tu empresa antes de construir.";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = isEn ? "Exit" : "Salir";
    btn.addEventListener("click", blueprintOff);
    note.appendChild(text);
    note.appendChild(btn);
    body.appendChild(note);
  }

  document.addEventListener("keydown", function (e) {
    var tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target && e.target.isContentEditable)) return;
    var k = (e.key || "").toLowerCase();
    if (k === "escape" && doc.classList.contains("blueprint")) { blueprintOff(); return; }
    if (k === code[pos]) {
      pos++;
      if (pos === code.length) {
        pos = 0;
        if (doc.classList.contains("blueprint")) blueprintOff(); else blueprintOn();
      }
    } else {
      pos = k === code[0] ? 1 : 0;
    }
  });
})();
