/**
 * Media & Merch page: gallery category/video filters and the photo and
 * video lightbox dialogs. Two independent, page-specific behaviors kept in
 * one file because both are small — see docs/media-merch.md. Neither
 * fetches anything on its own; the video dialogs create an iframe only
 * after a visitor explicitly activates one specific video (see "Gallery
 * video dialogs" below).
 */

import { createYouTubeIframe } from "./youtubeEmbed";

/* -------------------------------------------------------------------------
 * Category filters
 *
 * Progressive enhancement: `MediaGallery.astro`'s CSS keeps the filter
 * controls hidden until this script proves it can wire them up (the
 * `is-active` class below), so a script failure leaves every photo visible
 * with no dead controls in the tab order.
 *
 * Filtering only ever toggles the native `hidden` attribute on existing
 * gallery items — it never removes, clones, reorders, or rebuilds the
 * gallery DOM, and the stored selection order (already the DOM order) never
 * changes.
 * ---------------------------------------------------------------------- */

const filterContainer = document.querySelector<HTMLElement>("[data-gallery-filters]");
const filterButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-gallery-filter]"),
);
const galleryItems = Array.from(
  document.querySelectorAll<HTMLElement>("[data-gallery-category]"),
);
const statusEl = document.querySelector<HTMLElement>("[data-gallery-status]");

if (filterContainer && filterButtons.length > 0 && galleryItems.length > 0) {
  const applyFilter = (filter: string) => {
    let visibleCount = 0;

    for (const item of galleryItems) {
      const matches = filter === "all" || item.dataset.galleryCategory === filter;
      item.hidden = !matches;
      if (matches) visibleCount += 1;
    }

    for (const button of filterButtons) {
      const isActive = button.dataset.galleryFilter === filter;
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    if (statusEl) {
      const activeLabel =
        filterButtons.find((button) => button.dataset.galleryFilter === filter)?.dataset
          .galleryFilterLabel ?? filter;
      // Generic on purpose: the gallery mixes photos and videos, so "photo"/
      // "photos" would misdescribe a video-only or mixed result set.
      const noun = visibleCount === 1 ? "media item" : "media items";
      statusEl.textContent = `Showing ${visibleCount} of ${galleryItems.length} ${noun} — ${activeLabel}`;
    }
  };

  for (const button of filterButtons) {
    button.addEventListener("click", () => {
      const filter = button.dataset.galleryFilter;
      if (!filter) return;
      // Focus stays on the activated filter button: it is a real <button>,
      // so the click already focuses it, and nothing here moves focus away.
      applyFilter(filter);
    });
  }

  filterContainer.classList.add("is-active");
}

/* -------------------------------------------------------------------------
 * Lightbox dialogs — photos and videos
 *
 * The same native-dialog approach `memberProfiles.ts` uses for the About
 * page's member profiles, reimplemented here under a gallery-specific
 * namespace (`gallery-lightbox`) rather than shared, so the two features
 * stay independently legible even though they never appear on the same
 * route. See `MediaLightbox.astro`'s doc comment for what the platform
 * supplies for free (backdrop, background inertness, Escape) versus what
 * this script adds: opening without navigating, returning focus to the
 * exact originating control, and locking background scroll.
 *
 * Gallery VIDEO dialogs (`MediaVideoLightbox.astro`, `data-gallery-video-*`)
 * share this same block — and the same `SCROLL_LOCK_CLASS` — but are a
 * separate namespace from the photo dialogs above, because a video dialog
 * additionally has to create its iframe on open and destroy it on close
 * (photos have no equivalent step: the `<img>` is always present). Without
 * JavaScript, a gallery video's control is a real external link straight to
 * YouTube (`href={watchUrl}`, `target="_blank"`) — there is no no-script
 * `:target` fallback for a video dialog, unlike photos, because there is
 * nothing a no-script fallback could put inside it (no iframe can be
 * created without scripting). With JavaScript, this script intercepts that
 * same click, opens the dialog instead, and injects the iframe — so the
 * video never navigates away from this page once scripting is available.
 * ---------------------------------------------------------------------- */

const supportsGalleryLightbox =
  typeof HTMLDialogElement !== "undefined" &&
  typeof HTMLDialogElement.prototype.showModal === "function";

if (supportsGalleryLightbox) {
  const SCROLL_LOCK_CLASS = "gallery-lightbox-open";

  const dialogs = Array.from(
    document.querySelectorAll<HTMLDialogElement>("dialog[data-gallery-lightbox]"),
  );
  const triggers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-gallery-lightbox-open]"),
  );

  if (dialogs.length > 0) {
    document.documentElement.classList.add("js-gallery-lightbox");
  }

  /** Held rather than read from `document.activeElement` at close time,
   * because by then focus is inside the dialog that is closing. */
  let returnFocusTo: HTMLElement | null = null;

  const findTriggerFor = (dialogId: string) =>
    triggers.find((trigger) => trigger.dataset.galleryLightboxOpen === dialogId) ?? null;

  const openDialog = (dialog: HTMLDialogElement, trigger: HTMLElement | null) => {
    if (dialog.open) return;
    returnFocusTo = trigger;
    dialog.showModal();
    document.documentElement.classList.add(SCROLL_LOCK_CLASS);
  };

  for (const trigger of triggers) {
    const dialogId = trigger.dataset.galleryLightboxOpen;
    if (!dialogId) continue;

    const dialog = document.getElementById(dialogId);
    if (!(dialog instanceof HTMLDialogElement)) continue;

    trigger.addEventListener("click", (event) => {
      // Leave modified clicks alone — someone deliberately opening this in a
      // new tab should get the page with the fragment, not a suppressed click.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      openDialog(dialog, trigger);
    });
  }

  for (const dialog of dialogs) {
    for (const control of dialog.querySelectorAll<HTMLElement>(
      "[data-gallery-lightbox-close]",
    )) {
      control.addEventListener("click", (event) => {
        // Without scripting this control is a real link back to the gallery
        // heading. With scripting, closing is the better behavior and the
        // URL is left alone.
        event.preventDefault();
        dialog.close();
      });
    }

    // Fires for the close control AND Escape (which raises `cancel` then
    // `close`), so focus return and the scroll lock are handled once.
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove(SCROLL_LOCK_CLASS);

      // A dialog opened by deep link leaves its fragment in the URL;
      // clearing it means the same link can be opened again, and a later
      // back/forward navigation does not silently reopen it.
      if (window.location.hash === `#${dialog.id}`) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }

      returnFocusTo?.focus();
      returnFocusTo = null;
    });
  }

  /** Deep links, and the narrow window between activation and this module
   * running during which a click can still navigate. */
  const openFromHash = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const dialog = document.getElementById(id);
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (!dialog.hasAttribute("data-gallery-lightbox")) return;

    openDialog(dialog, findTriggerFor(id));
  };

  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  /* -----------------------------------------------------------------------
   * Gallery video dialogs
   * -------------------------------------------------------------------- */

  const videoDialogs = Array.from(
    document.querySelectorAll<HTMLDialogElement>("dialog[data-gallery-video-lightbox]"),
  );
  const videoTriggers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-gallery-video-open]"),
  );

  /** Held rather than read from `document.activeElement` at close time, same
   * reasoning as `returnFocusTo` above — kept as its own variable rather
   * than reused, since a photo dialog and a video dialog can never be open
   * at the same time (native `showModal()` is exclusive), but each needs to
   * remember its OWN originating trigger independently of the other. */
  let returnFocusToVideo: HTMLElement | null = null;

  const openVideoDialog = (dialog: HTMLDialogElement, trigger: HTMLElement) => {
    if (dialog.open) return;

    const frame = dialog.querySelector<HTMLElement>("[data-video-frame]");
    const videoId = trigger.dataset.videoId;
    if (!frame || !videoId) return;

    const title = trigger.dataset.videoTitle || "Video";
    // Built fresh on every open — never present in the initial HTML, even
    // inside a closed dialog — and always from the validated id, never a
    // raw Studio URL.
    const iframe = createYouTubeIframe(videoId, title);
    iframe.className = "gallery-video-lightbox__iframe";
    frame.replaceChildren(iframe);

    returnFocusToVideo = trigger;
    dialog.showModal();
    document.documentElement.classList.add(SCROLL_LOCK_CLASS);
  };

  for (const trigger of videoTriggers) {
    const dialogId = trigger.dataset.galleryVideoOpen;
    if (!dialogId) continue;

    const dialog = document.getElementById(dialogId);
    if (!(dialog instanceof HTMLDialogElement)) continue;

    trigger.addEventListener("click", (event) => {
      // Same modified-click exception as the photo triggers: a
      // deliberately new-tab/new-window click is left alone.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      openVideoDialog(dialog, trigger);
    });
  }

  for (const dialog of videoDialogs) {
    for (const control of dialog.querySelectorAll<HTMLElement>("[data-gallery-video-close]")) {
      control.addEventListener("click", () => dialog.close());
    }

    // Fires for the close control AND Escape, same as the photo dialogs.
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove(SCROLL_LOCK_CLASS);

      // Removes the iframe so playback actually stops, and clears the way
      // for this exact video to be opened and played again later.
      const frame = dialog.querySelector<HTMLElement>("[data-video-frame]");
      frame?.replaceChildren();

      returnFocusToVideo?.focus();
      returnFocusToVideo = null;
    });
  }
}
