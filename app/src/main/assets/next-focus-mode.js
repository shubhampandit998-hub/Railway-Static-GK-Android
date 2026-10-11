/* Focus mode activated by Next. Existing quiz scripts and data are untouched. */
(function () {
  "use strict";
  var controlPattern = /^(previous|prev|next|explanation|show|hide|show explanation|hide explanation|exam tag|show exam tag|hide exam tag)$/i;
  var panelSelectors = "#panel, .attempting-panel, .attempting-section, [id*='attempting' i], [class*='attempting' i]";
  function isKeptControl(el) {
    if (!el || !el.matches) return false;
    if (el.matches("button, a, [role='button'], input[type='button'], input[type='submit']")) {
      var label = (el.innerText || el.value || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      return controlPattern.test(label) || /^(previous|prev|next|explanation|exam tag)\b/i.test(label);
    }
    return false;
  }
  function isAttemptPanel(el) {
    if (!el || !el.matches) return false;
    if (el.matches(panelSelectors)) return true;
    var txt = (el.innerText || "").replace(/\s+/g, " ").trim();
    return txt.length < 500 && /attempting/i.test(txt) && /\d/.test(txt);
  }
  function enterFocusMode() {
    var root = document.body;
    if (!root) return;
    var keep = new Set();
    function keepWithAncestors(el) {
      for (var n = el; n && n !== root.parentElement; n = n.parentElement) {
        keep.add(n);
        if (n === root) break;
      }
    }
    Array.from(root.querySelectorAll("*")).forEach(function (el) {
      if (isAttemptPanel(el) || isKeptControl(el)) keepWithAncestors(el);
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
  document.addEventListener("click", function (event) {
    var el = event.target && event.target.closest
      ? event.target.closest("button, a, [role='button'], input[type='button'], input[type='submit']")
      : null;
    if (!el) return;
    var label = (el.innerText || el.value || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
    if (/^next\b/i.test(label)) {
      window.setTimeout(enterFocusMode, 0);
    }
  }, true);
})();