/* Focus mode for Next/Previous; avoids repeated whole-page scans on startup. */
(function () {
  "use strict";
  var controlPattern = /^(previous|prev|next|explanation|show|hide|show explanation|hide explanation|exam tag|show exam tag|hide exam tag|save|saved)$/i;
  var panelSelectors = "#panel, .attempting-panel, .attempting-section, [id*='attempting' i], [class*='attempting' i]";
  var hiddenStyle = '[data-next-focus-hidden="1"]{display:none!important}body.next-focus-mode{padding-top:8px}';

  function labelOf(el) {
    return (el.innerText || el.value || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
  }
  function isKeptControl(el) {
    if (!el || !el.matches || !el.matches("button, a, [role='button'], input[type='button'], input[type='submit']")) return false;
    var label = labelOf(el);
    return controlPattern.test(label) || /^(previous|prev|next|explanation|exam tag|save)\b/i.test(label);
  }
  function keepWithAncestors(el, keep, root) {
    for (var n = el; n && n !== root.parentElement; n = n.parentElement) {
      keep.add(n);
      if (n === root) break;
    }
  }
  function enterFocusMode() {
    var root = document.body;
    if (!root) return;
    var style = document.getElementById("nextFocusModeStyle");
    if (!style) {
      style = document.createElement("style");
      style.id = "nextFocusModeStyle";
      style.textContent = hiddenStyle;
      document.head.appendChild(style);
    }
    var keep = new Set();
    Array.from(root.querySelectorAll("button, a, [role='button'], input[type='button'], input[type='submit'], .explanation-box, [id*='explanation' i], [class*='explanation' i], " + panelSelectors))
      .forEach(function (el) {
        if (isKeptControl(el) || el.matches(panelSelectors) ||
            el.matches(".explanation-box, [id*='explanation' i], [class*='explanation' i]")) {
          keepWithAncestors(el, keep, root);
        }
      });
    if (!keep.size) return;
    root.classList.add("next-focus-mode");
    function prune(parent) {
      Array.from(parent.children).forEach(function (child) {
        if (!keep.has(child)) {
          child.setAttribute("data-next-focus-hidden", "1");
          child.setAttribute("aria-hidden", "true");
        } else {
          child.removeAttribute("data-next-focus-hidden");
          child.removeAttribute("aria-hidden");
          prune(child);
        }
      });
    }
    prune(root);
  }

  function findAttemptPanel() {
    var candidates = Array.from(document.querySelectorAll(panelSelectors)).filter(function (el) {
      return el !== document.body && (el.innerText || "").length < 5000;
    });
    candidates.sort(function (a, b) { return (a.innerText || "").length - (b.innerText || "").length; });
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

  document.addEventListener("click", function (event) {
    var el = event.target && event.target.closest
      ? event.target.closest("button, a, [role='button'], input[type='button'], input[type='submit']")
      : null;
    if (!el) return;
    var label = labelOf(el);
    if (/^(next|previous|prev)\b/i.test(label)) {
      window.setTimeout(enterFocusMode, 0);
      window.setTimeout(addSaveButton, 50);
    }
  }, true);

  // Do not scan the entire quiz DOM during startup; add the button after page load.
  window.addEventListener("load", addSaveButton, { once: true });
})();