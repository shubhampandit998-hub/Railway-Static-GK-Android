/* Hide options after the quiz's own Next handler renders the next question.
   Do not alter quiz data, explanations, navigation, or existing Save controls. */
(function () {
  "use strict";

  var optionSelector = "#main label.option, #main .option, #main .options, #main .answer-option, #main .choice, #main .option-item, #main .answer-choice, #main [class~='option'], #main [class~='options']";

  function hideOptions() {
    document.querySelectorAll(optionSelector).forEach(function (el) {
      el.style.setProperty("display", "none", "important");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function restoreOptions() {
    document.querySelectorAll(optionSelector).forEach(function (el) {
      el.style.removeProperty("display");
      el.removeAttribute("aria-hidden");
    });
  }

  function labelOf(el) {
    return (el.innerText || el.value || el.getAttribute("aria-label") ||
      el.getAttribute("title") || "").replace(/\s+/g, " ").trim();
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;

    /* Only act on navigation buttons inside the question's own navigation row.
       Answer options and other buttons cannot activate this behavior. */
    var nav = target.closest("#main .question-nav");
    if (!nav) return;
    var button = target.closest("button");
    if (!button) return;
    var label = labelOf(button);

    if (/^next\b/i.test(label)) {
      /* The inline nextQuestion() handler updates #main after this listener.
         Delayed passes apply to the newly rendered options, not the old ones. */
      window.setTimeout(hideOptions, 0);
      window.setTimeout(hideOptions, 60);
      window.setTimeout(hideOptions, 180);
    } else if (/^(?:←\s*)?(?:previous|prev)\b/i.test(label)) {
      window.setTimeout(restoreOptions, 0);
      window.setTimeout(restoreOptions, 80);
    }
  }, true);
})();