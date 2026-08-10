import { sanityImageUrl } from "./image";
import type {
  HOMEPAGE_QUERY_RESULT,
  UPCOMING_PUBLIC_EVENTS_QUERY_RESULT,
} from "./sanity.types";

/**
 * Maps raw Sanity query results into the plain shapes the existing
 * (Sanity-unaware) Astro components already expect. This is also where
 * conditionally-required schema fields (§20 of docs/phase3-plan.md — not
 * guaranteed non-null by `--enforce-required-fields`, which only covers
 * unconditional requirements) are defensively checked, so a component never
 * receives malformed or partial data it wasn't built to handle.
 */

type Homepage = NonNullable<HOMEPAGE_QUERY_RESULT>;

export interface NormalizedGalleryItem {
  _key: string;
  src: string;
  width: number;
  height: number;
  /** A ready-to-use CSS `object-position` value, e.g. `"32.0% 18.5%"`. */
  objectPosition: string;
  alt: string;
  caption: string;
}

const GALLERY_IMAGE_WIDTH = 900;
/** Used for Sanity images with no hotspot, and for locally-bundled fallback images (no hotspot data at all). */
export const DEFAULT_OBJECT_POSITION = "50% 50%";

type GalleryMediaImage = NonNullable<
  NonNullable<Homepage["featuredMedia"]>[number]["mediaItem"]["image"]
>;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * The gallery renders one image into several different final shapes (the
 * large first tile, the portrait fourth tile, ordinary square-ish tiles),
 * and those shapes' actual pixel aspect ratios shift again at the mobile
 * breakpoint — the grid drops from four columns to two and shortens each
 * row (180px → 150px), which changes a tile's rendered width-to-height
 * ratio even where its column/row span counts stay the same. Pre-cropping
 * to one fixed shape at the CDN, then letting CSS `object-fit: cover`
 * re-crop that already-cropped square down to whatever the real tile turns
 * out to be, applies a second,
 * generic center-based crop on top of Sanity's hotspot-aware one — which is
 * exactly how a correctly hotspot-cropped image ends up with its subject
 * cut off once it lands in a differently-shaped tile.
 *
 * Instead, `sanityImageUrl` is called with width only (§ below), so Sanity
 * applies the editor's manual crop (trimming) but does not force any
 * particular aspect ratio. The focal point is then propagated to the actual
 * rendered shape via CSS `object-position`, computed here as the hotspot's
 * position *relative to the manually-cropped region* (not the original
 * image — the served image only contains the cropped region, so the
 * position must be re-based against that, not the full original frame).
 * `object-fit: cover` then does exactly one crop, in the browser, correctly
 * centered on the real subject for whatever shape a given tile/breakpoint
 * actually is.
 */
function computeObjectPosition(image: GalleryMediaImage): string {
  const hotspot = image.hotspot;
  if (!hotspot) return DEFAULT_OBJECT_POSITION;

  const crop = image.crop;
  const left = crop?.left ?? 0;
  const right = crop?.right ?? 0;
  const top = crop?.top ?? 0;
  const bottom = crop?.bottom ?? 0;

  const croppedWidthFraction = Math.max(1 - left - right, 0.01);
  const croppedHeightFraction = Math.max(1 - top - bottom, 0.01);

  const relativeX = clamp01((hotspot.x - left) / croppedWidthFraction);
  const relativeY = clamp01((hotspot.y - top) / croppedHeightFraction);

  return `${(relativeX * 100).toFixed(1)}% ${(relativeY * 100).toFixed(1)}%`;
}

/**
 * Only used to size the `<img>` width/height attributes — the CSS grid
 * fixes each cell's actual on-screen size regardless of these, so this only
 * needs to be a reasonable approximation of the served (crop-trimmed)
 * image's own aspect ratio, not pixel-perfect.
 */
function computeCroppedAspectRatio(image: GalleryMediaImage): number {
  const dimensions = image.asset?.metadata?.dimensions;
  if (!dimensions) return 1;

  const crop = image.crop;
  const left = crop?.left ?? 0;
  const right = crop?.right ?? 0;
  const top = crop?.top ?? 0;
  const bottom = crop?.bottom ?? 0;

  const width = dimensions.width * Math.max(1 - left - right, 0.01);
  const height = dimensions.height * Math.max(1 - top - bottom, 0.01);
  return width / height;
}

/**
 * Drops any featured-media reference that didn't resolve to a real image
 * mediaItem, is missing its asset id (nothing for the image-url builder to
 * build a CDN URL from), or is missing alt text — never render a broken
 * `<img>` or one without accessible alt text.
 */
export function normalizeFeaturedMedia(
  featuredMedia: Homepage["featuredMedia"],
): NormalizedGalleryItem[] {
  if (!featuredMedia) return [];

  const items: NormalizedGalleryItem[] = [];
  for (const entry of featuredMedia) {
    const media = entry.mediaItem;
    const image = media?.image;
    const assetId = image?.asset?._id;
    if (!media || !image || !assetId || !media.alt) continue;

    const width = GALLERY_IMAGE_WIDTH;
    const height = Math.round(width / computeCroppedAspectRatio(image));

    items.push({
      _key: entry._key,
      src: sanityImageUrl(image, { width }),
      width,
      height,
      objectPosition: computeObjectPosition(image),
      alt: media.alt,
      caption: media.title,
    });
  }
  return items;
}

export interface NormalizedTestimonial {
  _key: string;
  quote: string;
  attribution: string;
}

const MAX_TESTIMONIALS = 3;

export function normalizeTestimonials(
  testimonials: Homepage["testimonials"],
): NormalizedTestimonial[] {
  if (!testimonials) return [];
  return testimonials
    .filter(
      (t): t is { _key: string; quote: string; attribution: string } =>
        Boolean(t.quote && t.attribution),
    )
    .slice(0, MAX_TESTIMONIALS);
}

export interface NormalizedEventCard {
  _id: string;
  title: string;
  venue: string;
  location: string;
  startDateTime: string;
  endDateTime: string | null;
  externalEventUrl: string | null;
}

/** Skips any event missing a field a homepage card can't be rendered without. */
export function normalizeUpcomingEvents(
  events: UPCOMING_PUBLIC_EVENTS_QUERY_RESULT,
): NormalizedEventCard[] {
  return events
    .filter(
      (
        event,
      ): event is typeof event & { title: string; venue: string; location: string } =>
        Boolean(event.title && event.venue && event.location && event.startDateTime),
    )
    .map((event) => ({
      _id: event._id,
      title: event.title,
      venue: event.venue,
      location: event.location,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      externalEventUrl: event.externalEventUrl,
    }));
}

/**
 * The Hero's only true requirement is a headline — eyebrow and supporting
 * text are optional copy, and their absence must never hide the whole
 * section (§2 of this correction round). `Hero.astro` itself independently
 * omits the eyebrow/subcopy elements when they're empty.
 */
export function isHeroContentComplete(
  hero: Homepage["hero"],
): hero is { eyebrow?: string; headline: string; subcopy?: string } {
  return Boolean(hero?.headline);
}

/**
 * Band Introduction requires a heading and at least one non-blank
 * paragraph — the small label and button text are optional and each omit
 * independently in `BandIntro.astro`, which also defensively filters blank
 * paragraph entries.
 */
export function isBandIntroComplete(
  bandIntro: Homepage["bandIntro"],
): bandIntro is {
  kicker?: string;
  heading: string;
  paragraphs: string[];
  ctaLabel?: string;
} {
  return Boolean(
    bandIntro?.heading &&
      bandIntro?.paragraphs &&
      bandIntro.paragraphs.some((p) => p && p.trim().length > 0),
  );
}

/**
 * Booking CTA's required core is heading + body + button text — the small
 * label is optional and omits independently in `BookingCTA.astro`.
 */
export function isBookingCtaComplete(
  bookingCta: Homepage["bookingCta"],
): bookingCta is { kicker?: string; heading: string; body: string; ctaLabel: string } {
  return Boolean(bookingCta?.heading && bookingCta?.body && bookingCta?.ctaLabel);
}

/**
 * A hero-video reference only ever comes from the live query result — there
 * is no fallback URL. `Hero.astro`'s own `getYouTubeVideoId` (approved in
 * Phase 2.5, untouched) already rejects anything that isn't a valid YouTube
 * URL, so a malformed or non-YouTube reference safely renders the static
 * logo without any extra checking here.
 */
export function getHeroVideoUrl(heroVideo: Homepage["heroVideo"] | undefined): string | null {
  return heroVideo?.videoUrl ?? null;
}

type OgImage = NonNullable<Homepage["seo"]>["ogImage"];

const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * Social-sharing image size, built only when an asset is actually attached
 * — `seo.ogImage` can exist as an empty `{_type: "image"}` object with no
 * upload, which would otherwise build a broken CDN URL.
 */
export function getOgImageUrl(ogImage: OgImage | null | undefined): string | null {
  if (!ogImage?.asset) return null;
  return sanityImageUrl(ogImage, OG_IMAGE_SIZE);
}
