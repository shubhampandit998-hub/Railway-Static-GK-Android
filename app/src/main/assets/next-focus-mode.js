/* Keep the existing Save/Bookmark control visible across question renders.
   Do not modify MCQ click handlers, answer evaluation, or quiz data. */
(function () {
  "use strict";

  var saveSelector = "button, a, [role='button'], input[type='button'], input[type='submit']";

  function labelOf(el) {
    return (el.innerText || el.value || el.getAttribute("aria-label") ||
      el.getAttribute("title") || el.getAttribute("data-title") || "").replace(/\s+/g, " ").trim();
  }

  function ensureSaveVisible() {
    document.querySelectorAll(saveSelector).forEach(function (el) {
      var label = labelOf(el);
      var isSave = /save|saved|bookmark|favourite|favorite|☆|★|⭐|\*/i.test(label);
      if (!isSave) return;
      el.hidden = false;
      el.removeAttribute("hidden");
      el.removeAttribute("aria-hidden");
      el.style.setProperty("display", "inline-flex", "important");
      el.style.setProperty("visibility", "visible", "important");
      el.style.setProperty("opacity", "1", "important");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureSaveVisible);
  } else {
    ensureSaveVisible();
  }

  /* Re-apply visibility when the app redraws the question or attempting panel. */
  var observer = new MutationObserver(ensureSaveVisible);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "style", "aria-hidden"] });
})();