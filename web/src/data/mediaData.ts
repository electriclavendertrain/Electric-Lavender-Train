/**
 * Code-owned Media & Merch page material. Three distinct kinds of thing live
 * here, exactly the split established by `aboutData.ts` and `showsData.ts` —
 * do not blur them together.
 *
 * 1. `mediaPageCopy` — permanent protected interface copy: filter labels,
 *    category display names, the new-tab notice, and the no-commerce
 *    boundary wording. Not editorial content, never in Sanity. Category
 *    display names are fixed for the same reason link-type names are fixed
 *    on `bandMember`: a filter labelled "Performances" must always mean the
 *    same thing.
 * 2. `mediaPageFallback` — ONE complete development fallback, used only when
 *    the whole `mediaPage` singleton is absent from a non-production
 *    dataset. Never merged field-by-field with live content, and never used
 *    in production (see `media-merch.astro`).
 * 3. `TEST_PRODUCT_MARKER` — the marker that makes placeholder merchandise
 *    unmistakable and mechanically detectable, exactly like
 *    `TEST_BIOGRAPHY_MARKER`. Load-bearing: `normalize.ts` rejects any
 *    merchandise name/description containing it whenever the configured
 *    dataset is `production`.
 */

import type { ImageMetadata } from "astro";
import galleryPerformance from "../assets/images/gallery/elt-04.jpg";
import galleryVocals from "../assets/images/gallery/elt-09.jpg";
import galleryGuitar from "../assets/images/gallery/elt-08.jpg";
import galleryBass from "../assets/images/gallery/elt-06.jpg";
import galleryCrowd from "../assets/images/gallery/elt-10.jpg";
import galleryDanceFloor from "../assets/images/gallery/elt-12.jpg";
import { getYouTubeVideoId } from "../lib/youtube";
import type { MediaGalleryCategory } from "../sanity/normalize";

/**
 * The marker that makes placeholder merchandise text unmistakable, and
 * mechanically detectable. Kept as one exported constant so the schema
 * documentation, the fallback content, and the production guard in
 * `normalize.ts` can never drift apart.
 */
export const TEST_PRODUCT_MARKER = "[TEST — CLIENT PRODUCT REQUIRED]";

/**
 * The shared prefix every development/placeholder `mediaItem` title in this
 * project uses — including the live Studio `development`-dataset fixture
 * `test-media-video-youtube` ("[TEST] Placeholder YouTube Video"), which is a
 * real, selectable Sanity document, not just a hardcoded fallback string. An
 * editor could select that exact document into `mediaPage.gallery.videos`
 * (it passes every schema filter: `mediaType == "video"`,
 * `videoProvider == "youtube"`), so `normalize.ts` checks selected gallery
 * videos' titles against this prefix and rejects a match in production —
 * mirrors `TEST_PRODUCT_MARKER`'s role for merchandise.
 */
export const TEST_MEDIA_ITEM_MARKER = "[TEST";

/* -------------------------------------------------------------------------
 * Protected interface copy
 *
 * Deliberately not editor-controlled: an editor renaming "Performances" to
 * something else would break the correspondence between the stored
 * `category` value and what a visitor is told it means. The no-commerce
 * notice defines the site's no-commerce boundary and stays out of Sanity for
 * the same reason the About page's new-tab notice does — it is an
 * accessibility/policy contract, not editorial voice.
 * ---------------------------------------------------------------------- */

export const mediaPageCopy = {
  featuredVideo: {
    /** Used only when the editor leaves the optional heading blank, so the
     * section always has a real, labelled `<h2>` — never an empty one. */
    defaultHeading: "Featured Video",
    playLabel: "Play featured video",
  },

  gallery: {
    headingId: "media-gallery",
    /** "All" is a UI filter only — it is never stored in Sanity. */
    allFilterLabel: "All",
    categoryLabels: {
      performance: "Performances",
      "venue-crowd": "Venue & Crowd",
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
  },

  merch: {
    headingId: "media-merch-items",
    /**
     * Protected: defines the site's no-commerce boundary. Editors control
     * `mediaPage.merch.heading` and `.body`; they do not control this
     * sentence, because rewording it could imply a working store.
     *
     * Points at the internal Contact page's merch inquiry form, not
     * Instagram — see docs/contact-booking.md and docs/media-merch.md §8.
     */
    noCommerceNotice:
      "Items are available by inquiry only — there is no online store, cart, or checkout. Use the merchandise inquiry form to email the band.",
    /** "Email the Band About {item name}" — an internal link, never a new tab. */
    inquiryLabelPrefix: "Email the Band About",
  },

  newTabSuffix: " (opens in a new tab)",
} as const;

/* -------------------------------------------------------------------------
 * Development fallback
 *
 * ONE coherent block, used only when the `mediaPage` singleton is entirely
 * absent from a non-production dataset. If the singleton exists but a
 * required section is incomplete, normalization returns `null` for the whole
 * document and this fallback is used instead — live content and placeholder
 * copy are never mixed in one render (see `media-merch.astro`).
 *
 * The featured video reuses the exact same test YouTube URL already
 * referenced by the development Homepage's `[TEST] Placeholder YouTube
 * Video` mediaItem (`test-media-video-youtube`) — no new Sanity document is
 * created or patched, this is a plain hardcoded URL string, and it is only
 * ever reachable through this fallback (see `media-merch.astro`: the
 * fallback branch is structurally unreachable once `PUBLIC_SANITY_DATASET`
 * is `production`, and a valid live `mediaPage` with no featured video still
 * omits the section — this fixture never leaks into either of those states).
 * The heading carries the `[TEST — CLIENT VIDEO REQUIRED]` marker so it can
 * never be mistaken for real ELT footage. `title` below is this fixture's
 * stand-in for a Studio `mediaItem.title` and is deliberately neutral and
 * test-specific — it becomes the player's accessible iframe title, and must
 * never describe this placeholder as Electric Lavender Train footage.
 *
 * The gallery reuses the same six existing local development images already
 * bundled for the Homepage fallback gallery — not new assets, and nothing
 * copied from `skele/`. "Existing" and "bundled" describe where the files
 * came from, not their copyright status — these are development/preview
 * assets with unresolved rights, exactly like every other local photo; see
 * `docs/content-rights-checklist.md`, which lists each one individually.
 * Being used in a development preview is not proof that publishing them in
 * `production` is authorized.
 * ---------------------------------------------------------------------- */

/**
 * The development Homepage's existing test video URL, reused verbatim.
 * Not a new asset and not a new Sanity reference — see the module doc
 * comment above.
 */
export const TEST_FEATURED_VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

/**
 * The video id embedded in `TEST_FEATURED_VIDEO_URL` above ("Never Gonna
 * Give You Up"), extracted once via the approved parser rather than
 * hardcoded a second time. Used by `normalize.ts` as a belt-and-suspenders
 * production guard for `mediaPage.gallery.videos`, alongside the
 * title-prefix check (`TEST_MEDIA_ITEM_MARKER`) — an editor selecting the
 * live `test-media-video-youtube` fixture would already be caught by its
 * `[TEST]`-prefixed title, but this catches the same well-known filler video
 * even if it were ever re-titled.
 */
export const TEST_VIDEO_ID = getYouTubeVideoId(TEST_FEATURED_VIDEO_URL) as string;

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
    image: galleryPerformance,
    alt: "The full Electric Lavender Train performing outdoors.",
    category: "performance",
    credit: null,
  },
  {
    _key: "fallback-2",
    image: galleryVocals,
    alt: "Rachel singing and playing baritone ukulele.",
    category: "performance",
    credit: null,
  },
  {
    _key: "fallback-3",
    image: galleryGuitar,
    alt: "Hunter singing and playing electric guitar.",
    category: "performance",
    credit: null,
  },
  {
    _key: "fallback-4",
    image: galleryBass,
    alt: "Geert playing bass during an outdoor performance.",
    category: "performance",
    credit: null,
  },
  {
    _key: "fallback-5",
    image: galleryCrowd,
    alt: "A wide view of the outdoor venue and audience.",
    category: "venue-crowd",
    credit: null,
  },
  {
    _key: "fallback-6",
    image: galleryDanceFloor,
    alt: "Audience members dancing in front of the band.",
    category: "venue-crowd",
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

/**
 * Two items, deliberately generic — not the reference's invented shirts,
 * bags, stickers, or vinyl. One exercises the text-only card state; the
 * other exercises the with-image, with-price, with-availability state. Every
 * field that would otherwise look like real product data carries the marker.
 */
export const merchFallback: FallbackMerchItem[] = [
  {
    _id: "fallback-merch-1",
    name: `${TEST_PRODUCT_MARKER} Sample Product One`,
    description: `${TEST_PRODUCT_MARKER} Placeholder description — approved product details are required from the client before this can go live.`,
    image: null,
    alt: null,
    priceDisplay: null,
    availabilityNote: null,
  },
  {
    _id: "fallback-merch-2",
    name: `${TEST_PRODUCT_MARKER} Sample Product Two`,
    description: `${TEST_PRODUCT_MARKER} Placeholder description — approved product details are required from the client before this can go live.`,
    image: galleryPerformance,
    alt: "Placeholder product photo pending an approved merchandise photograph.",
    priceDisplay: `${TEST_PRODUCT_MARKER} Placeholder price text`,
    availabilityNote: `${TEST_PRODUCT_MARKER} Placeholder availability text`,
  },
];

export const mediaPageFallback = {
  intro: {
    kicker: "Media & Merch",
    heading: "Photos, Video & Merch",
    lede: "A look at Electric Lavender Train live, plus band merchandise available by inquiry.",
  },
  featuredVideo: {
    kicker: "Watch",
    heading: "[TEST — CLIENT VIDEO REQUIRED] Featured Video",
    videoUrl: TEST_FEATURED_VIDEO_URL,
    /** Never "Electric Lavender Train" — this is a filler URL, not band
     * footage. See the module doc comment above. */
    title: "[TEST] Development placeholder video — not Electric Lavender Train footage",
  },
  gallery: {
    kicker: "Good Times & Great People",
    heading: "Media Gallery",
    body: null as string | null,
  },
  merch: {
    kicker: "Take It Home",
    heading: "Merchandise",
    body: null as string | null,
  },
  bookingCta: {
    kicker: "Let's Ride Together",
    heading: "Questions About Photos, Video, or Merch?",
    body: "Send us a message and we'll get back to you.",
    ctaLabel: "Email the Band About Merch",
  },
  seo: {
    metaTitle: "Media & Merch",
    // Deliberately doesn't mention "video" — the only video on this
    // fallback build is the marked test placeholder, not real ELT footage,
    // so this description must not imply otherwise.
    metaDescription:
      "Photos of Electric Lavender Train performing across California's Central Coast, plus band merchandise available by inquiry.",
  },
};

export default mediaPageCopy;
