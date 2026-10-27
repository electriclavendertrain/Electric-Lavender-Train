import {UsersIcon} from '@sanity/icons/Users'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {validateGoogleFormUrl} from './googleFormUrl'

/** About page singleton schema. */
export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  icon: UsersIcon,
  initialValue: {
    intro: {
      kicker: 'Who We Are',
      heading: "More Than a Band, We're Family.",
      paragraphs: [
        "We're a local band with deep roots on the Central Coast. We know the crowd, we know the songs, and we know how to make every night one to remember — full of dancing, singing, and the kind of energy that turns strangers into friends. Whether it's a backyard celebration or a packed house downtown, we play it like family.",
        'Thanks for riding the train with us.',
      ],
    },
    membersIntro: {
      kicker: 'The Lineup',
      heading: 'Meet the Band',
    },
    testimonialsIntro: {
      kicker: 'What People Are Saying',
      heading: 'Straight From the Dance Floor',
    },
    testimonialSubmission: {
      enabled: false,
      kicker: 'Share Your Story',
      heading: 'Tell Us About Your ELT Experience',
      explanation:
        'Caught a show or brought ELT to your room? We’d love to hear what made it memorable. Share your experience through our short Google Form.',
      ctaLabel: 'Share Your Experience',
    },
    bookingCta: {
      kicker: 'Let’s Ride Together',
      heading: 'Bring ELT to Your Room.',
      body: 'Winery patios, lounges, outdoor concerts, resorts, private celebrations — tell us about your event and your dates, and we’ll confirm what’s open.',
      ctaLabel: 'Send a Booking Inquiry',
    },
    seo: {
      metaTitle: 'About',
      metaDescription:
        'Meet Electric Lavender Train — a Central Coast band playing dynamic rock ’n’ roll and exhilarating takes on the hit songs audiences know and love.',
    },
  },
  fields: [
    defineField({
      name: 'intro',
      title: 'Page introduction',
      description: 'The About page heading, introduction, and main band photograph.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the About page introduction.'),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          description: 'The About page’s main heading — the only one of its kind on the page.',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the main About page heading.'),
        }),
        defineField({
          name: 'paragraphs',
          title: 'Paragraphs',
          description:
            'One or two short paragraphs introducing the band. The sole source for the About page introduction.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'text',
              validation: (Rule) => Rule.required().error('Enter text for this paragraph.'),
            }),
          ],
          validation: (Rule) =>
            Rule.required().min(1).max(2).error('Add one or two short introduction paragraphs.'),
        }),
        defineField({
          name: 'heroImage',
          title: 'Hero image',
          description:
            'A full-band photograph from the media library. It must have alternative text — the page will not build without it.',
          type: 'reference',
          to: [{type: 'mediaItem'}],
          options: {filter: 'mediaType == "image"'},
          validation: (Rule) =>
            Rule.required().error('Choose the approved full-band photograph for the About page.'),
        }),
      ],
    }),
    defineField({
      name: 'membersIntro',
      title: 'Meet the band heading',
      description: 'The heading and optional introduction shown above the member cards.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Meet the Band heading.'),
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
          validation: (Rule) =>
            Rule.required().error('Enter the heading shown above the band members.'),
        }),
        defineField({
          name: 'body',
          title: 'Introductory text',
          description: 'Optional short paragraph above the member cards.',
          type: 'text',
        }),
      ],
    }),
    defineField({
      name: 'members',
      title: 'Band members',
      description:
        'Choose 1 to 8 members, in the order they should appear. Drag to reorder — this order is the render order.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'bandMember'}]})],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(8)
          .error('Choose between one and eight band members to display.'),
    }),
    defineField({
      name: 'testimonialsIntro',
      title: 'Testimonials heading (About Page)',
      description:
        'This controls only the About section testimonial labels. Actual testimonial quotes, sources, logos, links, and display order are managed in “Testimonials” in the Studio sidebar and are shared with the Home page. This section is rendered only when testimonials are present; otherwise, it is omitted.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the About page testimonial heading.'),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Enter the small label above the About page testimonials.'),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the About page testimonial heading.'),
        }),
      ],
    }),
    defineField({
      name: 'testimonialSubmission',
      title: 'Share Your Story (testimonial submissions)',
      description:
        'Optional callout, rendered just below the testimonials on the About page, linking to a Google Form where visitors can share their own ELT experience. Stays hidden until Enabled is on and Heading, Explanation, Button text, and Form URL (a valid Google Forms link) are all filled in. Small label above heading remains optional even when this section is enabled.',
      type: 'object',
      validation: (Rule) =>
        Rule.custom(
          (
            value:
              | {
                  enabled?: boolean
                  heading?: string
                  explanation?: string
                  ctaLabel?: string
                  formUrl?: string
                }
              | undefined,
          ) => {
            if (!value?.enabled) return true
            const heading = value.heading?.trim()
            const explanation = value.explanation?.trim()
            const ctaLabel = value.ctaLabel?.trim()
            if (!heading || !explanation || !ctaLabel) {
              return 'To show this section, enter its Heading, Invitation text, and Button text.'
            }
            if (!value.formUrl) {
              return 'To show this section, paste the public Google Form URL.'
            }
            const formUrlResult = validateGoogleFormUrl(value.formUrl)
            return formUrlResult === true
              ? true
              : `To show this section, correct the Google Form URL: ${formUrlResult}`
          },
        ),
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show this section on the website',
          description:
            'Turn this section on once Heading, Explanation, and Button text are written and the Google Form is ready to link to. Small label above heading may stay blank.',
          type: 'boolean',
          initialValue: false,
        }),
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
          name: 'explanation',
          title: 'Invitation text',
          description: 'Short paragraph explaining what this is and how submissions may be used.',
          type: 'text',
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          type: 'string',
        }),
        defineField({
          name: 'formUrl',
          title: 'Google Form URL',
          description:
            'Paste the public Google Forms visitor link. Leave this blank until the form is live and tested.',
          type: 'url',
          validation: (Rule) => Rule.custom(validateGoogleFormUrl),
        }),
      ],
    }),
    defineField({
      name: 'bookingCta',
      title: 'Booking call to action',
      description: 'The final About-page section inviting visitors to open the booking form.',
      type: 'object',
      validation: (Rule) =>
        Rule.required().error('Complete the About page booking call to action.'),
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
            'Enter only the page-specific title, such as “About”. The website automatically appends the current formal band name.',
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
            'Optional image used when the About page is shared. It does not appear in visible page content. All other pages have their own independent share-image fields.',
          type: 'image',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'About Page'}
    },
  },
})
