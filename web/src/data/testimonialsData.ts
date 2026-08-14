import type { NormalizedTestimonial } from "../sanity/normalize";

/**
 * The shared three-card fallback set for the Homepage and About page.
 *
 * These are visibly attributed as placeholders so they cannot be mistaken for
 * approved client endorsements. In non-production, the set is used as one
 * coherent unit whenever fewer than three valid testimonial documents are
 * available; production requires three live documents. Live and placeholder
 * endorsements are never mixed in the same section.
 */
export const testimonialsFallback: NormalizedTestimonial[] = [
  {
    _id: "fallback-testimonial-1",
    quote: "The dance floor never emptied. ELT read the room perfectly all night long.",
    sourceName: "Placeholder quote — Central Coast venue guest",
    sourceContext: null,
    sourceUrl: null,
    logo: null,
  },
  {
    _id: "fallback-testimonial-2",
    quote:
      "Exactly the energy we wanted for our event — modern, tight, and genuinely fun to watch.",
    sourceName: "Placeholder quote — private event host",
    sourceContext: null,
    sourceUrl: null,
    logo: null,
  },
  {
    _id: "fallback-testimonial-3",
    quote: "Best cover band we've booked on the Central Coast, hands down.",
    sourceName: "Placeholder quote — venue booking contact",
    sourceContext: null,
    sourceUrl: null,
    logo: null,
  },
];

export function withTestimonialFallbacks(
  testimonials: NormalizedTestimonial[],
  allowFallbacks: boolean,
): NormalizedTestimonial[] {
  if (testimonials.length === testimonialsFallback.length) return testimonials;

  if (!allowFallbacks) {
    throw new Error(
      "The production dataset must contain three complete, published testimonials. " +
        "Add or complete them under `Testimonials` in Sanity Studio before building.",
    );
  }

  return testimonialsFallback;
}
