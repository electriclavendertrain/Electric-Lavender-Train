import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The Music page singleton, with the fixed `_id: "musicPage"`.
 *
 * Same singleton conventions as every other page singleton: one fixed
 * Structure entry, stripped from `schema.templates` and the global "+" menu
 * (via `SINGLETON_TYPES` in `sanity.config.ts`), queried by that exact
 * `_id`. See docs/developer-guide.md §5.
 *
 * `releases` is ONE ordered array of `musicRelease` references — not two
 * separate upcoming/released arrays. Each release's own `state` field
 * decides which of the two public sections it renders in; the frontend
 * derives both groups from this single list, preserving this array's order
 * within each group. Keeping one list (rather than one per state) is what
 * makes "no duplicated release references" straightforward to guarantee.
 *
 * No release titles, dates, artwork, or streaming links are seeded here —
 * inventing any of those would be worse than leaving this page's release
 * list empty until real ELT releases exist.
 */
export const musicPage = defineType({
  name: 'musicPage',
  title: 'Music Page',
  type: 'document',
  initialValue: {
    intro: {
      kicker: 'Music',
      heading: 'Music',
      lede: 'New releases from Electric Lavender Train — streaming links, pre-saves, and more, as they go live.',
    },
    seo: {
      metaTitle: 'Music',
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
        'Optional, one per page. Rendered immediately after the page introduction and before the release sections. Omitted from the page entirely unless a valid YouTube video is selected below.',
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
      name: 'releases',
      title: 'Releases — drag to order',
      description:
        'Every release shown on the Music page, in one list. Order here is the display order within each release’s own state (Upcoming / Released) — dragging an upcoming release above another upcoming release changes their order; dragging past a release in a different state has no effect on either section’s order. Choose up to 40, each only once.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'musicRelease'}]})],
      validation: (Rule) =>
        Rule.max(40).custom((value) => {
          if (!value || value.length === 0) return true
          const refs = value
            .map((entry) => (entry as {_ref?: string})._ref)
            .filter((ref): ref is string => Boolean(ref))
          const uniqueRefs = new Set(refs)
          return (
            uniqueRefs.size === refs.length ||
            'Each release may only appear once — remove the duplicate.'
          )
        }),
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
            'Enter only the page-specific title, such as “Music”. The website automatically appends the current formal band name.',
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
      return {title: 'Music Page'}
    },
  },
})
