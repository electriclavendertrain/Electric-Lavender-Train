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
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Small label above headline',
          type: 'string',
        }),
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'subcopy',
          title: 'Supporting text',
          description: 'Short paragraph shown beneath the main homepage headline.',
          type: 'text',
        }),
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
          name: 'paragraphs',
          title: 'Paragraphs',
          description: 'A concise preview of the future About page — one or two short paragraphs.',
          type: 'array',
          of: [defineArrayMember({type: 'text', validation: (Rule) => Rule.required()})],
          validation: (Rule) => Rule.required().min(1).max(2),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'featuredMedia',
      title: 'Featured gallery images',
      description:
        'Image media items only, shown in the homepage gallery preview. Choose up to six images — they render in the order selected here.',
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
      description: 'Up to three testimonials.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonial',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'attribution',
              title: 'Attribution',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'quote', subtitle: 'attribution'},
          },
        }),
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'bookingCta',
      title: 'Booking call to action',
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
        defineField({name: 'metaTitle', title: 'Meta title', type: 'string'}),
        defineField({name: 'metaDescription', title: 'Meta description', type: 'text'}),
        defineField({
          name: 'ogImage',
          title: 'Social share image',
          description:
            'Used for link previews on social media and messaging apps. It does not appear in the visible page content.',
          type: 'image',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Homepage'}
    },
  },
})
