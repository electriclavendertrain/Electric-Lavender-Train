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
 * - email (confirmed 2026-08-14): electriclavendertrain@gmail.com is the
 *   approved public contact/booking address — used for the visible
 *   direct-email/Footer fallback and as the intended Formspree notification
 *   destination once real endpoints are configured (see
 *   docs/contact-booking.md). No longer an open question in
 *   docs/client-questions.md.
 * - phone: both references show different, placeholder-shaped values (a
 *   "555"/sequential-digit number). Not real; left null so nothing fake
 *   ships.
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
    privacy: string;
    terms: string;
    accessibility: string;
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
    bookingForm: "/contact-booking?inquiry=booking#contact-forms",
    privacy: "/privacy",
    terms: "/terms",
    accessibility: "/accessibility",
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
    email: "electriclavendertrain@gmail.com",
    phone: null,
  },
};

/**
 * A deliberately simple `local@domain.tld`-shape check — the same pattern
 * `contactForms.ts` applies to a visitor's own typed email, reused here so
 * "is this address usable" means the same thing in both places. Not a full
 * RFC 5322 validator (no validator needs to be); its job is only to reject
 * `null`, blank/whitespace-only, and obviously malformed values, since
 * "non-null" alone is not the same claim as "genuinely usable."
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The actual "is the public contact email ready for launch" check —
 * `contact-booking.astro`'s production build guard uses this instead of a
 * bare `!== null` comparison, which a whitespace-only or malformed string
 * would have silently passed.
 */
export function isContactEmailConfigured(): boolean {
  const email = siteConfig.contact.email;
  return typeof email === "string" && EMAIL_PATTERN.test(email.trim());
}

/**
 * Appends the current formal band name to a route's page-specific SEO title.
 * Studio editors enter only the route portion (for example, "Home" or
 * "Shows"). When the formal name drops "The", changing `bandNameFormal`
 * above updates every route title, Open Graph title, and Twitter title.
 */
export function formatPageTitle(pageTitle: string): string {
  return `${pageTitle.trim()} — ${siteConfig.bandNameFormal}`;
}

export type ContactInquiryType = "booking" | "merch" | "other";

/**
 * Builds an internal link into `/contact-booking` that pre-selects one of
 * the three inquiry forms and (for merch) pre-fills the item field. The
 * `#contact-forms` fragment is the page's stable anchor for the switcher —
 * see `docs/contact-booking.md`.
 *
 * `item` is passed through `URLSearchParams`, which percent-encodes it
 * automatically; the contact page treats it as opaque display text only
 * (never HTML, never a product-record lookup) and caps its length when
 * reading it back out of the URL.
 */
export function contactInquiryHref(inquiry: ContactInquiryType, item?: string): string {
  const params = new URLSearchParams({ inquiry });
  if (item) params.set("item", item);
  return `${siteConfig.routes.contactBooking}?${params.toString()}#contact-forms`;
}

export default siteConfig;
