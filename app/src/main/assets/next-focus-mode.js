/* Keep existing Save/Bookmark control visible and prevent option taps from
   accidentally triggering navigation. Quiz data and answer evaluation stay intact. */
(function () {
  "use strict";

  var optionSelector = "#main label.option, #main .option, #main .answer-option, #main .choice, #main .option-item, #main .answer-choice, #main [class~='option']";
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

  function preventAccidentalAutoSkip(event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var option = target.closest(optionSelector);
    if (!option) return;

    /* Stop propagation beyond the option container only; allow the option's own
       click handler and default radio/checkbox behavior to execute. */
    event.stopPropagation();
  }

  document.addEventListener("click", preventAccidentalAutoSkip, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureSaveVisible);
  } else {
    ensureSaveVisible();
  }

  /* Keep the original Save control visible after each question/panel render. */
  var observer = new MutationObserver(ensureSaveVisible);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "style", "aria-hidden"] });
})();