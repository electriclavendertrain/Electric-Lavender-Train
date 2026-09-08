import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The Contact & Booking page singleton, with the fixed `_id: "contactPage"`.
 *
 * Same singleton conventions as every other page singleton: one fixed
 * Structure entry, stripped from `schema.templates` and the global "+" menu
 * (via `SINGLETON_TYPES` in `sanity.config.ts`), queried by that exact
 * `_id`. See docs/developer-guide.md §5.
 *
 * Only genuinely editorial content lives here: the page intro, the compact
 * newsletter callout copy, the FAQ, and SEO. Everything else on this route —
 * the four inquiry types, their field definitions, validation and length
 * limits, delivery/provider configuration, the honeypot, the sensitive-
 * information warning, and the protected Privacy & Delivery explanation —
 * stays code-owned in `web/src/data/contactData.ts` and
 * `web/src/lib/formDelivery.ts`, exactly as before this singleton existed.
 *
 * The FAQ answers below are cautious, safe-to-publish DRAFT placeholders —
 * written from this site's own already-implemented behavior only, never a
 * promised response time, fixed price, availability, confirmed booking, or
 * inventory claim. They are good enough to stay live as-is, but are still
 * marked for Hunter's review (see each field's Studio description) rather
 * than treated as final client-approved copy.
 */
export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  initialValue: {
    intro: {
      kicker: 'Get In Touch',
      heading: 'Contact & Booking',
      lede: 'Have a question, or want ELT at your event? Start below.',
      explanation:
        'Choose the kind of inquiry below, fill in the details, and send it directly from this page. Prefer email? Use the direct address at the bottom of the form instead.',
    },
    newsletterCta: {
      heading: 'Stay in the Loop',
      body: 'Get the weekly ELT performance schedule delivered to your inbox.',
      linkLabel: 'Join the Newsletter',
    },
    faq: [
      {
        _key: 'what-events',
        question: 'What kinds of events can ELT play?',
        answer:
          'Electric Lavender Train plays weddings, private parties, breweries, wineries, festivals, and other live events across California’s Central Coast. Every event is a little different, so send a booking inquiry with your event details and we’ll let you know what’s possible.',
      },
      {
        _key: 'booking-confirms',
        question: 'Does submitting a booking inquiry confirm my date?',
        answer:
          'No. Submitting an inquiry starts a conversation — it does not confirm availability, pricing, or a booking. ELT will follow up by email to confirm whether your date is open.',
      },
      {
        _key: 'merch-inquiries',
        question: 'How do merchandise inquiries work?',
        answer:
          'Merchandise is available by inquiry only — there’s no online store, cart, or checkout on this site. Send a merch inquiry with what you’re interested in, and we’ll follow up with availability and details.',
      },
      {
        _key: 'upcoming-shows',
        question: 'Where can I find upcoming public shows?',
        answer:
          'Public dates are listed on the Shows page as soon as they’re confirmed. A date that isn’t listed there isn’t guaranteed to be open — send a booking inquiry and ELT will confirm.',
      },
    ],
    seo: {
      metaTitle: 'Contact & Booking',
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
          description: 'The page’s main heading — the only one of its kind on the page.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'lede',
          title: 'Lede',
          description: 'One short opening sentence.',
          type: 'text',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'explanation',
          title: 'Explanation',
          description: 'Short paragraph explaining how to use the forms below.',
          type: 'text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'newsletterCta',
      title: 'Compact newsletter callout',
      description:
        'A short, secondary callout pointing visitors to the homepage newsletter section. This page never collects an email address directly — the link always leads to "/#newsletter" or the validated hosted signup URL.',
      type: 'object',
      validation: (Rule) => Rule.required(),
      fields: [
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
          name: 'linkLabel',
          title: 'Link text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'faq',
      title: 'Frequently asked questions',
      description:
        'Rendered immediately after the Privacy & Delivery material, before the newsletter callout. Do not promise response times, fixed prices, guaranteed availability, a confirmed booking, or inventory in any answer.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqEntry',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              description:
                'Draft placeholder wording — safe to publish as-is, but confirm with Hunter before treating it as final.',
              type: 'text',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'question', subtitle: 'answer'}},
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
            'Enter only the page-specific title, such as “Contact & Booking”. The website automatically appends the current formal band name.',
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
            'Optional image used when this page is shared. Independent of every other page’s share image.',
          type: 'image',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Contact Page'}
    },
  },
})
