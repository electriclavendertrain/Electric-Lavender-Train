import {defineQuery} from 'groq'

/**
 * Fetches the homepage singleton by its fixed `_id`. Fetched once, at build
 * time, in `index.astro`'s frontmatter (docs/phase3-plan.md §17, §19).
 */
export const HOMEPAGE_QUERY = defineQuery(`
  *[_type == "homepage" && _id == "homepage"][0]{
    hero,
    heroVideo->{ videoUrl, videoProvider },
    bandIntro,
    featuredMedia[]{
      _key,
      "mediaItem": @->{
        _id,
        title,
        alt,
        image{
          ...,
          asset->{
            _id,
            metadata{
              dimensions
            }
          }
        }
      }
    },
    upcomingShows{ emptyState{ title, message, actionLabel } },
    testimonialsIntro{ kicker, heading },
    testimonials[]{ _key, quote, attribution },
    bookingCta,
    seo
  }
`)

/**
 * The next three chronologically upcoming public scheduled events, fetched
 * independently of the homepage singleton (never duplicated into it). Never
 * selects busy-only or hidden events; never selects events by recency of
 * creation (docs/phase3-plan.md §3).
 */
export const UPCOMING_PUBLIC_EVENTS_QUERY = defineQuery(`
  *[_type == "event"
    && visibility == "public"
    && status == "scheduled"
    && coalesce(endDateTime, startDateTime) >= now()
  ] | order(startDateTime asc) [0...3] {
    _id, title, slug, startDateTime, endDateTime,
    venue, location, externalEventUrl
  }
`)

/* -------------------------------------------------------------------------
 * Shows page (/shows)
 *
 * One fixed-id page-singleton query plus three deliberately separate event
 * queries rather than one broad `event` projection. The public and private
 * event projections are disjoint: the private one selects NO field that could
 * carry text an editor typed, so a private booking's details cannot reach the
 * page even by accident. Hidden events are excluded structurally by every
 * event filter — never filtered out afterwards in the frontend.
 *
 * Note this is a courtesy to the query author, not a security boundary: the
 * dataset permits anonymous reads, so a direct API call can still read every
 * published field (docs/developer-guide.md §7).
 *
 * `now()` is evaluated when the query runs — i.e. at `astro build`. Events do
 * not move between upcoming and recent until the site rebuilds.
 *
 * No `slug` is selected anywhere: event detail routes are deferred, so
 * nothing on this page links to one.
 * ---------------------------------------------------------------------- */

/**
 * Client-editable Shows-page copy. Privacy labels, status wording, time-zone
 * and availability notices, and link labels remain protected frontend copy;
 * they are intentionally absent from this projection and schema.
 */
export const SHOWS_PAGE_QUERY = defineQuery(`
  *[_type == "showsPage" && _id == "showsPage"][0]{
    intro{ kicker, heading, paragraphs },
    upcoming{ heading },
    recent{ kicker, heading },
    emptyState{ title, message, actionLabel },
    bookingCta{ kicker, heading, body, ctaLabel },
    seo{ metaTitle, metaDescription }
  }
`)

/**
 * Every upcoming PUBLIC event, as one chronological stream — including
 * cancelled and postponed ones, which keep their chronological position and
 * render an explicit text badge rather than moving to a separate section.
 * Deliberately uncapped and with no future cutoff, so a far-future published
 * show appears automatically.
 *
 * `coalesce(endDateTime, startDateTime) >= now()` keeps an event that has
 * started but not yet ended in the upcoming stream, matching the homepage.
 * `_id` is the deterministic tiebreaker for events sharing a start instant.
 */
export const SHOWS_UPCOMING_PUBLIC_EVENTS_QUERY = defineQuery(`
  *[
    _type == "event"
    && visibility == "public"
    && defined(startDateTime)
    && coalesce(endDateTime, startDateTime) >= now()
  ]
  | order(startDateTime asc, _id asc) {
    _id,
    "kind": "public",
    status,
    startDateTime,
    endDateTime,
    title,
    venue,
    location,
    description,
    externalEventUrl
  }
`)

/**
 * Upcoming private bookings, reduced to nothing but an id and two times.
 * Only `scheduled` busy-only events qualify — a cancelled or postponed
 * private booking is no longer a commitment worth publishing, and a past one
 * is not useful, so both are excluded structurally here rather than
 * downstream.
 *
 * The projection selects no title, venue, location, description, slug, or
 * URL, so there is nothing for the frontend to leak. The visible "Private
 * Event" label is supplied by `web/src/data/showsData.ts`, never by Sanity.
 */
export const SHOWS_UPCOMING_PRIVATE_EVENTS_QUERY = defineQuery(`
  *[
    _type == "event"
    && visibility == "busyOnly"
    && status == "scheduled"
    && defined(startDateTime)
    && coalesce(endDateTime, startDateTime) >= now()
  ]
  | order(startDateTime asc, _id asc) {
    _id,
    "kind": "private",
    startDateTime,
    endDateTime
  }
`)

/**
 * The twelve most recent public shows that actually happened, newest first.
 * `status == "scheduled"` is required: a cancelled or postponed show never
 * took place, so listing it as a recent performance would be untrue. Past
 * private and hidden events are excluded structurally.
 */
export const SHOWS_RECENT_PUBLIC_EVENTS_QUERY = defineQuery(`
  *[
    _type == "event"
    && visibility == "public"
    && status == "scheduled"
    && defined(startDateTime)
    && coalesce(endDateTime, startDateTime) < now()
  ]
  | order(startDateTime desc, _id asc) [0...12] {
    _id,
    "kind": "public",
    status,
    startDateTime,
    endDateTime,
    title,
    venue,
    location,
    description,
    externalEventUrl
  }
`)
