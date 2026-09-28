/**
 * Shared, code-owned identity, routes, and verified public destinations.
 * The selected canonical domain is not evidence of ownership, DNS, or HTTPS.
 */

export interface SiteConfig {
  bandNameFormal: string;
  bandNameShort: string;
  tagline: string;
  location: string;
  /** Canonical origin; domain launch verification remains deferred. */
  siteUrl: string;
  routes: {
    home: string;
    about: string;
    shows: string;
    music: string;
    /** Current route; Astro redirects the former /media-merch path here. */
    galleryMerch: string;
    contactBooking: string;
    bookingForm: string;
    /** The one site-owned newsletter entry point. */
    newsletterSection: string;
    /** The Contact page's FAQ section (`ContactFaq.astro`). */
    faqSection: string;
    privacy: string;
    terms: string;
    accessibility: string;
    /**
     * Static, `noIndex` confirmation/status pages — not linked from Header,
     * Footer, or any other primary navigation. Each is the eventual target
     * of a provider dashboard setting (Formspree Thank You redirect, or a
     * Brevo confirmation/unsubscribe page) configured only once the route is
     * deployed on the production domain — see `docs/developer-guide.md`.
     */
    contactBookingThankYou: string;
    newsletterCheckInbox: string;
    newsletterConfirmed: string;
    newsletterUnsubscribed: string;
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
  /** Fixed label facts and fallback copy used by the Footer and Music page. */
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
    contactBookingThankYou: "/contact-booking/thank-you",
    newsletterCheckInbox: "/newsletter/check-your-inbox",
    newsletterConfirmed: "/newsletter/confirmed",
    newsletterUnsubscribed: "/newsletter/unsubscribed",
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

/** Lightweight check used for both configured and visitor email addresses. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Confirms the public contact address is usable by production guards. */
export function isContactEmailConfigured(): boolean {
  const email = siteConfig.contact.email;
  return typeof email === "string" && EMAIL_PATTERN.test(email.trim());
}

/** Appends the formal band name to a page-specific title. */
export function formatPageTitle(pageTitle: string): string {
  return `${pageTitle.trim()} — ${siteConfig.bandNameFormal}`;
}

export type ContactInquiryType = "booking" | "merch" | "other" | "removal";

/** Builds a safely encoded link to a selected Contact inquiry form. */
export function contactInquiryHref(inquiry: ContactInquiryType, item?: string): string {
  const params = new URLSearchParams({ inquiry });
  if (item) params.set("item", item);
  return `${siteConfig.routes.contactBooking}?${params.toString()}#contact-forms`;
}

export default siteConfig;
