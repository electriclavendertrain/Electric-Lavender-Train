import {defineArrayMember, defineField, defineType} from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
        defineField({name: 'headline', title: 'Headline', type: 'string'}),
        defineField({name: 'subcopy', title: 'Subcopy', type: 'text'}),
      ],
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero video',
      description: 'YouTube video items only — the approved hero player is YouTube-only.',
      type: 'reference',
      to: [{type: 'mediaItem'}],
      options: {
        filter: 'mediaType == "video" && videoProvider == "youtube"',
      },
    }),
    defineField({
      name: 'bandIntro',
      title: 'Band introduction',
      type: 'object',
      fields: [
        defineField({name: 'kicker', title: 'Kicker', type: 'string'}),
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({
          name: 'paragraphs',
          title: 'Paragraphs',
          type: 'array',
          of: [defineArrayMember({type: 'text'})],
        }),
        defineField({name: 'ctaLabel', title: 'CTA label', type: 'string'}),
      ],
    }),
    defineField({
      name: 'featuredMedia',
      title: 'Featured gallery images',
      description: 'Image media items only, shown in the homepage gallery preview.',
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
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonial',
          fields: [
            defineField({name: 'quote', title: 'Quote', type: 'text'}),
            defineField({name: 'attribution', title: 'Attribution', type: 'string'}),
          ],
          preview: {
            select: {title: 'quote', subtitle: 'attribution'},
          },
        }),
      ],
    }),
    defineField({
      name: 'bookingCta',
      title: 'Booking call to action',
      type: 'object',
      fields: [
        defineField({name: 'kicker', title: 'Kicker', type: 'string'}),
        defineField({name: 'heading', title: 'Heading', type: 'string'}),
        defineField({name: 'body', title: 'Body', type: 'text'}),
        defineField({name: 'ctaLabel', title: 'CTA label', type: 'string'}),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({name: 'metaTitle', title: 'Meta title', type: 'string'}),
        defineField({name: 'metaDescription', title: 'Meta description', type: 'text'}),
        defineField({name: 'ogImage', title: 'Social share image', type: 'image'}),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Homepage'}
    },
  },
})
