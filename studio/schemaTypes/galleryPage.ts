import {PlayIcon} from '@sanity/icons/Play'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The Gallery & Merchandise page singleton, with the fixed `_id: "galleryPage"`.
 *
 * Renamed from `mediaPage` (visitor-facing "Media & Merch" → "Gallery &
 * Merchandise", route `/media-merch` → `/gallery-merch`). `mediaPage` itself
 * is retained, deprecated and read-only, as a legacy copy of the prior
 * content — see that schema file's own doc comment — this is the active
 * singleton going forward. The one content difference from `mediaPage`
 * (beyond the rename): **no featured-video field**. Featured, click-to-load
 * video locations are now only the Homepage hero and the Music page — see
 * `docs/gallery-merch.md` and `docs/music.md`.
 *
 * Same singleton conventions as every other page singleton: one fixed
 * Structure entry, stripped from `schema.templates` and the global "+" menu
 * (via `SINGLETON_TYPES` in `sanity.config.ts`), queried by that exact
 * `_id`. See docs/developer-guide.md §5.
 *
 * No formation-date-style invented content lives in the initial values below:
 * neutral section headings only. No products, prices, or credits are seeded
 * — inventing any of those would be worse than leaving it blank.
 */
export const galleryPage = defineType({
  name: 'galleryPage',
  title: 'Gallery & Merchandise Page',
  type: 'document',
  icon: PlayIcon,
  initialValue: {
    gallery: {
      kicker: 'Good Times & Great People',
      heading: 'Media Gallery',
    },
    eventMediaSubmission: {
      kicker: 'Share Your Story',
      heading: 'Share Your Event Media',
      explanation:
        'Share photos or videos from an ELT event through our Google Form. Only submit material you have the right and permission to share. Submissions may be reviewed for ELT’s website, social media, and ordinary band promotion, but submission does not guarantee publication or credit. If credit is required or requested, include the preferred wording in the form.',
      ctaLabel: 'Submit Photos & Videos',
    },
    merch: {
      kicker: 'Take It Home',
      heading: 'Merchandise',
    },
    bookingCta: {
      kicker: "Let's Ride Together",
      heading: 'Questions About Photos, Video, or Merch?',
      body: "Send us a message and we'll get back to you.",
      ctaLabel: 'Email the Band About Merch',
    },
    seo: {
      metaTitle: 'Gallery & Merchandise',
    },
  },
  fields: [
    defineField({
      name: 'gallery',
      title: 'Media gallery',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          description:
            'Always rendered, even with zero photos/videos selected — this is the page’s only heading (its `<h1>`). Required for the page to build.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'body',
          title: 'Introductory text',
          description: 'Optional short paragraph above the gallery.',
          type: 'text',
        }),
        defineField({
          name: 'items',
          title: 'Gallery photos — drag to order',
          description:
            'Image media items only. This is the photo order: both the "All" filter order (photos first, then Gallery videos below) and the relative order within each category filter. Choose up to 24.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'reference',
              to: [{type: 'mediaItem'}],
              options: {
                filter: 'mediaType == "image"',
              },
            }),
          ],
          validation: (Rule) => Rule.max(24),
        }),
        defineField({
          name: 'videos',
          title: 'Gallery videos — drag to order',
          description:
            'YouTube videos displayed in the Media Gallery, in this order — drag to reorder. Dragging changes their display order; it does not affect the photo order above. These do not use the image categories (Performances / Venue & Crowd) — every gallery video automatically appears under "All" and under a code-owned "Videos" filter on the public site, and never under a photo category. Each entry must be a video media item with a normal YouTube URL (e.g. a watch or share link) or a supported youtube-nocookie.com/embed/ link configured on it — raw video files are never uploaded to Sanity here. Choose up to 12, each only once.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'reference',
              to: [{type: 'mediaItem'}],
              options: {
                filter: 'mediaType == "video" && videoProvider == "youtube"',
              },
            }),
          ],
          validation: (Rule) =>
            Rule.max(12).custom((value) => {
              if (!value || value.length === 0) return true
              const refs = value
                .map((entry) => (entry as {_ref?: string})._ref)
                .filter((ref): ref is string => Boolean(ref))
              const uniqueRefs = new Set(refs)
              return (
                uniqueRefs.size === refs.length ||
                'Each video may only appear once in Gallery videos — remove the duplicate.'
              )
            }),
        }),
      ],
    }),
    defineField({
      name: 'eventMediaSubmission',
      title: 'Share Your Event Media',
      description:
        'Rendered between Media Gallery and Merchandise. Links out to a Google Form for the visitor to upload their own event photos/video — this site never handles the upload itself. This is an approved, planned production feature; it stays hidden (if "Enabled" is off) or shows a clear configuration notice (if enabled but no Google Form URL is set yet) until a real Google Form actually exists — see web/src/sanity/normalize.ts and docs/gallery-merch.md.',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enabled',
          description: 'Turn this section on once the Google Form is ready to link to.',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
        }),
        defineField({
          name: 'explanation',
          title: 'Explanation',
          description: 'Short paragraph explaining what this is and how submissions may be used.',
          type: 'text',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          type: 'string',
        }),
        defineField({
          name: 'formUrl',
          title: 'Google Form URL',
          description:
            'Optional. This is validated for URL *structure and host* only — a real docs.google.com/forms/d/e/<id>/viewform link (a prefilled-link variant with query parameters is also accepted) or a real forms.gle/<code> short link. Nothing else passes: not the bare root of either host, not an arbitrary /forms/... path, not a /edit link, not a /formResponse submission endpoint, not an empty id, and not a lookalike or unrelated domain. This check cannot and does not confirm the form actually exists, is published, has the right sharing/access permissions, or carries the approved consent language — that still has to be verified by hand before this field is filled in. Leave empty until the form actually exists.',
          type: 'url',
          validation: (Rule) =>
            Rule.custom((value) => {
              if (!value) return true
              let parsed: URL
              try {
                parsed = new URL(value)
              } catch {
                return 'Must be a valid URL'
              }
              if (parsed.protocol !== 'https:') return 'Must be an https:// link'
              if (parsed.username || parsed.password) {
                return 'Must not contain a username or password in the URL'
              }
              const hostname = parsed.hostname.replace(/^www\./, '')
              // Each host accepts exactly one specific URL *shape*, not merely
              // "any non-empty path under it" — that looser check previously let
              // through malformed paths like docs.google.com/forms/not-a-form.
              if (hostname === 'forms.gle') {
                return (
                  /^\/[^/]+$/.test(parsed.pathname) ||
                  'Must be a real forms.gle short link with its own code, e.g. forms.gle/AbCdEfGh — not the bare forms.gle root or a multi-segment path'
                )
              }
              if (hostname === 'docs.google.com') {
                return (
                  /^\/forms\/d\/e\/[^/]+\/viewform$/.test(parsed.pathname) ||
                  'Must be a real docs.google.com/forms/d/e/<id>/viewform link (query parameters for a prefilled form are fine) — not the bare /forms/ root, an arbitrary /forms/... path, a /edit link, or a /formResponse endpoint'
                )
              }
              return 'Must be a real docs.google.com/forms/... link or a forms.gle/... short link'
            }),
        }),
      ],
    }),
    defineField({
      name: 'merch',
      title: 'Merchandise',
      description:
        'Editorial and inquiry-only. Omitted from the page entirely when no items are selected.',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'body',
          title: 'Introductory text',
          description:
            'Optional short paragraph above the merchandise grid. Leave empty unless you have something additional to say — the permanent no-commerce notice ("Items are available by inquiry only — there is no online store, cart, or checkout…") is already rendered automatically by the site for every merchandise item; do not repeat or restate it here, or it will appear twice on the page.',
          type: 'text',
        }),
        defineField({
          name: 'items',
          title: 'Selected merchandise',
          description: 'Merch items, in display order. Choose up to 24.',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'merchItem'}]})],
          validation: (Rule) => Rule.max(24),
        }),
      ],
    }),
    defineField({
      name: 'bookingCta',
      title: 'Inquiry call to action',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'text',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta title',
          description:
            'Enter only the page-specific title, such as “Gallery & Merchandise”. The website automatically appends the current formal band name.',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta description',
          type: 'text',
          validation: (Rule) => Rule.max(180).warning('Keep this concise for search results.'),
        }),
        defineField({
          name: 'ogImage',
          title: 'Social share image',
          description:
            'Optional image used when this page is shared. Independent of every other page’s share image.',
          type: 'image',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Gallery & Merchandise Page'}
    },
  },
})
