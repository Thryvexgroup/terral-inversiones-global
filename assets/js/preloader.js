(function () {
  'use strict';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var key = 'terral-intro-seen';
  var navigation = window.performance && window.performance.getEntriesByType
    ? window.performance.getEntriesByType('navigation')[0] : null;
  var isReload = navigation && navigation.type === 'reload';
  // Reloads replay the entrance, including when the current URL has an anchor.
  if (motion.matches || (location.hash && !isReload)) return;
  try {
    if (sessionStorage.getItem(key) && !isReload) return;
    sessionStorage.setItem(key, '1');
  } catch (_) { /* Storage restrictions must never prevent access to the site. */ }
  var curtain = document.createElement('div');
  curtain.className = 'terral-preloader';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<div class="terral-preloader__logo"><span class="terral-preloader__mask"><span class="terral-preloader__word">' + 'TERRAL'.split('').map(function (letter, index) {
    return '<span class="terral-preloader__letter" style="--letter:' + index + '">' + letter + '</span>';
  }).join('') + '</span></span><span class="terral-preloader__dot">.</span></div>';
  document.body.prepend(curtain);
  function finish() {
    curtain.remove();
    window.removeEventListener('keydown', finish);
    window.removeEventListener('pointerdown', finish);
    window.removeEventListener('pagehide', finish);
    motion.removeEventListener('change', finish);
  }
  curtain.addEventListener('animationend', function (event) {
    if (event.animationName === 'terral-curtain') finish();
  });
  // Interaction always takes priority over the decorative entrance.
  window.addEventListener('keydown', finish, { once: true });
  window.addEventListener('pointerdown', finish, { once: true });
  window.addEventListener('pagehide', finish, { once: true });
  motion.addEventListener('change', finish, { once: true });
  setTimeout(finish, 2800);
}());
