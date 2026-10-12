/* Keeps the existing quiz UI intact and adds a Save control to the Attempting panel. */
(function () {
  "use strict";
  var panelSelectors = "#panel, .attempting-panel, .attempting-section, [id*='attempting' i], [class*='attempting' i]";

  function findAttemptPanel() {
    var candidates = Array.from(document.querySelectorAll(panelSelectors)).filter(function (el) {
      return el !== document.body && (el.innerText || "").length < 5000;
    });
    candidates.sort(function (a, b) {
      return (a.innerText || "").length - (b.innerText || "").length;
    });
    return candidates[0] || null;
  }

  function addSaveButton() {
    var panel = findAttemptPanel();
    if (!panel || panel.querySelector("#attemptingPanelSaveButton")) return;
    var button = document.createElement("button");
    button.id = "attemptingPanelSaveButton";
    button.type = "button";
    button.textContent = "Save";
    button.setAttribute("aria-label", "Save attempting panel progress");
    button.style.margin = "8px 4px";

    var status = document.createElement("span");
    status.id = "attemptingPanelSaveStatus";
    status.setAttribute("role", "status");
    status.style.margin = "4px";

    button.addEventListener("click", function () {
      var question = document.querySelector(".q, [id*='question' i], .question");
      var payload = {
        savedAt: new Date().toISOString(),
        question: question ? (question.innerText || "").trim() : "",
        attemptingPanel: (panel.innerText || "").trim(),
        url: location.pathname
      };
      try {
        localStorage.setItem("railwayStaticGK.attemptingPanelSave", JSON.stringify(payload));
        status.textContent = "Saved";
        button.textContent = "Saved";
      } catch (e) {
        status.textContent = "Save failed";
      }
    });

    panel.appendChild(button);
    panel.appendChild(status);
  }

  // Do not hide or rewrite any quiz content: question, options, explanations,
  // exam tags, and existing Previous/Next behavior remain unchanged.
  if (document.readyState === "complete") {
    addSaveButton();
  } else {
    window.addEventListener("load", addSaveButton, { once: true });
  }
})();