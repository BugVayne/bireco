// Общие UI-элементы для всех страниц: полоса прогресса прокрутки
// и кнопка "наверх". Элементы создаются из JS — в HTML ничего добавлять не нужно.

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Полоса прогресса прокрутки ---------- */
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  /* ---------- Кнопка "наверх" ---------- */
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Scroll to top");
  toTop.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(toTop);

  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = "scaleX(" + Math.min(Math.max(p, 0), 1) + ")";
    toTop.classList.toggle("show", window.scrollY > 600);
  }

  function scrollTop() {
    if (reducedMotion) {
      window.scrollTo(0, 0);
      return;
    }
    var startY = window.scrollY;
    var dur = Math.min(1100, Math.max(500, startY * 0.45));
    var start = null;
    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      window.scrollTo(0, startY * (1 - ease(p)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  toTop.addEventListener("click", scrollTop);
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
