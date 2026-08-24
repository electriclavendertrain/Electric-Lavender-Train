/**
 * Two different kinds of homepage content live here, and they're handled
 * differently by index.astro:
 *
 * 1. Coherent fallback blocks for Studio-owned Homepage sections while a
 *    non-production dataset is being populated.
 *
 * 2. `heroFallback` / `bandIntroFallback` / `galleryFallback` /
 *    `bookingCtaFallback` — used ONLY when the entire homepage singleton
 *    document is absent from the configured dataset (docs/phase3-plan.md §15).
 *    If the singleton exists but a section within it is incomplete,
 *    index.astro omits that section instead of reaching for these — never
 *    mixing real Sanity content with placeholder text in the same render.
 *
 * Shared testimonial fallbacks live in `testimonialsData.ts`, not in either
 * page singleton's fallback block.
 *
 * There is no event fallback of any kind, anywhere, ever — see
 * `web/src/pages/index.astro` and docs/phase3-plan.md §15.
 *
 * `TEST_NEWSLETTER_MARKER` is a belt-and-suspenders production guard, not a
 * marker used anywhere in this file's own fallback content today (the
 * newsletter fallback below is real, approved copy, not a placeholder). If a
 * `[TEST`-prefixed value is ever typed into the Studio `homepage.newsletter`
 * fields — in `development` or, by accident, `production` — `normalize.ts`
 * rejects it in production the same way `TEST_BIOGRAPHY_MARKER` and
 * `TEST_PRODUCT_MARKER` guard their own sections.
 */

export const TEST_NEWSLETTER_MARKER = "[TEST";

import type { ImageMetadata } from "astro";
import galleryPerformance from "../assets/images/gallery/elt-04.jpg";
import galleryVocals from "../assets/images/gallery/elt-09.jpg";
import galleryGuitar from "../assets/images/gallery/elt-08.jpg";
import galleryBass from "../assets/images/gallery/elt-06.jpg";
import galleryCrowd from "../assets/images/gallery/elt-10.jpg";
import galleryDanceFloor from "../assets/images/gallery/elt-12.jpg";

// ---------------------------------------------------------------------
// Studio-owned section fallbacks.
// ---------------------------------------------------------------------

export const upcomingShowsFallback = {
  kicker: "Where to Find Us",
  heading: "Upcoming Shows",
  viewAllLabel: "View All Shows",
  emptyState: {
    title: "No shows on the calendar right now",
    message: "Check back soon, or follow along on Instagram for the latest announcements.",
    actionLabel: "Follow Us on Instagram",
  },
};

export const galleryIntroFallback = {
  kicker: "Good Times & Great People",
  heading: "Live From the Last Show",
  ctaLabel: "View Full Gallery",
};

export const testimonialsIntroFallback = {
  kicker: "What People Are Saying",
  heading: "Straight From the Dance Floor",
};

export const homepageSeoFallback = {
  metaDescription:
    "Electric Lavender Train brings high-energy live dance music to weddings, parties, breweries, festivals, and events across California’s Central Coast.",
};

// ---------------------------------------------------------------------
// Fallback-only content — used only when the homepage singleton is
// entirely absent (never when it exists but is partially empty).
// ---------------------------------------------------------------------

export const heroFallback = {
  eyebrow: "Central Coast Live Music",
  headline: "The Central Coast's Favorite Dance Band",
  subcopy:
    "Playing the songs you love with the people you love. Good vibes, great music, unforgettable nights.",
};

export const bandIntroFallback = {
  kicker: "Who We Are",
  heading: "More Than a Band, We're Family.",
  paragraphs: [
    "We're a local band with deep roots on the Central Coast. We know the crowd, we know the songs, and we know how to make every night one to remember — full of dancing, singing, and the kind of energy that turns strangers into friends. Whether it's a backyard celebration or a packed house downtown, we play it like family.",
    "Thanks for riding the train with us.",
  ],
  ctaLabel: "Meet the Band",
};

export interface FallbackGalleryItem {
  _key: string;
  image: ImageMetadata;
  alt: string;
  caption: string;
}

export const galleryFallback: FallbackGalleryItem[] = [
  {
    _key: "fallback-1",
    image: galleryPerformance,
    alt: "The full Electric Lavender Train performing outdoors.",
    caption: "On stage",
  },
  {
    _key: "fallback-2",
    image: galleryVocals,
    alt: "Rachel singing and playing baritone ukulele.",
    caption: "Lead vocals",
  },
  {
    _key: "fallback-3",
    image: galleryGuitar,
    alt: "Hunter singing and playing electric guitar.",
    caption: "Guitar & vocals",
  },
  {
    _key: "fallback-4",
    image: galleryBass,
    alt: "Geert playing bass during an outdoor performance.",
    caption: "Holding the groove",
  },
  {
    _key: "fallback-5",
    image: galleryCrowd,
    alt: "A wide view of the outdoor venue and audience.",
    caption: "The crowd",
  },
  {
    _key: "fallback-6",
    image: galleryDanceFloor,
    alt: "Audience members dancing in front of the band.",
    caption: "Dance floor",
  },
];

export const bookingCtaFallback = {
  kicker: "Let's Ride Together",
  heading: "Let's Make Your Next Event Unforgettable.",
  body: "Weddings, private parties, breweries, festivals — if there's a dance floor, we'll fill it. Send a booking inquiry and let's start planning.",
  ctaLabel: "Send a Booking Inquiry",
};

export const newsletterFallback = {
  kicker: "Stay in the Loop",
  heading: "Join the ELT Newsletter",
  body: "Weekly updates from Electric Lavender Train, straight to your inbox. Subscribers can separately opt in to new-show alerts when a public date is added. Signup uses email confirmation (double opt-in) once the hosted form is live.",
  ctaLabel: "Sign Up for the Newsletter",
};
