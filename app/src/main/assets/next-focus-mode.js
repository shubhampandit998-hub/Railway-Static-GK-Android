/* Next-click focus mode: hide answer options only; preserve question, navigation,
   explanation, save, exam tags, and all other quiz content/data. */
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
    // Fallback only to explicitly named option elements, never hide the whole page.
    Array.from(document.querySelectorAll(optionSelectors)).forEach(function (el) {
      el.style.setProperty("display", "none", "important");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function restoreOptionsForNewQuestion() {
    var question = document.querySelector(".question, #question, .q, [id*='question' i]");
    if (!question) return;
    question.classList.remove("rsgk-options-hidden");
    Array.from(question.querySelectorAll(optionSelectors)).forEach(function (el) {
      el.style.removeProperty("display");
      el.removeAttribute("aria-hidden");
    });
  }

  function addSaveButton() {
    var selectors = "#panel, .attempting-panel, .attempting-section, [id*='attempting' i], [class*='attempting' i]";
    var panel = Array.from(document.querySelectorAll(selectors))
      .filter(function (el) { return el !== document.body && (el.innerText || "").length < 5000; })
      .sort(function (a, b) { return (a.innerText || "").length - (b.innerText || "").length; })[0];
    if (!panel || panel.querySelector("#attemptingPanelSaveButton")) return;
    var button = document.createElement("button");
    button.id = "attemptingPanelSaveButton";
    button.type = "button";
    button.textContent = "Save";
    button.style.margin = "8px 4px";
    var status = document.createElement("span");
    status.id = "attemptingPanelSaveStatus";
    status.setAttribute("role", "status");
    button.addEventListener("click", function () {
      try {
        var question = document.querySelector(".question, #question, .q, [id*='question' i]");
        localStorage.setItem("railwayStaticGK.attemptingPanelSave", JSON.stringify({
          savedAt: new Date().toISOString(),
          question: question ? (question.innerText || "").trim() : "",
          attemptingPanel: (panel.innerText || "").trim(),
          url: location.pathname
        }));
        button.textContent = "Saved";
        status.textContent = "Saved";
      } catch (e) { status.textContent = "Save failed"; }
    });
    panel.appendChild(button);
    panel.appendChild(status);
  }

  document.addEventListener("click", function (event) {
    var control = event.target && event.target.closest
      ? event.target.closest("button, a, [role='button'], input[type='button'], input[type='submit']")
      : null;
    if (!control) return;
    var label = (control.innerText || control.value || control.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
    if (/^next\b/i.test(label)) {
      // Hide currently rendered choices synchronously, then catch DOM updates by the quiz.
      hideOptions();
      window.setTimeout(hideOptions, 0);
      window.setTimeout(hideOptions, 80);
    } else if (/^(previous|prev)\b/i.test(label)) {
      // Previous returns to the earlier question with its options visible.
      restoreOptionsForNewQuestion();
    }
  }, true);

  window.addEventListener("load", function () {
    addSaveButton();
  }, { once: true });
})();