/** Creates a validated privacy-enhanced YouTube embed on demand. */
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
