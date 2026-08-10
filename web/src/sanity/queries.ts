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
