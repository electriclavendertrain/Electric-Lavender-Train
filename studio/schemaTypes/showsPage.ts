import {CalendarIcon} from '@sanity/icons/Calendar'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const showsPage = defineType({
  name: 'showsPage',
  title: 'Shows Page',
  type: 'document',
  icon: CalendarIcon,
  initialValue: {
    intro: {
      kicker: 'Where to Find Us',
      heading: 'Shows',
      paragraphs: [
        "Electric Lavender Train plays dance floors, breweries, wineries, and backyards up and down California's Central Coast. Public dates are listed here as soon as they're confirmed.",
      ],
    },
    upcoming: {heading: 'Upcoming Schedule'},
    recent: {kicker: "Where We've Been", heading: 'Recent Shows'},
    emptyState: {
      title: 'No upcoming dates listed right now',
      message:
        'No upcoming dates are currently listed on this page. New public dates are added as they are confirmed. An unlisted date is not guaranteed available — send a booking inquiry and ELT will confirm.',
      actionLabel: 'Follow on Instagram',
      actionUrl: 'https://www.instagram.com/electriclavendertrain',
    },
    bookingCta: {
      kicker: "Let's Ride Together",
      heading: 'Want ELT at Your Venue or Event?',
      body: "Weddings, private parties, breweries, festivals — if there's a dance floor, we'll fill it. Tell us about your event and your dates, and we'll confirm what's open.",
      ctaLabel: 'Send a Booking Inquiry',
    },
    seo: {
      metaTitle: 'Shows',
      metaDescription:
        "Upcoming and recent Electric Lavender Train performances on California's Central Coast. All times Pacific.",
    },
  },
  fields: [
    defineField({
      name: 'intro',
      title: 'Page introduction',
      description: 'The Shows page heading and one or two short introduction paragraphs.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Shows page introduction.'),
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
          validation: (Rule) => Rule.required().error('Enter the main Shows page heading.'),
        }),
        defineField({
          name: 'paragraphs',
          title: 'Introductory paragraphs',
          description:
            'One or two short public-facing paragraphs. Time-zone and availability notices are protected site copy and are added automatically.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'text',
              validation: (Rule) => Rule.required().error('Enter text for this paragraph.'),
            }),
          ],
          validation: (Rule) =>
            Rule.required()
              .min(1)
              .max(2)
              .error('Add one or two short Shows page introduction paragraphs.'),
        }),
      ],
    }),
    defineField({
      name: 'upcoming',
      title: 'Upcoming schedule',
      description:
        'The heading shown above upcoming public events. Events themselves are managed under Events.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Upcoming Schedule heading.'),
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the Upcoming Schedule heading.'),
        }),
      ],
    }),
    defineField({
      name: 'recent',
      title: 'Recent shows',
      description: 'The heading shown above recently completed public events.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Recent Shows heading.'),
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
          validation: (Rule) => Rule.required().error('Enter the Recent Shows heading.'),
        }),
      ],
    }),
    defineField({
      name: 'emptyState',
      title: 'No upcoming shows message and external redirect',
      description:
        'Shown only when there are no upcoming Public shows or “Private booking — show date only” entries. A private entry contributes only its date/time and the website label “Private Event”; its private details are never displayed. The optional external redirect can send visitors to any approved social or public page.',
      type: 'object',
      validation: (Rule) =>
        Rule.required().error('Complete the message used when no upcoming shows are listed.'),
      fields: [
        defineField({
          name: 'title',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the no-upcoming-shows heading.'),
        }),
        defineField({
          name: 'message',
          title: 'Message',
          description:
            'Do not imply that unlisted dates are available. The website schedule is not an availability calendar.',
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
    defineField({
      name: 'bookingCta',
      title: 'Booking call to action',
      description: 'The final Shows-page section inviting visitors to open the booking form.',
      type: 'object',
      validation: (Rule) =>
        Rule.required().error('Complete the Shows page booking call to action.'),
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
            'Enter only the page-specific title, such as “Shows”. The website automatically appends the current formal band name.',
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
            'Optional image used when the Shows page is shared. It does not appear in visible page content. All other pages have their own independent share-image fields.',
          type: 'image',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Shows Page'}
    },
  },
})
