import {defineQuery} from 'groq'

/**
 * Fetches the homepage singleton by its fixed `_id`. Fetched once, at build
 * time, in `index.astro`'s frontmatter (docs/phase3-plan.md §17, §19).
 */
export const HOMEPAGE_QUERY = defineQuery(`
  *[_type == "homepage" && _id == "homepage"][0]{
    hero,
    heroVideo->{ videoUrl, videoProvider, title },
    bandIntro{
      ...,
      image->{
        _id,
        alt,
        creditLine,
        creditUrl,
        image{
          ...,
          asset->{
            _id,
            metadata{ dimensions }
          }
        }
      }
    },
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
    upcomingShows{
      kicker,
      heading,
      viewAllLabel,
      emptyState{ title, message, actionLabel }
    },
    galleryIntro{ kicker, heading, ctaLabel },
    testimonialsIntro{ kicker, heading },
    bookingCta,
    newsletter{ kicker, heading, body, ctaLabel },
    seo
  }
`)

/* -------------------------------------------------------------------------
 * Reusable testimonials
 *
 * Deliberately NOT part of either page singleton. The Homepage and the About
 * page each fetch this query independently and render the same three cards in
 * the same order, while keeping their own section headings
 * (`homepage.testimonialsIntro` / `aboutPage.testimonialsIntro`).
 *
 * `homepage.testimonials` — the old page-nested array — is no longer selected
 * anywhere. Its development values were migrated to reusable documents,
 * explicitly cleared from the singleton, and the retired schema field removed.
 * ---------------------------------------------------------------------- */

/**
 * The first three testimonials by display order, with `_id` as the
 * deterministic tiebreaker for documents sharing an order value. The cap lives
 * in the query so neither page can accidentally render a fourth, and it is
 * re-applied during normalization because a raw API write can store anything.
 *
 * `sourceLogo` is dereferenced explicitly and treated as a contained graphic,
 * not a photographic crop — no crop/hotspot is requested for it.
 */
export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial"]
  | order(displayOrder asc, _id asc)[0...3] {
    _id,
    quote,
    sourceName,
    sourceContext,
    sourceUrl,
    displayOrder,
    sourceLogo->{
      _id,
      title,
      alt,
      image{
        ...,
        asset->{
          _id,
          metadata{ dimensions }
        }
      }
    }
  }
`)

/* -------------------------------------------------------------------------
 * About page (/about)
 *
 * One fixed-id singleton query. Members are ordered references, dereferenced
 * here so the page makes a single round trip — the order stored in
 * `aboutPage.members` is the render order, and only the members selected there
 * are fetched.
 *
 * Only PUBLIC member fields are projected. `bandMember` has no private contact
 * field to select in the first place, and none may be added
 * (docs/developer-guide.md §9) — but note that a public dataset means GROQ
 * omission is not access control. The guarantee is that nothing private is
 * stored, not that this projection hides it.
 * ---------------------------------------------------------------------- */

/**
 * The About page singleton by fixed `_id`.
 *
 * `heroImage->` and `members[]{"member": @->}` follow the same dereference
 * shapes the homepage already uses: a single direct reference takes `->`, and
 * an array whose elements ARE references takes `@->` with a projection alias.
 * `_key` is preserved on every array so list keys stay stable.
 */
export const ABOUT_PAGE_QUERY = defineQuery(`
  *[_type == "aboutPage" && _id == "aboutPage"][0]{
    intro{
      kicker,
      heading,
      lede,
      heroImage->{
        _id,
        title,
        alt,
        image{
          ...,
          asset->{
            _id,
            metadata{ dimensions }
          }
        }
      }
    },
    story{ kicker, heading, paragraphs },
    labelAffiliation{ kicker, text, logoAlt, url },
    membersIntro{ kicker, heading, body },
    members[]{
      _key,
      "member": @->{
        _id,
        name,
        role,
        profileImage->{
          _id,
          title,
          alt,
          image{
            ...,
            asset->{
              _id,
              metadata{ dimensions }
            }
          }
        },
        biography,
        publicLinks[]{ _key, linkType, label, url }
      }
    },
    experience{
      kicker,
      heading,
      introduction,
      highlights[]{ _key, title, description }
    },
    testimonialsIntro{ kicker, heading },
    bookingCta{ kicker, heading, body, ctaLabel },
    seo{ metaTitle, metaDescription, ogImage }
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
    seo{ metaTitle, metaDescription, ogImage }
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

/* -------------------------------------------------------------------------
 * Gallery & Merchandise page (/gallery-merch)
 *
 * One fixed-id singleton query. `gallery.items` (photos), `gallery.videos`
 * (YouTube videos), and `merch.items` are ordered arrays of DIRECT
 * references — same dereference shape the homepage's `featuredMedia` and the
 * About page's `members` already use: `@->` dereferences "this array
 * element", and `"media"` / `"item"` are projection aliases naming the
 * result, not real fields. `_key` is preserved on every array so selection
 * order and list identity survive normalization.
 *
 * `gallery.items` projects no `mediaType` (image validity is decided from
 * whether `image.asset` resolved, exactly like `normalizeFeaturedMedia`
 * already does for the homepage gallery). `gallery.videos` DOES project
 * `mediaType`/`videoProvider` — unlike a photo selection, a video selection
 * must be re-validated as an actual YouTube video (not just "resolved"), so
 * `normalizeGalleryVideos` needs those fields to check.
 * ---------------------------------------------------------------------- */

/* -------------------------------------------------------------------------
 * Contact & Booking page (/contact-booking)
 *
 * One fixed-id singleton query. Everything selected here is genuinely
 * editorial — page intro, the compact newsletter callout, and the FAQ.
 * Inquiry types, field definitions, validation, delivery configuration, and
 * every piece of protected privacy/security copy stay entirely out of this
 * query and out of Sanity — see `web/src/data/contactData.ts`.
 * ---------------------------------------------------------------------- */

export const CONTACT_PAGE_QUERY = defineQuery(`
  *[_type == "contactPage" && _id == "contactPage"][0]{
    intro{ kicker, heading, lede, explanation },
    newsletterCta{ heading, body, linkLabel },
    faq[]{ _key, question, answer },
    seo{ metaTitle, metaDescription, ogImage }
  }
`)

/* -------------------------------------------------------------------------
 * Music page (/music)
 *
 * One fixed-id singleton query. `releases` is ONE ordered array of direct
 * references — same `@->` dereference shape used throughout this file — and
 * is the single source of truth for both selection AND order; the frontend
 * splits it into "upcoming" and "released" groups by each release's own
 * `state`, without re-sorting either group.
 *
 * Field order below (intro, featuredVideo, releases, seo) matches the
 * editorial placement on the page: the featured video renders immediately
 * after the intro and before the release sections — see `music.astro` and
 * the matching field order in `studio/schemaTypes/musicPage.ts`. GROQ
 * doesn't care about projection field order, but keeping it visually
 * consistent with the page/schema avoids the two silently drifting apart.
 * ---------------------------------------------------------------------- */

export const MUSIC_PAGE_QUERY = defineQuery(`
  *[_type == "musicPage" && _id == "musicPage"][0]{
    intro{ kicker, heading, lede },
    featuredVideo{
      kicker,
      heading,
      video->{
        videoUrl,
        videoProvider,
        title
      }
    },
    releases[]{
      _key,
      "release": @->{
        _id,
        title,
        "slug": slug.current,
        releaseType,
        state,
        releaseDate,
        coverArtwork->{
          _id,
          alt,
          image{
            ...,
            asset->{
              _id,
              metadata{ dimensions }
            }
          }
        },
        description,
        spotifyUrl,
        appleMusicUrl,
        preSaveUrl,
        watchVideoUrl
      }
    },
    seo{ metaTitle, metaDescription, ogImage }
  }
`)

/* -------------------------------------------------------------------------
 * Gallery & Merchandise page (/gallery-merch)
 *
 * Renamed from the Media & Merch page (`mediaPage` → `galleryPage`, route
 * `/media-merch` → `/gallery-merch`) — see docs/gallery-merch.md. Unlike
 * `mediaPage`, this singleton has NO featured-video field: featured,
 * click-to-load video locations are now only the Homepage hero and the
 * Music page (`MUSIC_PAGE_QUERY` above).
 * ---------------------------------------------------------------------- */

export const GALLERY_PAGE_QUERY = defineQuery(`
  *[_type == "galleryPage" && _id == "galleryPage"][0]{
    intro{ kicker, heading, lede },
    gallery{
      kicker,
      heading,
      body,
      items[]{
        _key,
        "media": @->{
          _id,
          title,
          alt,
          category,
          creditLine,
          creditUrl,
          image{
            ...,
            asset->{
              _id,
              metadata{ dimensions }
            }
          }
        }
      },
      videos[]{
        _key,
        "media": @->{
          _id,
          title,
          mediaType,
          videoProvider,
          videoUrl,
          videoPoster{
            ...,
            asset->{
              _id,
              metadata{ dimensions }
            }
          },
          creditLine,
          creditUrl
        }
      }
    },
    eventMediaSubmission{
      enabled,
      kicker,
      heading,
      explanation,
      ctaLabel,
      formUrl
    },
    merch{
      kicker,
      heading,
      body,
      items[]{
        _key,
        "item": @->{
          _id,
          name,
          description,
          priceDisplay,
          availabilityNote,
          image->{
            _id,
            title,
            alt,
            image{
              ...,
              asset->{
                _id,
                metadata{ dimensions }
              }
            }
          }
        }
      }
    },
    bookingCta{ kicker, heading, body, ctaLabel },
    seo{ metaTitle, metaDescription, ogImage }
  }
`)
