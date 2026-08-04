/**
 * Isolated placeholder content for the homepage: page-specific copy,
 * gallery selection, and sample testimonials. Kept separate from
 * siteConfig.ts (shared identity/contact) and shows.ts (event data) so a
 * future Sanity homepage query can replace this file without touching
 * component markup. Replace in Phase 3.
 */

import type { ImageMetadata } from "astro";
import galleryPerformance from "../assets/images/gallery/elt-04.jpg";
import galleryVocals from "../assets/images/gallery/elt-09.jpg";
import galleryGuitar from "../assets/images/gallery/elt-08.jpg";
import galleryBass from "../assets/images/gallery/elt-06.jpg";
import galleryCrowd from "../assets/images/gallery/elt-10.jpg";
import galleryDanceFloor from "../assets/images/gallery/elt-12.jpg";

export const hero = {
  eyebrow: "Central Coast Live Music",
  headline: "The Central Coast's Favorite Dance Band",
  subcopy:
    "Playing the songs you love with the people you love. Good vibes, great music, unforgettable nights.",
};

/**
 * Hero click-to-play featured video, isolated here rather than in
 * siteConfig.ts because it's homepage-specific editorial content, not
 * shared site identity. A verified ELT performance video URL has not yet
 * been supplied, so this ships as null: the hero renders the plain static
 * floating logo, with no play control, and keeps the eyebrow above. When a
 * verified URL is set, Hero.astro swaps the eyebrow to "Play Featured
 * Video" and renders the logo as an interactive poster. In Phase 3 this
 * becomes a `heroVideo` reference on the Sanity homepage singleton,
 * filtered to video media items (see docs/home.md).
 */
export const heroVideoUrl: string | null = null;

export const bandIntro = {
  kicker: "Who We Are",
  heading: "More Than a Band, We're Family.",
  paragraphs: [
    "We're a local band with deep roots on the Central Coast. We know the crowd, we know the songs, and we know how to make every night one to remember — full of dancing, singing, and the kind of energy that turns strangers into friends. Whether it's a backyard celebration or a packed house downtown, we play it like family.",
    "Thanks for riding the train with us.",
  ],
  ctaLabel: "Meet the Band",
};

export const upcomingShowsCopy = {
  kicker: "Where to Find Us",
  heading: "Upcoming Shows",
  viewAllLabel: "View All Shows",
  placeholderNote:
    "Sample dates shown — this section will display real, confirmed shows once connected to the booking calendar.",
  emptyStateTitle: "No shows on the calendar right now",
  emptyStateMessage:
    "Check back soon, or follow along on Instagram for the latest announcements.",
};

export interface GalleryItem {
  image: ImageMetadata;
  alt: string;
  caption: string;
}

export const galleryCopy = {
  kicker: "Good Times & Great People",
  heading: "Live From the Last Show",
  ctaLabel: "View Full Gallery",
};

export const galleryItems: GalleryItem[] = [
  {
    image: galleryPerformance,
    alt: "The full Electric Lavender Train performing outdoors.",
    caption: "On stage",
  },
  {
    image: galleryVocals,
    alt: "Rachel singing and playing baritone ukulele.",
    caption: "Lead vocals",
  },
  {
    image: galleryGuitar,
    alt: "Hunter singing and playing electric guitar.",
    caption: "Guitar & vocals",
  },
  {
    image: galleryBass,
    alt: "Geert playing bass during an outdoor performance.",
    caption: "Holding the groove",
  },
  {
    image: galleryCrowd,
    alt: "A wide view of the outdoor venue and audience.",
    caption: "The crowd",
  },
  {
    image: galleryDanceFloor,
    alt: "Audience members dancing in front of the band.",
    caption: "Dance floor",
  },
];

export interface Testimonial {
  quote: string;
  attribution: string;
}

export const testimonialsCopy = {
  kicker: "What People Are Saying",
  heading: "Straight From the Dance Floor",
  placeholderNote:
    "Sample testimonials shown for layout purposes — pending client-approved quotes.",
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "The dance floor never emptied. ELT read the room perfectly all night long.",
    attribution: "Placeholder quote — Central Coast venue guest",
  },
  {
    quote:
      "Exactly the energy we wanted for our event — modern, tight, and genuinely fun to watch.",
    attribution: "Placeholder quote — private event host",
  },
  {
    quote: "Best cover band we've booked on the Central Coast, hands down.",
    attribution: "Placeholder quote — venue booking contact",
  },
];

export const bookingCta = {
  kicker: "Let's Ride Together",
  heading: "Let's Make Your Next Event Unforgettable.",
  body: "Weddings, private parties, breweries, festivals — if there's a dance floor, we'll fill it. Send a booking inquiry and let's start planning.",
  ctaLabel: "Send a Booking Inquiry",
};
