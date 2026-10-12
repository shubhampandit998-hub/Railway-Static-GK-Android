/* Hide answer options only when the actual Next control is activated.
   Keep quiz data and all existing controls unchanged. */
(function () {
  "use strict";

  var optionSelectors = [
    ".option", ".answer-option", ".choice", ".option-item",
    ".answer-choice", "[class~='option']"
  ].join(",");
  var optionContainerSelectors = [
    ".option", ".answer-option", ".choice", ".option-item",
    ".answer-choice", "[class~='option']"
  ].join(",");
  var allOptionSelectors = [
    optionSelectors, ".options", "[class~='options']"
  ].join(",");
  var styleId = "railwayOptionsFocusStyle";

  function getQuestionRoot() {
    return document.querySelector(".question, #question, .q, [id*='question' i]");
  }

  function installStyle() {
    if (document.getElementById(styleId)) return;
    var style = document.createElement("style");
    style.id = styleId;
    style.textContent =
      ".rsgk-options-hidden .option," +
      ".rsgk-options-hidden .options," +
      ".rsgk-options-hidden .answer-option," +
      ".rsgk-options-hidden .choice," +
      ".rsgk-options-hidden .option-item," +
      ".rsgk-options-hidden .answer-choice," +
      ".rsgk-options-hidden [class~='option']," +
      ".rsgk-options-hidden [class~='options'] { display:none !important; }";
    (document.head || document.documentElement).appendChild(style);
  }

  function hideOptions() {
    installStyle();
    var root = getQuestionRoot();
    var scope = root || document;
    if (root) root.classList.add("rsgk-options-hidden");
    Array.from(scope.querySelectorAll(allOptionSelectors)).forEach(function (el) {
      el.style.setProperty("display", "none", "important");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function restoreOptionsForPrevious() {
    var root = getQuestionRoot();
    var scope = root || document;
    if (root) root.classList.remove("rsgk-options-hidden");
    Array.from(scope.querySelectorAll(allOptionSelectors)).forEach(function (el) {
      el.style.removeProperty("display");
      el.removeAttribute("aria-hidden");
    });
  }

  function handleNavigation(event) {
    var target = event.target;
    if (!target || !target.closest) return;

    /* Never treat an answer choice as navigation, even if nested in a button. */
    if (target.closest(optionContainerSelectors)) return;

    var control = target.closest("button, a, [role='button'], input[type='button'], input[type='submit']");
    if (!control) return;

    var label = (control.innerText || control.value || control.getAttribute("aria-label") ||
      control.getAttribute("title") || "").replace(/\\s+/g, " ").trim();

    /* Exact labels only: do not activate from arbitrary text containing 'Next'. */
    if (/^next(?:\\s+question)?$/i.test(label)) {
      hideOptions();
      window.setTimeout(hideOptions, 0);
      window.setTimeout(hideOptions, 80);
    } else if (/^(?:previous|prev)(?:\\s+question)?$/i.test(label)) {
      restoreOptionsForPrevious();
    }
  }

  document.addEventListener("click", handleNavigation, true);
  /* Some WebViews dispatch touch events inconsistently; click remains supported. */
  document.addEventListener("touchend", function (event) {
    handleNavigation(event);
  }, { capture: true, passive: true });
})();