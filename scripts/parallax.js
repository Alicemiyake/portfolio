// Parallax effect for .project-section stacks (image + caption together),
// modeled on arnaudpaquier.com/1_rocks: each stack is translated as the
// page scrolls, at its own speed (data-speed on the section). The image
// and its info block move as a single unit, exactly like that reference.
//
// Safe spacing: the shift is clamped so a card can never travel far enough
// to eat into the row-gap and overlap a neighbouring card's caption. The
// clamp is derived from the grid's actual row-gap (read live from CSS)
// rather than hardcoded, so it always stays in sync with the layout.

(function () {
  const grid = document.querySelector(".projects-grid");
  const stacks = Array.from(document.querySelectorAll(".project-section[data-speed]"));
  if (!grid || !stacks.length) return;

  const items = stacks.map((el) => ({
    el,
    speed: parseFloat(el.dataset.speed) || 0.2,
  }));

  const mediaQuery = window.matchMedia("(max-width: 768px)");
  let ticking = false;
  let maxShift = 0;

  function measureMaxShift() {
    const rowGap = parseFloat(getComputedStyle(grid).rowGap) || 0;
    // Two neighbouring cards can move toward each other at once, so each
    // one only gets a slice of the gap - leave a safety margin on top.
    maxShift = (rowGap / 2) * 0.7;
  }

  function updateParallax() {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    for (const { el, speed } of items) {
      const rect = el.getBoundingClientRect();

      if (rect.bottom < -viewportHeight || rect.top > viewportHeight * 2) continue;

      let shift = (viewportCenter - (rect.top + rect.height / 2)) * speed;
      shift = Math.max(-maxShift, Math.min(maxShift, shift));

      el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    }

    ticking = false;
  }

  function requestTick() {
    if (!ticking && !mediaQuery.matches) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }

  function resetTransforms() {
    for (const { el } of items) {
      el.style.transform = "";
    }
  }

  function handleResize() {
    measureMaxShift();
    requestTick();
  }

  mediaQuery.addEventListener("change", (e) => {
    if (e.matches) resetTransforms();
    else requestTick();
  });

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", handleResize);

  measureMaxShift();
  if (!mediaQuery.matches) requestTick();
})();
