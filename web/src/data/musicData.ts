/**
 * Code-owned Music-page material — the same two-part split established by
 * every other route's data module (`showsData.ts`, `mediaData.ts`,
 * `contactData.ts`):
 *
 * 1. `musicPageCopy` — permanent protected interface copy: section heading
 *    ids, button labels, and empty-state messages. Not editorial content,
 *    never in Sanity.
 * 2. `musicPageFallback` — used only when the `musicPage` singleton is
 *    entirely absent from a non-production dataset. Deliberately carries
 *    ZERO releases — unlike every other route's fallback, this one never
 *    invents placeholder release names, dates, artwork, or streaming links.
 *    A Music page with no releases yet is a legitimate, honest state (see
 *    the empty-state messages below); a fabricated release would not be.
 * 3. `TEST_RELEASE_MARKER` — the marker that makes a placeholder
 *    `musicRelease` unmistakable and mechanically detectable, exactly like
 *    `TEST_PRODUCT_MARKER` (`mediaData.ts`) and `TEST_BIOGRAPHY_MARKER`
 *    (`aboutData.ts`). Load-bearing: `normalize.ts` rejects any selected
 *    release whose title or description contains it whenever the configured
 *    dataset is `production` — see the development `[TEST]`-titled fixtures
 *    seeded in the `development` dataset's `musicRelease` documents.
 */

import type { MusicReleaseType } from "../sanity/normalize";

export const TEST_RELEASE_MARKER = "[TEST]";

export const musicPageCopy = {
  upcomingHeadingId: "music-upcoming",
  releasedHeadingId: "music-released",
  upcomingHeading: "Upcoming Releases",
  releasedHeading: "Released Music",

  emptyUpcomingMessage: "No upcoming releases are announced yet — check back soon.",
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
  preSaveLabel: "Pre-Save",
  watchVideoLabel: "Watch Video",

  countdownOutNow: "Out now",
  /** `(n) => "..."` so the singular/plural wording lives in one place. */
  countdownDays: (days: number) => (days === 1 ? "In 1 day" : `In ${days} days`),

  featuredVideo: {
    defaultHeading: "Watch",
  },

  labelAcknowledgmentPrefix: "ELT is part of",

  newTabSuffix: " (opens in a new tab)",
} as const;

/**
 * ONE complete development fallback, used only when the whole `musicPage`
 * singleton is absent from a non-production dataset. No release fixtures —
 * see the module doc comment above.
 */
export const musicPageFallback = {
  intro: {
    kicker: "Music",
    heading: "Music",
    lede: "New releases from Electric Lavender Train — streaming links, pre-saves, and more, as they go live.",
  },
  seo: {
    metaTitle: "Music",
    metaDescription:
      "Explore music from The Electric Lavender Train, including upcoming releases, featured videos, and links to Spotify and Apple Music.",
  },
};

export default musicPageCopy;
