import {defineArrayMember, defineField, defineType} from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  initialValue: {
    newsletter: {
      kicker: 'Stay in the Loop',
      heading: 'Join the ELT Newsletter',
      body: 'Get the weekly ELT performance schedule delivered to your inbox. Signup uses email confirmation (double opt-in) once the hosted form is live.',
      ctaLabel: 'Sign Up for the Newsletter',
    },
    upcomingShows: {
      kicker: 'Where to Find Us',
      heading: 'Upcoming Shows',
      viewAllLabel: 'View All Shows',
      emptyState: {
        title: 'No shows on the calendar right now',
        message: 'Check back soon, or follow along on Instagram for the latest announcements.',
        actionLabel: 'Follow Us on Instagram',
      },
    },
    experience: {
      kicker: 'What to Expect',
      heading: 'The ELT Experience',
      introduction:
        'ELT brings exhilarating takes on the hit songs audiences know and love. Powerhouse vocals, guitar-forward chemistry, and a locked-in rhythm section give every performance plenty of energy, while the band’s easygoing presence keeps the room welcoming — from winery patios and lounge stages to outdoor concerts and private celebrations.',
      highlights: [
        {
          _key: 'the-sound',
          title: 'The Sound',
          description:
            'Dynamic rock ’n’ roll, and exhilarating takes on the hit songs a room already knows. Broad appeal without a fixed set list — the songs suit the night.',
        },
        {
          _key: 'on-stage',
          title: 'On Stage',
          description:
            'Powerhouse vocals, guitar-forward chemistry, and a bass-and-drums foundation that holds the whole thing together. Energetic and live, never overproduced.',
        },
        {
          _key: 'in-the-room',
          title: 'In the Room',
          description:
            'Welcoming and easygoing, and at home on a winery patio, a bar lounge stage, an outdoor concert, a resort lawn, or a private celebration anywhere on the Central Coast.',
        },
      ],
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
      name: 'officialBandPhotos',
      title: 'Official band photos',
      description:
        'A restrained, Homepage-only showcase of professionally photographed, approved official band images — distinct from the fan/live imagery on the Gallery & Merchandise page, and never sourced from it automatically. Rendered immediately after the Hero, before The ELT Experience. Optional: omitted from the page entirely when empty or when every selected photo is invalid. Choose 1 to 4 strong images — fewer, stronger photos are preferred over a large set.',
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
          description: 'Required once this block has any photos selected.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'body',
          title: 'Introductory text',
          description: 'Optional short paragraph above the photos.',
          type: 'text',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          description:
            'Links to the About page. The destination is fixed in code, not editable here — only this visible label is.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'photos',
          title: 'Photos — drag to order',
          description:
            'Image media items only. Choose 1 to 4 professional photographs from the Media Library. Drag to set their display order.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'reference',
              to: [{type: 'mediaItem'}],
              options: {filter: 'mediaType == "image"'},
            }),
          ],
          validation: (Rule) =>
            Rule.min(1)
              .max(4)
              .custom((value) => {
                if (!value || value.length === 0) return true
                const refs = value
                  .map((entry) => (entry as {_ref?: string})._ref)
                  .filter((ref): ref is string => Boolean(ref))
                const uniqueRefs = new Set(refs)
                return (
                  uniqueRefs.size === refs.length ||
                  'Each photo may only appear once — remove the duplicate.'
                )
              }),
        }),
      ],
    }),
    defineField({
      name: 'experience',
      title: 'What an ELT performance feels like',
      description: 'Rendered on the Homepage after Official Band Photos, before Upcoming Shows.',
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
          name: 'introduction',
          title: 'Introduction',
          description:
            'One short paragraph answering what ELT sounds like and what a performance feels like.',
          type: 'text',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'highlights',
          title: 'Highlights',
          description:
            'Exactly three: the sound, the performance, and the kinds of rooms and audiences that suit the band.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'experienceHighlight',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'description',
                  title: 'Description',
                  type: 'text',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: {select: {title: 'title', subtitle: 'description'}},
            }),
          ],
          validation: (Rule) => Rule.required().length(3),
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
              description: 'The destination is the verified Instagram URL in site configuration.',
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
      name: 'newsletter',
      title: 'Weekly schedule newsletter',
      description:
        'The one weekly schedule newsletter — not a separate show-alert subscription. The signup button appears only once the hosted signup link is configured; no email is collected on this site directly.',
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
          title: 'Newsletter description',
          description:
            'Briefly describe the weekly newsletter. Mention that signup uses double opt-in email confirmation. Do not promise a specific delivery day, or a separate new-show-alert subscription.',
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
