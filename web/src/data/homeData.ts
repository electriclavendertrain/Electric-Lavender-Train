/** Code-owned Homepage labels and complete development fallbacks. */

export const TEST_NEWSLETTER_MARKER = "[TEST";

// ---------------------------------------------------------------------
// Studio-owned section fallbacks.
// ---------------------------------------------------------------------

export const upcomingShowsFallback = {
  kicker: "Where to Find Us",
  heading: "Upcoming Shows",
  viewAllLabel: "View All Shows",
  emptyState: {
    title: "No shows on the calendar right now",
    message:
      "Check back soon, or follow along on Instagram for the latest announcements.",
    actionLabel: "Follow Us on Instagram",
  },
};

/** Accessible-name anchor for "The ELT Experience" section, reused by
 * `AboutExperience.astro`'s `headingId` prop — Homepage-owned since this
 * content moved here from the About page. Not sourced from `aboutData.ts`. */
export const EXPERIENCE_HEADING_ID = "home-experience";

/** The Experience section is defined as exactly three highlights, not "up to". */
export const REQUIRED_EXPERIENCE_HIGHLIGHTS = 3;

/** Same approved copy that was previously seeded on the About page (now deprecated there — see `aboutPage.experience` in `studio/schemaTypes/aboutPage.ts`). */
export const experienceFallback = {
  kicker: "What to Expect",
  heading: "The ELT Experience",
  introduction:
    "ELT brings exhilarating takes on the hit songs audiences know and love. Powerhouse vocals, guitar-forward chemistry, and a locked-in rhythm section give every performance plenty of energy, while the band’s easygoing presence keeps the room welcoming — from winery patios and lounge stages to outdoor concerts and private celebrations.",
  highlights: [
    {
      _key: "the-sound",
      title: "The Sound",
      description:
        "Dynamic rock ’n’ roll, and exhilarating takes on the hit songs a room already knows. Broad appeal without a fixed set list — the songs suit the night.",
    },
    {
      _key: "on-stage",
      title: "On Stage",
      description:
        "Powerhouse vocals, guitar-forward chemistry, and a bass-and-drums foundation that holds the whole thing together. Energetic and live, never overproduced.",
    },
    {
      _key: "in-the-room",
      title: "In the Room",
      description:
        "Welcoming and easygoing, and at home on a winery patio, a bar lounge stage, an outdoor concert, a resort lawn, or a private celebration anywhere on the Central Coast.",
    },
  ],
};

export const testimonialsIntroFallback = {
  kicker: "What People Are Saying",
  heading: "Straight From the Dance Floor",
};

export const homepageSeoFallback = {
  metaDescription:
    "Electric Lavender Train brings high-energy live dance music to weddings, parties, breweries, festivals, and events across California’s Central Coast.",
};

// Used only when the Homepage singleton is entirely absent.

export const heroFallback = {
  eyebrow: "Central Coast Live Music",
  headline: "The Central Coast's Favorite Dance Band.",
  subcopy:
    "Playing the songs you love with the people you love. Good vibes, great music, unforgettable nights.",
};

export const bookingCtaFallback = {
  kicker: "Let's Ride Together",
  heading: "Let's Make Your Next Event Unforgettable.",
  body: "Weddings, private parties, breweries, festivals — if there's a dance floor, we'll fill it. Send a booking inquiry and let's start planning.",
  ctaLabel: "Send a Booking Inquiry",
};

export const newsletterFallback = {
  kicker: "Stay in the Loop",
  heading: "Join the ELT Newsletter",
  body: "Get the weekly ELT performance schedule delivered to your inbox. Signup uses email confirmation (double opt-in) once the hosted form is live.",
  ctaLabel: "Sign Up for the Newsletter",
};
