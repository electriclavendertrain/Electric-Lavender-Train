/**
 * Scroll-triggered reveal animation and the desktop scroll-track spark.
 * Under prefers-reduced-motion, reveal targets are shown immediately
 * instead of waiting on an IntersectionObserver, matching the behavior of
 * the functional reference's useScrollReveal hook.
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
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
}

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
