/**
 * Click-to-play video activation, shared by every route with a click-to-play
 * YouTube embed (currently the Homepage hero and the Music page's featured
 * video). The iframe is only created here, after a real user
 * activation — never on page load, and never a request to any
 * `youtube.com`/`ytimg.com`-family host before that. A native <button> (see
 * Hero.astro / FeaturedVideo.astro) gives keyboard activation (Enter/Space)
 * for free; this script only needs to handle the click event both input
 * methods dispatch.
 *
 * Generalized to plain data attributes so a second consumer could reuse it
 * without copying it — no component-specific id or CSS assumption is
 * hardcoded below:
 *
 *   data-video-trigger   marks the <button> that starts playback. Expected
 *                        to carry the shared `.video-trigger` presentation
 *                        class (see global.css's "Click-to-play video
 *                        trigger" section) — this script does not care, but
 *                        every current caller does.
 *   data-video-id        the 11-character YouTube video id
 *   data-video-title     the iframe's accessible title
 *   data-video-wrapper   the nearest ancestor that receives the
 *                        "is-playing" class on activation — expected to
 *                        carry the shared `.video-trigger-wrapper` class.
 *
 * The created iframe always gets the single shared `video-trigger__iframe`
 * class (global.css), styled by `.video-trigger-wrapper.is-playing
 * .video-trigger__iframe` — since both current callers share that one
 * presentation now, there is no per-caller iframe class to configure.
 *
 * Uses the privacy-enhanced `youtube-nocookie.com` embed domain rather than
 * `youtube.com` — this reduces, but does not eliminate, data YouTube/Google
 * may still process once a video is actually activated and playing (see
 * docs/contact-booking.md's Privacy Policy for the accurate disclosure —
 * this is not a claim that no third-party processing occurs at all).
 *
 * The iframe itself is built by the shared `createYouTubeIframe` helper
 * (`./youtubeEmbed.ts`), also used by `mediaGallery.ts` for gallery videos —
 * see that file's doc comment for why this is factored out rather than
 * duplicated.
 */

import { createYouTubeIframe } from "./youtubeEmbed";

const triggers = document.querySelectorAll<HTMLButtonElement>("[data-video-trigger]");

for (const trigger of triggers) {
  trigger.addEventListener("click", () => {
    const videoId = trigger.dataset.videoId;
    const wrapper = trigger.closest<HTMLElement>("[data-video-wrapper]");
    if (!videoId || !wrapper) return;

    const title = trigger.dataset.videoTitle || "Featured video";

    const iframe = createYouTubeIframe(videoId, title);
    iframe.className = "video-trigger__iframe";

    wrapper.classList.add("is-playing");
    trigger.replaceWith(iframe);
    iframe.focus();
  });
}
