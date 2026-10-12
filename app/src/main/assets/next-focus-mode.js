/* UI-only improvements: show the user's selected MCQ option and place an existing
   Saved Questions navigation control in the question attempting panel when present.
   Do not change question data, answers, scoring, or existing control behavior. */
(function () {
  "use strict";

  var selectedClass = "rsgk-option-selected";
  var optionSelector = "#main label.option, #main .option, #main .answer-option, #main .choice, #main .option-item, #main .answer-choice, #main [class~='option']";

  function markSelectedOption(event) {
    var option = event.target && event.target.closest ? event.target.closest(optionSelector) : null;
    if (!option) return;

    var root = option.closest("#main");
    if (!root) return;

    /* Only visually mark the tapped choice; leave the quiz's own answer logic intact. */
    root.querySelectorAll(optionSelector + "." + selectedClass).forEach(function (el) {
      el.classList.remove(selectedClass);
    });
    option.classList.add(selectedClass);
  }

  function moveSavedQuestionsControl() {
    var nav = document.querySelector("#main .question-nav, #main .attempting-panel, #main #attemptingPanel, #main .attempting");
    if (!nav) return;

    var candidates = Array.from(document.querySelectorAll("button, a, [role='button']"));
    var savedControl = candidates.find(function (el) {
      if (nav.contains(el)) return false;
      var label = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "")
        .replace(/\s+/g, " ").trim();
      return /^(?:saved questions|saved question|view saved questions|my saved questions)$/i.test(label);
    });

    /* Move the existing control instead of creating a duplicate, preserving its listeners. */
    if (savedControl) nav.appendChild(savedControl);
  }

  document.addEventListener("click", markSelectedOption, true);
  document.addEventListener("change", function (event) {
    var input = event.target;
    if (!input || !input.matches || !input.matches("#main input[type='radio'], #main input[type='checkbox']")) return;
    var label = input.closest("label") || (input.id ? document.querySelector('label[for="' + input.id.replace(/"/g, '\\"') + '"]') : null);
    if (label) {
      var root = label.closest("#main");
      if (root) root.querySelectorAll(optionSelector + "." + selectedClass).forEach(function (el) { el.classList.remove(selectedClass); });
      label.classList.add(selectedClass);
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", moveSavedQuestionsControl);
  } else {
    moveSavedQuestionsControl();
  }
  /* The question panel is re-rendered during navigation, so re-check after UI updates. */
  var observer = new MutationObserver(function () { moveSavedQuestionsControl(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();