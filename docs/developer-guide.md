# ELT Developer Guide

Maintenance reference for the Electric Lavender Train website as it is actually built today.

This describes the **implemented system** — not the plan that produced it. It assumes you have never read `docs/phase3-plan.md`. Where a decision has reasoning worth preserving, the reasoning is here too; the plan document remains the historical record but you should not need it to work on the site.

**Scope as implemented:** one route (`/`, the homepage), fed by Sanity at build time. Everything else listed under [Deferred work](#15-deferred-work) does not exist yet.

---

## Table of contents

1. [The 60-second version](#1-the-60-second-version)
2. [Repository layout](#2-repository-layout)
3. [Sanity content types](#3-sanity-content-types)
4. [Validation and conditional behavior](#4-validation-and-conditional-behavior)
5. [Content → code mapping](#5-content--code-mapping)
6. [Datasets and how to switch](#6-datasets-and-how-to-switch)
7. [Public configuration vs. secrets](#7-public-configuration-vs-secrets)
8. [Build-time fetching](#8-build-time-fetching)
9. [Normalization](#9-normalization)
10. [Images, crop and hotspot](#10-images-crop-and-hotspot)
11. [TypeGen](#11-typegen)
12. [Build and rebuild behavior](#12-build-and-rebuild-behavior)
13. [Pacific time](#13-pacific-time)
14. [Changing fields safely](#14-changing-fields-safely)
15. [Deferred work](#15-deferred-work)
16. [Troubleshooting](#16-troubleshooting)
17. [Known issues](#17-known-issues)
18. [Client-facing rationale](#18-client-facing-rationale)

---

## 1. The 60-second version

The site is a **static** Astro build. There is no server and no runtime API call.

```
Client edits content in Sanity Studio
        ↓  (publish)
Sanity dataset
        ↓  read once, at `astro build`, by index.astro's frontmatter
GROQ queries  →  normalization  →  plain component props
        ↓
dist/index.html — plain HTML, no Sanity code shipped to the browser
```

Consequences worth internalizing:

- **Content changes do not appear until something rebuilds the site.** There is no live refresh.
- **The browser never queries the Sanity Content Lake.** No Sanity client, no GROQ query, and no API token is shipped to or executed in the browser. Content arrives already baked into the HTML, so there are no loading states and none are needed. The browser *does* request optimized image assets from the public Sanity image CDN (`cdn.sanity.io`) — those are ordinary `<img>` requests for static image files, not content queries.
- **A content problem is a build problem.** If Sanity is misconfigured or unreachable, the build fails rather than shipping a broken page.

---

## 2. Repository layout

| Path | What it is |
|---|---|
| `web/` | The Astro frontend. This is the production website. |
| `studio/` | The Sanity Studio project — owns the schema *and* the TypeGen workflow. |
| `skele/` | Read-only design/functionality references. Never edit; gitignored. |
| `docs/` | Planning and specification documents. Gitignored **except this guide**. |

Two separate npm packages. They share no code — `studio/` and `web/` each have their own `package.json` and `node_modules`. The only things that cross the boundary are two generated files, written by Studio's tooling into `web/`:

- `studio/schema.json` — the extracted schema
- `web/src/sanity/sanity.types.ts` — the generated TypeScript types

Both are committed. **Never hand-edit either one.**

### Files that matter for content

```
studio/
  schemaTypes/
    event.ts          event document
    mediaItem.ts      reusable image/video item
    homepage.ts       the homepage singleton
    templates.ts      "New Public Show" / "New Private Booking"
    index.ts          registers the three types
  structure.ts        the Studio sidebar tree + filtered event views
  sanity.config.ts    project/dataset, structure, Create-menu rules
  sanity.cli.ts       CLI project/dataset + TypeGen config
  schema.json         GENERATED

web/src/
  sanity/
    client.ts         re-exports the client from the `sanity:client` module
    queries.ts        BOTH GROQ queries live here, nowhere else
    normalize.ts      raw query results → component props (defensive)
    image.ts          Sanity CDN image URL builder
    sanity.types.ts   GENERATED
  pages/index.astro   the ONLY place that fetches
  components/*.astro  plain-props components; know nothing about Sanity
  data/homeData.ts    permanent section copy + whole-document fallbacks
  lib/dateFormat.ts   Pacific-time event formatting
```

---

## 3. Sanity content types

Three document types. That is the entire content model.

### `homepage` — the singleton

One document, with the hardcoded `_id: "homepage"`. The query looks it up by that exact id, so **there is only ever one, and its id must not change.**

| Field | Type | Required | Notes |
|---|---|---|---|
| `hero` | object | yes | `eyebrow?`, `headline` (**required**), `subcopy?` |
| `heroVideo` | reference → `mediaItem` | no | Picker filtered to YouTube videos only |
| `bandIntro` | object | yes | `kicker?`, `heading` (**required**), `paragraphs` (**1–2, required**), `ctaLabel?` |
| `featuredMedia` | array of references → `mediaItem` | no | Picker filtered to images; max 6; **order here is render order** |
| `testimonials` | array of objects | no | Each needs `quote` + `attribution`; max 3 |
| `bookingCta` | object | yes | `kicker?`, `heading`/`body`/`ctaLabel` (**all required**) |
| `seo` | object | no | `metaTitle?`, `metaDescription?`, `ogImage?` |

Testimonials are **nested objects, not separate documents** — they belong to this one page and nothing else references them. If a future page needs the same quotes, that is the moment to promote them to their own document type.

`seo.ogImage` is used **only** for social/link previews in `<meta>` tags. It never appears in visible page content.

**What is deliberately NOT in the singleton:** section headings for Upcoming Shows / Gallery / Testimonials, the empty-state wording, routes, navigation, layout, animation, and button destinations. Those live in code (`web/src/data/homeData.ts` and `siteConfig.ts`) because they are interface, not content.

### `event`

One document type for both public shows and private bookings — not two. A booking's kind is a fact about its *visibility*, and it can legitimately change; two document types would force delete-and-recreate to reflect that.

Always present:

| Field | Type | Required |
|---|---|---|
| `startDateTime` | datetime | yes |
| `endDateTime` | datetime | no — blank means "end time unknown" |
| `status` | `scheduled` / `cancelled` / `postponed` | yes (defaults `scheduled`) |
| `visibility` | `public` / `busyOnly` / `hidden` | yes (defaults `public`) |

Public-only fields — shown and required **only** when `visibility == "public"`: `title`, `slug`, `venue`, `location`, `description?`, `externalEventUrl?`.

| `visibility` | Studio label | Homepage effect |
|---|---|---|
| `public` | Public show | Eligible for the homepage |
| `busyOnly` | Private booking — show date only | **Never** on the homepage. Reserved for a future Shows page, which will show a generic "Private Event" label supplied by the frontend. |
| `hidden` | Hidden from website | Never queried by anything public |

There is **no event image field**, and no field is *named* for a client name, address, contact, budget, or notes. That is intentional — but note that `title`, `venue`, `location`, and `description` are free text and will store whatever is typed into them. Keeping confidential details out of events is an editorial rule, not something the schema can enforce; see [§7](#7-public-configuration-vs-secrets).

`slug` exists so a future `/shows/[slug]` route can be added without a content migration. **That route does not exist**; nothing links to a slug today.

### `mediaItem`

A reusable media library entry, shared by the homepage today and a future Media page later.

| Field | Required when |
|---|---|
| `title` | always — doubles as the gallery caption (there is no separate caption field) |
| `mediaType` | always — `image` or `video`; drives everything below |
| `image` | `mediaType == "image"` |
| `alt` | `mediaType == "image"` |
| `videoProvider` | `mediaType == "video"` — `youtube` / `vimeo` / `other` |
| `videoUrl` | `mediaType == "video"`, with per-provider hostname validation |
| `videoPoster` | required when `videoProvider == "other"`; optional otherwise |

The `image` and `videoPoster` requirements are *enforced* by rules living on `mediaType` and `videoProvider` respectively, not on those fields themselves — see [§4](#4-validation-and-conditional-behavior) for why.

`videoUrl` is a `url` field, never free text or rich text, so an editor cannot enter iframe markup, embed HTML, or JavaScript.

**Provider thumbnails are not implemented.** Nothing on the current homepage renders one: the hero always uses the local ELT logo as its poster, and the gallery is image-only. `videoPoster` is currently unused by any rendered page.

---

## 4. Validation and conditional behavior

### Conditional requirements

Public-show event fields and media-type-specific fields are enforced with `Rule.custom` keyed off a sibling value, not `Rule.required()`. That means a private booking is never blocked from saving over fields it does not need.

**Important consequence for the frontend:** TypeGen's `--enforce-required-fields` only understands *unconditional* requirements. A conditionally-required field such as a public event's `venue` still generates as nullable. Never assume such a field is present because Studio "should have" required it — that is exactly what [normalization](#9-normalization) is for.

### Public-only fields hide *and* stay visible while populated

`event.ts` uses `hiddenUnlessNeededToClear`: a public-only field is visible when the event is public, **and also stays visible on a non-public event for as long as it still holds a value**, so an editor can see and clear it. Once cleared, it hides.

This exists because `hidden` only controls the editing UI — it never clears a stored value. Without it, an editor who flipped a public show to `busyOnly` would have stale title/slug/venue data stored in a form that no longer displays it.

### Where conditional rules are anchored, and why it matters

**Read this before adding or moving any validation rule.**

In the installed Sanity version, the *level* of a custom validation marker depends on what kind of node the rule is attached to:

| Rule attached to | Emitted level | Blocks publishing? |
|---|---|---|
| A **primitive** field (`string`, `url`, `number`, array) | `error` | **Yes** |
| An **object-typed** field (an `image` field, an `object` field) | `warning` | No |
| The **document root** (`validation` on the type itself) | `warning` | No |

Sanity Studio disables Publish on errors only; warnings are displayed but do not stop anyone. Adding an explicit `.error()` to an object-level rule **does not change its level** — that was tested directly and had no effect.

The practical rule: **anchor every conditional requirement to a primitive field, even when the thing being checked is an object.** Inspect the sibling value through `context.document`.

Three rules in this schema are deliberately placed this way:

| The check | Lives on | Inspects |
|---|---|---|
| Stale public details on a non-public event | `event.visibility` (string) | `title`, `slug`, `venue`, `location`, `description`, `externalEventUrl` |
| An image item must have an uploaded image | `mediaItem.mediaType` (string) | `document.image` |
| "Other" provider must have a poster | `mediaItem.videoProvider` (string) | `document.videoPoster` |

The `image` and `videoPoster` fields themselves carry **no** validation — a rule there would only ever produce a non-blocking warning. There is no document-level `validation` on `event` for the same reason.

This is the whole workaround. **No custom Studio document action is needed**, and none exists.

### The stale-public-details guard

The rule on `event.visibility` fires when a non-public event still carries any populated public-only field, naming exactly which ones:

> To publish this as a private booking, clear the populated public-show fields below: Title, Slug, Venue, and Location.

This is a **blocking error** — the editor cannot publish until those fields are cleared. Verified both against crafted fixtures and against the live `development` dataset.

It pairs with `hiddenUnlessNeededToClear` above: the offending fields stay visible precisely so the editor can clear them without switching visibility back to Public first. Clearing them makes the document publishable immediately.

### Enforced limits

| Rule | Where | Enforced at render time too? |
|---|---|---|
| Band Intro: 1–2 paragraphs | `homepage.bandIntro.paragraphs` | **Yes** — `BandIntro.astro` filters blanks, then caps at 2 |
| Testimonials: max 3 | `homepage.testimonials` | **Yes** — `normalizeTestimonials` slices to 3 |
| Featured media: max 6 | `homepage.featuredMedia` | **Yes** — `normalizeFeaturedMedia` stops after 6 valid items |
| End after start | `event.endDateTime` | n/a |
| Unique slug | `event.slug` | async check against other events |

Studio validation binds the Studio UI. It does **not** bind raw Content API writes — a script or an integration can store over-limit data. Every display limit is therefore also enforced where it renders.

Two details in how the render-time caps count:

- **Invalid entries never consume a slot.** Filtering happens before the cap, so six good gallery images still render even if unusable references precede them, and two real paragraphs still render even if blank entries come first.
- **Selection order is preserved.** The stored array order is the render order; capping takes the first N valid items, it never reorders.

### Reference pickers are filtered at search time

- `heroVideo` → `mediaType == "video" && videoProvider == "youtube"`
- `featuredMedia` → `mediaType == "image"`

These are *search* constraints: non-matching items never appear as selectable candidates in the first place, so the client cannot pick something the player or gallery cannot handle. The same media items remain fully selectable elsewhere.

### Studio structure

```
Homepage                      ← fixed single document, no "+ create"
Events
  ├─ Next 7 Days              ← rolling window, see §13
  ├─ Upcoming Public Shows
  ├─ Upcoming Private Bookings
  ├─ Past Events
  └─ All Events
Media Library
```

Singleton enforcement is belt-and-suspenders: the fixed Structure entry always opens `_id: "homepage"`; `homepage` is filtered out of `schema.templates`; and `document.newDocumentOptions` strips it from the global "+" menu. A direct Content API call could still create a second `homepage` document under a different `_id` — nothing prevents that at the API level, and it is accepted because the client only ever uses the Studio UI. (Such a document would be ignored by the site, which queries `_id == "homepage"` specifically.)

Two initial-value templates replace the generic "New event": **New Public Show** (`visibility: public`) and **New Private Booking** (`visibility: busyOnly`, date only).

---

## 5. Content → code mapping

| Sanity content | GROQ query | Fetch location | Astro consumer |
|---|---|---|---|
| `homepage.hero` | `HOMEPAGE_QUERY` | `web/src/pages/index.astro` | `components/Hero.astro` |
| `homepage.heroVideo` → `mediaItem.videoUrl` | `HOMEPAGE_QUERY` (`heroVideo->`) | `web/src/pages/index.astro` | `components/Hero.astro` (`videoUrl` prop) |
| `homepage.bandIntro` | `HOMEPAGE_QUERY` | `web/src/pages/index.astro` | `components/BandIntro.astro` |
| `homepage.featuredMedia[]` → `mediaItem.image`/`alt`/`title` | `HOMEPAGE_QUERY` (`@->`) | `web/src/pages/index.astro` | `components/GalleryPreview.astro` |
| `homepage.testimonials[]` | `HOMEPAGE_QUERY` | `web/src/pages/index.astro` | `components/Testimonials.astro` |
| `homepage.bookingCta` | `HOMEPAGE_QUERY` | `web/src/pages/index.astro` | `components/BookingCTA.astro` |
| `homepage.seo` (`metaTitle`, `metaDescription`, `ogImage`) | `HOMEPAGE_QUERY` | `web/src/pages/index.astro` | `layouts/BaseLayout.astro` (`<head>` only) |
| `event` (public, scheduled, upcoming — next 3) | `UPCOMING_PUBLIC_EVENTS_QUERY` | `web/src/pages/index.astro` | `components/UpcomingShows.astro` |

Section headings, the "View All Shows" label, and the empty-state copy are **not** in the table because they are not Sanity content — they come from `web/src/data/homeData.ts`.

### The two queries

Both live in `web/src/sanity/queries.ts` and nowhere else. Both use `defineQuery` imported from `groq` — TypeGen's static analyzer specifically looks for that call, so an anonymous inline template literal would not produce a named result type.

**`HOMEPAGE_QUERY`** fetches the singleton by fixed id. Two projections deserve explanation:

```groq
heroVideo->{ videoUrl, videoProvider }
```
A single direct reference — `->` dereferences it.

```groq
featuredMedia[]{
  _key,
  "mediaItem": @->{ _id, title, alt, image{ ..., asset->{ _id, metadata{ dimensions } } } }
}
```
`featuredMedia` is an array of **direct** references — each array element *is* the reference, not a wrapper object with a nested field. So the dereference is `@->` ("this array element"), and `"mediaItem":` is a projection **alias** naming the result, not a real field. `image{...}` picks up `crop` and `hotspot` automatically; `metadata{dimensions}` supplies width/height so the browser can reserve layout space.

**`UPCOMING_PUBLIC_EVENTS_QUERY`** is entirely independent of the singleton:

```groq
*[_type == "event"
  && visibility == "public"
  && status == "scheduled"
  && coalesce(endDateTime, startDateTime) >= now()
] | order(startDateTime asc) [0...3] { … }
```

"Next three" means **chronologically nearest**, from `order(startDateTime asc)` — never the three most recently created. Busy-only and hidden events are excluded *structurally by the query*, not filtered out afterwards in the frontend. `coalesce(endDateTime, startDateTime)` means an event that has started but not ended still counts as upcoming.

Note the query does **not** select `description`, so an event description can never reach the homepage even for a public show.

---

## 6. Datasets and how to switch

One Sanity project (`4bysltwo`), two datasets:

| Dataset | Purpose |
|---|---|
| `development` | Test/placeholder content. Everything is labeled `[TEST]`. |
| `production` | Approved client content only. |

**Current state (as of 2026-08-10):** `production` contains 0 documents. That is a deployment-phase fact, not a property of the system — it will be populated by hand when content migration happens ([§15](#15-deferred-work)). Do not write code that assumes it is empty.

Both allow anonymous reads. No API token is configured or used by this repository.

Dataset selection is entirely environment-driven — nothing is hardcoded:

| Consumer | Variable | Read by |
|---|---|---|
| Studio | `SANITY_STUDIO_DATASET` | `studio/.env` → `sanity.config.ts` / `sanity.cli.ts` |
| Astro | `PUBLIC_SANITY_DATASET` | `web/.env` → `astro.config.mjs` (via `loadEnv`) and `index.astro` |

**To switch datasets locally,** edit the value in `web/.env` and/or `studio/.env` and restart the dev server or rebuild. Both `.env` files are gitignored; `.env.example` files are committed and document `development` as the intended default.

`production` builds will eventually get their env vars from the host's settings UI, never from a committed file.

⚠️ Keep `web/.env` and `studio/.env` pointed at the **same** dataset while developing, or Studio will be editing content the site is not reading.

---

## 7. Public configuration vs. secrets

| Thing | Category |
|---|---|
| Project ID (`4bysltwo`) | **Public configuration.** Visible in every image URL and API request. |
| Dataset name | **Public configuration** — regardless of whether the dataset is public or private. The name is not what controls access. |
| API version | Public configuration |
| API tokens, including read-only ones | **Secret.** Server/build-side only, never `PUBLIC_`-prefixed, never committed, never in browser code. |

No API token is configured or used by this repository, because both datasets permit anonymous reads. One would become necessary only if a dataset were made private.

### The part that actually matters

**Event visibility, GROQ filters, and hidden Studio fields are editorial and presentational controls. They are not access control.**

Because the dataset permits anonymous reads, anyone who queries the API directly can read every published field of every document, regardless of what any page's query selects or what any field's `hidden` rule conceals. `visibility: "hidden"` means *hidden from the website*; it does **not** mean confidential.

The only real guarantee is not storing the sensitive value at all. **This is an editorial discipline, not something the schema can enforce.** The `event` type has no field *named* for client identity, contact details, budget, or notes — but `title`, `venue`, `location`, and `description` are free text and will hold whatever an editor types into them. Nothing stops someone putting a client's name in `title` or a home address in `location`.

So the operating rules are:

1. **Private bookings must not contain confidential information** — not in any field, however innocuously named. A `busyOnly` event should carry a date and nothing else. Real client details stay in the client's own email and calendar.
2. **The corrected `visibility` validation now enforces the mechanical half of this.** Switching an event to `busyOnly` or `hidden` while any public field is still populated is a **blocking** error — the editor cannot publish until `title`, `slug`, `venue`, `location`, `description`, and `externalEventUrl` are cleared. That prevents a former public show from silently retaining its details after being made private. It cannot, of course, stop someone from typing something confidential into a *public* show's fields.
3. **Do not add a field intended to hold confidential data.** Adding one would make the rule above meaningless and put genuinely sensitive data in an anonymously-readable dataset.

If genuine confidentiality is ever needed in Sanity, that requires a private dataset with authenticated server-side reads — a separate decision, not a schema tweak.

---

## 8. Build-time fetching

Everything happens in the frontmatter of `web/src/pages/index.astro`. That is the **only** file in the project that imports the Sanity client or either query.

```ts
const [homepage, upcomingEvents] = await Promise.all([
  sanityClient.fetch(HOMEPAGE_QUERY),
  sanityClient.fetch(UPCOMING_PUBLIC_EVENTS_QUERY),
]);
```

Two independent queries, fetched in parallel. **Neither is wrapped in try/catch, deliberately.** A genuine failure — network, auth, malformed GROQ, bad config — throws and fails the build in every environment. Silent fallback would ship a page that looks fine while quietly being wrong.

### Valid empty states vs. build failures

**Render or omit intentionally:** no upcoming events · no hero video · no featured media · no testimonials · missing optional copy.

**Fail the build:** missing/invalid project id or dataset · missing token when one is required · auth failure · network failure · malformed GROQ · and, in `production` only, a missing homepage singleton.

That last one is keyed on the configured **dataset value**, not Astro's build mode — a production-mode Astro build may legitimately point at `development`:

```ts
const isProductionDataset = import.meta.env.PUBLIC_SANITY_DATASET === "production";
if (homepage === null && isProductionDataset) throw new Error(…);
```

In `development`, a missing singleton is tolerated and the fallback constants render instead — an unseeded dev dataset is an expected state, not an error.

### Fallbacks: the precise rule

`web/src/data/homeData.ts` holds two different things:

1. **Permanent section copy** (`upcomingShowsCopy`, `galleryCopy`, `testimonialsCopy`) — never in Sanity, always used.
2. **`*Fallback` constants** — used **only when the entire homepage singleton document is absent.**

> If the singleton exists but a section within it is incomplete, that section is **omitted**, never patched with placeholder text. Real content and placeholder copy are never mixed in the same render.

**There is no event fallback of any kind, in any environment.** A placeholder show rendered as if real would imply a performance that isn't happening. Zero upcoming events renders the intentional empty state.

---

## 9. Normalization

`web/src/sanity/normalize.ts` sits between raw query results and component props. It exists for two reasons, and the second is the important one.

1. **Shape mapping** — turn a Sanity image object into the plain `{src, width, height, objectPosition, alt, caption}` shape a component renders with a normal `<img>`.
2. **Defensive validation** — because generated-type optionality does not tell you what is actually present. Conditionally-required fields generate as nullable ([§4](#4-validation-and-conditional-behavior)), and raw API writes can bypass Studio validation entirely. Nullable here reflects a *real possibility*, not TypeScript being cautious.

| Export | What it guarantees |
|---|---|
| `normalizeFeaturedMedia` | Drops any entry that did not resolve, has no asset id, or has no alt text — so no broken `<img>` and no image without accessible alt text. Caps at 6 **valid** items, preserving order. Computes `objectPosition` from the hotspot. |
| `normalizeTestimonials` | Drops incomplete items; caps at 3. |
| `normalizeUpcomingEvents` | Skips any event missing `title`, `venue`, `location`, or `startDateTime`. |
| `isHeroContentComplete` | Requires `headline` only. |
| `isBandIntroComplete` | Requires `heading` + at least one non-blank paragraph. |
| `isBookingCtaComplete` | Requires `heading` + `body` + `ctaLabel`. |
| `getHeroVideoUrl` | Returns the URL or `null`. |
| `getOgImageUrl` | Returns `null` unless an asset is genuinely attached — `seo.ogImage` can exist as an empty object with no upload, which would otherwise build a broken CDN URL. |

**Components never see Sanity data structures.** Every `.astro` component under `components/` takes plain props and has no idea Sanity exists. Query logic never lives inside a visual component. Preserve that boundary.

---

## 10. Images, crop and hotspot

`web/src/sanity/image.ts` wraps `@sanity/image-url`.

Sanity CDN images render as ordinary `<img>` tags, **not** through `astro:assets`' `<Image>`. `astro:assets` optimizes local files at build time; Sanity's CDN already does equivalent resizing and format negotiation for remote URLs, so routing them through Astro too would be a redundant second pass. Local assets (the ELT logo, the family photo, the fallback gallery images) still use `astro:assets` normally.

### Width-only vs. width+height — this distinction matters

```ts
sanityImageUrl(image, { width })            // no forced aspect ratio
sanityImageUrl(image, { width, height })    // forces a crop to that exact shape
```

**The gallery requests width only.** Sanity applies the editor's manual crop (trimming) but does not force an aspect ratio. The focal point is then handed to CSS as a per-image `--focal-point` custom property, and `object-fit: cover` performs exactly **one** crop, in the browser, correctly centered for whatever shape that tile happens to be.

Why not just pre-crop at the CDN? Because the same image renders into several different shapes: the large first tile, the tall fourth tile, ordinary tiles — and those shapes change again at the mobile breakpoint. Pre-cropping to one fixed shape and then letting `object-fit: cover` re-crop *that* applies a second, generic, center-based crop on top of Sanity's hotspot-aware one. That is precisely how a correctly hotspot-cropped image ends up with the subject sliced off in a differently-shaped tile.

`computeObjectPosition` re-bases the stored hotspot against the **manually-cropped region**, not the original frame — the served image only contains the cropped region, so a hotspot expressed relative to the full original would land in the wrong place.

**The social-share image is the one place that uses width+height** (1200×630), because a share image only ever needs one fixed shape.

---

## 11. TypeGen

The workflow is owned by `studio/`, because Studio owns the schema. Configuration lives under the `typegen` key in `studio/sanity.cli.ts` — **not** a standalone `sanity-typegen.json`, which the installed CLI treats as deprecated.

```ts
typegen: {
  path: '../web/src/sanity/queries.ts',
  schema: 'schema.json',
  generates: '../web/src/sanity/sanity.types.ts',
}
```

Run from the `studio/` directory:

```bash
cd studio
npm run extract   # sanity schemas extract --enforce-required-fields --force
npm run typegen   # sanity typegen generate
npm run types     # both, in order — use this one
```

`npm run extract` already includes `--force`, so it overwrites the committed `schema.json` in place. Nothing extra needs to be passed, and there is no need to fall back to running the underlying CLI commands by hand.

`schemas` is plural. Both generated files are committed, and neither is ever hand-edited.

### When to rerun

Rerun `npm run types` after **any** of:

- adding, removing, or renaming a schema field
- changing a field's type or its required/optional status
- changing a GROQ query's projection, filter, or shape

**Nothing reminds you to do this.** `astro check` can surface a type error when a stale generated type is genuinely incompatible with how a result is *used*, but it does not compare the generated files against the current schema and flag staleness on its own. Regenerating is a manual discipline.

To confirm the committed files are current: run `npm run types` and then `git status`. **A clean working tree means they were already up to date.**

### `--enforce-required-fields`, precisely

It makes fields with **unconditional** required validation non-optional in the generated types. It does **not** evaluate `Rule.custom` logic — conditionally-required fields still generate as optional. It tightens the unconditional portion of the type surface and nothing more. It does not remove the need for runtime checks ([§9](#9-normalization)).

---

## 12. Build and rebuild behavior

```bash
cd web
npm run dev      # local dev server
npx astro check  # typecheck — must report 0 errors
npm run build    # production build → web/dist/
npm run preview  # serve the built output
```

The build reads Sanity once and writes static HTML. **The output is a snapshot.** It does not re-check the clock and it does not poll for content.

That has a specific consequence for events: an event crosses the "upcoming → past" threshold purely by time passing, with **zero documents edited**. The built HTML keeps showing it until something rebuilds. This is why a scheduled daily rebuild is required in addition to any publish-triggered rebuild — see [§13](#13-pacific-time) and [§15](#15-deferred-work).

A failed build simply never goes live; the previously deployed site keeps serving unchanged. That is what makes "fail loudly" safe rather than risky — a bad Sanity state blocks new content from shipping, it never takes the site down.

---

## 13. Pacific time

`America/Los_Angeles` is the explicit scheduling and display timezone for every ELT event. Both sides are handled, and both are needed independently.

**Input.** `startDateTime` and `endDateTime` are configured with:

```ts
options: { displayTimeZone: 'America/Los_Angeles', allowTimeZoneSwitch: false }
```

The client sees and edits every event time in Pacific, whatever their own device timezone is, and cannot accidentally switch the input to another zone.

**Output.** Every `Intl.DateTimeFormat` call in `web/src/lib/dateFormat.ts` passes `timeZone: "America/Los_Angeles"` explicitly. Nothing relies on the default timezone of your machine, the build environment, Node, or the visitor's browser — all of which can differ from Pacific and from each other. **If you add a new date format anywhere, it must pass `timeZone` explicitly.**

Stored values remain ordinary ISO instants; none of this changes storage.

### Formats

| Case | Output |
|---|---|
| Same Pacific day | `Saturday, Aug 22, 2026 · 7:00–10:00 PM` |
| Different Pacific days | `Saturday, Aug 22, 2026 · 7:00 PM – Sunday, Aug 23, 2026 · 1:00 AM` |
| No end time | `Saturday, Aug 22, 2026 · 7:00 PM` |

"Same day" is decided by comparing the **Pacific calendar date** of the two instants, not their UTC dates — a Pacific evening show can cross UTC midnight while still being the same local day.

### Two things that are deliberately timezone-agnostic

`coalesce(endDateTime, startDateTime) >= now()` and `order(startDateTime asc)` compare true UTC instants. They do not need to know about Pacific time to be correct, and they should not be "fixed" to use it.

### Why the Studio view is "Next 7 Days" and not "This Week"

Computing a reliable Monday–Sunday boundary in a named IANA timezone needs DST-aware date math — `America/Los_Angeles` shifts between PST and PDT, so no fixed offset works. For an admin convenience view, that is easy to get subtly wrong for no real benefit. The view is a rolling `now()` → `now() + 7 days` window, which needs no timezone conversion at all and has no DST edge cases. It is labeled accurately.

### Rebuild timing

When the scheduled rebuild is eventually configured, **choose its time with Pacific in mind** — land it safely after midnight Pacific. "Upcoming vs. past" is evaluated against true instants but *experienced* by Pacific visitors against the Pacific calendar day; a naive round-UTC-hour schedule would make events visibly roll from upcoming to past at an odd hour of the Pacific evening.

---

## 14. Changing fields safely

### Adding an optional field

1. Add it in the relevant `studio/schemaTypes/*.ts`.
2. Add it to the projection in `web/src/sanity/queries.ts` if the page needs it.
3. `cd studio && npm run types`.
4. Consume it — via `normalize.ts` if it needs any defensive checking, then pass it as a plain prop.
5. `cd web && npx astro check && npm run build`.
6. Commit the regenerated `studio/schema.json` and `web/src/sanity/sanity.types.ts` with your change.

### Making a field required

Existing published documents do not retroactively satisfy a new requirement. They keep their current values and only fail validation the next time someone edits and republishes them. Check existing content first:

```bash
cd studio
npx sanity documents validate --dataset development
```

### Removing or renaming a field

Sanity does not delete stored data when you remove a field from the schema — the value stays on the document, just invisible in Studio. Renaming is a remove-plus-add and **does not migrate content**. Remove it from the query projection too, or TypeGen will generate a type for something the schema no longer defines.

### Testing schema rules without touching a dataset

This is the safest tool in the box, and it is underused:

```bash
cd studio
npx sanity documents validate --file /path/to/cases.ndjson --level info --format ndjson -y
```

It validates documents from a file against the compiled Studio schema and **writes nothing**. Craft deliberately-invalid documents to confirm a rule fires before you rely on it.

### Rules to keep

- Do not fetch Sanity anywhere except `index.astro`'s frontmatter.
- Do not put GROQ inside a visual component.
- Do not hand-edit the generated files.
- Do not attach a conditional requirement to an object-typed field or the document root — it will only warn. Anchor it to a primitive sibling ([§4](#4-validation-and-conditional-behavior)), and verify the level with `documents validate`.
- Do not add a field to `event` intended to hold confidential information ([§7](#7-public-configuration-vs-secrets)).
- Do not add a display limit to the schema without also enforcing it where it renders ([§4](#4-validation-and-conditional-behavior)).
- Do not use Sanity file assets for production video hosting ([§18](#18-client-facing-rationale)).

---

## 15. Deferred work

None of the following exists. Finishing the homepage integration did not imply any of it.

**Deployment** — the whole of it. No hosting site, no domain configuration, no build hook, no Sanity publication webhook, no scheduled daily rebuild, no analytics. The intended shape when it happens:

```
Base directory:    web
Build command:     npm run build
Publish directory: dist
```

with production Sanity env vars set in the host's settings UI (never a committed file), a publish-filtered Sanity webhook covering `homepage`/`event`/`mediaItem`, and a **separate** scheduled daily rebuild — required because an event changes category with no document edited ([§12](#12-build-and-rebuild-behavior)), timed with Pacific in mind ([§13](#13-pacific-time)).

**Studio deployment guard.** No `sanity deploy` has ever run. When one is planned, a `predeploy` dataset check should be specified — with the honest caveat that an npm lifecycle script cannot intercept the CLI binary invoked another way. It reduces accidental risk; it does not prevent deliberate bypass.

**Content migration.** `production` is empty. Approved content is entered there by hand, never bulk-copied from `development`, so placeholder data cannot cross over by accident.

**Other routes.** `/about`, `/shows`, `/media-merch`, `/contact-booking`, and event detail pages. Navigation already points at these routes; they 404 today by design — the intended destination is preserved rather than being redirected to a homepage anchor.

**`siteSettings` singleton.** May eventually replace the global public values in `web/src/data/siteConfig.ts` — band name, logo, booking email, social URLs, default SEO. Worth doing once there is a real second consumer. Secrets, route paths, navigation behavior, and layout controls stay in code regardless.

**Mux video hosting.** Recorded as an option, not built. Revisit after confirming upload frequency, whether Studio should be the only media workflow, budget, and whether YouTube/Vimeo discoverability still matters.

**`availabilityBlock`.** Not modeled. Vacations, rehearsals, and tentative holds stay in the client's private scheduling workflow. Sanity models *confirmed engagements only*. Confirmed events and general unavailability must not be merged into one document type — they answer different questions ("what's happening" vs. "is this date taken"). Booking-page copy to carry forward: *dates without a listed event are not guaranteed available; submit an inquiry and ELT will confirm.*

**Shows page.** Will list public performances and sanitized busy-only bookings chronologically together, with busy-only rendering a generic "Private Event" card (date/time only, no detail route) and hidden events never appearing. It needs its own sanitized GROQ projection — and note that such a projection is a courtesy to the query author, not a security boundary ([§7](#7-public-configuration-vs-secrets)).

**Booking form delivery.** The CTA links to a route that does not exist. Nothing wires a form to Sanity or to email.

---

## 16. Troubleshooting

**Build fails: "The Sanity `homepage` singleton is missing from the production dataset."**
Working as intended. `PUBLIC_SANITY_DATASET=production` but no `homepage` document exists there. Either publish it, or point `web/.env` at `development`.

**Content edited in Studio but the site is unchanged.**
Expected — static build. Rebuild. If it persists: confirm `web/.env` and `studio/.env` name the same dataset, and that the document was **published**, not left as a draft. Queries never see drafts.

**A gallery image silently disappeared.**
`normalizeFeaturedMedia` drops entries with no resolved media item, no asset id, or **no alt text**. A missing `alt` is the usual cause. Check the `mediaItem`.

**An event does not appear on the homepage.**
Work down the query: is `visibility` exactly `public`? Is `status` exactly `scheduled`? Is `coalesce(endDateTime, startDateTime)` still in the future? Is it among the **three nearest** — a fourth upcoming show will not render. Is it published? And `normalizeUpcomingEvents` skips events missing `title`, `venue`, or `location`.

**Times display in the wrong zone.**
Some format call is missing `timeZone: "America/Los_Angeles"`. All of them must pass it explicitly ([§13](#13-pacific-time)).

**`astro check` errors about a Sanity type.**
Almost always stale generated types. `cd studio && npm run types`, then re-check.

**TypeGen reports 0 queries.**
A query is not using `defineQuery` imported from `groq`, or it lives outside `web/src/sanity/queries.ts` (the only path TypeGen scans).

**A gallery image's subject is cropped badly.**
Set the hotspot on the `mediaItem`. If it is already set, check that `sanityImageUrl` is being called **width-only** for gallery images — passing a height forces a CDN crop and re-introduces the double-crop problem ([§10](#10-images-crop-and-hotspot)).

**"Document references non-existent document" on a write.**
Sanity enforces referential integrity: a strong reference cannot point at a missing document. Use a weak reference if a dangling pointer is genuinely intended.

**Empty page sections in `development`.**
Expected when the singleton exists but a section is incomplete — that section is omitted rather than filled with placeholder text ([§8](#8-build-time-fetching)).

---

## 17. Known issues

**None outstanding.** Two issues found during the Phase 3D review have been fixed; both are recorded below because the reasoning affects how you should write future code.

### Resolved — object-level validation does not block publishing

Custom validation attached to an object-typed node or the document root is emitted at `warning` level by the installed Sanity version, and Studio only blocks on `error`. Three rules were affected and all three have been re-anchored to primitive sibling fields, where they now emit `error` and genuinely block publishing.

**This constraint still applies to any rule you add in future** — see [§4](#4-validation-and-conditional-behavior) for the placement rule and the verification command. No custom Studio document action is required.

### Resolved — gallery caption contrast

Cream caption text over the tile gradient alone fell well below WCAG AA wherever an image cropped to a bright region: worst measured ratios were ~1.2:1 on small mobile tiles and ~4.1:1 even on desktop, because the gradient ramps from transparent at 55% and its effect depends entirely on the photograph underneath.

`.g-cap` now carries its own restrained scrim (`rgba(11, 11, 18, 0.72)`, 5px/10px padding, 8px radius) directly behind the text, so contrast no longer depends on the image at all. The tile gradient, hover reveal, always-visible touch captions, overlay stacking, hotspot framing, image order, and no-touch-zoom behavior are all unchanged.

Measured after the fix, across all six tiles at mobile (390px), tablet (768px) and desktop (1440px) — sampling the actual rendered pixels behind the glyphs:

**Worst ratio across all 18 tile/viewport combinations: 7.74:1** (medians 13–16). AA for normal text is 4.5:1.

---

## 18. Client-facing rationale

Plain-language explanations for the decisions most likely to need justifying.

**Why videos live on YouTube rather than being uploaded to the website.**
> Videos stay on dedicated video platforms so the website remains fast and reliable without becoming responsible for processing and delivering very large files. It also reuses the band's existing channels. A Studio upload workflow can be added later if upload volume makes that convenience worth the extra service and cost.

**Why the hero video only starts when you click it.**
> Nothing loads from YouTube until a visitor deliberately activates the video. The page stays fast, nothing autoplays, and no third-party video tracking happens for visitors who never press play. The embed also uses YouTube's privacy-enhanced domain.

**Why the site has to rebuild to show new content.**
> The website is published as plain, pre-built pages — the fastest and most reliable thing to serve, with nothing that can go down between the visitor and the page. The trade-off is that new content appears at the next rebuild rather than instantly. Publishing can trigger a rebuild automatically once hosting is set up.

**Why private bookings never show details.**
> A private booking is entered as a date and nothing else, and the website never displays anything more than that for one. Sanity has no field asking for a client's name, address, or contact information, and the band's practice is to keep that information in email and calendar rather than in the website's content system. If a date that was once a public show is switched to private, the system refuses to publish it until the public details have been cleared, so nothing is left behind by accident.

**Why the client enters events by hand.**
> Every event that appears publicly passes through a person. The website never publishes a show on its own, so nothing goes live that the band did not deliberately confirm.

**Why "no upcoming shows" is a real message rather than a hidden section.**
> An empty calendar is honest and looks intentional. The site never invents a placeholder show, and it never implies that an unlisted date is available — availability is always confirmed by the band directly.

**Why some homepage text cannot be edited in Sanity.**
> Section headings and button labels are part of the page's design and structure rather than its content. Keeping them in code keeps the layout predictable and stops an accidental edit from breaking the design. Everything genuinely content-like — the hero, the introduction, testimonials, gallery selection, booking copy, SEO — is editable.
