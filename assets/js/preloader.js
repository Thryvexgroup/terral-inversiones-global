(function () {
  'use strict';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var key = 'terral-intro-seen';
  // Deep links and restored navigation should take visitors straight to their content.
  if (motion.matches || location.hash) return;
  try {
    if (sessionStorage.getItem(key)) return;
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
