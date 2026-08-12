/**
 * Fallback editorial content for the Shows-page singleton.
 *
 * This entire object is used only when the fixed-id `showsPage` document is
 * absent from a non-production dataset. Once the singleton exists, the page
 * uses its complete normalized content and never mixes live Sanity fields
 * with individual fallback values. Production builds require the singleton.
 */
export const showsPageFallback = {
  intro: {
    kicker: "Where to Find Us",
    heading: "Shows",
    paragraphs: [
      "Electric Lavender Train plays dance floors, breweries, wineries, and backyards up and down California's Central Coast. Public dates are listed here as soon as they're confirmed.",
    ],
  },
  upcoming: {
    heading: "Upcoming Schedule",
  },
  recent: {
    kicker: "Where We've Been",
    heading: "Recent Shows",
  },
  emptyState: {
    title: "No upcoming dates listed right now",
    message:
      "No upcoming dates are currently listed on this page. New public dates are added as they are confirmed. An unlisted date is not guaranteed available — send a booking inquiry and ELT will confirm.",
    actionLabel: "Follow on Instagram",
  },
  bookingCta: {
    kicker: "Let's Ride Together",
    heading: "Want ELT at Your Venue or Event?",
    body: "Weddings, private parties, breweries, festivals — if there's a dance floor, we'll fill it. Tell us about your event and your dates, and we'll confirm what's open.",
    ctaLabel: "Send a Booking Inquiry",
  },
  seo: {
    metaTitle: "Shows",
    metaDescription:
      "Upcoming and recent Electric Lavender Train performances on California's Central Coast. All times Pacific.",
  },
} as const;

/**
 * Protected interface and safety copy.
 *
 * These values are deliberately not editor-controlled. In particular, the
 * generic private-event label comes from here because private GROQ results
 * contain no title, and the time-zone/availability notices must stay true.
 */
export const showsPageCopy = {
  intro: {
    timeZoneNote: "All times shown are Pacific (America/Los Angeles).",
    availabilityNote:
      "This is a schedule of confirmed dates, not an availability calendar. A date that isn't listed here is not guaranteed to be open — send a booking inquiry and ELT will confirm.",
  },

  monthNav: {
    label: "Jump to a month",
  },

  upcoming: {
    headingId: "upcoming-schedule",
  },

  recent: {
    headingId: "recent-shows",
  },

  privateEventTitle: "Private Event",

  statusBadges: {
    cancelled: "Cancelled",
    postponed: "Postponed",
  },

  statusNotes: {
    cancelled: "This show has been cancelled.",
    postponed:
      "This show has been postponed. The time below is the originally scheduled time; a new date will be announced.",
  },

  externalLinkLabels: {
    scheduled: "Tickets & Details",
    cancelled: "Event Update",
    postponed: "Event Update",
    recent: "Event Page",
  },

  newTabSuffix: " (opens in a new tab)",
} as const;

export default showsPageCopy;
