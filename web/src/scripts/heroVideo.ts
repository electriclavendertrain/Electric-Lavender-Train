/** Creates a privacy-enhanced YouTube iframe only after visitor activation. */

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
