import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {defineField, defineType} from 'sanity'

/**
 * A reusable testimonial, shared by the Homepage and the About page.
 *
 * These were previously nested objects on the Homepage singleton. They became
 * ordinary documents the moment a second page needed the same quotes — that
 * is exactly the "promote to a document type" trigger described in
 * docs/developer-guide.md §4.
 *
 * Ordinary Sanity-generated `_id`s; not a singleton.
 *
 * A source may be an individual OR an establishment (a venue, winery, concert
 * series, resort, or other organization). `sourceName` carries whichever it
 * is, and `sourceContext` adds the qualifier when one helps.
 *
 * Nothing here may be published without client approval — quote text, source
 * attribution, logo usage rights, and the source URL each need sign-off.
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      description:
        'The approved quotation, without surrounding quotation marks — the card adds its own.',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceName',
      title: 'Source name',
      description:
        'Who said it: a person, or an establishment such as a venue, winery, concert series, or resort.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceContext',
      title: 'Source context',
      description:
        'Optional qualifier shown beneath the name, e.g. "Tasting room manager" or "Paso Robles, CA".',
      type: 'string',
    }),
    defineField({
      name: 'sourceLogo',
      title: 'Source logo',
      description:
        'Optional. Only use a logo the establishment has approved for this use. With no logo the card renders as a polished text-only quote — no substitute mark is invented.',
      type: 'reference',
      to: [{type: 'mediaItem'}],
      options: {filter: 'mediaType == "image"'},
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Official source URL',
      description:
        'Optional link to the establishment’s own official page. Not a review-site listing unless that is the approved source.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description:
        'Lower numbers appear first. The website shows the first three testimonials in this order, on both the Homepage and the About page.',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: {
      quote: 'quote',
      sourceName: 'sourceName',
      sourceContext: 'sourceContext',
      displayOrder: 'displayOrder',
      media: 'sourceLogo.image',
    },
    prepare({quote, sourceName, sourceContext, displayOrder, media}) {
      // Order first, so the list reads as the running order it actually is.
      const order = typeof displayOrder === 'number' ? `${displayOrder}.` : '—'
      const source = sourceName || 'No source set'
      return {
        title: `${order} ${source}`,
        subtitle: sourceContext ? `${sourceContext} · ${quote ?? ''}` : (quote ?? 'No quote set'),
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [{field: 'displayOrder', direction: 'asc'}],
    },
  ],
})
