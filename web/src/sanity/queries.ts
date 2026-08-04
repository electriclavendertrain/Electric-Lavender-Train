import {defineQuery} from 'groq'

/**
 * Structural placeholder for Phase 3A: written and typed, but not yet
 * called from any page — index.astro isn't wired to Sanity until Phase 3C
 * (docs/phase3-plan.md §17, §23).
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
    testimonials[]{ _key, quote, attribution },
    bookingCta,
    seo
  }
`)

/**
 * Structural placeholder for Phase 3A — see note above. Never selects
 * busy-only or hidden events; never selects events by recency of creation
 * (docs/phase3-plan.md §3).
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
