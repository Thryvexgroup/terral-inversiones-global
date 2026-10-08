(function () {
  'use strict';

  var motion;
  try { motion = window.matchMedia('(prefers-reduced-motion: reduce)'); }
  catch (_) { motion = { matches: false }; }
  if (motion.matches) return;

  // Reloads replay the entrance, including when the current URL has an anchor.
  // A plain arrival on a deep link does not cover the anchored content.
  var nav = null;
  try {
    nav = window.performance && window.performance.getEntriesByType
      ? window.performance.getEntriesByType('navigation')[0] : null;
  } catch (_) { /* Navigation Timing is optional. */ }
  var isReload = !!(nav && nav.type === 'reload');
  if (location.hash && !isReload) return;
  try {
    var KEY = 'terral-intro-seen';
    if (sessionStorage.getItem(KEY) && !isReload) return;
    sessionStorage.setItem(KEY, '1');
  } catch (_) { /* Storage restrictions must never block the site. */ }

  function build() {
    if (!document.body) return;

    var curtain = document.createElement('div');
    curtain.className = 'terral-preloader';
    curtain.setAttribute('aria-hidden', 'true');
    var word = 'TERRAL'.split('').map(function (letter, index) {
      return '<span class="terral-preloader__letter" style="--letter:' + index + '">' + letter + '</span>';
    }).join('');
    curtain.innerHTML =
      '<div class="terral-preloader__logo">' +
        '<span class="terral-preloader__mask"><span class="terral-preloader__word">' + word + '</span></span>' +
        '<span class="terral-preloader__dot">.</span>' +
      '</div>';
    document.body.prepend(curtain);

    var done = false;
    var started = false;
    var hardCap;
    var playCap;

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(hardCap);
      clearTimeout(playCap);
      if (curtain && curtain.parentNode) curtain.parentNode.removeChild(curtain);
      window.removeEventListener('keydown', finish);
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('pagehide', finish);
    }

    // The curtain sliding away is the natural end of the sequence.
    curtain.addEventListener('animationend', function (event) {
      if (event.animationName === 'terral-curtain') finish();
    });

    // Interaction always takes priority over the decorative entrance.
    window.addEventListener('keydown', finish);
    window.addEventListener('pointerdown', finish);
    window.addEventListener('pagehide', finish);

    // Never trap the visitor: this fires only if the sequence never even starts
    // (e.g. fonts hang AND the tab is never brought to the foreground). It is
    // cleared the moment the animation begins, so it can never cut it short.
    hardCap = setTimeout(finish, 10000);

    function start() {
      if (done || started) return;
      started = true;
      clearTimeout(hardCap);
      curtain.classList.add('is-playing');
      // Backstop in case animationend is missed; matches the ~2.8s CSS timeline.
      playCap = setTimeout(finish, 3600);
    }

    function whenVisible(run) {
      if (document.visibilityState !== 'hidden') { run(); return; }
      var onVisible = function () {
        if (document.visibilityState !== 'hidden') {
          document.removeEventListener('visibilitychange', onVisible);
          run();
        }
      };
      document.addEventListener('visibilitychange', onVisible);
    }

    function begin() {
      if (done) return;
      // Start only when the tab is actually on screen, so the entrance always
      // plays from the first frame instead of partway through a background load.
      whenVisible(function () {
        if (done) return;
        // One painted frame with the blank cream curtain in place, then play.
        requestAnimationFrame(function () { requestAnimationFrame(start); });
      });
    }

    // Hold the first letter until Zodiak (the 600 weight maps to the 700 face)
    // is ready, so the wordmark never flashes in a fallback serif and reflows.
    var fontReady;
    try {
      fontReady = document.fonts
        ? document.fonts.load('700 96px Zodiak').catch(function () {})
        : Promise.resolve();
    } catch (_) { fontReady = Promise.resolve(); }

    Promise.race([
      fontReady,
      new Promise(function (resolve) { setTimeout(resolve, 2000); })
    ]).then(begin);
  }

  if (document.body) {
    build();
  } else {
    document.addEventListener('DOMContentLoaded', build, { once: true });
  }
}());
