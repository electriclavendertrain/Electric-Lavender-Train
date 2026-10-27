import {defineArrayMember, defineField, defineType} from 'sanity'

/** Music page singleton schema. */
export const musicPage = defineType({
  name: 'musicPage',
  title: 'Music Page',
  type: 'document',
  initialValue: {
    featured: {
      kicker: 'Featured',
      heading: 'Heavy Crush Records Presents...',
    },
    labelAffiliation: {
      kicker: 'Our Label',
      text: 'The Electric Lavender Train is part of Heavy Crush Records.',
      logoAlt: 'Heavy Crush Records logo',
      url: 'https://www.heavycrushrecords.com/',
      missionStatement: 'Focus on intent. Empower through performance.',
      socialLinks: {
        facebookUrl: 'https://www.facebook.com/profile.php?id=61558015122991',
        instagramUrl: 'https://www.instagram.com/heavycrushrecords',
        youtubeUrl: 'https://www.youtube.com/c/thetens',
      },
    },
    bookingCta: {
      kicker: 'Let’s Ride Together',
      heading: 'Bring the Music to You.',
      body: 'From winery patios and packed rooms to private celebrations, bring ELT’s live sound to your next event. Tell us what you’re planning and we’ll follow up about the details.',
      ctaLabel: 'Send a Booking Inquiry',
    },
    seo: {
      metaTitle: 'Music',
      metaDescription:
        'Explore music from The Electric Lavender Train, including releases, featured videos, and links to Spotify and Apple Music.',
    },
  },
  fields: [
    defineField({
      name: 'featured',
      title: 'Featured',
      description:
        "Always rendered as the page's first section and its one heading — this is never conditionally omitted. The video is optional: the section still renders with just the heading when no video is selected.",
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the first section of the Music page.'),
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
          validation: (Rule) => Rule.required().error('Enter the main Music page heading.'),
        }),
        defineField({
          name: 'video',
          title: 'Video',
          description: 'Optional. YouTube video items only — the approved player is YouTube-only.',
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
        'Only released music appears on the public Music page — this list should contain released releases only (Studio\'s picker below only offers releases already marked "Released"). Order here is the display order. Choose up to 40, each only once.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'musicRelease'}],
          options: {filter: 'state == "released"'},
        }),
      ],
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
      name: 'labelAffiliation',
      title: 'Heavy Crush Records information',
      description:
        'Editable wording, mission statement, and social links for the Heavy Crush Records relationship, shown after Releases.',
      type: 'object',
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above the text',
          type: 'string',
        }),
        defineField({
          name: 'text',
          title: 'Relationship text',
          description:
            'Keep to the approved wording: “The Electric Lavender Train is part of Heavy Crush Records.”',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error(
              'Enter the approved sentence describing ELT’s relationship with Heavy Crush Records.',
            ),
        }),
        defineField({
          name: 'logoAlt',
          title: 'Logo alternative text',
          description: 'Accessible description of the Heavy Crush Records logo image.',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Describe the Heavy Crush Records logo for screen-reader users.'),
        }),
        defineField({
          name: 'url',
          title: 'Heavy Crush Records URL',
          description:
            'The label’s official website. Kept as its own field for backward compatibility with the existing “Visit Heavy Crush Records” link.',
          type: 'url',
          validation: (Rule) =>
            Rule.required()
              .uri({scheme: ['http', 'https']})
              .error('Enter the official Heavy Crush Records website URL, including https://.'),
        }),
        defineField({
          name: 'missionStatement',
          title: 'Mission statement',
          description:
            'A short, editable statement of the label’s mission — rendered beneath the relationship text.',
          type: 'text',
          rows: 2,
          validation: (Rule) =>
            Rule.required().error('Enter the approved Heavy Crush Records mission statement.'),
        }),
        defineField({
          name: 'socialLinks',
          title: 'Social links',
          description:
            'Heavy Crush Records’ own social links — separate from The Electric Lavender Train’s own social links. Rendered as three buttons in this fixed order: Facebook, Instagram, YouTube. Each URL is checked against its platform’s real hostname so a button cannot silently point somewhere unrelated.',
          type: 'object',
          fields: [
            defineField({
              name: 'facebookUrl',
              title: 'Facebook URL',
              description: 'Must be a real facebook.com link.',
              type: 'url',
              validation: (Rule) =>
                Rule.required()
                  .uri({scheme: ['https']})
                  .custom((value) => {
                    if (!value) return true
                    let parsed: URL
                    try {
                      parsed = new URL(value)
                    } catch {
                      return 'Must be a valid URL'
                    }
                    return (
                      parsed.hostname.replace(/^www\./, '') === 'facebook.com' ||
                      'Must be a real facebook.com link — not a lookalike domain'
                    )
                  }),
            }),
            defineField({
              name: 'instagramUrl',
              title: 'Instagram URL',
              description: 'Must be a real instagram.com link.',
              type: 'url',
              validation: (Rule) =>
                Rule.required()
                  .uri({scheme: ['https']})
                  .custom((value) => {
                    if (!value) return true
                    let parsed: URL
                    try {
                      parsed = new URL(value)
                    } catch {
                      return 'Must be a valid URL'
                    }
                    return (
                      parsed.hostname.replace(/^www\./, '') === 'instagram.com' ||
                      'Must be a real instagram.com link — not a lookalike domain'
                    )
                  }),
            }),
            defineField({
              name: 'youtubeUrl',
              title: 'YouTube URL',
              description: 'Must be a real youtube.com link.',
              type: 'url',
              validation: (Rule) =>
                Rule.required()
                  .uri({scheme: ['https']})
                  .custom((value) => {
                    if (!value) return true
                    let parsed: URL
                    try {
                      parsed = new URL(value)
                    } catch {
                      return 'Must be a valid URL'
                    }
                    return (
                      parsed.hostname.replace(/^www\./, '') === 'youtube.com' ||
                      'Must be a real youtube.com link — not a lookalike domain'
                    )
                  }),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'bookingCta',
      title: 'Booking call to action',
      description:
        'The final Music-page section inviting visitors to open the booking form. Complete all required fields before production launch.',
      type: 'object',
      validation: (Rule) =>
        Rule.required().error('Complete the Music page booking call to action.'),
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
          description: 'Links to the Contact page Booking Inquiry form.',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the booking button text.'),
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Search and social sharing',
      description: 'Optional text and image used by search engines and when this page is shared.',
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
            'Optional image used when the Music page is shared. It does not appear in visible page content. All other pages have their own independent share-image fields.',
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
