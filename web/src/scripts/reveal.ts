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

/**
 * A page restored from the back/forward cache (bfcache) — e.g. clicking
 * Back after navigating Home → About → Back — reuses the exact frozen DOM
 * and JS state rather than re-running this script or re-fetching anything.
 * That's normally invisible and desirable, but an `<img>` that was still
 * mid-decode at the instant the page was frozen can come back un-painted:
 * `img.complete`/`naturalWidth` report the image as fully loaded (the
 * browser did finish decoding it, at some point during the freeze), yet the
 * compositor never actually painted that frame before restore, so it stays
 * visually blank until something else forces a repaint — a known class of
 * browser bfcache-repaint bugs, not specific to any one image or component.
 *
 * `pageshow`'s `persisted` flag is exactly "was this a bfcache restore,
 * not a fresh navigation" — this never fires (or never matters) on an
 * ordinary load, so it can't introduce a flash there. The nudge itself is
 * an imperceptible opacity change on the next frame, enough to force the
 * browser to recomposite the whole page (including any stuck image layers)
 * without any visible flicker of its own.
 */
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  const root = document.documentElement;
  const previousOpacity = root.style.opacity;
  root.style.opacity = "0.999999";
  requestAnimationFrame(() => {
    root.style.opacity = previousOpacity;
  });
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
