/* Next-button focus behavior. Quiz content/data and existing controls remain unchanged. */
(function () {
  "use strict";

  var optionSelectors = ".option, .options, .answer-option, .choice, .option-item, .answer-choice, [class~='option'], [class~='options']";
  var styleId = "railwayOptionsFocusStyle";

  function questionScope() {
    /* Actual quiz markup renders options as label.option inside the question .card. */
    return document.querySelector("#main .card") || document.querySelector("#main") || document;
  }

  function hideOptions() {
    var scope = questionScope();
    Array.from(scope.querySelectorAll(optionSelectors)).forEach(function (el) {
      el.style.setProperty("display", "none", "important");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function restoreOptions() {
    var scope = questionScope();
    Array.from(scope.querySelectorAll(optionSelectors)).forEach(function (el) {
      el.style.removeProperty("display");
      el.removeAttribute("aria-hidden");
    });
  }

  function handleNavigation(event) {
    var target = event.target;
    if (!target || !target.closest) return;

    /* Answer labels/radios must never trigger focus mode. */
    if (target.closest(".option, .option input, .answer-option, .choice, .option-item, .answer-choice")) return;

    var control = target.closest("button, a, [role='button'], input[type='button'], input[type='submit']");
    if (!control) return;
    var label = (control.innerText || control.value || control.getAttribute("aria-label") ||
      control.getAttribute("title") || "").replace(/\s+/g, " ").trim();

    /* Actual button text is "Next →" / "← Previous". */
    if (/^next\b/i.test(label)) {
      window.setTimeout(hideOptions, 0);
      window.setTimeout(hideOptions, 50);
      window.setTimeout(hideOptions, 150);
    } else if (/^(?:←\s*)?(?:previous|prev)\b/i.test(label) || /previous/i.test(label)) {
      window.setTimeout(restoreOptions, 0);
      window.setTimeout(restoreOptions, 80);
    }
  }

  document.addEventListener("click", handleNavigation, true);
  document.addEventListener("touchend", handleNavigation, { capture: true, passive: true });
})();