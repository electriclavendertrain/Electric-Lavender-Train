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
 * - appleMusic, spotify (confirmed 2026-09-02): official ELT artist pages on
 *   each platform, supplied directly and verified — not placeholder-shaped.
 * - mailingAddress: a confirmed PO Box (`docs/client-questions.md`) was
 *   published here and publicly rendered from 2026-09-03. The client later
 *   decided against public display (2026-09-07); the field and every
 *   consumer were removed. The confirmed address itself remains recorded,
 *   privately, in `docs/client-questions.md` — not deleted, just no longer
 *   surfaced anywhere public. See `ELT-CONTENT-006` in `DEFERRED-WORK.md`.
 * - email (confirmed 2026-08-14): electriclavendertrain@gmail.com is the
 *   approved public contact/booking address — used for the visible
 *   direct-email/Footer fallback and as the intended Formspree notification
 *   destination once real endpoints are configured (see
 *   docs/contact-booking.md). No longer an open question in
 *   docs/client-questions.md.
 * - phone: both references show different, placeholder-shaped values (a
 *   "555"/sequential-digit number). Not real; left null so nothing fake
 *   ships.
 * - siteUrl (client-selected domain recorded 2026-09-03): the client chose
 *   `theelectriclavendertrain.com` as the production domain — see
 *   `ELT-LAUNCH-007` in `DEFERRED-WORK.md`. This confirms the NAME only.
 *   It is NOT evidence the domain has been purchased, ownership verified,
 *   DNS configured, or HTTPS provisioned — `ELT-LAUNCH-007` and
 *   `ELT-ACCESS-006` remain open until each of those is independently
 *   verified. This value is used to build every canonical/og:url output;
 *   nothing fetches from it, and no page depends on it resolving.
 */

export interface SiteConfig {
  bandNameFormal: string;
  bandNameShort: string;
  tagline: string;
  location: string;
  /**
   * The client-selected canonical origin (name confirmed; purchase/DNS/HTTPS
   * not — see the verification notes above and `ELT-LAUNCH-007`). Every
   * page's `<link rel="canonical">` and `og:url` are built from this plus
   * the route path, in `BaseLayout.astro`. No trailing slash — the layout
   * joins the path itself.
   */
  siteUrl: string;
  routes: {
    home: string;
    about: string;
    shows: string;
    music: string;
    /** Renamed from "Media & Merch" to "Gallery & Merchandise"
     * (`/media-merch` -> `/gallery-merch`); a static-compatible redirect
     * from the old path is configured in `astro.config.mjs`. */
    galleryMerch: string;
    contactBooking: string;
    bookingForm: string;
    /** The homepage's newsletter section (`Newsletter.astro`) — the site's
     * one subscription entry point. Every other newsletter link (Hero,
     * Footer, the Contact page's compact CTA) points here rather than
     * duplicating the section. */
    newsletterSection: string;
    /** The Contact page's FAQ section (`ContactFaq.astro`). */
    faqSection: string;
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
    /** Official ELT artist page — verified 2026-09-02. */
    appleMusic: string | null;
    /** Official ELT artist page — verified 2026-09-02. */
    spotify: string | null;
  };
  venmoLabel: string;
  /**
   * The label ELT is part of. Fixed, approved facts — name, URL, and the
   * exact approved relationship wording.
   *
   * Two independent consumers:
   * - The Footer uses this object for its own small, fixed, code-owned
   *   relationship acknowledgment (`name`, `url`, `relationshipText`) —
   *   unchanged regardless of Sanity content, and it never reads
   *   `musicPage.labelAffiliation`.
   * - The Music page owns the full, larger, editable Label Affiliation
   *   section via `musicPage.labelAffiliation` in Sanity (moved there from
   *   `aboutPage.labelAffiliation` — see `studio/schemaTypes/musicPage.ts`).
   *   `missionStatement` and `socialLinks` below are this object's
   *   field-level fallback for that section (`music.astro`,
   *   `musicData.ts`) whenever `musicPage.labelAffiliation` is absent or
   *   incomplete — exactly the role this object used to play for
   *   `aboutPage.labelAffiliation` before the move.
   */
  heavyCrushRecords: {
    name: string;
    url: string;
    relationshipText: string;
    missionStatement: string;
    socialLinks: {
      facebookUrl: string;
      instagramUrl: string;
      youtubeUrl: string;
    };
  };
  contact: {
    email: string | null;
    phone: string | null;
  };
}

export const siteConfig: SiteConfig = {
  bandNameFormal: "The Electric Lavender Train",
  bandNameShort: "ELT",
  tagline: "The Central Coast's Favorite Dance Band.",
  location: "Central Coast California",
  siteUrl: "https://theelectriclavendertrain.com",

  routes: {
    home: "/",
    about: "/about",
    shows: "/shows",
    music: "/music",
    galleryMerch: "/gallery-merch",
    contactBooking: "/contact-booking",
    bookingForm: "/contact-booking?inquiry=booking#contact-forms",
    newsletterSection: "/#newsletter",
    faqSection: "/contact-booking#faq",
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
    appleMusic: "https://music.apple.com/us/artist/the-electric-lavender-train/6774378427",
    spotify: "https://open.spotify.com/artist/6ndUytStOTBMrvOggBzCRf",
  },
  venmoLabel: "Tip the Band",

  heavyCrushRecords: {
    name: "Heavy Crush Records",
    url: "https://www.heavycrushrecords.com/",
    relationshipText: "The Electric Lavender Train is part of Heavy Crush Records.",
    missionStatement: "Focus on intent. Empower through performance.",
    socialLinks: {
      facebookUrl: "https://www.facebook.com/profile.php?id=61558015122991",
      instagramUrl: "https://www.instagram.com/heavycrushrecords",
      youtubeUrl: "https://www.youtube.com/c/thetens",
    },
  },

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

export type ContactInquiryType = "booking" | "merch" | "other" | "removal";

/**
 * Builds an internal link into `/contact-booking` that pre-selects one of
 * the four inquiry forms and (for merch) pre-fills the item field. The
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
