import {defineArrayMember, defineField, defineType} from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  initialValue: {
    upcomingShows: {
      kicker: 'Where to Find Us',
      heading: 'Upcoming Shows',
      viewAllLabel: 'View All Shows',
      emptyState: {
        title: 'No shows on the calendar right now',
        message:
          'Check back soon, or follow along on Instagram for the latest announcements.',
        actionLabel: 'Follow Us on Instagram',
      },
    },
    galleryIntro: {
      kicker: 'Good Times & Great People',
      heading: 'Live From the Last Show',
      ctaLabel: 'View Full Gallery',
    },
    testimonialsIntro: {
      kicker: 'What People Are Saying',
      heading: 'Straight From the Dance Floor',
    },
    seo: {
      metaTitle: 'Home',
      metaDescription:
        'Electric Lavender Train brings high-energy live dance music to weddings, parties, breweries, festivals, and events across California’s Central Coast.',
    },
  },
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
      name: 'galleryIntro',
      title: 'Gallery section heading',
      description:
        'Homepage copy shown above the selected gallery images. The gallery images themselves are chosen in “Featured gallery images”.',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          description: 'Links to the Media & Merch page.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'upcomingShows',
      title: 'Upcoming shows section',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'viewAllLabel',
          title: 'View all shows button text',
          description: 'Links to the Shows page.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'emptyState',
          title: 'No upcoming shows message',
          description: 'Shown only when there are no eligible upcoming public shows.',
          type: 'object',
          validation: (Rule) => Rule.required(),
          fields: [
            defineField({
              name: 'title',
              title: 'Heading',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'message',
              title: 'Message',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'actionLabel',
              title: 'Instagram button text',
              description:
                'The destination is the verified Instagram URL in site configuration.',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'testimonialsIntro',
      title: 'Testimonials heading (Homepage)',
      description:
        'This controls only the Homepage section heading. Testimonial quotes, sources, logos, links, and display order are managed in “Testimonials” in the Studio sidebar and are shared with the About page.',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
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
        defineField({
          name: 'metaTitle',
          title: 'Meta title',
          description:
            'Enter only the page-specific title, such as “Home”. The website automatically appends the current formal band name.',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta description',
          description:
            'Suggested: Electric Lavender Train brings high-energy live dance music to weddings, parties, breweries, festivals, and events across California’s Central Coast.',
          type: 'text',
          validation: (Rule) => Rule.max(180).warning('Keep this concise for search results.'),
        }),
        defineField({
          name: 'ogImage',
          title: 'Social share image',
          description:
            'Optional image used when the Homepage is shared. It does not appear in visible page content, and the About and Shows pages have their own independent share-image fields.',
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
