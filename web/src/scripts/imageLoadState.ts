/**
 * Shared loading state for standalone images: the About hero and the
 * Homepage official band photos. It mirrors the Gallery's treatment in
 * `mediaGallery.ts`. Each `[data-image-load-state]` wrapper moves from
 * "loading" to "ready" or "error" as its `[data-image-load-target]` image
 * settles, and `global.css` shows `LoadingDots` (or a short error line)
 * while the image is hidden.
 *
 * The `js-image-loading` class is added only when this script runs, so
 * without JavaScript every image renders normally and no loader appears.
 */

type ImageState = "loading" | "ready" | "error";

const getImageState = (image: HTMLImageElement): ImageState => {
  if (!image.complete) return "loading";
  return image.naturalWidth > 0 ? "ready" : "error";
};

const loadStateFrames = Array.from(
  document.querySelectorAll<HTMLElement>("[data-image-load-state]"),
);

if (loadStateFrames.length > 0) {
  document.documentElement.classList.add("js-image-loading");

  for (const frame of loadStateFrames) {
    const image = frame.querySelector<HTMLImageElement>("[data-image-load-target]");
    if (!image) {
      frame.dataset.imageLoadState = "ready";
      continue;
    }

    const updateState = () => {
      frame.dataset.imageLoadState = getImageState(image);
    };

    image.addEventListener("load", updateState);
    image.addEventListener("error", updateState);
    updateState();
  }
}
