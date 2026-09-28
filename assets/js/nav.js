/* Two jobs, no library.

   1. The mobile menu.
   2. Shading the tab for whichever section is being read.

   Roger, 2026-09-16: "the top tab/buttons are not connected to the scroll,
   making it difficult to know where you stand on the site... if a person
   scrolls down to the next section, automatically move the shade on the top
   menu to the correct section to match."                                   */
(function () {
  "use strict";

  /* ---------- 1. Mobile menu ---------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".mobile-nav");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.getAttribute("data-open") === "true";
      panel.setAttribute("data-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        panel.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    /* Tapping a link on a phone should close the menu, not leave it open
       over the section it just jumped to. */
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        panel.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- 2. Which section am I looking at? --------------------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll("[data-section], .mobile-nav a[href*='#']")
  );
  var sections = Array.prototype.slice.call(
    document.querySelectorAll(".section--anchor[id]")
  );
  if (!links.length || !sections.length) return;

  function idFor(link) {
    var d = link.getAttribute("data-section");
    if (d) return d;
    var href = link.getAttribute("href") || "";
    return href.indexOf("#") > -1 ? href.split("#").pop() : "";
  }

  var current = "";

  function shade(id) {
    if (id === current) return;
    current = id;
    links.forEach(function (link) {
      if (idFor(link) === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  /* The section whose top edge is nearest above the reading line wins. The
     reading line sits a third of the way down, which is where the eye
     actually is — not at the very top of the window. */
  function update() {
    var line = window.scrollY + window.innerHeight * 0.33;
    var found = sections[0].id;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= line) found = sections[i].id;
    }
    /* At the very bottom of the page the last section may be too short to
       ever cross the line. Give it to the last one. */
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      found = sections[sections.length - 1].id;
    }
    shade(found);
  }

  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      update();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("hashchange", onScroll);
  update();

  /* ---------- 3. The detail sheet ----------------------------------- */
  /* A native dialog, so Escape closes it and focus is handled for us. */
  document.querySelectorAll("[data-opens]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var d = document.getElementById(btn.getAttribute("data-opens"));
      if (d && typeof d.showModal === "function") d.showModal();
      else if (d) d.setAttribute("open", "");
    });
  });
  document.querySelectorAll("[data-closes]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var d = document.getElementById(btn.getAttribute("data-closes"));
      if (d && typeof d.close === "function") d.close();
      else if (d) d.removeAttribute("open");
    });
  });
  /* Clicking the backdrop closes it too. */
  document.querySelectorAll("dialog.sheet").forEach(function (d) {
    d.addEventListener("click", function (e) {
      if (e.target === d) d.close();
    });
  });
})();
