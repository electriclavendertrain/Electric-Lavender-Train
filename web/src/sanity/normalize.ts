import { sanityImageUrl } from "./image";
import { isValidDateTime } from "../lib/dateFormat";
import {
  TEST_BIOGRAPHY_MARKER,
} from "../data/aboutData";
import { TEST_PRODUCT_MARKER, TEST_MEDIA_ITEM_MARKER, TEST_VIDEO_ID } from "../data/mediaData";
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
  MEDIA_PAGE_QUERY_RESULT,
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
/**
 * Mirrors the schema's `Rule.max(6)` on `homepage.featuredMedia`. Studio
 * validation binds the Studio UI, not the Content API — a raw API write can
 * store more than six. The mosaic CSS only styles the 1st and 4th tiles
 * specially, so extra tiles would render as unplanned trailing cells.
 */
const MAX_FEATURED_MEDIA = 6;
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

/**
 * Drops any featured-media reference that didn't resolve to a real image
 * mediaItem, is missing its asset id (nothing for the image-url builder to
 * build a CDN URL from), or is missing alt text — never render a broken
 * `<img>` or one without accessible alt text.
 *
 * Caps the result at six, defensively. The cap counts *valid* items only:
 * a dropped entry never consumes one of the six slots, so six good images
 * still render even if malformed entries precede them. Selection order is
 * preserved — the array's order is the render order.
 */
export function normalizeFeaturedMedia(
  featuredMedia: Homepage["featuredMedia"],
): NormalizedGalleryItem[] {
  if (!featuredMedia) return [];

  const items: NormalizedGalleryItem[] = [];
  for (const entry of featuredMedia) {
    if (items.length >= MAX_FEATURED_MEDIA) break;

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

const MAX_STORY_PARAGRAPHS = 4;
const MAX_BIOGRAPHY_PARAGRAPHS = 4;
const MAX_MEMBER_LINKS = 6;
/** The Experience section is defined as exactly three highlights, not "up to". */
const REQUIRED_EXPERIENCE_HIGHLIGHTS = 3;
const ABOUT_HERO_IMAGE_WIDTH = 1100;

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
}

export interface NormalizedAboutHeroImage {
  src: string;
  width: number;
  height: number;
  objectPosition: string;
  alt: string;
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
    lede: string;
    heroImage: NormalizedAboutHeroImage;
  };
  story: { kicker: string | null; heading: string; paragraphs: string[] };
  membersIntro: { kicker: string | null; heading: string; body: string | null };
  members: NormalizedBandMember[];
  experience: {
    kicker: string | null;
    heading: string;
    introduction: string;
    highlights: NormalizedExperienceHighlight[];
  };
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
  };
}

export function normalizeAboutPageContent(
  page: ABOUT_PAGE_QUERY_RESULT,
  options: NormalizeAboutOptions,
): NormalizedAboutPageContent | null {
  if (!page) return null;

  const introHeading = cleanText(page.intro?.heading);
  const introLede = cleanText(page.intro?.lede);
  const heroImage = normalizeAboutHeroImage(page.intro?.heroImage);

  const storyHeading = cleanText(page.story?.heading);
  const storyParagraphs = (page.story?.paragraphs ?? [])
    .map(cleanText)
    .filter((paragraph): paragraph is string => paragraph !== null)
    .slice(0, MAX_STORY_PARAGRAPHS);

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

  const experienceHeading = cleanText(page.experience?.heading);
  const experienceIntroduction = cleanText(page.experience?.introduction);
  const highlights: NormalizedExperienceHighlight[] = [];
  for (const highlight of page.experience?.highlights ?? []) {
    if (highlights.length >= REQUIRED_EXPERIENCE_HIGHLIGHTS) break;
    const title = cleanText(highlight?.title);
    const description = cleanText(highlight?.description);
    if (!title || !description) continue;
    highlights.push({ _key: highlight._key, title, description });
  }

  const testimonialsKicker = cleanText(page.testimonialsIntro?.kicker);
  const testimonialsHeading = cleanText(page.testimonialsIntro?.heading);

  const bookingHeading = cleanText(page.bookingCta?.heading);
  const bookingBody = cleanText(page.bookingCta?.body);
  const bookingCtaLabel = cleanText(page.bookingCta?.ctaLabel);

  if (
    !introHeading ||
    !introLede ||
    !heroImage ||
    !storyHeading ||
    storyParagraphs.length === 0 ||
    !membersIntroHeading ||
    members.length === 0 ||
    !experienceHeading ||
    !experienceIntroduction ||
    highlights.length !== REQUIRED_EXPERIENCE_HIGHLIGHTS ||
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
      lede: introLede,
      heroImage,
    },
    story: {
      kicker: cleanText(page.story?.kicker),
      heading: storyHeading,
      paragraphs: storyParagraphs,
    },
    membersIntro: {
      kicker: cleanText(page.membersIntro?.kicker),
      heading: membersIntroHeading,
      body: cleanText(page.membersIntro?.body),
    },
    members,
    experience: {
      kicker: cleanText(page.experience?.kicker),
      heading: experienceHeading,
      introduction: experienceIntroduction,
      highlights,
    },
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
 * Media & Merch page (/media-merch)
 *
 * `mediaPage.gallery.items` and `mediaPage.merch.items` are ordered arrays of
 * a hand-picked, curated selection — the same editorial weight as
 * `aboutPage.members`. This file therefore follows the About page's
 * precedent, not the Homepage's: a curated selection is treated STRICTLY in
 * production (any invalid selected entry fails the whole build, exactly like
 * `normalizeBandMember` taking the whole About singleton down) and
 * LENIENTLY everywhere else (an invalid entry is silently dropped, exactly
 * like `normalizeFeaturedMedia`).
 *
 * Which behavior applies is controlled by `options.strict`, which callers set
 * from the configured DATASET (`isProductionDataset`), not from Astro's
 * build mode — see `NormalizeMediaPageOptions`.
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
/** Bounded, not "full resolution" — the largest size the lightbox actually
 * displays, and the only other size requested for a gallery photo. */
const GALLERY_LIGHTBOX_WIDTH = 1600;
const MERCH_IMAGE_WIDTH = 640;

type MediaPage = NonNullable<MEDIA_PAGE_QUERY_RESULT>;
type RawGalleryPhoto = NonNullable<MediaPage["gallery"]["items"]>[number]["media"];
type RawGalleryVideo = NonNullable<MediaPage["gallery"]["videos"]>[number]["media"];
type RawMerchItem = NonNullable<MediaPage["merch"]["items"]>[number]["item"];

/** Mirrors Studio's `Rule.max(12)` on `mediaPage.gallery.videos` — Studio
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
  thumbnail: { src: string; width: number; height: number; objectPosition: string };
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

export interface NormalizedFeaturedVideo {
  kicker: string | null;
  heading: string | null;
  /** The raw stored URL. `getYouTubeVideoId` (approved, untouched) does the
   * actual validation, at the same layer `Hero.astro` already does it — this
   * mirrors `getHeroVideoUrl` exactly rather than duplicating that check. */
  videoUrl: string;
  /** The referenced mediaItem's own `title`, for the player's accessible
   * name. `FeaturedVideo.astro`'s caller falls back to a safe neutral
   * string when this is `null`, mirroring `getHeroVideoTitle`. */
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

export interface NormalizedMediaGallery {
  kicker: string | null;
  heading: string | null;
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

export interface NormalizedMediaMerch {
  kicker: string | null;
  heading: string | null;
  body: string | null;
  items: NormalizedMerchItem[];
}

export interface NormalizedMediaPageContent {
  intro: { kicker: string | null; heading: string; lede: string };
  featuredVideo: NormalizedFeaturedVideo | null;
  gallery: NormalizedMediaGallery;
  merch: NormalizedMediaMerch;
  bookingCta: { kicker: string | null; heading: string; body: string; ctaLabel: string };
  seo: { metaTitle: string | null; metaDescription: string | null; ogImageUrl: string | null };
}

export interface NormalizeMediaPageOptions {
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
 * dimensions and non-blank alt text — the same bar `normalizeFeaturedMedia`
 * already holds the homepage gallery to. Returns `null` for ANY reason a
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
 * `mediaPage.gallery.items` is the single source of truth for gallery
 * membership AND order — this loop never sorts or reorders. Invalid entries
 * are filtered out (lenient mode) BEFORE the 24-item cap is applied, so an
 * invalid entry never consumes one of the 24 slots. In strict mode, any
 * invalid selected entry invalidates the whole gallery (and, via the
 * top-level caller, the whole page) rather than silently publishing a
 * curated selection with something missing from it.
 */
function normalizeGalleryItems(
  entries: MediaPage["gallery"]["items"],
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
 * `mediaPage.gallery.videos` is the single source of truth for gallery-
 * video membership AND order, independent of `gallery.items`'s photo
 * order — same cap-after-filter, never-reorder contract as
 * `normalizeGalleryItems`. A reference to the same underlying `mediaItem`
 * appearing twice is additionally deduplicated by `_id` here — Studio's own
 * custom validation already blocks this in the Studio UI, but that binds
 * the Studio UI, not the Content API, matching this file's established
 * convention of re-checking Studio-enforced rules at the content layer.
 */
function normalizeGalleryVideos(
  entries: MediaPage["gallery"]["videos"],
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
  entries: MediaPage["merch"]["items"],
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
 * Mirrors `getHeroVideoUrl` exactly: returns the stored URL, unvalidated, or
 * `null` if nothing is referenced. `getYouTubeVideoId` — approved and
 * untouched — does the actual YouTube-ID validation, at the same layer
 * (`FeaturedVideo.astro`, mirroring `Hero.astro`) the homepage already does
 * it at. A malformed or non-YouTube URL safely resolves to "no video" there,
 * exactly as it does on the homepage.
 */
function normalizeFeaturedVideo(raw: MediaPage["featuredVideo"]): NormalizedFeaturedVideo | null {
  const videoUrl = cleanText(raw?.video?.videoUrl);
  if (!videoUrl) return null;

  return {
    kicker: cleanText(raw?.kicker),
    heading: cleanText(raw?.heading),
    videoUrl,
    title: cleanText(raw?.video?.title),
  };
}

/**
 * Treats the Media & Merch singleton as one editorial unit for its required
 * core (intro + booking CTA), exactly like About and Shows — anything
 * required there that is missing or malformed returns `null` for the whole
 * document. The gallery and merch selections are handled by their own
 * strict/lenient normalizers above; a `null` from either also invalidates
 * the whole page, but ONLY in strict mode (see the module doc comment).
 *
 * Do NOT fail merely because: the featured video is absent, the gallery
 * (photos or videos) is empty, merchandise is empty, a category is absent, a
 * media credit is absent, a merchandise image is absent, price/availability
 * text is absent, or optional SEO overrides are absent — none of those reach
 * this function's `null`-return paths. `gallery.videos` is normalized by its
 * own strict/lenient rules (`normalizeGalleryVideos`, mirroring
 * `normalizeGalleryItems`'s cap-after-filter, never-reorder contract, plus a
 * production-only rejection of development placeholder video content) —
 * an empty or absent `videos` selection is always valid and leaves a
 * photo-only gallery unchanged.
 */
export function normalizeMediaPageContent(
  page: MEDIA_PAGE_QUERY_RESULT,
  options: NormalizeMediaPageOptions,
): NormalizedMediaPageContent | null {
  if (!page) return null;

  const introHeading = cleanText(page.intro?.heading);
  const introLede = cleanText(page.intro?.lede);
  const bookingHeading = cleanText(page.bookingCta?.heading);
  const bookingBody = cleanText(page.bookingCta?.body);
  const bookingCtaLabel = cleanText(page.bookingCta?.ctaLabel);

  if (!introHeading || !introLede || !bookingHeading || !bookingBody || !bookingCtaLabel) {
    return null;
  }

  const galleryItems = normalizeGalleryItems(page.gallery?.items, options.strict);
  if (galleryItems === null) return null;

  const galleryVideos = normalizeGalleryVideos(page.gallery?.videos, options.strict);
  if (galleryVideos === null) return null;

  const merchItems = normalizeMerchItems(page.merch?.items, options.strict);
  if (merchItems === null) return null;

  return {
    intro: {
      kicker: cleanText(page.intro?.kicker),
      heading: introHeading,
      lede: introLede,
    },
    featuredVideo: normalizeFeaturedVideo(page.featuredVideo),
    gallery: {
      kicker: cleanText(page.gallery?.kicker),
      heading: cleanText(page.gallery?.heading),
      body: cleanText(page.gallery?.body),
      items: galleryItems,
      videos: galleryVideos,
      hasPerformance: galleryItems.some((item) => item.category === "performance"),
      hasVenueCrowd: galleryItems.some((item) => item.category === "venue-crowd"),
      hasVideos: galleryVideos.length > 0,
    },
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
