/**
 * Scroll-triggered reveal animation and the desktop scroll-track spark.
 *
 * This script only ever ADDS `.in`. It is not what makes content visible —
 * the `.reveal` hidden state is scoped to `html.js-reveal` in `global.css` and
 * wrapped in `prefers-reduced-motion: no-preference`, so if this file fails to
 * load, or motion is reduced, the content was never hidden in the first place.
 *
 * Adding `.in` immediately under reduced motion is therefore belt-and-braces
 * rather than the mechanism: the CSS has already opted out.
 */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const revealEls = document.querySelectorAll<HTMLElement>(".reveal:not(.in)");

if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    // A positive bottom margin extends the observed root past the visual
    // viewport, so a `.reveal` element starts animating ~150px before it
    // would otherwise scroll into view, rather than waiting for 15% of it
    // to already be visible plus a negative margin delaying that further.
    { threshold: 0, rootMargin: "0px 0px 150px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
}

/**
 * Keyboard users can tab ahead of their own scrolling. The browser scrolls the
 * focus target into view, but frequently not far enough to satisfy the
 * observer's threshold above — which would leave the focus ring sitting on a
 * block still at `opacity: 0`.
 *
 * Revealing on `focusin` closes that gap deterministically. `reveal-instant`
 * tells the CSS to skip the animation, so the block does not fade in again
 * after focus moves on. Registered unconditionally: under reduced motion, or
 * with no `js-reveal` class, nothing was hidden and this simply does nothing.
 */
document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  target.closest(".reveal:not(.in)")?.classList.add("in", "reveal-instant");
});

const spark = document.getElementById("track-spark");
if (spark) {
  const updateTrack = () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? scrollTop / docHeight : 0;
    spark.style.top = `${pct * window.innerHeight}px`;
  };
  updateTrack();
  window.addEventListener("scroll", updateTrack, { passive: true });
}
