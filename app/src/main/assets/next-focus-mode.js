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

  /* Disable only the auto-advance timers created inside the quiz answer handler.
     The original answer handler still records answers, scores, and feedback.
     Manual Next/Previous buttons are not intercepted. */
  function disableAnswerAutoAdvance() {
    if (typeof window.answer !== "function" || window.answer.__manualNextOnly) return;

    var originalAnswer = window.answer;
    var wrappedAnswer = function () {
      var originalSetTimeout = window.setTimeout;

      window.setTimeout = function (callback, delay) {
        if (typeof callback === "function") {
          var source = Function.prototype.toString.call(callback);
          var advancesQuestion =
            /currentQuestion\s*(?:\+\+|=\s*currentQuestion\s*\+\s*1)/i.test(source) ||
            /(?:nextSet|nextQuestion|goToNextQuestion|advanceQuestion)\s*\(/i.test(source) ||
            /currentQuestion\s*\+\s*\+/.test(source);
          var rendersQuestionAfterAdvance =
            /render(?:Saved|Wrong|AllWrong)?\s*\(/i.test(source) ||
            /showQuestion|loadQuestion/i.test(source);
          if (advancesQuestion || (rendersQuestionAfterAdvance && /questionIndex|currentQuestion|nextSet/i.test(source))) {
            return 0;
          }
        }
        return originalSetTimeout.apply(window, arguments);
      };

      try {
        return originalAnswer.apply(this, arguments);
      } finally {
        window.setTimeout = originalSetTimeout;
      }
    };

    wrappedAnswer.__manualNextOnly = true;
    window.answer = wrappedAnswer;
  }

  /* This script is loaded after the quiz script; retry after DOM changes in case
     the page replaces the answer handler. */
  disableAnswerAutoAdvance();

  /* Re-check after quiz navigation or any panel re-render. */
  var observer = new MutationObserver(scheduleCheck);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "style", "aria-hidden", "class"]
  });

  /* Make navigation controls usable on the first tap.
     The original focus handler required two taps outside the question card,
     which made Home and Practice Mode appear unresponsive. */
  if (typeof window.revealQuizOptionsOutsideAttemptPanel === "function") {
    document.removeEventListener(
      "pointerdown",
      window.revealQuizOptionsOutsideAttemptPanel,
      true
    );
  }

  document.addEventListener("pointerdown", function (event) {
    var target = event.target;
    if (target && target.closest && target.closest("#main .card")) return;
    if (target && target.closest && target.closest("#examTagToggle")) return;
    outsideRevealFirstTapAt = 0;
    document.body.classList.remove("attempt-focus");
  }, true);

  /* Save a Practice answer without replacing the whole question DOM.
     This keeps the selected radio stable and avoids scroll/focus jumps on touch. */
  if (typeof window.practiceAnswer === "function" && !window.practiceAnswer.__stablePracticeSelection) {
    var originalPracticeAnswer = window.practiceAnswer;
    var stablePracticeAnswer = function (id, val) {
      if (!practiceSession || practiceSession.submitted) return;
      practiceSession.answers[id] = val;

      var summary = document.querySelector("#main .progressbar + .small");
      var total = practiceSession.questions.length;
      var attempted = Object.keys(practiceSession.answers).length;
      if (summary) summary.textContent = "Attempted: " + attempted + "/" + total + " • Skip: " + (total - attempted);

      var selector = document.getElementById("practiceQuestionSelect");
      if (selector) {
        practiceSession.questions.forEach(function (q, index) {
          if (selector.options[index]) {
            selector.options[index].textContent = "Question " + (index + 1) +
              (practiceSession.answers[q.id] !== undefined ? " — Attempted" : "");
          }
        });
      }
    };
    stablePracticeAnswer.__stablePracticeSelection = true;
    window.practiceAnswer = stablePracticeAnswer;
  }

  /* Home always returns to the first quiz set and exits any active focus UI. */
  if (typeof window.goHome === "function" && !window.goHome.__singleTapFixed) {
    var originalGoHome = window.goHome;
    var fixedGoHome = function () {
      if (typeof window.stopPracticeTimer === "function") {
        window.stopPracticeTimer();
      }
      document.body.classList.remove("attempt-focus");
      return originalGoHome.apply(this, arguments);
    };
    fixedGoHome.__singleTapFixed = true;
    window.goHome = fixedGoHome;
  }
})();