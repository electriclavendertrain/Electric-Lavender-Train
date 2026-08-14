/**
 * Temporary single source of truth for shared site identity, routes, and
 * verified public contact/social information. Replace with Sanity-backed
 * site settings in Phase 3.
 *
 * Verification notes (2026-08-03):
 * - instagram, facebook, venmo: carried over from the functional reference,
 *   which explicitly marked these as real/confirmed (not placeholder-shaped).
 * - linktree: consistent, non-placeholder-shaped across both independently
 *   authored references; treated as confirmed pending explicit sign-off.
 * - youtube: left null. The one-page reference's "YouTube" link actually
 *   points at the Linktree URL (not a real YouTube URL), and the functional
 *   reference flags an unresolved placeholder video ID — contradictory
 *   signals, so this is treated as unverified rather than guessed.
 * - email, phone: both references show different, placeholder-shaped values
 *   (a ".example" domain and a "555"/sequential-digit number). Neither is
 *   real; left null so nothing fake ships.
 * - siteUrl (confirmed 2026-08-13): the canonical production origin. Used
 *   only to build canonical/og:url values; nothing fetches from it.
 */

export interface SiteConfig {
  bandNameFormal: string;
  bandNameShort: string;
  tagline: string;
  location: string;
  /**
   * The confirmed canonical origin. Every page's `<link rel="canonical">` and
   * `og:url` are built from this plus the route path, in `BaseLayout.astro`.
   * No trailing slash — the layout joins the path itself.
   */
  siteUrl: string;
  routes: {
    home: string;
    about: string;
    shows: string;
    mediaMerch: string;
    contactBooking: string;
    bookingForm: string;
  };
  social: {
    instagram: string | null;
    facebook: string | null;
    youtube: string | null;
    linktree: string | null;
    venmo: string | null;
  };
  venmoLabel: string;
  contact: {
    email: string | null;
    phone: string | null;
  };
}

export const siteConfig: SiteConfig = {
  bandNameFormal: "The Electric Lavender Train",
  bandNameShort: "ELT",
  tagline:
    "The Central Coast's favorite dance band — good music, good people, good times.",
  location: "San Luis Obispo & the Central Coast, California",
  siteUrl: "https://electriclavendertrain.com",

  routes: {
    home: "/",
    about: "/about",
    shows: "/shows",
    mediaMerch: "/media-merch",
    contactBooking: "/contact-booking",
    bookingForm: "/contact-booking#booking-form",
  },

  social: {
    instagram: "https://www.instagram.com/electriclavendertrain",
    facebook:
      "https://www.facebook.com/people/Electric-Lavender-Train/61564158675927/",
    youtube: null,
    linktree: "https://linktr.ee/electriclavendertrain",
    venmo: "https://venmo.com/u/heavycrushrecords",
  },
  venmoLabel: "Tip the Band",

  contact: {
    email: null,
    phone: null,
  },
};

/**
 * Appends the current formal band name to a route's page-specific SEO title.
 * Studio editors enter only the route portion (for example, "Home" or
 * "Shows"). When the formal name drops "The", changing `bandNameFormal`
 * above updates every route title, Open Graph title, and Twitter title.
 */
export function formatPageTitle(pageTitle: string): string {
  return `${pageTitle.trim()} — ${siteConfig.bandNameFormal}`;
}

export default siteConfig;
