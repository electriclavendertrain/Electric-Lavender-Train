/** Code-owned Music labels and development-only fallback content. */

import type { MusicReleaseType } from "../sanity/normalize";

export const TEST_RELEASE_MARKER = "[TEST]";

export const musicPageCopy = {
  releasedHeadingId: "music-released",
  releasedHeading: "Releases",

  emptyReleasedMessage: "No releases are live yet — check back soon.",

  /** Release-type badge text. "other"/unset render nothing rather than a
   * label that would just say "Other". */
  releaseTypeLabels: {
    single: "Single",
    ep: "EP",
    album: "Album",
  } satisfies Partial<Record<NonNullable<MusicReleaseType>, string>>,

  spotifyLabel: "Listen on Spotify",
  appleMusicLabel: "Listen on Apple Music",
  watchVideoLabel: "Watch Video",

  /** Protected copy for the Heavy Crush Records Label Affiliation section (`LabelAffiliation.astro`), rendered on this page immediately after Releases. */
  labelAffiliation: {
    websiteLabel: "Visit Heavy Crush Records",
    linkLabels: {
      facebook: "Facebook",
      instagram: "Instagram",
      youtube: "YouTube",
    },
  },

  newTabSuffix: " (opens in a new tab)",
} as const;

/** ONE complete development fallback, used only when the whole `musicPage` singleton is absent from a non-production dataset. */
export const musicPageFallback = {
  featured: {
    kicker: "Featured",
    heading: "Heavy Crush Records Presents...",
    video: null,
  },
  seo: {
    metaTitle: "Music",
    metaDescription:
      "Explore music from The Electric Lavender Train, including releases, featured videos, and links to Spotify and Apple Music.",
  },
};

export default musicPageCopy;
