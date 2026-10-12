/* Keep the existing Saved Questions / Save control visible across all quiz screens.
   Preserve its original click action and all quiz data and answer logic. */
(function () {
  "use strict";

  var controls = "button, a, [role='button'], input[type='button'], input[type='submit']";
  var saveWords = /saved?\s*questions?|bookmark|favourites?|favorites?/i;

  function textOf(el) {
    return [
      el.innerText,
      el.value,
      el.getAttribute("aria-label"),
      el.getAttribute("title"),
      el.getAttribute("data-title"),
      el.id,
      typeof el.className === "string" ? el.className : ""
    ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }

  function isSavedControl(el) {
    var text = textOf(el);
    if (saveWords.test(text)) return true;
    /* Also recognize a star-only save control, but not arbitrary buttons. */
    return /(?:^|\s)(?:\*|☆|★|⭐)(?:\s|$)/.test(text) &&
      /save|saved|bookmark|question/i.test(text);
  }

  function setIfDifferent(el, prop, value) {
    if (el.style.getPropertyValue(prop) !== value) {
      el.style.setProperty(prop, value, "important");
    }
  }

  function ensureSavedControlVisible() {
    document.querySelectorAll(controls).forEach(function (el) {
      if (!isSavedControl(el)) return;

      el.hidden = false;
      el.removeAttribute("hidden");
      el.removeAttribute("aria-hidden");
      setIfDifferent(el, "display", "inline-flex");
      setIfDifferent(el, "visibility", "visible");
      setIfDifferent(el, "opacity", "1");

      /* If a surrounding wrapper itself is hidden, reveal that wrapper too. */
      var parent = el.parentElement;
      var depth = 0;
      while (parent && parent !== document.body && depth < 5) {
        if (parent.hidden || parent.hasAttribute("hidden") ||
            parent.getAttribute("aria-hidden") === "true" ||
            getComputedStyle(parent).display === "none" ||
            getComputedStyle(parent).visibility === "hidden") {
          parent.hidden = false;
          parent.removeAttribute("hidden");
          parent.removeAttribute("aria-hidden");
          if (getComputedStyle(parent).display === "none") {
            setIfDifferent(parent, "display", "block");
          }
          if (getComputedStyle(parent).visibility === "hidden") {
            setIfDifferent(parent, "visibility", "visible");
          }
        }
        parent = parent.parentElement;
        depth++;
      }
    });
  }

  function scheduleCheck() {
    ensureSavedControlVisible();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleCheck);
  } else {
    scheduleCheck();
  }

  /* Disable automatic question advance after an answer is selected.
     Manual Previous/Next controls remain available. */
  var answerClickAt = 0;
  var wrappedFunctions = new WeakSet();

  function wrapAdvanceFunctions() {
    Object.keys(window).forEach(function (name) {
      if (!/next|advance|loadquestion|showquestion|gotoquestion|movequestion/i.test(name)) return;
      var fn;
      try { fn = window[name]; } catch (e) { return; }
      if (typeof fn !== "function" || wrappedFunctions.has(fn)) return;

      var wrapped = function () {
        if (Date.now() - answerClickAt < 500) return;
        return fn.apply(this, arguments);
      };
      try {
        window[name] = wrapped;
        wrappedFunctions.add(wrapped);
      } catch (e) {}
    });
  }

  document.addEventListener("click", function (event) {
    var target = event.target && event.target.closest
      ? event.target.closest(".option, [class*='option'], [data-option], label")
      : null;
    if (!target) return;
    answerClickAt = Date.now();
    wrapAdvanceFunctions();
  }, true);

  /* Some quiz scripts define navigation functions after page load. */
  wrapAdvanceFunctions();
  var functionWatcher = new MutationObserver(wrapAdvanceFunctions);
  functionWatcher.observe(document.documentElement, { childList: true, subtree: true });

  /* Re-check after quiz navigation or any panel re-render. */
  var observer = new MutationObserver(scheduleCheck);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "style", "aria-hidden", "class"]
  });
})();