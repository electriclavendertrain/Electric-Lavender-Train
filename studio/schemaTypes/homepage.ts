import {defineArrayMember, defineField, defineType} from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  initialValue: {
    newsletter: {
      kicker: 'Stay in the Loop',
      heading: 'Join the ELT Newsletter',
      body: 'Get the weekly ELT performance schedule, music news, and updates delivered straight to your inbox.',
      ctaLabel: 'Sign Up for the Newsletter',
    },
    upcomingShows: {
      kicker: 'Where to Find Us',
      heading: 'Upcoming Shows',
      viewAllLabel: 'View All Shows',
      emptyState: {
        title: 'No shows on the calendar right now',
        message: 'Follow along on Instagram for the latest announcements.',
        actionLabel: 'Follow Us on Instagram',
        actionUrl: 'https://www.instagram.com/electriclavendertrain',
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
      title: 'Top of Homepage',
      description:
        'The first section visitors see: its main headline, optional small label, and supporting sentence.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Top of Homepage section.'),
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Small label above headline',
          description:
            'Shown only when there is no valid configured "Featured Homepage video" below. Otherwise small label reads: "Play Featured Video".',
          type: 'string',
        }),
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the main Homepage headline.'),
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
      title: 'Featured Homepage video',
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
        'Homepage-only showcase of approved member portraits. Each portrait links to that member’s About-page profile, so select the same Media item currently used as that member’s Profile photo. Rendered immediately after the Hero, before The ELT Experience. Optional: omitted from the page entirely when empty or invalid. Choose 1 to 4 strong images.',
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
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as {photos?: unknown[]} | undefined
              if (parent?.photos?.length && !value?.trim()) {
                return 'Enter the heading shown above the official band photos.'
              }
              return true
            }),
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
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as {photos?: unknown[]} | undefined
              if (parent?.photos?.length && !value?.trim()) {
                return 'Enter the About-page button text shown below the photos.'
              }
              return true
            }),
        }),
        defineField({
          name: 'photos',
          title: 'Photos — drag to order',
          description:
            'Choose 1 to 4 image Media items that are also assigned as band-member Profile photos. Each Homepage portrait links to its matching member profile. Drag to set display order.',
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
      validation: (Rule) =>
        Rule.required().error('Complete the ELT performance experience section.'),
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
          validation: (Rule) => Rule.required().error('Enter the performance experience heading.'),
        }),
        defineField({
          name: 'introduction',
          title: 'Introduction',
          description:
            'Optional short paragraph answering what ELT sounds and feels like without repeating the three highlights below.',
          type: 'text',
        }),
        defineField({
          name: 'highlights',
          title: 'Highlights',
          description:
            'Exactly three, in this order: The Sound, On Stage, and In the Room. A title may be reworded only if it still clearly matches that category, because the three SVG icons are fixed to these positions in code.',
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
                  validation: (Rule) =>
                    Rule.required().error('Enter a title for this performance highlight.'),
                }),
                defineField({
                  name: 'description',
                  title: 'Description',
                  type: 'text',
                  validation: (Rule) =>
                    Rule.required().error('Describe this performance highlight.'),
                }),
              ],
              preview: {select: {title: 'title', subtitle: 'description'}},
            }),
          ],
          validation: (Rule) =>
            Rule.required().length(3).error('Add exactly three performance highlights.'),
        }),
      ],
    }),
    defineField({
      name: 'upcomingShows',
      title: 'Upcoming shows section',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Upcoming Shows section.'),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Enter the small label above Upcoming Shows.'),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the Upcoming Shows heading.'),
        }),
        defineField({
          name: 'viewAllLabel',
          title: 'View all shows button text',
          description: 'Links to the Shows page.',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Enter the button text that links to the Shows page.'),
        }),
        defineField({
          name: 'emptyState',
          title: 'No upcoming shows message and external redirect',
          description: 'Shown only when there are no eligible upcoming public shows.',
          type: 'object',
          validation: (Rule) =>
            Rule.required().error('Complete the message used when no upcoming shows are listed.'),
          fields: [
            defineField({
              name: 'title',
              title: 'Heading',
              type: 'string',
              validation: (Rule) => Rule.required().error('Enter the no upcoming shows heading.'),
            }),
            defineField({
              name: 'message',
              title: 'Message',
              type: 'text',
              validation: (Rule) =>
                Rule.required().error('Enter the message visitors see when no shows are listed.'),
            }),
            defineField({
              name: 'actionLabel',
              title: 'External redirect button text',
              description:
                'Optional. Enter this together with the External redirect URL below, or leave both blank to show no button.',
              type: 'string',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as {actionUrl?: string} | undefined
                  if (parent?.actionUrl && !value?.trim()) {
                    return 'Enter the button text for the external redirect, or remove its URL.'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'actionUrl',
              title: 'External redirect URL',
              description:
                'Optional. Redirect visitors to an external social media or other public page when no shows are posted on the site.',
              type: 'url',
              validation: (Rule) =>
                Rule.uri({scheme: ['https']}).custom((value, context) => {
                  const parent = context.parent as {actionLabel?: string} | undefined
                  if (value && !parent?.actionLabel?.trim()) {
                    return 'Enter the button text above, or remove this external redirect URL.'
                  }
                  return true
                }),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'testimonialsIntro',
      title: 'Testimonials heading (Homepage)',
      description:
        'This controls only the Homepage testimonial-section labels. Actual testimonial quotes, sources, logos, links, and display order are managed in “Testimonials” in the Studio sidebar and are shared with the About page. This section is rendered only when testimonials are available; otherwise, it is omitted.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Homepage testimonial heading.'),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Enter the small label above the Homepage testimonials.'),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the Homepage testimonial heading.'),
        }),
      ],
    }),
    defineField({
      name: 'bookingCta',
      title: 'Booking call to action',
      description: 'The final Homepage section inviting visitors to open the booking form.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Homepage booking call to action.'),
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
          validation: (Rule) => Rule.required().error('Enter the booking call-to-action heading.'),
        }),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'text',
          validation: (Rule) =>
            Rule.required().error('Enter the booking call-to-action description.'),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          type: 'string',
          description: 'Links to the Contact page "Booking Inquiry" form.',
          validation: (Rule) => Rule.required().error('Enter the booking button text.'),
        }),
      ],
    }),
    defineField({
      name: 'newsletter',
      title: 'Weekly schedule newsletter',
      description:
        'This controls only the visible copy in the weekly schedule newsletter section. The hosted signup and unsubscribe destinations come from environment variables; site-owned confirmation routes remain code-owned.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the weekly newsletter section.'),
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
          validation: (Rule) => Rule.required().error('Enter the newsletter heading.'),
        }),
        defineField({
          name: 'body',
          title: 'Newsletter description',
          description: 'Briefly describe the weekly newsletter.',
          type: 'text',
          validation: (Rule) => Rule.required().error('Describe the weekly newsletter.'),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the newsletter signup button text.'),
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Search and social sharing',
      description:
        'Optional but highly recommended text and image used by search engines and when this page is shared.',
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
            'Optional image used when the Homepage is shared. It does not appear in visible page content. All other pages have their own independent share-image fields.',
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
