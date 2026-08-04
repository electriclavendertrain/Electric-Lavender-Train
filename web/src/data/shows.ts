/**
 * Isolated placeholder show data, shaped like the future Sanity event
 * document. Replace with a live query in Phase 3.
 *
 * Dates are illustrative only and were chosen to sit in the future relative
 * to today so the homepage doesn't display "upcoming" shows that have
 * already passed. Venue names are carried over from the one-page reference's
 * own sample data; no detailsHref is set because no real per-event ticket or
 * detail page exists yet — showing one would falsely imply a confirmed,
 * bookable date.
 */

export interface Show {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string; // YYYY-MM-DD
  timeDisplay: string;
  status: "upcoming" | "past";
  isPlaceholder: boolean;
  detailsHref: string | null;
}

export const shows: Show[] = [
  {
    id: "placeholder-coyote-2026-08-22",
    title: "Live at Coyote Bar & Grill",
    venue: "Coyote Bar & Grill",
    city: "Paso Robles, CA",
    date: "2026-08-22",
    timeDisplay: "7:00 PM",
    status: "upcoming",
    isPlaceholder: true,
    detailsHref: null,
  },
  {
    id: "placeholder-the-spot-2026-09-05",
    title: "Live at The Spot",
    venue: "The Spot",
    city: "Atascadero, CA",
    date: "2026-09-05",
    timeDisplay: "8:00 PM",
    status: "upcoming",
    isPlaceholder: true,
    detailsHref: null,
  },
  {
    id: "placeholder-whiskey-ridge-2026-09-19",
    title: "Live at Whiskey Ridge",
    venue: "Whiskey Ridge",
    city: "Cambria, CA",
    date: "2026-09-19",
    timeDisplay: "7:30 PM",
    status: "upcoming",
    isPlaceholder: true,
    detailsHref: null,
  },
];

export default shows;
