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
          title: 'Introductory paragraphs',
          description:
            'One or two short public-facing paragraphs. Time-zone and availability notices are protected site copy and are added automatically.',
          type: 'array',
          of: [defineArrayMember({type: 'text', validation: (Rule) => Rule.required()})],
          validation: (Rule) => Rule.required().min(1).max(2),
        }),
      ],
    }),
    defineField({
      name: 'upcoming',
      title: 'Upcoming schedule',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'recent',
      title: 'Recent shows',
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
      ],
    }),
    defineField({
      name: 'emptyState',
      title: 'No upcoming shows message',
      description:
        'Shown only when no public shows or sanitized private bookings are upcoming.',
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
          description:
            'Do not imply that unlisted dates are available. The website schedule is not an availability calendar.',
          type: 'text',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'actionLabel',
          title: 'Instagram link text',
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
        defineField({name: 'metaTitle', title: 'Meta title', type: 'string'}),
        defineField({
          name: 'metaDescription',
          title: 'Meta description',
          type: 'text',
          validation: (Rule) => Rule.max(180).warning('Keep this concise for search results.'),
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
