/**
 * Builds the iframe every click-to-play YouTube embed on the site uses, once
 * a visitor has explicitly activated one specific video. Shared by
 * `heroVideo.ts` (the Homepage hero / Music page featured video, which
 * replaces its trigger button with this iframe inline) and
 * `mediaGallery.ts` (gallery videos, which inject this iframe into an
 * already-open lightbox dialog) — one definition means the embed
 * permissions list and the privacy-enhanced `youtube-nocookie.com` domain
 * can only ever be defined in one place, the same reasoning that keeps
 * `getYouTubeVideoId` a single approved parser rather than a
 * per-caller copy.
 *
 * Always built from a validated video id, never a raw Studio URL — callers
 * are responsible for validating the id (via `getYouTubeVideoId`) before
 * calling this.
 */
export function createYouTubeIframe(videoId: string, title: string): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  iframe.title = title;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.setAttribute("frameborder", "0");
  return iframe;
}
