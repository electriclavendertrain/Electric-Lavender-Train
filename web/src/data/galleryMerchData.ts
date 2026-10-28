/** Code-owned Gallery labels and development-only fallback content. */

import type { ImageMetadata } from "astro";
import galleryBandPortrait from "../assets/images/elt-band-photo3.jpg";
import galleryVenueLineup from "../assets/images/elt-band-photo4.jpg";
import galleryOutdoorPortrait from "../assets/images/elt-band-photo5.jpg";
import galleryOutdoorStage from "../assets/images/elt-band-photo7.jpg";
import galleryStageLineup from "../assets/images/elt-band-photo8.jpg";
import galleryForestPortrait from "../assets/images/elt-band-photo9.jpeg";
import { getYouTubeVideoId } from "../lib/youtube";
import type { MediaGalleryCategory } from "../sanity/normalize";

/** The marker that makes placeholder merchandise text unmistakable, and mechanically detectable. */
export const TEST_PRODUCT_MARKER = "[TEST — CLIENT PRODUCT REQUIRED]";

/** The shared prefix every development/placeholder `mediaItem` title in this project uses — including the live Studio `development`-dataset fixture `test-media-video-youtube` ("[TEST] Placeholder YouTube Video"), which is a real, selectable Sanity document… */
export const TEST_MEDIA_ITEM_MARKER = "[TEST";

/* -------------------------------------------------------------------------
 * Protected interface copy
 *
 * Deliberately not editor-controlled: an editor renaming "Performances" to
 * something else would break the correspondence between the stored
 * `category` value and what a visitor is told it means. The merchandise
 * introduction is editor-owned in the Gallery & Merchandise singleton.
 * ---------------------------------------------------------------------- */

export const galleryMerchCopy = {
  gallery: {
    headingId: "media-gallery",
    /** "All" is a UI filter only — it is never stored in Sanity. */
    allFilterLabel: "All",
    categoryLabels: {
      performance: "Performances",
      "venue-crowd": "Venue & Crowd",
      "band-photos": "Band Photos",
    } satisfies Record<MediaGalleryCategory, string>,
    /** Code-owned, like the two category labels above — video membership
     * comes from `mediaType`, never an editor-selected category, so this is
     * never a `MediaGalleryCategory` value and never stored in Sanity. */
    videoFilterLabel: "Videos",
    filterGroupLabel: "Filter gallery by category",
    /** Visually-hidden prefixes so each credit's purpose (and medium) is
     * announced without rewriting the approved attribution text itself —
     * "Photo credit: " for an image `mediaItem`, "Video credit: " for a
     * video one. Both read the same stored `creditLine`/`creditUrl` pair. */
    photoCreditPrefix: "Photo credit: ",
    videoCreditPrefix: "Video credit: ",
    /** Prefix for a gallery video tile's accessible name, e.g.
     * "Play video: {title}" — the tile IS the play control, so its whole
     * accessible name doubles as the "Play video: {title}" pattern. */
    playVideoLabelPrefix: "Play video: ",
    /** Visually-hidden suffix clarifying, for a visitor with no JavaScript,
     * that this control is a real external link to YouTube rather than a
     * local control — with scripting available, `mediaGallery.ts`
     * intercepts the same click to open the local privacy-enhanced dialog
     * instead, so the video experience stays on this page either way. */
    videoNewTabSuffix: " (opens on YouTube)",
    lightboxCloseLabel: "Close",
    lightboxClosePhotoSuffix: "photo",
    lightboxCloseVideoSuffix: "video",
    /** Shown in place of the filters/grid when zero photos and videos are
     * selected — the heading (this page's `<h1>`) still renders above it,
     * since the page must never be left without one. */
    emptyMessage: "No gallery photos or videos are currently posted.",
  },

  merch: {
    headingId: "gallery-merch-items",
    /** "Email the Band About {item name}" — an internal link, never a new tab. */
    inquiryLabelPrefix: "Email the Band About",
  },

  newTabSuffix: " (opens in a new tab)",
} as const;

/* -------------------------------------------------------------------------
 * Development fallback
 *
 * ONE coherent block, used only when the `galleryPage` singleton is entirely
 * absent from a non-production dataset. If the singleton exists but a
 * required section is incomplete, normalization returns `null` for the whole
 * document and this fallback is used instead — live content and placeholder
 * copy are never mixed in one render (see `gallery-merch.astro`).
 *
 * The gallery reuses six existing ELT band photos retained in this codebase.
 * They remain development-only fallback assets; production still requires a
 * complete Sanity singleton and never silently promotes this local selection.
 * Repository presence alone is not rights evidence — see
 * `docs/content-rights-checklist.md`.
 * ---------------------------------------------------------------------- */

/** A well-known filler YouTube URL, retained only as the source for `TEST_VIDEO_ID` below — this page's own fallback no longer renders any featured video, but the id is still used as a belt-and-suspenders production guard against this exact well-known filler… */
export const TEST_FEATURED_VIDEO_URL =
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

/** The video id embedded in `TEST_FEATURED_VIDEO_URL` above ("Never Gonna Give You Up"), extracted once via the approved parser rather than hardcoded a second time. */
export const TEST_VIDEO_ID = getYouTubeVideoId(
  TEST_FEATURED_VIDEO_URL,
) as string;

export interface FallbackGalleryPhoto {
  _key: string;
  image: ImageMetadata;
  alt: string;
  category: MediaGalleryCategory | null;
  /** Fallback content invents no attribution — every entry is `null`. */
  credit: null;
}

export const galleryFallback: FallbackGalleryPhoto[] = [
  {
    _key: "fallback-1",
    image: galleryBandPortrait,
    alt: "The four members of Electric Lavender Train posing together with their instruments.",
    category: "band-photos",
    credit: null,
  },
  {
    _key: "fallback-2",
    image: galleryVenueLineup,
    alt: "Electric Lavender Train standing together onstage at Mr. Rick's.",
    category: "performance",
    credit: null,
  },
  {
    _key: "fallback-3",
    image: galleryOutdoorPortrait,
    alt: "Electric Lavender Train posing together outdoors before a show.",
    category: "band-photos",
    credit: null,
  },
  {
    _key: "fallback-4",
    image: galleryOutdoorStage,
    alt: "Electric Lavender Train standing together on an outdoor stage.",
    category: "performance",
    credit: null,
  },
  {
    _key: "fallback-5",
    image: galleryStageLineup,
    alt: "Electric Lavender Train together under the stage lights after a performance.",
    category: "performance",
    credit: null,
  },
  {
    _key: "fallback-6",
    image: galleryForestPortrait,
    alt: "The four members of Electric Lavender Train posing together in the forest.",
    category: "band-photos",
    credit: null,
  },
];

export interface FallbackMerchItem {
  _id: string;
  name: string;
  description: string;
  image: ImageMetadata | null;
  alt: string | null;
  priceDisplay: string | null;
  availabilityNote: string | null;
}

/** No fabricated merchandise appears when the development singleton is absent. */
export const merchFallback: FallbackMerchItem[] = [];

export const galleryMerchFallback = {
  gallery: {
    kicker: "Good Times & Great People",
    heading: "Media Gallery",
    body: null as string | null,
  },
  merch: {
    kicker: "Take It Home",
    heading: "Merchandise",
    body: "Items are available by inquiry only — there is no online store, cart, or checkout. Use the merchandise inquiry form to email the band.",
  },
  bookingCta: {
    kicker: "Let's Ride Together",
    heading: "Questions About Photos, Video, or Merch?",
    body: "Send us a message and we'll get back to you.",
    ctaLabel: "Email the Band About Merch",
  },
  seo: {
    metaTitle: "Gallery & Merchandise",
    metaDescription:
      "Photos of Electric Lavender Train performing across California's Central Coast, plus band merchandise available by inquiry.",
  },
};

export default galleryMerchCopy;
