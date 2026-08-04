/**
 * Hero click-to-play video activation. The iframe is only created here,
 * after a real user activation — never on page load. A native <button>
 * (see Hero.astro) gives keyboard activation (Enter/Space) for free; this
 * script only needs to handle the click event both input methods dispatch.
 */

const trigger = document.querySelector<HTMLButtonElement>("#hero-video-trigger");

trigger?.addEventListener("click", () => {
  const videoId = trigger.dataset.videoId;
  const wrapper = trigger.closest<HTMLElement>(".hero-media");
  if (!videoId || !wrapper) return;

  const title = trigger.dataset.videoTitle || "Featured video";

  const iframe = document.createElement("iframe");
  iframe.className = "hero-media__iframe";
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  iframe.title = title;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.setAttribute("frameborder", "0");

  wrapper.classList.add("is-playing");
  trigger.replaceWith(iframe);
  iframe.focus();
});
