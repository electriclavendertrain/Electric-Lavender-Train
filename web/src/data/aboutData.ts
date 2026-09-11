/** Code-owned About labels, fallback assets, and development-only copy. */

import type { ImageMetadata } from "astro";
import siteConfig from "./siteConfig";
import familyPhoto from "../assets/images/elt-family.jpeg";
import rachelProfile from "../assets/images/members/rachel.png";
import hunterProfile from "../assets/images/members/hunter.png";
import geertProfile from "../assets/images/members/geert.png";
import paulProfile from "../assets/images/members/paul.png";

/** The marker that makes placeholder biography text unmistakable, and mechanically detectable. */
export const TEST_BIOGRAPHY_MARKER = "[TEST — CLIENT BIO REQUIRED]";

/* -------------------------------------------------------------------------
 * Local profile-photo fallbacks
 *
 * Live member photographs now live in Sanity's Media Library and carry their
 * own alt text and hotspot. These source assets remain bundled only so the
 * complete development fallback can render when no About singleton exists.
 * ---------------------------------------------------------------------- */

export type ProfileImageFallbackKey = "rachel" | "hunter" | "geert" | "paul";

export interface MemberProfileFallbackAsset {
  src: ImageMetadata;
  alt: string;
  /**
   * CSS `object-position` for the square-ish card crop, chosen so the
   * subject's face stays in frame. These are tall portrait photographs, so a
   * default 50%/50% centre crop would cut heads off.
   */
  objectPosition: string;
}

export const memberProfileFallbackAssets: Record<
  ProfileImageFallbackKey,
  MemberProfileFallbackAsset
> = {
  rachel: {
    src: rachelProfile,
    alt: "Rachel singing into a microphone while playing a baritone ukulele at an outdoor show.",
    objectPosition: "46% 24%",
  },
  hunter: {
    src: hunterProfile,
    alt: "Hunter playing electric guitar mid-performance at an outdoor show.",
    objectPosition: "44% 26%",
  },
  geert: {
    src: geertProfile,
    alt: "Geert playing bass and singing at an outdoor show.",
    objectPosition: "50% 20%",
  },
  paul: {
    src: paulProfile,
    alt: "Paul smiling behind the drum kit at an outdoor show.",
    objectPosition: "46% 28%",
  },
};

/* -------------------------------------------------------------------------
 * Protected interface copy
 *
 * Element ids, control wording, and accessibility notices. Deliberately not
 * editor-controlled: an editor changing "Close" to something ambiguous, or
 * removing the new-tab notice, would break the page's accessibility contract
 * rather than merely reword it.
 * ---------------------------------------------------------------------- */

export const aboutPageCopy = {
  membersHeadingId: "about-members",
  testimonialsHeadingId: "about-testimonials",

  /** Prefix for every member dialog's element id. Kept in one place so the
   *  card's `href`, the dialog's `id`, and the script's lookup cannot drift. */
  memberDialogIdPrefix: "member-profile-",

  /** `Meet {first name}` when a first name can be taken, else this. */
  memberCardActionFallback: "View profile",
  memberCardActionPrefix: "Meet",

  memberDialogCloseLabel: "Close",
  /** Appended to the close control's accessible name: "Close Rachel's profile". */
  memberDialogCloseSuffix: "profile",

  memberLinksLabel: "Links",

  newTabSuffix: " (opens in a new tab)",

  /** Visible link text per approved link type. "other" uses the editor label. */
  linkTypeLabels: {
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    spotify: "Spotify",
    website: "Website",
  },
} as const;

/* -------------------------------------------------------------------------
 * Development fallback
 *
 * ONE coherent block, used only when the `aboutPage` singleton is entirely
 * absent from a non-production dataset. If the singleton exists but a section
 * is incomplete, that section is omitted rather than patched from here — live
 * content and placeholder copy are never mixed in one render.
 * ---------------------------------------------------------------------- */

/** Hero photograph for the development fallback only; optimized via astro:assets. */
export const aboutHeroFallbackImage: ImageMetadata = familyPhoto;

export const aboutHeroFallbackAlt =
  `${siteConfig.bandNameFormal} together at an outdoor Central Coast show.`;

/**
 * Lorem Ipsum. Not a biography, not a draft of one, and not to be tidied up
 * into something that reads plausibly — it must stay obviously fake so nobody
 * mistakes it for approved copy. Real biographies belong in Sanity.
 */
const LOREM_BIOGRAPHY = [
  `${TEST_BIOGRAPHY_MARKER} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
  `${TEST_BIOGRAPHY_MARKER} Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.`,
];

export const aboutPageFallback = {
  /** About introduction and the page's only h1. */
  intro: {
    kicker: "Who We Are",
    heading: "More Than a Band, We're Family.",
    paragraphs: [
      "We're a local band with deep roots on the Central Coast. We know the crowd, we know the songs, and we know how to make every night one to remember — full of dancing, singing, and the kind of energy that turns strangers into friends. Whether it's a backyard celebration or a packed house downtown, we play it like family.",
      "Thanks for riding the train with us.",
    ],
  },
  membersIntro: {
    kicker: "The Lineup",
    heading: "Meet the Band",
    body: null,
  },
  /** Confirmed names and roles, in the confirmed order. */
  members: [
    {
      _id: "fallback-member-rachel",
      name: "Rachel Santa Cruz",
      role: "Vocals, Keys, Baritone Ukulele",
      profileImageFallbackKey: "rachel" as ProfileImageFallbackKey,
      biography: LOREM_BIOGRAPHY,
    },
    {
      _id: "fallback-member-hunter",
      name: "Hunter Takao Nakazono",
      role: "Vocals, Guitar",
      profileImageFallbackKey: "hunter" as ProfileImageFallbackKey,
      biography: LOREM_BIOGRAPHY,
    },
    {
      _id: "fallback-member-geert",
      name: "Geert de Lange",
      role: "Bass, Vocals",
      profileImageFallbackKey: "geert" as ProfileImageFallbackKey,
      biography: LOREM_BIOGRAPHY,
    },
    {
      _id: "fallback-member-paul",
      name: "Paul Della Pelle",
      role: "Drums, Vocals",
      profileImageFallbackKey: "paul" as ProfileImageFallbackKey,
      biography: LOREM_BIOGRAPHY,
    },
  ],
  testimonialsIntro: {
    kicker: "What People Are Saying",
    heading: "Straight From the Dance Floor",
  },
  bookingCta: {
    kicker: "Let’s Ride Together",
    heading: "Bring ELT to Your Room.",
    body: "Winery patios, lounges, outdoor concerts, resorts, private celebrations — tell us about your event and your dates, and we’ll confirm what’s open.",
    ctaLabel: "Send a Booking Inquiry",
  },
  seo: {
    metaTitle: "About",
    metaDescription:
      "Meet Electric Lavender Train — a Central Coast band playing dynamic rock ’n’ roll and exhilarating takes on the hit songs audiences know and love.",
  },
};

export default aboutPageCopy;
