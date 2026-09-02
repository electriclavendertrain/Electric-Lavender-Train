/**
 * Code-owned Music-page material — the same two-part split established by
 * every other route's data module (`showsData.ts`, `mediaData.ts`,
 * `contactData.ts`):
 *
 * 1. `musicPageCopy` — permanent protected interface copy: section heading
 *    ids, button labels, and empty-state messages. Not editorial content,
 *    never in Sanity. Also owns the Label Affiliation section's protected
 *    copy (`labelAffiliation`), moved here from `aboutData.ts`'s
 *    `aboutPageCopy` now that Music is that section's live owner.
 * 2. `musicPageFallback` — used only when the `musicPage` singleton is
 *    entirely absent from a non-production dataset. Deliberately carries
 *    ZERO releases — unlike every other route's fallback, this one never
 *    invents placeholder release names, dates, artwork, or streaming links.
 *    A Music page with no releases yet is a legitimate, honest state (see
 *    the empty-state message below); a fabricated release would not be.
 * 3. `TEST_RELEASE_MARKER` — the marker that makes a placeholder
 *    `musicRelease` unmistakable and mechanically detectable, exactly like
 *    `TEST_PRODUCT_MARKER` (`mediaData.ts`) and `TEST_BIOGRAPHY_MARKER`
 *    (`aboutData.ts`). Load-bearing: `normalize.ts` rejects any selected
 *    *released* release whose title or description contains it whenever the
 *    configured dataset is `production` — see the development `[TEST]`-titled
 *    fixtures seeded in the `development` dataset's `musicRelease` documents.
 *    An upcoming-state release is excluded before this check ever runs (see
 *    `normalizeMusicReleases`), since the public Music page has no Upcoming
 *    Releases section at all.
 */

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

  /** Protected copy for the Heavy Crush Records Label Affiliation section
   * (`LabelAffiliation.astro`), rendered on this page immediately after
   * Releases. Moved from `aboutData.ts`'s `aboutPageCopy` now that Music is
   * the live owner (`musicPage.labelAffiliation`) — `aboutPageCopy.linkTypeLabels`
   * is untouched and still serves band-member public links, which stay on
   * the About page. */
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

/**
 * ONE complete development fallback, used only when the whole `musicPage`
 * singleton is absent from a non-production dataset. No release fixtures —
 * see the module doc comment above. No video is invented for `featured`
 * either, consistent with never fabricating release/media content.
 */
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
