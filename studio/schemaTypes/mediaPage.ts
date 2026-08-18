import {PlayIcon} from '@sanity/icons/Play'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The Media & Merch page singleton, with the fixed `_id: "mediaPage"`.
 *
 * Same singleton conventions as `homepage`, `aboutPage`, and `showsPage`: one
 * fixed Structure entry, stripped from `schema.templates` and the global "+"
 * menu (via `SINGLETON_TYPES` in `sanity.config.ts`), queried by that exact
 * `_id`. See docs/developer-guide.md §5.
 *
 * `gallery.items` (photos), `gallery.videos` (YouTube videos), and
 * `merch.items` are all ORDERED arrays of direct references — the stored
 * order is the render order, exactly like `homepage.featuredMedia` and
 * `aboutPage.members`. `gallery.items` and `gallery.videos` are two
 * independently ordered lists: the public page renders photos (in
 * `items` order) followed by videos (in `videos` order) for "All", and
 * each has its own filter. See `web/src/sanity/normalize.ts` for the
 * exact interleaving rule.
 *
 * No formation-date-style invented content lives in the initial values below:
 * neutral section headings only. No products, prices, credits, or featured
 * video are seeded — inventing one would be worse than leaving it blank.
 */
export const mediaPage = defineType({
  name: 'mediaPage',
  title: 'Media & Merch Page',
  type: 'document',
  icon: PlayIcon,
  initialValue: {
    intro: {
      kicker: 'Media & Merch',
      heading: 'Photos, Video & Merch',
      lede: 'A look at Electric Lavender Train live, plus band merchandise available by inquiry.',
    },
    gallery: {
      kicker: 'Good Times & Great People',
      heading: 'Media Gallery',
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
      metaTitle: 'Media & Merch',
    },
  },
  fields: [
    defineField({
      name: 'intro',
      title: 'Page introduction',
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
          description: 'The page’s main heading — the only one of its kind on the page.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'lede',
          title: 'Lede',
          description: 'One short paragraph introducing this page.',
          type: 'text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'featuredVideo',
      title: 'Featured video',
      description:
        'Optional. Omitted from the page entirely unless a valid YouTube video is selected below.',
      type: 'object',
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
        }),
        defineField({
          name: 'video',
          title: 'Video',
          description: 'YouTube video items only — the approved player is YouTube-only.',
          type: 'reference',
          to: [{type: 'mediaItem'}],
          options: {
            filter: 'mediaType == "video" && videoProvider == "youtube"',
          },
        }),
      ],
    }),
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
            'YouTube videos displayed in the Media Gallery, in this order — drag to reorder. Dragging changes their display order; it does not affect the photo order above. These do not use the image categories (Performances / Venue & Crowd) — every gallery video automatically appears under "All" and under a code-owned "Videos" filter on the public site, and never under a photo category. Each entry must be a video media item with a normal YouTube URL (e.g. a watch or share link) or a supported youtube-nocookie.com/embed/ link configured on it — raw video files are never uploaded to Sanity here. The same video may also be selected as the separate Featured video above, if you want that. Choose up to 12, each only once.',
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
          description: 'Optional short paragraph above the merchandise grid.',
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
            'Enter only the page-specific title, such as “Media & Merch”. The website automatically appends the current formal band name.',
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
      return {title: 'Media & Merch Page'}
    },
  },
})
