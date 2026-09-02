import { sanityImageUrl, sanityImageSrcSet } from "./image";
import { isValidDateTime, isValidCalendarDateOnly } from "../lib/dateFormat";
import {
  TEST_BIOGRAPHY_MARKER,
} from "../data/aboutData";
import { TEST_PRODUCT_MARKER, TEST_MEDIA_ITEM_MARKER, TEST_VIDEO_ID } from "../data/galleryMerchData";
import { TEST_NEWSLETTER_MARKER, REQUIRED_EXPERIENCE_HIGHLIGHTS } from "../data/homeData";
import { TEST_RELEASE_MARKER } from "../data/musicData";
import { getYouTubeVideoId } from "../lib/youtube";
import type {
  HOMEPAGE_QUERY_RESULT,
  UPCOMING_PUBLIC_EVENTS_QUERY_RESULT,
  ABOUT_PAGE_QUERY_RESULT,
  TESTIMONIALS_QUERY_RESULT,
  SHOWS_PAGE_QUERY_RESULT,
  SHOWS_UPCOMING_PUBLIC_EVENTS_QUERY_RESULT,
  SHOWS_UPCOMING_PRIVATE_EVENTS_QUERY_RESULT,
  SHOWS_RECENT_PUBLIC_EVENTS_QUERY_RESULT,
  GALLERY_PAGE_QUERY_RESULT,
  CONTACT_PAGE_QUERY_RESULT,
  MUSIC_PAGE_QUERY_RESULT,
  SanityImageCrop,
  SanityImageDimensions,
  SanityImageHotspot,
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

/** Used for Sanity images with no hotspot, and for locally-bundled fallback images (no hotspot data at all). */
export const DEFAULT_OBJECT_POSITION = "50% 50%";

/**
 * The shape every projected Sanity image shares: optional crop/hotspot, and an
 * asset carrying an id plus (usually) intrinsic dimensions. Written
 * structurally rather than derived from one query's generated type, because
 * the gallery, the About hero, and testimonial logos all reach these helpers
 * from three different projections.
 */
interface ProjectedSanityImage {
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
  asset?: {
    _id: string;
    metadata?: { dimensions?: SanityImageDimensions | null } | null;
  } | null;
}

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
function computeObjectPosition(image: ProjectedSanityImage): string {
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
function computeCroppedAspectRatio(image: ProjectedSanityImage): number {
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

/* =========================================================================
 * Reusable testimonials — shared by the Homepage and the About page
 * ====================================================================== */

/**
 * A source logo is a CONTAINED GRAPHIC, not a photographic crop. There is no
 * `objectPosition` here on purpose: the component renders it with
 * `object-fit: contain`, so a hotspot would have nothing to act on, and
 * cropping a wordmark to fill a box is how logos get their edges sliced off.
 */
export interface NormalizedTestimonialLogo {
  src: string;
  width: number;
  height: number;
}

export interface NormalizedTestimonial {
  _id: string;
  quote: string;
  sourceName: string;
  sourceContext: string | null;
  sourceUrl: string | null;
  logo: NormalizedTestimonialLogo | null;
}

const MAX_TESTIMONIALS = 3;
const TESTIMONIAL_LOGO_WIDTH = 320;

/**
 * Keeps the first three complete testimonials in the order the query returned
 * them (`displayOrder asc, _id asc`). The cap is re-applied here as well as in
 * GROQ because Studio and query limits bind their own callers, not the Content
 * API.
 *
 * A testimonial needs a quote and a source name; everything else is optional.
 * A malformed optional logo is dropped on its own — it never discards an
 * otherwise valid testimonial, and the card simply renders text-only. No
 * substitute mark, monogram, or initial is generated: a fabricated logo would
 * misrepresent a real establishment.
 *
 * `sourceUrl` is re-validated with `URL` and kept only for http/https, exactly
 * as event links are. Nothing about a rejected quote or attribution is logged.
 */
export function normalizeTestimonials(
  testimonials: TESTIMONIALS_QUERY_RESULT,
): NormalizedTestimonial[] {
  const items: NormalizedTestimonial[] = [];

  for (const entry of testimonials) {
    if (items.length >= MAX_TESTIMONIALS) break;

    const quote = cleanText(entry.quote);
    const sourceName = cleanText(entry.sourceName);
    if (!quote || !sourceName) continue;

    items.push({
      _id: entry._id,
      quote,
      sourceName,
      sourceContext: cleanText(entry.sourceContext),
      sourceUrl: safeExternalUrl(entry.sourceUrl),
      logo: normalizeTestimonialLogo(entry.sourceLogo),
    });
  }

  return items;
}

function normalizeTestimonialLogo(
  logo: TESTIMONIALS_QUERY_RESULT[number]["sourceLogo"],
): NormalizedTestimonialLogo | null {
  const image = logo?.image;
  const assetId = image?.asset?._id;
  const dimensions = image?.asset?.metadata?.dimensions;

  // No resolved reference, no asset, or no intrinsic dimensions to reserve
  // space with — omit the logo rather than ship a broken or shifting image.
  if (!image || !assetId || !dimensions?.width || !dimensions?.height) return null;

  const width = TESTIMONIAL_LOGO_WIDTH;
  return {
    // Width only: no `height` is passed, so Sanity never forces a crop.
    src: sanityImageUrl(image, { width }),
    width,
    height: Math.round(width / (dimensions.width / dimensions.height)),
  };
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
 * Booking CTA's required core is heading + body + button text — the small
 * label is optional and omits independently in `BookingCTA.astro`.
 */
export function isBookingCtaComplete(
  bookingCta: Homepage["bookingCta"],
): bookingCta is { kicker?: string; heading: string; body: string; ctaLabel: string } {
  return Boolean(bookingCta?.heading && bookingCta?.body && bookingCta?.ctaLabel);
}

/**
 * Newsletter section's required core is heading + body + button text — the
 * small label is optional and omits independently in `Newsletter.astro`.
 * Whether the signup button itself actually appears is a separate, later
 * decision (`getNewsletterSignupUrl()` in `web/src/lib/newsletter.ts`) —
 * this only governs the surrounding editorial copy.
 *
 * `strict` mirrors every other production guard in this file
 * (`NormalizeGalleryPageOptions.strict`, `NormalizeMusicPageOptions.strict`,
 * `NormalizeAboutOptions.rejectTestBiographies`): true only when the
 * configured Sanity DATASET is `production`. In that mode, a
 * `[TEST`-marked kicker/heading/body/ctaLabel (`TEST_NEWSLETTER_MARKER`)
 * also fails completeness — a belt-and-suspenders guard against test
 * newsletter copy ever being copied into the production dataset by
 * accident, exactly like `TEST_BIOGRAPHY_MARKER` and `TEST_PRODUCT_MARKER`.
 */
export function isNewsletterComplete(
  newsletter: Homepage["newsletter"],
  strict: boolean,
): newsletter is { kicker: string | null; heading: string; body: string; ctaLabel: string } {
  if (!newsletter?.heading || !newsletter?.body || !newsletter?.ctaLabel) return false;
  if (strict) {
    const values = [newsletter.kicker, newsletter.heading, newsletter.body, newsletter.ctaLabel];
    if (values.some((value) => value?.includes(TEST_NEWSLETTER_MARKER))) return false;
  }
  return true;
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

/**
 * The referenced video mediaItem's own `title`, for the player's accessible
 * name. `Hero.astro` falls back to a safe neutral string when this is
 * `null` — a missing/unresolved reference, or a reference with a blank
 * title, is not a reason to fail anything here.
 */
export function getHeroVideoTitle(heroVideo: Homepage["heroVideo"] | undefined): string | null {
  return cleanText(heroVideo?.title);
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

/**
 * The Homepage's "ELT Experience" section requires a heading, an
 * introduction, a CTA button label, and exactly `REQUIRED_EXPERIENCE_HIGHLIGHTS`
 * highlights — each with a non-blank title and description. Every string
 * passes through `cleanText` before being checked, so a whitespace-only
 * value (e.g. a single space) can never pass as complete — matching the
 * requirement that whitespace-only Experience fields must fail this guard.
 * `kicker` is optional and omits independently in `AboutExperience.astro`.
 */
export function isExperienceContentComplete(
  experience: Homepage["experience"] | undefined,
): boolean {
  if (
    !cleanText(experience?.heading) ||
    !cleanText(experience?.introduction) ||
    !cleanText(experience?.ctaLabel)
  ) {
    return false;
  }
  const highlights = experience?.highlights ?? [];
  if (highlights.length !== REQUIRED_EXPERIENCE_HIGHLIGHTS) return false;
  return highlights.every(
    (highlight) => cleanText(highlight?.title) && cleanText(highlight?.description),
  );
}

/* =========================================================================
 * Homepage — Official Band Photos
 *
 * A restrained, Homepage-only, professionally-photographed showcase —
 * editorially distinct from the fan/live imagery on the Gallery &
 * Merchandise page and never pulled from it automatically. Optional: `null`/
 * absent is always valid (the whole section is then omitted), but a
 * PRESENT-but-invalid selection is a production-fail condition (unlike most
 * optional Homepage blocks) — there is no fallback substitute, official
 * general-purpose Gallery images, or invented content to fall back to, so
 * publishing garbage here would be worse than failing loudly. `strict`
 * mirrors every other production guard in this file.
 * ====================================================================== */

export interface NormalizedOfficialBandPhoto {
  _key: string;
  src: string;
  width: number;
  height: number;
  objectPosition: string;
  alt: string;
  srcSet: string;
  sizes: string;
  credit: { label: string; url: string | null } | null;
}

const MAX_OFFICIAL_BAND_PHOTOS = 4;
const OFFICIAL_BAND_PHOTO_WIDTH = 900;
/** Candidates never exceed `OFFICIAL_BAND_PHOTO_WIDTH` — see
 * `OfficialBandPhotos.astro`'s `sizes` (560px/980px breakpoints, matching
 * `BandMembers.astro`'s grid, 270px desktop cap). */
const OFFICIAL_BAND_PHOTO_WIDTHS = [280, 450, 900];

type RawOfficialBandPhoto = NonNullable<
  NonNullable<Homepage["officialBandPhotos"]>["photos"]
>[number]["mediaItem"];

/**
 * A photo must resolve to a real image asset with intrinsic dimensions and
 * non-blank alt text — the same bar every other content photo on this site
 * is held to. In strict (production) mode, a `[TEST`-prefixed title or alt
 * text also invalidates the photo — this is a production-only section, so a
 * development test fixture selected into it must never silently reach a
 * production build. Returns `null` for any reason the photo can't be
 * honestly rendered; the caller decides whether that's fatal (strict) or a
 * skip (lenient) — see `normalizeOfficialBandPhotos`.
 */
function normalizeOneOfficialBandPhoto(
  media: RawOfficialBandPhoto | null | undefined,
  strict: boolean,
): Omit<NormalizedOfficialBandPhoto, "_key"> | null {
  if (!media) return null;

  const alt = cleanText(media.alt);
  const image = media.image;
  const assetId = image?.asset?._id;
  const dimensions = image?.asset?.metadata?.dimensions;
  if (!alt || !image || !assetId || !dimensions?.width || !dimensions?.height) return null;

  if (strict) {
    const title = media.title ?? "";
    if (title.includes(TEST_MEDIA_ITEM_MARKER) || alt.includes(TEST_MEDIA_ITEM_MARKER)) {
      return null;
    }
  }

  const creditLabel = cleanText(media.creditLine);
  const credit = creditLabel ? { label: creditLabel, url: safeExternalUrl(media.creditUrl) } : null;

  const width = OFFICIAL_BAND_PHOTO_WIDTH;
  return {
    src: sanityImageUrl(image, { width }),
    width,
    height: Math.round(width / computeCroppedAspectRatio(image)),
    objectPosition: computeObjectPosition(image),
    alt,
    srcSet: sanityImageSrcSet(image, OFFICIAL_BAND_PHOTO_WIDTHS),
    sizes: "(max-width: 560px) 88vw, (max-width: 980px) 44vw, 270px",
    credit,
  };
}

/**
 * `homepage.officialBandPhotos.photos` is the single source of truth for
 * selection AND order — this loop never sorts or reorders. Capped at 4
 * (`MAX_OFFICIAL_BAND_PHOTOS`), matching Studio's own `Rule.max(4)`; the cap
 * counts *valid* photos only, so an invalid entry never consumes one of the
 * four slots in lenient mode. A reference appearing twice is deduplicated by
 * asset id, mirroring every other curated-selection normalizer in this file.
 *
 * Returns `[]` when the input is empty/absent — a fully valid state, the
 * caller omits the section. Returns `null` only in strict mode when an
 * invalid entry was selected — the caller treats that as a production-fail
 * condition (no fallback substitution), never in lenient mode, where an
 * invalid entry is simply skipped.
 */
export function normalizeOfficialBandPhotos(
  entries: NonNullable<Homepage["officialBandPhotos"]>["photos"] | null | undefined,
  strict: boolean,
): NormalizedOfficialBandPhoto[] | null {
  const items: NormalizedOfficialBandPhoto[] = [];
  const seenAssetIds = new Set<string>();

  for (const entry of entries ?? []) {
    if (items.length >= MAX_OFFICIAL_BAND_PHOTOS) break;

    const photo = normalizeOneOfficialBandPhoto(entry?.mediaItem, strict);
    if (photo === null) {
      if (strict) return null;
      continue;
    }
    const assetId = entry.mediaItem?.image?.asset?._id;
    if (assetId) {
      if (seenAssetIds.has(assetId)) continue;
      seenAssetIds.add(assetId);
    }

    items.push({ _key: entry._key, ...photo });
  }

  return items;
}

/* =========================================================================
 * About page (/about)
 *
 * The singleton is treated as ONE editorial unit, exactly like the Shows page:
 * anything required that is missing or malformed returns `null` for the whole
 * document, and `about.astro` then either fails the production build or falls
 * back as a complete block. Individual live fields are never patched with
 * fallback values.
 *
 * Member objects are CONSTRUCTED FIELD BY FIELD from whitelisted values. There
 * is no spread of a raw result anywhere here, and nothing about a rejected
 * biography, link, or name is ever logged — a document `_id` is the only safe
 * diagnostic.
 * ====================================================================== */

const MAX_BIOGRAPHY_PARAGRAPHS = 4;
const MAX_MEMBER_LINKS = 6;
const ABOUT_HERO_IMAGE_WIDTH = 1100;
/** Candidates never exceed `ABOUT_HERO_IMAGE_WIDTH` — see `AboutHero.astro`'s
 * `sizes` (860px breakpoint, 560px desktop cap). */
const ABOUT_HERO_IMAGE_WIDTHS = [560, 900, 1100];

type AboutPage = NonNullable<ABOUT_PAGE_QUERY_RESULT>;
type RawMemberLink = NonNullable<
  AboutPage["members"][number]["member"]["publicLinks"]
>[number];

export type MemberLinkType = RawMemberLink["linkType"];

const MEMBER_LINK_TYPES: readonly string[] = [
  "instagram",
  "facebook",
  "youtube",
  "spotify",
  "website",
  "other",
];

export interface NormalizedMemberLink {
  _key: string;
  linkType: MemberLinkType;
  /** Editor-supplied for "other"; otherwise null and the frontend names it. */
  label: string | null;
  url: string;
}

export interface NormalizedBandMember {
  _id: string;
  name: string;
  role: string;
  biography: string[];
  image: NormalizedMemberProfileImage;
  links: NormalizedMemberLink[];
}

export interface NormalizedMemberProfileImage {
  src: string;
  width: number;
  height: number;
  objectPosition: string;
  alt: string;
  /** Optional — present only for live Sanity-sourced images (never
   * generated for the local dev-fallback photos built in `about.astro`).
   * `<img srcset>`/`sizes` simply omit themselves when this is undefined. */
  srcSet?: string;
  sizes?: string;
}

export interface NormalizedAboutHeroImage {
  src: string;
  width: number;
  height: number;
  objectPosition: string;
  alt: string;
  /** Optional — present only for live Sanity-sourced images (never
   * generated for the local dev-fallback photo built in `about.astro`). */
  srcSet?: string;
  sizes?: string;
}

export interface NormalizedExperienceHighlight {
  _key: string;
  title: string;
  description: string;
}

export interface NormalizedAboutPageContent {
  intro: {
    kicker: string | null;
    heading: string;
    /** "Who We Are" — up to two paragraphs. Sourced from the new
     * `aboutPage.intro.paragraphs` field, falling back (temporarily, during
     * the phase-1 migration) to the deprecated `aboutPage.intro.lede` as a
     * single-item array when `paragraphs` is empty. Remove this fallback
     * once `lede` is deleted in phase 2. */
    paragraphs: string[];
    heroImage: NormalizedAboutHeroImage;
  };
  membersIntro: { kicker: string | null; heading: string; body: string | null };
  members: NormalizedBandMember[];
  testimonialsIntro: { kicker: string; heading: string };
  bookingCta: {
    kicker: string | null;
    heading: string;
    body: string;
    ctaLabel: string;
  };
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    ogImageUrl: string | null;
  };
}

export interface NormalizeAboutOptions {
  /**
   * When true, a biography still carrying the development test marker
   * invalidates the whole singleton. Set from the configured DATASET, not from
   * Astro's build mode — a production-mode build may legitimately point at
   * `development`.
   */
  rejectTestBiographies: boolean;
}

function isMemberLinkType(value: unknown): value is MemberLinkType {
  return typeof value === "string" && MEMBER_LINK_TYPES.includes(value);
}

/**
 * A public link survives only if its type is recognised AND its URL parses to
 * http/https. Studio's `Rule.uri` binds the Studio UI, not the Content API, so
 * the protocol is re-checked here — a `javascript:` href must never reach the
 * HTML. An "other" link additionally needs a meaningful editor label, because
 * there is no standard name the frontend could supply for it.
 *
 * Malformed links are dropped individually; they never invalidate the member.
 */
function normalizeMemberLinks(links: RawMemberLink[] | null): NormalizedMemberLink[] {
  if (!links) return [];

  const normalized: NormalizedMemberLink[] = [];
  for (const link of links) {
    if (normalized.length >= MAX_MEMBER_LINKS) break;
    if (!isMemberLinkType(link.linkType)) continue;

    const url = safeExternalUrl(link.url);
    if (!url) continue;

    const label = cleanText(link.label);
    if (link.linkType === "other" && !label) continue;

    normalized.push({ _key: link._key, linkType: link.linkType, label, url });
  }
  return normalized;
}

/**
 * Every member must be renderable in full. A missing name, role, biography, or
 * profile image is a content error, not a reason to quietly
 * publish a half-built card — so this returns `null` and takes the whole
 * singleton down with it.
 */
function normalizeBandMember(
  raw: AboutPage["members"][number]["member"] | null | undefined,
  options: NormalizeAboutOptions,
): NormalizedBandMember | null {
  if (!raw) return null;

  const name = cleanText(raw.name);
  const role = cleanText(raw.role);
  if (!name || !role) return null;

  const image = normalizeMemberProfileImage(raw.profileImage);
  if (!image) return null;

  const biography = (raw.biography ?? [])
    .map(cleanText)
    .filter((paragraph): paragraph is string => paragraph !== null)
    .slice(0, MAX_BIOGRAPHY_PARAGRAPHS);

  if (biography.length === 0) return null;
  if (
    options.rejectTestBiographies &&
    biography.some((paragraph) => paragraph.includes(TEST_BIOGRAPHY_MARKER))
  ) {
    return null;
  }

  return {
    _id: raw._id,
    name,
    role,
    biography,
    image,
    links: normalizeMemberLinks(raw.publicLinks),
  };
}

const MEMBER_PROFILE_IMAGE_WIDTH = 900;
/** Candidates never exceed `MEMBER_PROFILE_IMAGE_WIDTH` — the card renders
 * far smaller than 900px at every breakpoint (see `BandMembers.astro`'s
 * `sizes`), so this only lets a narrow viewport request less, never more. */
const MEMBER_PROFILE_IMAGE_WIDTHS = [280, 450, 900];

function normalizeMemberProfileImage(
  profileImage: AboutPage["members"][number]["member"]["profileImage"] | null | undefined,
): NormalizedMemberProfileImage | null {
  const image = profileImage?.image;
  const assetId = image?.asset?._id;
  const alt = cleanText(profileImage?.alt);
  if (!image || !assetId || !alt) return null;

  const width = MEMBER_PROFILE_IMAGE_WIDTH;
  return {
    src: sanityImageUrl(image, { width }),
    width,
    height: Math.round(width / computeCroppedAspectRatio(image)),
    objectPosition: computeObjectPosition(image),
    alt,
    srcSet: sanityImageSrcSet(image, MEMBER_PROFILE_IMAGE_WIDTHS),
    sizes: "(max-width: 560px) 88vw, (max-width: 980px) 44vw, 270px",
  };
}

/**
 * The About hero photograph must resolve to a real asset AND carry alt text.
 * This is the page's identity image; publishing it without a description would
 * leave the page's most prominent element unreadable to some visitors, so a
 * missing alt is a build-stopping problem rather than a silently empty
 * attribute.
 *
 * Width only, like the gallery — Sanity applies the editor's manual crop but
 * forces no aspect ratio, and the hotspot is handed to CSS `object-position`
 * so the browser performs exactly one crop into whatever shape the responsive
 * frame actually is.
 */
function normalizeAboutHeroImage(
  heroImage: AboutPage["intro"]["heroImage"] | null | undefined,
): NormalizedAboutHeroImage | null {
  const image = heroImage?.image;
  const assetId = image?.asset?._id;
  const alt = cleanText(heroImage?.alt);
  if (!image || !assetId || !alt) return null;

  const width = ABOUT_HERO_IMAGE_WIDTH;
  return {
    src: sanityImageUrl(image, { width }),
    width,
    height: Math.round(width / computeCroppedAspectRatio(image)),
    objectPosition: computeObjectPosition(image),
    alt,
    srcSet: sanityImageSrcSet(image, ABOUT_HERO_IMAGE_WIDTHS),
    sizes: "(max-width: 860px) 88vw, 560px",
  };
}

/**
 * Re-validated at render time, exactly like `safeSpotifyUrl`/
 * `safeAppleMusicUrl` above — Studio's own hostname `Rule.custom` binds the
 * Studio UI, not the Content API, so a button labeled Facebook must be
 * independently confirmed here to actually point at facebook.com before it
 * can render. Deliberately https-only (unlike `safeExternalUrl`, which still
 * accepts http for the label's main `url` field, kept for backward
 * compatibility).
 */
function safeFacebookUrl(value: string | null | undefined): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && parsed.hostname.replace(/^www\./, "") === "facebook.com"
      ? raw
      : null;
  } catch {
    return null;
  }
}

/** Same reasoning as `safeFacebookUrl` — must resolve to the real Instagram host. */
function safeInstagramUrl(value: string | null | undefined): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && parsed.hostname.replace(/^www\./, "") === "instagram.com"
      ? raw
      : null;
  } catch {
    return null;
  }
}

/** Same reasoning as `safeFacebookUrl` — must resolve to the real YouTube host. */
function safeYoutubeUrl(value: string | null | undefined): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && parsed.hostname.replace(/^www\./, "") === "youtube.com"
      ? raw
      : null;
  } catch {
    return null;
  }
}

/** Cap on `aboutPage.intro.paragraphs` — mirrors the schema's `Rule.max(2)`. */
const MAX_INTRO_PARAGRAPHS = 2;

export function normalizeAboutPageContent(
  page: ABOUT_PAGE_QUERY_RESULT,
  options: NormalizeAboutOptions,
): NormalizedAboutPageContent | null {
  if (!page) return null;

  const introHeading = cleanText(page.intro?.heading);
  const heroImage = normalizeAboutHeroImage(page.intro?.heroImage);

  // Phase-1 migration dual read: prefer the new `paragraphs` field; fall back
  // to wrapping the deprecated `lede` in a single-item array only when
  // `paragraphs` is empty. Remove the `lede` fallback once that field is
  // deleted in phase 2 (see docs/developer-guide.md §16/§18 and the ELT
  // content-migration plan).
  const introParagraphsFromNewField = (page.intro?.paragraphs ?? [])
    .map(cleanText)
    .filter((paragraph): paragraph is string => paragraph !== null)
    .slice(0, MAX_INTRO_PARAGRAPHS);
  const legacyLede = cleanText(page.intro?.lede);
  const introParagraphs =
    introParagraphsFromNewField.length > 0
      ? introParagraphsFromNewField
      : legacyLede
        ? [legacyLede]
        : [];

  const membersIntroHeading = cleanText(page.membersIntro?.heading);

  // Order and `_key` come straight from the stored array; capping and
  // filtering never reorder, and a dropped entry is fatal rather than skipped.
  const members: NormalizedBandMember[] = [];
  for (const entry of page.members ?? []) {
    const member = normalizeBandMember(entry?.member, options);
    if (!member) {
      members.length = 0;
      break;
    }
    members.push(member);
  }

  const testimonialsKicker = cleanText(page.testimonialsIntro?.kicker);
  const testimonialsHeading = cleanText(page.testimonialsIntro?.heading);

  const bookingHeading = cleanText(page.bookingCta?.heading);
  const bookingBody = cleanText(page.bookingCta?.body);
  const bookingCtaLabel = cleanText(page.bookingCta?.ctaLabel);

  if (
    !introHeading ||
    introParagraphs.length === 0 ||
    !heroImage ||
    !membersIntroHeading ||
    members.length === 0 ||
    !testimonialsKicker ||
    !testimonialsHeading ||
    !bookingHeading ||
    !bookingBody ||
    !bookingCtaLabel
  ) {
    return null;
  }

  return {
    intro: {
      kicker: cleanText(page.intro?.kicker),
      heading: introHeading,
      paragraphs: introParagraphs,
      heroImage,
    },
    membersIntro: {
      kicker: cleanText(page.membersIntro?.kicker),
      heading: membersIntroHeading,
      body: cleanText(page.membersIntro?.body),
    },
    members,
    testimonialsIntro: { kicker: testimonialsKicker, heading: testimonialsHeading },
    bookingCta: {
      kicker: cleanText(page.bookingCta?.kicker),
      heading: bookingHeading,
      body: bookingBody,
      ctaLabel: bookingCtaLabel,
    },
    seo: {
      metaTitle: cleanText(page.seo?.metaTitle),
      metaDescription: cleanText(page.seo?.metaDescription),
      ogImageUrl: getOgImageUrl(page.seo?.ogImage),
    },
  };
}

/* =========================================================================
 * Shows page (/shows)
 *
 * A discriminated union, not one loose event shape. `kind` is the
 * discriminant, and it is assigned HERE from the function that produced the
 * object — never copied out of the query result — so a component branching on
 * `kind === "private"` can never be handed an object carrying public fields.
 *
 * The privacy rule that matters: a private normalized object is CONSTRUCTED
 * FIELD BY FIELD. Nothing in this file spreads a raw private query result,
 * and `NormalizedPrivateEvent` has no field capable of holding editor-typed
 * text. Even if the private projection were widened by accident, the extra
 * fields would stop here rather than reaching a component.
 * ====================================================================== */

export type PublicShowStatus = "scheduled" | "cancelled" | "postponed";

const PUBLIC_SHOW_STATUSES: readonly string[] = [
  "scheduled",
  "cancelled",
  "postponed",
];

export interface NormalizedPublicShow {
  _id: string;
  kind: "public";
  status: PublicShowStatus;
  title: string;
  venue: string;
  location: string;
  startDateTime: string;
  endDateTime: string | null;
  description: string | null;
  externalEventUrl: string | null;
}

/**
 * Everything a private booking is allowed to become on the way to the page:
 * an id to key the list by, and two instants. There is deliberately no field
 * here for a title, venue, location, description, slug, status, visibility,
 * or URL — the visible "Private Event" wording comes from
 * `web/src/data/showsData.ts`.
 */
export interface NormalizedPrivateEvent {
  _id: string;
  kind: "private";
  startDateTime: string;
  endDateTime: string | null;
}

export type NormalizedShowsEvent = NormalizedPublicShow | NormalizedPrivateEvent;

/** Both public Shows queries project identically, so one normalizer serves both. */
type RawPublicShow =
  | SHOWS_UPCOMING_PUBLIC_EVENTS_QUERY_RESULT[number]
  | SHOWS_RECENT_PUBLIC_EVENTS_QUERY_RESULT[number];

/** Non-blank text, trimmed — or null. Whitespace-only is treated as absent. */
function cleanText(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export interface NormalizedShowsPageContent {
  intro: {
    kicker: string | null;
    heading: string;
    paragraphs: string[];
  };
  upcoming: { heading: string };
  recent: { kicker: string | null; heading: string };
  emptyState: { title: string; message: string; actionLabel: string };
  bookingCta: { kicker: string | null; heading: string; body: string; ctaLabel: string };
  seo: { metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null };
}

/**
 * Treats the Shows singleton as one complete editorial unit. A malformed
 * published document returns null rather than mixing individual live fields
 * with code fallback copy. The page then falls back only in non-production
 * datasets and fails production builds with a clear error.
 */
export function normalizeShowsPageContent(
  page: SHOWS_PAGE_QUERY_RESULT,
): NormalizedShowsPageContent | null {
  if (!page) return null;

  const introHeading = cleanText(page.intro?.heading);
  const introParagraphs = (page.intro?.paragraphs ?? [])
    .map(cleanText)
    .filter((paragraph): paragraph is string => paragraph !== null)
    .slice(0, 2);
  const upcomingHeading = cleanText(page.upcoming?.heading);
  const recentHeading = cleanText(page.recent?.heading);
  const emptyTitle = cleanText(page.emptyState?.title);
  const emptyMessage = cleanText(page.emptyState?.message);
  const emptyActionLabel = cleanText(page.emptyState?.actionLabel);
  const bookingHeading = cleanText(page.bookingCta?.heading);
  const bookingBody = cleanText(page.bookingCta?.body);
  const bookingCtaLabel = cleanText(page.bookingCta?.ctaLabel);

  if (
    !introHeading ||
    introParagraphs.length === 0 ||
    !upcomingHeading ||
    !recentHeading ||
    !emptyTitle ||
    !emptyMessage ||
    !emptyActionLabel ||
    !bookingHeading ||
    !bookingBody ||
    !bookingCtaLabel
  ) {
    return null;
  }

  return {
    intro: {
      kicker: cleanText(page.intro?.kicker),
      heading: introHeading,
      paragraphs: introParagraphs,
    },
    upcoming: { heading: upcomingHeading },
    recent: {
      kicker: cleanText(page.recent?.kicker),
      heading: recentHeading,
    },
    emptyState: {
      title: emptyTitle,
      message: emptyMessage,
      actionLabel: emptyActionLabel,
    },
    bookingCta: {
      kicker: cleanText(page.bookingCta?.kicker),
      heading: bookingHeading,
      body: bookingBody,
      ctaLabel: bookingCtaLabel,
    },
    seo: {
      metaTitle: cleanText(page.seo?.metaTitle),
      metaDescription: cleanText(page.seo?.metaDescription),
      ogImageUrl: getOgImageUrl(page.seo?.ogImage),
    },
  };
}

/**
 * Studio's `Rule.uri({scheme: ['http', 'https']})` binds the Studio UI, not
 * the Content API, so this re-checks the protocol at render time rather than
 * trusting it. Anything `URL` cannot parse, and anything that parses to a
 * scheme other than http/https (`javascript:`, `data:`, `file:`), is dropped
 * to null and the card simply renders without its link.
 *
 * The validated string is returned verbatim rather than `URL`-normalized, so
 * the rendered href is exactly what the editor entered.
 */
function safeExternalUrl(value: string | null | undefined): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  try {
    const { protocol } = new URL(raw);
    return protocol === "http:" || protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}

function isPublicShowStatus(value: unknown): value is PublicShowStatus {
  return typeof value === "string" && PUBLIC_SHOW_STATUSES.includes(value);
}

/**
 * Whitelists every public field onto a freshly-built object, and drops any
 * event a card cannot honestly render: missing title, venue, location, an
 * unparseable start instant, or a status outside the three known values.
 *
 * Rejected records are dropped silently and no content value is logged —
 * build logs are not a place to echo event text. A document `_id` would be
 * the only safe diagnostic if one is ever needed.
 */
export function normalizePublicShows(events: RawPublicShow[]): NormalizedPublicShow[] {
  const shows: NormalizedPublicShow[] = [];

  for (const event of events) {
    const title = cleanText(event.title);
    const venue = cleanText(event.venue);
    const location = cleanText(event.location);

    if (!title || !venue || !location) continue;
    if (!isValidDateTime(event.startDateTime)) continue;
    if (!isPublicShowStatus(event.status)) continue;

    shows.push({
      _id: event._id,
      kind: "public",
      status: event.status,
      title,
      venue,
      location,
      startDateTime: event.startDateTime,
      // An unparseable end time degrades to "no end time" rather than
      // invalidating an otherwise renderable show.
      endDateTime: isValidDateTime(event.endDateTime) ? event.endDateTime : null,
      description: cleanText(event.description),
      externalEventUrl: safeExternalUrl(event.externalEventUrl),
    });
  }

  return shows;
}

/**
 * Builds each private entry explicitly from two fields. Note what is absent:
 * no spread, no `...event`, no `Object.assign`. Malformed entries with an
 * unparseable start instant are dropped.
 */
export function normalizePrivateEvents(
  events: SHOWS_UPCOMING_PRIVATE_EVENTS_QUERY_RESULT,
): NormalizedPrivateEvent[] {
  const privateEvents: NormalizedPrivateEvent[] = [];

  for (const event of events) {
    if (!isValidDateTime(event.startDateTime)) continue;

    privateEvents.push({
      _id: event._id,
      kind: "private",
      startDateTime: event.startDateTime,
      endDateTime: isValidDateTime(event.endDateTime) ? event.endDateTime : null,
    });
  }

  return privateEvents;
}

/* =========================================================================
 * Gallery & Merchandise page (/gallery-merch)
 *
 * Renamed from the Media & Merch page (`mediaPage` → `galleryPage`) — see
 * docs/gallery-merch.md. This page has NO featured-video field or section;
 * featured, click-to-load video locations are now only the Homepage hero
 * and the Music page (see the `normalizeFeaturedVideo` section below).
 *
 * `galleryPage.gallery.items` and `galleryPage.merch.items` are ordered
 * arrays of a hand-picked, curated selection — the same editorial weight as
 * `aboutPage.members`. This file therefore follows the About page's
 * precedent, not the Homepage's: a curated selection is treated STRICTLY in
 * production (any invalid selected entry fails the whole build, exactly like
 * `normalizeBandMember` taking the whole About singleton down) and
 * LENIENTLY everywhere else (an invalid entry is silently dropped).
 *
 * Which behavior applies is controlled by `options.strict`, which callers set
 * from the configured DATASET (`isProductionDataset`), not from Astro's
 * build mode — see `NormalizeGalleryPageOptions`.
 *
 * As with the rest of this file, per-item objects are built field by field —
 * no spreading a raw query result — and nothing about a rejected item's
 * content is ever logged.
 * ====================================================================== */

export type MediaGalleryCategory = "performance" | "venue-crowd";

const GALLERY_CATEGORIES: readonly MediaGalleryCategory[] = ["performance", "venue-crowd"];

const MAX_GALLERY_ITEMS = 24;
const MAX_MERCH_ITEMS = 24;
/** Thumbnail tiles never need more than this; the CDN and CSS `object-fit`
 * do the rest (see `computeObjectPosition`'s doc comment above). */
const GALLERY_THUMB_WIDTH = 700;
/** Candidates never exceed `GALLERY_THUMB_WIDTH` — see `MediaGallery.astro`'s
 * `sizes` (900px/600px breakpoints, 282px desktop cap). */
const GALLERY_THUMB_WIDTHS = [282, 450, 700];
/** Bounded, not "full resolution" — the largest size the lightbox actually
 * displays, and the only other size requested for a gallery photo. */
const GALLERY_LIGHTBOX_WIDTH = 1600;
const MERCH_IMAGE_WIDTH = 640;

type GalleryPage = NonNullable<GALLERY_PAGE_QUERY_RESULT>;
type RawGalleryPhoto = NonNullable<GalleryPage["gallery"]["items"]>[number]["media"];
type RawGalleryVideo = NonNullable<GalleryPage["gallery"]["videos"]>[number]["media"];
type RawMerchItem = NonNullable<GalleryPage["merch"]["items"]>[number]["item"];

/** Mirrors Studio's `Rule.max(12)` on `galleryPage.gallery.videos` — Studio
 * validation binds the Studio UI, not the Content API, so the cap is
 * re-applied here exactly like `MAX_GALLERY_ITEMS` / `MAX_MERCH_ITEMS`. */
const MAX_GALLERY_VIDEOS = 12;
/** Same tile size as a photo thumbnail — gallery video tiles are the same
 * grid cell size as a photo tile (see `MediaGallery.astro`). */
const GALLERY_VIDEO_POSTER_WIDTH = GALLERY_THUMB_WIDTH;

export interface NormalizedGalleryCredit {
  /** The exact approved attribution text, rendered verbatim — never rewritten. */
  label: string;
  url: string | null;
}

export interface NormalizedGalleryPhoto {
  _key: string;
  title: string;
  alt: string;
  category: MediaGalleryCategory | null;
  /** `srcSet`/`sizes` are optional — present only for live Sanity-sourced
   * photos, never generated for the local dev-fallback images built in
   * `gallery-merch.astro`. */
  thumbnail: {
    src: string;
    width: number;
    height: number;
    objectPosition: string;
    srcSet?: string;
    sizes?: string;
  };
  /** A larger, still-bounded size for the lightbox — never a second,
   * undisplayed download and never the original asset unbounded. */
  full: { src: string; width: number; height: number };
  credit: NormalizedGalleryCredit | null;
}

export interface NormalizedGalleryVideoPoster {
  src: string;
  width: number;
  height: number;
  objectPosition: string;
}

export interface NormalizedGalleryVideo {
  _key: string;
  title: string;
  /** The validated 11-character YouTube video id, via the approved
   * `getYouTubeVideoId` — never a third, divergent parser. */
  videoId: string;
  /** Built from `videoId`, not the raw stored URL — a canonical
   * `https://www.youtube.com/watch?v=<id>` link, safe and consistent
   * regardless of which valid stored format (watch, youtu.be, embed,
   * shorts, or a youtube-nocookie.com embed link) the editor entered. Used
   * only for the no-JavaScript external-link fallback; the activated
   * player always uses `youtube-nocookie.com` instead (see
   * `scripts/mediaGallery.ts`). */
  watchUrl: string;
  /** `null` when no `videoPoster` was supplied — the tile then falls back
   * to the code-owned ELT logo, never a YouTube-hosted thumbnail (that
   * would require a pre-activation request to a Google/YouTube host). */
  poster: NormalizedGalleryVideoPoster | null;
  credit: NormalizedGalleryCredit | null;
}

/**
 * The Music page's Featured video sub-object — deliberately NOT a "whole
 * section" shape (see `NormalizedFeatured` near `normalizeMusicPageContent`
 * for that). This is validated as a ready-to-render video or nothing: unlike
 * the Homepage hero's `getHeroVideoUrl`/`getYouTubeVideoId` two-step (raw URL
 * resolved now, ID validated later at render time), `videoId` here is already
 * confirmed valid — there is no second validation step downstream.
 */
export interface NormalizedFeaturedVideoRef {
  videoId: string;
  /** The referenced mediaItem's own `title`. `music.astro` falls back to a
   * safe neutral string when this is `null`, mirroring `getHeroVideoTitle`. */
  title: string | null;
}

export interface NormalizedMerchImage {
  src: string;
  width: number;
  height: number;
  objectPosition: string;
  alt: string;
}

export interface NormalizedMerchItem {
  _id: string;
  name: string;
  description: string;
  image: NormalizedMerchImage | null;
  priceDisplay: string | null;
  availabilityNote: string | null;
}

export interface NormalizedGallerySection {
  kicker: string | null;
  /** Required — this is the Gallery & Merchandise page's only heading (its
   * `<h1>`), always present once the page itself is non-null, even when
   * `items`/`videos` are both empty. */
  heading: string;
  body: string | null;
  items: NormalizedGalleryPhoto[];
  /** Independently ordered from `items` — see the module doc comment above
   * "Gallery ordering". */
  videos: NormalizedGalleryVideo[];
  /** Whether at least one normalized item uses each category — the exact
   * signal `MediaGallery.astro` needs to decide which filter buttons exist,
   * without building three duplicate image arrays. */
  hasPerformance: boolean;
  hasVenueCrowd: boolean;
  /** Whether the code-owned "Videos" filter should render at all — true
   * only when `videos` is non-empty. */
  hasVideos: boolean;
}

export interface NormalizedMerchSection {
  kicker: string | null;
  heading: string | null;
  body: string | null;
  items: NormalizedMerchItem[];
}

/**
 * `null` when the section is off (editor hasn't enabled it, or hasn't
 * filled in the required copy) — omitted from the page entirely. When
 * present but `formUrl` is `null`, the section still renders (the editor
 * has turned it on) but with a clear development/configuration notice
 * instead of a working link — the fail-closed state required for a Google
 * Form that doesn't exist yet, mirroring `Newsletter.astro`'s
 * `signupUrl: string | null` contract exactly.
 */
export interface NormalizedEventMediaSubmission {
  kicker: string | null;
  heading: string;
  explanation: string;
  ctaLabel: string;
  formUrl: string | null;
}

export interface NormalizedGalleryPageContent {
  gallery: NormalizedGallerySection;
  eventMediaSubmission: NormalizedEventMediaSubmission | null;
  merch: NormalizedMerchSection;
  bookingCta: { kicker: string | null; heading: string; body: string; ctaLabel: string };
  seo: { metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null };
}

export interface NormalizeGalleryPageOptions {
  /**
   * True only when the configured Sanity DATASET is `production` — set from
   * `import.meta.env.PUBLIC_SANITY_DATASET`, not from Astro's build mode,
   * exactly like `NormalizeAboutOptions.rejectTestBiographies`.
   */
  strict: boolean;
}

function isGalleryCategory(value: unknown): value is MediaGalleryCategory {
  return typeof value === "string" && (GALLERY_CATEGORIES as readonly string[]).includes(value);
}

/**
 * `null` means "no category" (valid — the item is "uncategorized" and
 * appears only in "All"). `"invalid"` means the stored value is neither
 * blank nor one of the two known categories — a raw API write bypassing
 * Studio's controlled list, since Studio itself cannot produce this.
 */
function normalizeGalleryCategory(
  value: string | null | undefined,
): MediaGalleryCategory | null | "invalid" {
  if (value == null) return null;
  return isGalleryCategory(value) ? value : "invalid";
}

/**
 * `creditUrl` is valid only when `creditLine` is present — enforced again
 * here because Studio's validation binds the Studio UI, not the Content API.
 * `null` means "no credit at all." `"invalid"` means a credit URL was
 * supplied but is not a safe `http:`/`https:` URL — in strict mode this
 * fails the item outright rather than silently changing what the published
 * attribution links to; in lenient mode it degrades to unlinked text.
 */
function normalizeGalleryCredit(
  creditLine: string | null | undefined,
  creditUrl: string | null | undefined,
  strict: boolean,
): NormalizedGalleryCredit | null | "invalid" {
  const label = cleanText(creditLine);
  if (!label) return null;

  const rawUrl = cleanText(creditUrl);
  if (!rawUrl) return { label, url: null };

  const safeUrl = safeExternalUrl(rawUrl);
  if (safeUrl) return { label, url: safeUrl };

  return strict ? "invalid" : { label, url: null };
}

/**
 * A gallery photo must resolve to a real image asset, with intrinsic
 * dimensions and non-blank alt text. Returns `null` for ANY reason a
 * photo cannot be honestly rendered (unresolved reference, missing asset,
 * missing alt, an unknown category, or — in strict mode only — an invalid
 * credit URL). The caller decides what a `null` means: dropped in lenient
 * mode, fatal in strict mode. See the module doc comment above.
 */
function normalizeOneGalleryPhoto(
  media: RawGalleryPhoto | null | undefined,
  strict: boolean,
): Omit<NormalizedGalleryPhoto, "_key"> | null {
  if (!media) return null;

  const title = cleanText(media.title);
  const alt = cleanText(media.alt);
  const image = media.image;
  const assetId = image?.asset?._id;
  const dimensions = image?.asset?.metadata?.dimensions;
  if (!title || !alt || !image || !assetId || !dimensions?.width || !dimensions?.height) {
    return null;
  }

  const category = normalizeGalleryCategory(media.category);
  if (category === "invalid") {
    if (strict) return null;
  }

  const credit = normalizeGalleryCredit(media.creditLine, media.creditUrl, strict);
  if (credit === "invalid") return null;

  const thumbWidth = GALLERY_THUMB_WIDTH;
  const lightboxWidth = GALLERY_LIGHTBOX_WIDTH;

  return {
    title,
    alt,
    // An unknown category in lenient mode degrades to "uncategorized"
    // rather than dropping an otherwise-valid photo — the same treatment a
    // malformed optional attribute gets everywhere else in this file.
    category: category === "invalid" ? null : category,
    thumbnail: {
      src: sanityImageUrl(image, { width: thumbWidth }),
      width: thumbWidth,
      height: Math.round(thumbWidth / computeCroppedAspectRatio(image)),
      objectPosition: computeObjectPosition(image),
      srcSet: sanityImageSrcSet(image, GALLERY_THUMB_WIDTHS),
      sizes: "(max-width: 600px) 44vw, (max-width: 900px) 29vw, 282px",
    },
    full: {
      src: sanityImageUrl(image, { width: lightboxWidth }),
      width: lightboxWidth,
      height: Math.round(lightboxWidth / computeCroppedAspectRatio(image)),
    },
    // `credit === "invalid"` already returned above, so this is narrowed to
    // `NormalizedGalleryCredit | null`.
    credit,
  };
}

/**
 * `galleryPage.gallery.items` is the single source of truth for gallery
 * membership AND order — this loop never sorts or reorders. Invalid entries
 * are filtered out (lenient mode) BEFORE the 24-item cap is applied, so an
 * invalid entry never consumes one of the 24 slots. In strict mode, any
 * invalid selected entry invalidates the whole gallery (and, via the
 * top-level caller, the whole page) rather than silently publishing a
 * curated selection with something missing from it.
 */
function normalizeGalleryItems(
  entries: GalleryPage["gallery"]["items"],
  strict: boolean,
): NormalizedGalleryPhoto[] | null {
  const items: NormalizedGalleryPhoto[] = [];

  for (const entry of entries ?? []) {
    if (items.length >= MAX_GALLERY_ITEMS) break;

    const photo = normalizeOneGalleryPhoto(entry?.media, strict);
    if (photo === null) {
      if (strict) return null;
      continue;
    }
    items.push({ _key: entry._key, ...photo });
  }

  return items;
}

/**
 * `null` means no poster was supplied (valid — the tile falls back to the
 * code-owned ELT logo) OR — in lenient mode — a poster WAS supplied but is
 * unusable, which degrades to the same "no poster" state. `"invalid"` means
 * a poster was supplied but is unusable, in strict mode: a supplied-but-
 * broken poster is a production-fail condition, exactly like
 * `normalizeMerchImage`. The poster is decorative (no alt required) — the
 * surrounding control already supplies the accessible name ("Play video:
 * {title}"), so there is nothing here for alt text to duplicate.
 */
function normalizeGalleryVideoPoster(
  raw: RawGalleryVideo["videoPoster"] | null | undefined,
  strict: boolean,
): NormalizedGalleryVideoPoster | null | "invalid" {
  if (!raw) return null;

  const assetId = raw.asset?._id;
  const dimensions = raw.asset?.metadata?.dimensions;
  if (!raw.asset || !assetId || !dimensions?.width || !dimensions?.height) {
    return strict ? "invalid" : null;
  }

  const width = GALLERY_VIDEO_POSTER_WIDTH;
  return {
    src: sanityImageUrl(raw, { width }),
    width,
    height: Math.round(width / computeCroppedAspectRatio(raw)),
    objectPosition: computeObjectPosition(raw),
  };
}

/**
 * A `[TEST`-prefixed title marks a development/placeholder `mediaItem` — see
 * `TEST_MEDIA_ITEM_MARKER`'s doc comment in `mediaData.ts`.
 */
function isTestMediaItemTitle(title: string): boolean {
  return title.startsWith(TEST_MEDIA_ITEM_MARKER);
}

/**
 * A gallery video must resolve to a real, YouTube-provider video
 * `mediaItem` (not merely "resolved" — see the query's own doc comment on
 * why `mediaType`/`videoProvider` are projected here but not for photos),
 * with a title and a URL that actually extracts a playable video id via the
 * approved, unmodified `getYouTubeVideoId`. Returns `null` for ANY reason a
 * video cannot be honestly rendered — unresolved reference, wrong media
 * type/provider, missing title, malformed/unextractable URL, an invalid
 * poster (strict mode only), or — strict mode only — a title/id that
 * matches a known development placeholder (`isTestMediaItemTitle` /
 * `TEST_VIDEO_ID`). The caller decides what a `null` means: dropped in
 * lenient mode, fatal in strict mode — see the module doc comment.
 */
function normalizeOneGalleryVideo(
  media: RawGalleryVideo | null | undefined,
  strict: boolean,
): Omit<NormalizedGalleryVideo, "_key"> | null {
  if (!media) return null;
  if (media.mediaType !== "video" || media.videoProvider !== "youtube") return null;

  const title = cleanText(media.title);
  if (!title) return null;
  if (strict && isTestMediaItemTitle(title)) return null;

  const rawUrl = cleanText(media.videoUrl);
  const videoId = rawUrl ? getYouTubeVideoId(rawUrl) : null;
  if (!videoId) return null;
  if (strict && videoId === TEST_VIDEO_ID) return null;

  const poster = normalizeGalleryVideoPoster(media.videoPoster, strict);
  if (poster === "invalid") return null;

  const credit = normalizeGalleryCredit(media.creditLine, media.creditUrl, strict);
  if (credit === "invalid") return null;

  return {
    title,
    videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    poster,
    credit,
  };
}

/**
 * `galleryPage.gallery.videos` is the single source of truth for gallery-
 * video membership AND order, independent of `gallery.items`'s photo
 * order — same cap-after-filter, never-reorder contract as
 * `normalizeGalleryItems`. A reference to the same underlying `mediaItem`
 * appearing twice is additionally deduplicated by `_id` here — Studio's own
 * custom validation already blocks this in the Studio UI, but that binds
 * the Studio UI, not the Content API, matching this file's established
 * convention of re-checking Studio-enforced rules at the content layer.
 */
function normalizeGalleryVideos(
  entries: GalleryPage["gallery"]["videos"],
  strict: boolean,
): NormalizedGalleryVideo[] | null {
  const videos: NormalizedGalleryVideo[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries ?? []) {
    if (videos.length >= MAX_GALLERY_VIDEOS) break;

    const video = normalizeOneGalleryVideo(entry?.media, strict);
    if (video === null) {
      if (strict) return null;
      continue;
    }
    if (entry?.media?._id && seenIds.has(entry.media._id)) continue;
    if (entry?.media?._id) seenIds.add(entry.media._id);

    videos.push({ _key: entry._key, ...video });
  }

  return videos;
}

/**
 * `null` means no image was chosen (a valid, polished text-only state) OR —
 * in lenient mode — an image WAS chosen but is unusable, which degrades to
 * the same "no image" state rather than blocking the whole item.
 * `"invalid"` means an image was chosen but is unusable, in strict mode:
 * "a supplied but unresolved merchandise image" is a production-fail
 * condition, not a silent downgrade.
 */
function normalizeMerchImage(
  raw: RawMerchItem["image"] | null | undefined,
  strict: boolean,
): NormalizedMerchImage | null | "invalid" {
  if (!raw) return null;

  const image = raw.image;
  const assetId = image?.asset?._id;
  const dimensions = image?.asset?.metadata?.dimensions;
  const alt = cleanText(raw.alt);
  if (!image || !assetId || !dimensions?.width || !dimensions?.height || !alt) {
    return strict ? "invalid" : null;
  }

  const width = MERCH_IMAGE_WIDTH;
  return {
    src: sanityImageUrl(image, { width }),
    width,
    height: Math.round(width / computeCroppedAspectRatio(image)),
    objectPosition: computeObjectPosition(image),
    alt,
  };
}

/**
 * Requires name + description, exactly like every other required-pair check
 * in this file. Rejects the exact development test marker in strict mode
 * only — `TEST_PRODUCT_MARKER` must never reach a production build, but
 * development is allowed to render its own marked placeholder content (the
 * marker would be useless as a dev fixture otherwise).
 */
function normalizeOneMerchItem(
  item: RawMerchItem | null | undefined,
  strict: boolean,
): NormalizedMerchItem | null {
  if (!item) return null;

  const name = cleanText(item.name);
  const description = cleanText(item.description);
  if (!name || !description) return null;

  if (strict && (name.includes(TEST_PRODUCT_MARKER) || description.includes(TEST_PRODUCT_MARKER))) {
    return null;
  }

  const image = normalizeMerchImage(item.image, strict);
  if (image === "invalid") return null;

  return {
    _id: item._id,
    name,
    description,
    image,
    priceDisplay: cleanText(item.priceDisplay),
    availabilityNote: cleanText(item.availabilityNote),
  };
}

/** Same cap-after-filter, never-reorder contract as `normalizeGalleryItems`. */
function normalizeMerchItems(
  entries: GalleryPage["merch"]["items"],
  strict: boolean,
): NormalizedMerchItem[] | null {
  const items: NormalizedMerchItem[] = [];

  for (const entry of entries ?? []) {
    if (items.length >= MAX_MERCH_ITEMS) break;

    const merchItem = normalizeOneMerchItem(entry?.item, strict);
    if (merchItem === null) {
      if (strict) return null;
      continue;
    }
    items.push(merchItem);
  }

  return items;
}

/**
 * Structural, not tied to `musicPage`'s own generated type — kept general in
 * case a future page-level featured video is ever added elsewhere, the same
 * way it was previously shared between `mediaPage` and `musicPage` before
 * the Gallery & Merchandise page's featured-video section was removed
 * entirely (`docs/gallery-merch.md`). Featured, click-to-load video
 * locations today are only the Homepage hero (its own, separate
 * `getHeroVideoUrl`/`getHeroVideoTitle` pair below) and the Music page.
 */
interface RawFeaturedVideoRefLike {
  videoUrl?: string | null;
  title?: string | null;
}

/**
 * Validates one Music-page Featured video reference on its own — no
 * "kicker"/"heading", and no page-level "null means omit the section"
 * behavior (that lives in `normalizeMusicPageContent`'s `featured` handling,
 * since the Featured section itself always renders regardless of whether a
 * video is selected). Unlike the Homepage hero's two-step
 * `getHeroVideoUrl`/`getYouTubeVideoId` split, this calls `getYouTubeVideoId`
 * itself and returns an already-validated `videoId` — a malformed or
 * non-YouTube URL resolves to `null` here, not downstream.
 */
function normalizeFeaturedVideoRef(
  raw: RawFeaturedVideoRefLike | null | undefined,
): NormalizedFeaturedVideoRef | null {
  const videoUrl = cleanText(raw?.videoUrl);
  if (!videoUrl) return null;

  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) return null;

  return { videoId, title: cleanText(raw?.title) };
}

/**
 * Approved, planned production feature — not conditional on further product
 * sign-off, only on the Google Form actually existing. `null` when disabled
 * or missing its required copy — omits the section entirely. Otherwise
 * always returned complete, with `formUrl` independently `null` when not
 * yet configured or invalid — see `NormalizedEventMediaSubmission`'s doc
 * comment for what that state means to the caller. This is deliberately
 * fail-closed: nothing here claims the Google Form's own consent/license
 * mechanism is operational — that only becomes true once a real form and
 * its consent language exist (see `docs/gallery-merch.md` and
 * `docs/client-questions.md`).
 */
function normalizeEventMediaSubmission(
  raw: GalleryPage["eventMediaSubmission"],
): NormalizedEventMediaSubmission | null {
  if (!raw?.enabled) return null;

  const heading = cleanText(raw.heading);
  const explanation = cleanText(raw.explanation);
  const ctaLabel = cleanText(raw.ctaLabel);
  if (!heading || !explanation || !ctaLabel) return null;

  return {
    kicker: cleanText(raw.kicker),
    heading,
    explanation,
    ctaLabel,
    formUrl: safeGoogleFormUrl(raw.formUrl),
  };
}

/**
 * Treats the Gallery & Merchandise singleton as one editorial unit for its
 * required core (gallery heading + booking CTA), exactly like About and
 * Shows — anything required there that is missing or malformed returns
 * `null` for the whole document. There is no page-intro field on this page
 * at all: `gallery.heading` is the page's only heading (its `<h1>`) and is
 * always rendered, even with zero photos/videos selected. The gallery and
 * merch selections are handled by their own strict/lenient normalizers
 * above; a `null` from either also invalidates the whole page, but ONLY in
 * strict mode (see the module doc comment). There is no featured-video field
 * on this page at all — see the module doc comment.
 *
 * Do NOT fail merely because: the gallery (photos or videos) is empty,
 * merchandise is empty, a category is absent, a media credit is absent, a
 * merchandise image is absent, price/availability text is absent, or
 * optional SEO overrides are absent — none of those reach this function's
 * `null`-return paths. `gallery.videos` is normalized by its own
 * strict/lenient rules (`normalizeGalleryVideos`, mirroring
 * `normalizeGalleryItems`'s cap-after-filter, never-reorder contract, plus a
 * production-only rejection of development placeholder video content) —
 * an empty or absent `videos` selection is always valid and leaves a
 * photo-only gallery unchanged.
 */
export function normalizeGalleryPageContent(
  page: GALLERY_PAGE_QUERY_RESULT,
  options: NormalizeGalleryPageOptions,
): NormalizedGalleryPageContent | null {
  if (!page) return null;

  const galleryHeading = cleanText(page.gallery?.heading);
  const bookingHeading = cleanText(page.bookingCta?.heading);
  const bookingBody = cleanText(page.bookingCta?.body);
  const bookingCtaLabel = cleanText(page.bookingCta?.ctaLabel);

  if (!galleryHeading || !bookingHeading || !bookingBody || !bookingCtaLabel) {
    return null;
  }

  const galleryItems = normalizeGalleryItems(page.gallery?.items, options.strict);
  if (galleryItems === null) return null;

  const galleryVideos = normalizeGalleryVideos(page.gallery?.videos, options.strict);
  if (galleryVideos === null) return null;

  const merchItems = normalizeMerchItems(page.merch?.items, options.strict);
  if (merchItems === null) return null;

  return {
    gallery: {
      kicker: cleanText(page.gallery?.kicker),
      heading: galleryHeading,
      body: cleanText(page.gallery?.body),
      items: galleryItems,
      videos: galleryVideos,
      hasPerformance: galleryItems.some((item) => item.category === "performance"),
      hasVenueCrowd: galleryItems.some((item) => item.category === "venue-crowd"),
      hasVideos: galleryVideos.length > 0,
    },
    eventMediaSubmission: normalizeEventMediaSubmission(page.eventMediaSubmission),
    merch: {
      kicker: cleanText(page.merch?.kicker),
      heading: cleanText(page.merch?.heading),
      body: cleanText(page.merch?.body),
      items: merchItems,
    },
    bookingCta: {
      kicker: cleanText(page.bookingCta?.kicker),
      heading: bookingHeading,
      body: bookingBody,
      ctaLabel: bookingCtaLabel,
    },
    seo: {
      metaTitle: cleanText(page.seo?.metaTitle),
      metaDescription: cleanText(page.seo?.metaDescription),
      ogImageUrl: getOgImageUrl(page.seo?.ogImage),
    },
  };
}

/* =========================================================================
 * Contact & Booking page (/contact-booking)
 *
 * `intro` is the required editorial core, treated as one unit exactly like
 * every other page singleton's intro — missing/incomplete invalidates the
 * whole document, in every mode.
 *
 * `newsletterCta` and `faq` follow the same strict/lenient split as the
 * Gallery & Merchandise and Music pages' curated selections
 * (`NormalizeContactPageOptions.strict`, set by the caller from the
 * configured DATASET): in `production`, a missing/incomplete newsletter
 * callout or an empty FAQ list is treated as mandatory production content
 * and invalidates the whole document, exactly like an incomplete `intro`.
 * Everywhere else, both remain independently optional and degrade on their
 * own — a missing/incomplete newsletter callout omits just that section,
 * and an empty FAQ list simply renders no FAQ entries — so a
 * `development`-dataset preview stays usable while this content is still
 * being written. FAQ entries are filtered individually in both modes — a
 * malformed entry is dropped, never fatal to its siblings or to the page.
 * ====================================================================== */

export interface NormalizedFaqEntry {
  _key: string;
  question: string;
  answer: string;
}

export interface NormalizedContactPageContent {
  intro: { kicker: string | null; heading: string; lede: string; explanation: string };
  newsletterCta: { heading: string; body: string; linkLabel: string } | null;
  faq: NormalizedFaqEntry[];
  seo: { metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null };
}

export interface NormalizeContactPageOptions {
  /** True only when the configured Sanity DATASET is `production` — mirrors
   * `NormalizeGalleryPageOptions.strict` / `NormalizeMusicPageOptions.strict`
   * exactly. */
  strict: boolean;
}

const MAX_FAQ_ENTRIES = 12;

function normalizeFaqEntries(
  entries: NonNullable<CONTACT_PAGE_QUERY_RESULT>["faq"],
): NormalizedFaqEntry[] {
  const items: NormalizedFaqEntry[] = [];
  for (const entry of entries ?? []) {
    if (items.length >= MAX_FAQ_ENTRIES) break;
    const question = cleanText(entry?.question);
    const answer = cleanText(entry?.answer);
    if (!question || !answer || !entry?._key) continue;
    items.push({ _key: entry._key, question, answer });
  }
  return items;
}

/**
 * Treats the Contact singleton's `intro` as one required editorial unit,
 * exactly like every other page singleton — missing/incomplete returns
 * `null` for the whole document, and `contact-booking.astro` then either
 * fails the production build or falls back as a complete block. In strict
 * (production) mode, an incomplete newsletter callout or an empty FAQ list
 * ALSO returns `null` for the whole document — see the module doc comment.
 */
export function normalizeContactPageContent(
  page: CONTACT_PAGE_QUERY_RESULT,
  options: NormalizeContactPageOptions,
): NormalizedContactPageContent | null {
  if (!page) return null;

  const introHeading = cleanText(page.intro?.heading);
  const introLede = cleanText(page.intro?.lede);
  const introExplanation = cleanText(page.intro?.explanation);

  if (!introHeading || !introLede || !introExplanation) return null;

  const newsletterHeading = cleanText(page.newsletterCta?.heading);
  const newsletterBody = cleanText(page.newsletterCta?.body);
  const newsletterLinkLabel = cleanText(page.newsletterCta?.linkLabel);
  const newsletterCta =
    newsletterHeading && newsletterBody && newsletterLinkLabel
      ? { heading: newsletterHeading, body: newsletterBody, linkLabel: newsletterLinkLabel }
      : null;

  const faq = normalizeFaqEntries(page.faq);

  if (options.strict && (!newsletterCta || faq.length === 0)) return null;

  return {
    intro: {
      kicker: cleanText(page.intro?.kicker),
      heading: introHeading,
      lede: introLede,
      explanation: introExplanation,
    },
    newsletterCta,
    faq,
    seo: {
      metaTitle: cleanText(page.seo?.metaTitle),
      metaDescription: cleanText(page.seo?.metaDescription),
      ogImageUrl: getOgImageUrl(page.seo?.ogImage),
    },
  };
}

/* =========================================================================
 * Music page (/music)
 *
 * Visible order: Featured (always rendered, supplies the page's one heading)
 * → Releases (released music only) → Heavy Crush Records label affiliation.
 * There is no Upcoming Releases section, empty state, or countdown anywhere
 * on this page — `musicRelease.state` is retained as a content-model fact
 * (a release may still be authored as "upcoming" before release day), but
 * `normalizeMusicReleases` below excludes any non-released entry before it
 * ever reaches strict/`[TEST]` validation, so an upcoming release can never
 * fail a production build — see that function's own doc comment.
 *
 * `releases` is a curated, editor-ordered selection — the same editorial
 * weight as `aboutPage.members` and `galleryPage.gallery.items` — so it
 * follows their precedent: STRICT in production (any invalid *released*
 * entry fails the whole build) and LENIENT everywhere else (an invalid
 * entry is silently dropped). `options.strict` is set by the caller from
 * the configured DATASET, exactly like `NormalizeGalleryPageOptions.strict`.
 *
 * A release's own optional links (Spotify/Apple Music/pre-save/watch video)
 * never gate the release's existence, in either mode — a broken or
 * lookalike-domain link degrades to "no link" for that one field only, the
 * same way a malformed credit URL degrades elsewhere in this file. Only a
 * release missing its title, a recognized `state`, or a parseable
 * `releaseDate` is dropped (lenient) or fatal (strict).
 * ====================================================================== */

export type MusicReleaseState = "upcoming" | "released";
export type MusicReleaseType = "single" | "ep" | "album" | "other" | null;

export interface NormalizedMusicArtwork {
  src: string;
  width: number;
  height: number;
  objectPosition: string;
  alt: string;
}

export interface NormalizedMusicRelease {
  _id: string;
  title: string;
  slug: string | null;
  releaseType: MusicReleaseType;
  state: MusicReleaseState;
  /** `YYYY-MM-DD`, as stored — never re-formatted here; components decide
   * display formatting and the optional countdown from this raw value. */
  releaseDate: string;
  /** `null` when no artwork is selected, or a selected one is unusable —
   * an upcoming release may be announced before artwork exists. */
  artwork: NormalizedMusicArtwork | null;
  description: string | null;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  preSaveUrl: string | null;
  watchVideoUrl: string | null;
}

/**
 * Always rendered — never `null` on its own; a missing/incomplete `featured`
 * invalidates the whole `NormalizedMusicPageContent`, since `heading` is the
 * page's one `<h1>`. `video` is independently optional: the section still
 * renders with just kicker/heading when no video is selected or resolved.
 */
export interface NormalizedFeatured {
  kicker: string | null;
  heading: string;
  video: NormalizedFeaturedVideoRef | null;
}

/**
 * `null` when the Sanity field is empty/incomplete — `music.astro` falls
 * back to `siteConfig.heavyCrushRecords` rather than omitting the section
 * or invalidating the rest of the page. Treated as ONE coherent block:
 * every field here (including `missionStatement` and every `socialLinks`
 * URL) must be present and safe for this to be non-null — an incomplete
 * live document never mixes partial live fields with fallback ones. Moved
 * here from the About page — the migration is complete: a read-only query
 * confirmed `musicPage.labelAffiliation` published with real content, and
 * the deprecated `aboutPage.labelAffiliation` field has since been removed
 * from the schema entirely (no longer just deprecated/read-only).
 */
export interface NormalizedMusicLabelAffiliation {
  kicker: string | null;
  text: string;
  logoAlt: string;
  url: string;
  missionStatement: string;
  socialLinks: { facebookUrl: string; instagramUrl: string; youtubeUrl: string };
}

export interface NormalizedMusicPageContent {
  featured: NormalizedFeatured;
  releases: NormalizedMusicRelease[];
  labelAffiliation: NormalizedMusicLabelAffiliation | null;
  seo: { metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null };
}

export interface NormalizeMusicPageOptions {
  /** True only when the configured Sanity DATASET is `production` —
   * mirrors `NormalizeGalleryPageOptions.strict` exactly. */
  strict: boolean;
}

const MAX_MUSIC_RELEASES = 40;
const MUSIC_ARTWORK_WIDTH = 640;
const MUSIC_RELEASE_STATES: readonly string[] = ["upcoming", "released"];

type RawMusicReleases = NonNullable<MUSIC_PAGE_QUERY_RESULT>["releases"];
type RawMusicRelease = NonNullable<RawMusicReleases>[number]["release"];

function isMusicReleaseState(value: unknown): value is MusicReleaseState {
  return typeof value === "string" && MUSIC_RELEASE_STATES.includes(value);
}

/** https-only, no provider hardcoded — used for `preSaveUrl` and
 * `watchVideoUrl`, whose providers deliberately vary. */
function safeHttpsUrl(value: string | null | undefined): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  try {
    return new URL(raw).protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Used for `galleryPage.eventMediaSubmission.formUrl` — unlike `safeHttpsUrl`
 * above, this does NOT accept an arbitrary `https://` link. Studio's own
 * `Rule.custom` on this field (`studio/schemaTypes/galleryPage.ts`) binds
 * the Studio UI, not the Content API, so the identical check is re-applied
 * here, kept deliberately in lockstep with it — matching the project's
 * established convention for lookalike-domain-resistant fields
 * (`spotifyUrl`/`appleMusicUrl` on `musicRelease` use the identical
 * pattern). This validates URL *structure and host* only — it accepts
 * exactly two shapes: a real `docs.google.com/forms/d/e/<id>/viewform`
 * link (a prefilled variant with query parameters is also accepted) or a
 * real `forms.gle/<code>` short link — and rejects everything else that
 * still parses as one of those two hosts: the bare root of either host, an
 * arbitrary path under `/forms/` (e.g. `/forms/not-a-form` — a previous,
 * looser version of this check accepted any non-empty path here), a
 * `/edit` link, the `/formResponse` submission endpoint, an empty form id,
 * and a URL carrying embedded credentials. None of this confirms the form
 * actually exists, is published, has the right sharing/access permissions,
 * or carries the approved consent language — only that the URL has the
 * right shape and host to plausibly be one.
 */
function safeGoogleFormUrl(value: string | null | undefined): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;
  const hostname = parsed.hostname.replace(/^www\./, "");
  // Each host accepts exactly one specific URL *shape*, not merely "any
  // non-empty path under it".
  if (hostname === "forms.gle") {
    return /^\/[^/]+$/.test(parsed.pathname) ? raw : null;
  }
  if (hostname === "docs.google.com") {
    return /^\/forms\/d\/e\/[^/]+\/viewform$/.test(parsed.pathname) ? raw : null;
  }
  return null;
}

/** Re-validated at render time, exactly like every other Studio-enforced
 * rule in this file (Studio's own check binds the Studio UI only) — must
 * resolve to the real Spotify host, not merely any https:// URL. */
function safeSpotifyUrl(value: string | null | undefined): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    const hostname = parsed.hostname.replace(/^www\./, "");
    return parsed.protocol === "https:" && (hostname === "open.spotify.com" || hostname === "spotify.com")
      ? raw
      : null;
  } catch {
    return null;
  }
}

/** Same reasoning as `safeSpotifyUrl` — must resolve to the real Apple
 * Music host. */
function safeAppleMusicUrl(value: string | null | undefined): string | null {
  const raw = cleanText(value);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && parsed.hostname.replace(/^www\./, "") === "music.apple.com"
      ? raw
      : null;
  } catch {
    return null;
  }
}

/**
 * Width only, like every other content photo on this site — Sanity applies
 * the editor's manual crop but forces no aspect ratio, and the hotspot is
 * handed to CSS `object-position`. `null` for any reason the artwork can't
 * be honestly rendered (no selection, unresolved reference, missing alt) —
 * never fatal to the release itself.
 */
function normalizeMusicArtwork(raw: RawMusicRelease["coverArtwork"]): NormalizedMusicArtwork | null {
  const image = raw?.image;
  const assetId = image?.asset?._id;
  const alt = cleanText(raw?.alt);
  if (!image || !assetId || !alt) return null;

  const width = MUSIC_ARTWORK_WIDTH;
  return {
    src: sanityImageUrl(image, { width }),
    width,
    height: Math.round(width / computeCroppedAspectRatio(image)),
    objectPosition: computeObjectPosition(image),
    alt,
  };
}

/**
 * A release must be renderable as itself: a title, a recognized `state`,
 * and a parseable `releaseDate`. Everything else — artwork, description,
 * and every link — is optional and degrades independently, never taking
 * the release down with it.
 *
 * `strict` additionally rejects a release whose title or description
 * carries `TEST_RELEASE_MARKER` — the `[TEST]` prefix every development
 * fixture release uses (see `musicData.ts`) — mirroring
 * `TEST_BIOGRAPHY_MARKER`'s and `TEST_PRODUCT_MARKER`'s role elsewhere in
 * this file: a marked development release must never silently pass a
 * production build even if it's ever selected into a production
 * `musicPage.releases`.
 */
function normalizeOneMusicRelease(
  raw: RawMusicRelease | null | undefined,
  strict: boolean,
): NormalizedMusicRelease | null {
  if (!raw) return null;

  const title = cleanText(raw.title);
  if (!title) return null;
  if (!isMusicReleaseState(raw.state)) return null;
  if (!isValidCalendarDateOnly(raw.releaseDate)) return null;

  const description = cleanText(raw.description);
  if (strict && (title.includes(TEST_RELEASE_MARKER) || description?.includes(TEST_RELEASE_MARKER))) {
    return null;
  }

  return {
    _id: raw._id,
    title,
    slug: cleanText(raw.slug),
    releaseType: raw.releaseType ?? null,
    state: raw.state,
    releaseDate: raw.releaseDate,
    artwork: normalizeMusicArtwork(raw.coverArtwork),
    description,
    spotifyUrl: safeSpotifyUrl(raw.spotifyUrl),
    appleMusicUrl: safeAppleMusicUrl(raw.appleMusicUrl),
    preSaveUrl: safeHttpsUrl(raw.preSaveUrl),
    watchVideoUrl: safeHttpsUrl(raw.watchVideoUrl),
  };
}

/**
 * `musicPage.releases` is the single source of truth for release membership
 * AND order — this loop never sorts or reorders. Only released releases
 * ever reach the public page: an entry whose raw `state === "upcoming"` is
 * skipped BEFORE it reaches `normalizeOneMusicRelease`'s strict/`[TEST]`
 * validation, so an upcoming release — even one carrying `[TEST]` in its
 * title — can never trip strict mode's "whole list invalid" branch. This is
 * a defensive, non-fatal exclusion (mirroring Studio's own `state ==
 * "released"` reference filter on this field, in case it's ever bypassed by
 * a raw API write), not a production error: an accidentally-selected
 * upcoming release is silently ignored, exactly like a duplicate reference
 * is silently deduplicated below.
 *
 * A **released** `[TEST]`-titled release is NOT given this early exemption —
 * it still goes through full strict validation and still fails the whole
 * build in production, exactly as before.
 *
 * Invalid (released) entries are filtered out (lenient mode) BEFORE the cap
 * is applied, so an invalid entry never consumes one of the 40 slots. A
 * reference to the same release appearing twice is additionally
 * deduplicated by `_id` — Studio's own custom validation already blocks
 * this in the Studio UI, re-checked here for the same reason every other
 * Studio-enforced rule is re-checked at this layer.
 */
function normalizeMusicReleases(
  entries: RawMusicReleases,
  strict: boolean,
): NormalizedMusicRelease[] | null {
  const items: NormalizedMusicRelease[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries ?? []) {
    if (items.length >= MAX_MUSIC_RELEASES) break;

    if (entry?.release?.state === "upcoming") continue;

    const release = normalizeOneMusicRelease(entry?.release, strict);
    if (release === null) {
      if (strict) return null;
      continue;
    }
    if (seenIds.has(release._id)) continue;
    seenIds.add(release._id);

    items.push(release);
  }

  return items;
}

/**
 * Treats the Music singleton's `featured` block as the required editorial
 * core, exactly like every other page singleton's intro — missing/incomplete
 * returns `null` for the whole document, since `featured.heading` is the
 * page's one `<h1>` and always renders. The curated `releases` selection is
 * validated by its own strict/lenient rules above; a `null` from it also
 * invalidates the whole document, but ONLY in strict mode (see the module
 * doc comment). An empty or absent `releases` selection is always valid on
 * its own — a Music page with zero releases yet is a legitimate pre-launch
 * state, not an error.
 *
 * `featured`/`featuredVideo` migration (phase 1 — see the ELT content
 * migration plan and `studio/schemaTypes/musicPage.ts`): treated as ONE
 * coherent block, never merged field-by-field. If the new `featured.heading`
 * is present, `featured.kicker`/`.video` are used exclusively and the
 * deprecated `featuredVideo` is ignored entirely; otherwise the complete
 * deprecated `featuredVideo` block is used instead. This prevents a
 * still-unmigrated document from showing a new-field kicker next to a
 * legacy-field video (or vice versa).
 *
 * `labelAffiliation` follows the exact same independently-optional,
 * all-or-nothing contract `aboutPage.labelAffiliation` used to before that
 * field was removed (migration complete, not just moved) — see
 * `NormalizedMusicLabelAffiliation`'s doc comment.
 */
export function normalizeMusicPageContent(
  page: MUSIC_PAGE_QUERY_RESULT,
  options: NormalizeMusicPageOptions,
): NormalizedMusicPageContent | null {
  if (!page) return null;

  const useNewFeatured = Boolean(cleanText(page.featured?.heading));
  const featuredSource = useNewFeatured ? page.featured : page.featuredVideo;
  const featuredHeading = cleanText(featuredSource?.heading);
  if (!featuredHeading) return null;

  const featured: NormalizedFeatured = {
    kicker: cleanText(featuredSource?.kicker),
    heading: featuredHeading,
    video: normalizeFeaturedVideoRef(
      featuredSource?.video
        ? { videoUrl: featuredSource.video.videoUrl, title: featuredSource.video.title }
        : null,
    ),
  };

  const releases = normalizeMusicReleases(page.releases, options.strict);
  if (releases === null) return null;

  const labelAffiliationText = cleanText(page.labelAffiliation?.text);
  const labelAffiliationLogoAlt = cleanText(page.labelAffiliation?.logoAlt);
  const labelAffiliationUrl = safeExternalUrl(page.labelAffiliation?.url);
  const labelAffiliationMission = cleanText(page.labelAffiliation?.missionStatement);
  const labelAffiliationFacebook = safeFacebookUrl(page.labelAffiliation?.socialLinks?.facebookUrl);
  const labelAffiliationInstagram = safeInstagramUrl(page.labelAffiliation?.socialLinks?.instagramUrl);
  const labelAffiliationYoutube = safeYoutubeUrl(page.labelAffiliation?.socialLinks?.youtubeUrl);

  return {
    featured,
    releases,
    // Independently optional — an incomplete `labelAffiliation` does NOT
    // invalidate the whole Music page. `music.astro` falls back to the same
    // approved facts already recorded in `siteConfig.heavyCrushRecords` when
    // this is `null`. Treated as ONE coherent block, not per-field: every
    // one of the six fields below must be present and safe, or the whole
    // object is `null` and the caller substitutes the complete code-owned
    // default.
    labelAffiliation:
      labelAffiliationText &&
      labelAffiliationLogoAlt &&
      labelAffiliationUrl &&
      labelAffiliationMission &&
      labelAffiliationFacebook &&
      labelAffiliationInstagram &&
      labelAffiliationYoutube
        ? {
            kicker: cleanText(page.labelAffiliation?.kicker),
            text: labelAffiliationText,
            logoAlt: labelAffiliationLogoAlt,
            url: labelAffiliationUrl,
            missionStatement: labelAffiliationMission,
            socialLinks: {
              facebookUrl: labelAffiliationFacebook,
              instagramUrl: labelAffiliationInstagram,
              youtubeUrl: labelAffiliationYoutube,
            },
          }
        : null,
    seo: {
      metaTitle: cleanText(page.seo?.metaTitle),
      metaDescription: cleanText(page.seo?.metaDescription),
      ogImageUrl: getOgImageUrl(page.seo?.ogImage),
    },
  };
}
