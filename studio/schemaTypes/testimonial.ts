import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {defineField, defineType} from 'sanity'

/** Reusable testimonial schema shared by Home and About. */
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
