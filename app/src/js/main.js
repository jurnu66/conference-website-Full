(function () {
  "use strict";
  var doc = document;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile menu (drawer)
     - focus moves into the drawer when it opens and back to the button when it closes
     - the rest of the page is made inert so Tab stays inside the drawer */
  var toggle = doc.querySelector(".menu-toggle");
  var nav = doc.getElementById("site-nav");
  var drawerMode = window.matchMedia("(max-width: 1240px)");
  function focusables() {
    return Array.prototype.filter.call(
      nav.querySelectorAll("a[href], button:not([disabled])"),
      function (el) { return el.offsetParent !== null; }
    );
  }
  function setMenu(open, returnFocus) {
    if (!nav || !toggle) return;
    var wasOpen = nav.classList.contains("open");
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
    doc.body.style.overflow = open ? "hidden" : "";
    doc.querySelectorAll("main, footer, .topbar, .brand, .to-top, .skip-link").forEach(function (el) {
      if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert");
    });
    if (open && !wasOpen) {
      // wait for the drawer to become visible before moving focus
      setTimeout(function () { var f = focusables(); if (f.length) f[0].focus(); }, 60);
    } else if (!open && wasOpen && returnFocus) {
      toggle.focus();
    }
  }
  if (toggle) {
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open"), true); });
    nav.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !nav.classList.contains("open")) return;
      var f = focusables(), first = f[0], last = f[f.length - 1];
      if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); toggle.focus(); }
      else if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); toggle.focus(); }
    });
    toggle.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !nav.classList.contains("open")) return;
      var f = focusables();
      if (!f.length) return;
      e.preventDefault();
      (e.shiftKey ? f[f.length - 1] : f[0]).focus();
    });
    var onMode = function () { if (!drawerMode.matches) setMenu(false); };
    if (drawerMode.addEventListener) drawerMode.addEventListener("change", onMode);
  }

  /* Dropdowns
     - click/tap/Enter toggles .open (the source of truth)
     - hover also previews on desktop (CSS), but a click that closes the menu
       adds .no-hover so it really disappears until the mouse leaves
     - hovering another item closes any menu opened by click → never two at once
     - moving keyboard focus out of a menu closes it */
  var dropButtons = doc.querySelectorAll(".nav-item > button.nav-link");
  function closeDrops(except) {
    dropButtons.forEach(function (b) {
      if (b === except) return;
      b.parentElement.classList.remove("open");
      b.setAttribute("aria-expanded", "false");
    });
  }
  dropButtons.forEach(function (btn) {
    var item = btn.parentElement;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !item.classList.contains("open");
      closeDrops(btn);
      item.classList.toggle("open", open);
      item.classList.toggle("no-hover", !open);
      btn.setAttribute("aria-expanded", String(open));
    });
    item.addEventListener("mouseenter", function () { closeDrops(btn); });
    item.addEventListener("mouseleave", function () { item.classList.remove("no-hover"); });
    item.addEventListener("focusout", function (e) {
      if (e.relatedTarget && !item.contains(e.relatedTarget)) {
        item.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });
  doc.querySelectorAll(".nav-main > .nav-item").forEach(function (li) {
    if (!li.querySelector(".dropdown")) li.addEventListener("mouseenter", function () { closeDrops(); });
  });
  doc.addEventListener("click", function () { closeDrops(); });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openItem = doc.querySelector(".nav-item.open");
    closeDrops();
    if (openItem) openItem.querySelector("button").focus();
    else setMenu(false, true);
  });

  /* Tabs (program)
     - arrow keys, Home and End move between tabs
     - the chosen tab is kept in the URL (?tab=1) so a shared link opens the same tab */
  doc.querySelectorAll("[role=tablist]").forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[role=tab]"));
    function select(tab, focus, updateUrl) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = doc.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      if (updateUrl && window.history && history.replaceState) {
        var url = new URL(location.href);
        var i = tabs.indexOf(tab);
        if (i === 0) url.searchParams.delete("tab"); else url.searchParams.set("tab", String(i));
        history.replaceState(null, "", url);
      }
    }
    var start = parseInt(new URLSearchParams(location.search).get("tab"), 10);
    if (start > 0 && tabs[start]) select(tabs[start], false, false);
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false, true); });
      tab.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true, true); }
      });
    });
  });

  /* Header shadow + back-to-top */
  var toTop = doc.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY;
    doc.body.classList.toggle("scrolled", y > 36);
    if (toTop) toTop.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* Section nav highlight (home) */
  var links = doc.querySelectorAll(".section-nav a");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
        var a = map[en.target.id];
        if (a) {
          a.classList.add("active");
          a.setAttribute("aria-current", "true");
          // Scroll only the pill bar sideways. scrollIntoView() would also start a
          // (smooth) page scroll and cancel the user's own scrolling → visible jerk.
          var bar = a.closest("ul");
          if (bar && bar.scrollWidth > bar.clientWidth) {
            var left = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2;
            bar.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? "auto" : "smooth" });
          }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = doc.getElementById(id); if (s) spy.observe(s); });
  }
  links.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* Reveal on scroll */
  var reveals = doc.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
