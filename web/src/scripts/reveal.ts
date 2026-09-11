/** Adds intersection-based reveals while respecting reduced motion. */

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
    // Begin reveals shortly before elements enter the viewport.
    { threshold: 0, rootMargin: "0px 0px 150px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
}

/** Keyboard users can tab ahead of their own scrolling. */
document.addEventListener("focusin", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  target.closest(".reveal:not(.in)")?.classList.add("in", "reveal-instant");
});

/** A page restored from the back/forward cache (bfcache) — e.g. */
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
