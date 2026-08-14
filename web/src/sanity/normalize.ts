import { sanityImageUrl } from "./image";
import { isValidDateTime } from "../lib/dateFormat";
import {
  TEST_BIOGRAPHY_MARKER,
} from "../data/aboutData";
import type {
  HOMEPAGE_QUERY_RESULT,
  UPCOMING_PUBLIC_EVENTS_QUERY_RESULT,
  ABOUT_PAGE_QUERY_RESULT,
  TESTIMONIALS_QUERY_RESULT,
  SHOWS_PAGE_QUERY_RESULT,
  SHOWS_UPCOMING_PUBLIC_EVENTS_QUERY_RESULT,
  SHOWS_UPCOMING_PRIVATE_EVENTS_QUERY_RESULT,
  SHOWS_RECENT_PUBLIC_EVENTS_QUERY_RESULT,
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
