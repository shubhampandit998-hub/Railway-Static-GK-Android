/* Next-click focus mode: hide answer options only; preserve question, navigation,
   explanation, existing corner Save control, exam tags, and all other quiz content/data. */
(function () {
  "use strict";
  var hiddenStyle = [
    ".rsgk-options-hidden .option,",
    ".rsgk-options-hidden .options,",
    ".rsgk-options-hidden .answer-option,",
    ".rsgk-options-hidden .choice,",
    ".rsgk-options-hidden .option-item,",
    ".rsgk-options-hidden .answer-choice,",
    ".rsgk-options-hidden [class~='option'],",
    ".rsgk-options-hidden [class~='options'] { display:none !important; }"
  ].join("\n");
  var optionSelectors = [
    ".option", ".options", ".answer-option", ".choice",
    ".option-item", ".answer-choice", "[class~='option']", "[class~='options']"
  ].join(",");
  var styleId = "railwayOptionsFocusStyle";

  function installStyle() {
    if (document.getElementById(styleId)) return;
    var style = document.createElement("style");
    style.id = styleId;
    style.textContent = hiddenStyle;
    (document.head || document.documentElement).appendChild(style);
  }

  function hideOptions() {
    installStyle();
    var question = document.querySelector(".question, #question, .q, [id*='question' i]");
    if (question) {
      question.classList.add("rsgk-options-hidden");
      Array.from(question.querySelectorAll(optionSelectors)).forEach(function (el) {
        el.style.setProperty("display", "none", "important");
        el.setAttribute("aria-hidden", "true");
      });
      return;
    }
    Array.from(document.querySelectorAll(optionSelectors)).forEach(function (el) {
      el.style.setProperty("display", "none", "important");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function restoreOptionsForPrevious() {
    var question = document.querySelector(".question, #question, .q, [id*='question' i]");
    if (!question) return;
    question.classList.remove("rsgk-options-hidden");
    Array.from(question.querySelectorAll(optionSelectors)).forEach(function (el) {
      el.style.removeProperty("display");
      el.removeAttribute("aria-hidden");
    });
  }

  document.addEventListener("click", function (event) {
    var control = event.target && event.target.closest
      ? event.target.closest("button, a, [role='button'], input[type='button'], input[type='submit']")
      : null;
    if (!control) return;
    var label = (control.innerText || control.value || control.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
    if (/^next\b/i.test(label)) {
      hideOptions();
      window.setTimeout(hideOptions, 0);
      window.setTimeout(hideOptions, 80);
    } else if (/^(previous|prev)\b/i.test(label)) {
      restoreOptionsForPrevious();
    }
  }, true);
})();