import {PlayIcon} from '@sanity/icons/Play'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {validateGoogleFormUrl} from './googleFormUrl'

/** Gallery & Merchandise page singleton schema. */
export const galleryPage = defineType({
  name: 'galleryPage',
  title: 'Gallery & Merchandise Page',
  type: 'document',
  icon: PlayIcon,
  initialValue: {
    gallery: {
      kicker: 'Good Times & Great People',
      heading: 'Media Gallery',
    },
    eventMediaSubmission: {
      kicker: 'Share Your Story',
      heading: 'Share Your Event Media',
      explanation:
        'Share photos or videos from an ELT event through our Google Form. Only submit material you have the right and permission to share. Submissions may be reviewed for ELT’s website, social media, and ordinary band promotion, but submission does not guarantee publication or credit. If credit is required or requested, include the preferred wording in the form.',
      ctaLabel: 'Submit Photos & Videos',
    },
    merch: {
      kicker: 'Take It Home',
      heading: 'Merchandise',
      body: 'Items are available by inquiry only — there is no online store, cart, or checkout. Use the merchandise inquiry form to email the band.',
    },
    bookingCta: {
      kicker: "Let's Ride Together",
      heading: 'Questions About Photos, Video, or Merch?',
      body: "Send us a message and we'll get back to you.",
      ctaLabel: 'Email the Band About Merch',
    },
    seo: {
      metaTitle: 'Gallery & Merchandise',
    },
  },
  fields: [
    defineField({
      name: 'gallery',
      title: 'Media gallery',
      description: 'The Gallery & Merchandise page heading, introduction, photos, and videos.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the media gallery section.'),
      fields: [
        defineField({
          name: 'kicker',
          title: 'Small label above heading',
          type: 'string',
        }),
        defineField({
          name: 'heading',
          title: 'Main gallery heading',
          description: 'The page’s main heading. Required even when the gallery is empty.',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Enter the main Gallery & Merchandise page heading.'),
        }),
        defineField({
          name: 'body',
          title: 'Introductory text',
          description: 'Optional short paragraph above the gallery.',
          type: 'text',
        }),
        defineField({
          name: 'items',
          title: 'Gallery photos — drag to order',
          description:
            'Image media items only. This is the photo order: both the "All" filter order (photos first, then Gallery videos below) and the relative order within each category filter. Choose up to 24.',
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
          validation: (Rule) => Rule.max(24),
        }),
        defineField({
          name: 'videos',
          title: 'Gallery videos — drag to order',
          description:
            'YouTube videos only. Drag to set their display order. Videos appear under All and Videos, not the photo categories. Choose up to 12.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'reference',
              to: [{type: 'mediaItem'}],
              options: {
                filter: 'mediaType == "video" && videoProvider == "youtube"',
              },
            }),
          ],
          validation: (Rule) =>
            Rule.max(12).custom((value) => {
              if (!value || value.length === 0) return true
              const refs = value
                .map((entry) => (entry as {_ref?: string})._ref)
                .filter((ref): ref is string => Boolean(ref))
              const uniqueRefs = new Set(refs)
              return (
                uniqueRefs.size === refs.length ||
                'Each video may only appear once in Gallery videos — remove the duplicate.'
              )
            }),
        }),
      ],
    }),
    defineField({
      name: 'eventMediaSubmission',
      title: 'Share Your Event Media',
      description:
        'Optional callout linking to the event-media Google Form. It stays hidden until the section is enabled and its Heading, Invitation text, Button text, and valid Google Form URL are all complete.',
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
            'Turn this on only after the invitation text is approved and the public Google Form link has been added and tested.',
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
      name: 'merch',
      title: 'Merchandise',
      description:
        'Editorial and inquiry-only. Omitted from the page entirely when no items are selected.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the Merchandise section.'),
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
          validation: (Rule) => Rule.required().error('Enter the Merchandise heading.'),
        }),
        defineField({
          name: 'body',
          title: 'Introductory text',
          description:
            'The single paragraph shown above the merchandise grid. Keep the approved inquiry-only wording here so visitors understand there is no online store, cart, or checkout.',
          type: 'text',
          validation: (Rule) =>
            Rule.required().error('Enter the inquiry-only merchandise introduction.'),
        }),
        defineField({
          name: 'items',
          title: 'Selected merchandise',
          description: 'Merch items, in display order. Choose up to 24.',
          type: 'array',
          of: [defineArrayMember({type: 'reference', to: [{type: 'merchItem'}]})],
          validation: (Rule) => Rule.max(24),
        }),
      ],
    }),
    defineField({
      name: 'bookingCta',
      title: 'Inquiry call to action',
      description: 'The final page section inviting visitors to ask about merchandise or bookings.',
      type: 'object',
      validation: (Rule) => Rule.required().error('Complete the inquiry call to action.'),
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
          validation: (Rule) => Rule.required().error('Enter the inquiry call-to-action heading.'),
        }),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'text',
          validation: (Rule) =>
            Rule.required().error('Enter the inquiry call-to-action description.'),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'Button text',
          type: 'string',
          validation: (Rule) => Rule.required().error('Enter the inquiry button text.'),
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
            'Enter only the page-specific title, such as “Gallery & Merchandise”. The website automatically appends the current formal band name.',
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
            'Optional image used when the Gallery & Merchandise page is shared. It does not appear in visible page content. All other pages have their own independent share-image fields.',
          type: 'image',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Gallery & Merchandise Page'}
    },
  },
})
