import {UsersIcon} from '@sanity/icons/Users'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The About page singleton, with the fixed `_id: "aboutPage"`.
 *
 * Same singleton conventions as `homepage` and `showsPage`: one fixed
 * Structure entry, removed from the global create menu and from
 * `schema.templates`, and queried by that exact `_id`. See
 * docs/developer-guide.md §5.
 *
 * The initial values below are neutral section headings, approved tone
 * guidance, and wording the client already approved. No formation date,
 * origin story, member biography, testimonial, or press claim is seeded here
 * — inventing one would be worse than leaving the field blank.
 *
 * `members` is an ordered list of references, not embedded member content:
 * a member is reusable, and the order stored here is the render order.
 */
export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  icon: UsersIcon,
  initialValue: {
    intro: {
      kicker: 'Who We Are',
      heading: 'More Than a Band, We\'re Family.',
      paragraphs: [
        'We\'re a local band with deep roots on the Central Coast. We know the crowd, we know the songs, and we know how to make every night one to remember — full of dancing, singing, and the kind of energy that turns strangers into friends. Whether it\'s a backyard celebration or a packed house downtown, we play it like family.',
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
      description: '"Who We Are" — moved here from the Homepage, and now the page introduction.',
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
          description: 'The About page’s main heading — the only one of its kind on the page.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'paragraphs',
          title: 'Paragraphs',
          description: 'One or two short paragraphs introducing the band. The sole source for the About page introduction.',
          type: 'array',
          of: [defineArrayMember({type: 'text', validation: (Rule) => Rule.required()})],
          validation: (Rule) => Rule.required().min(1).max(2),
        }),
        defineField({
          name: 'heroImage',
          title: 'Hero image',
          description:
            'A full-band photograph from the media library. It must have alternative text — the page will not build without it.',
          type: 'reference',
          to: [{type: 'mediaItem'}],
          options: {filter: 'mediaType == "image"'},
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'membersIntro',
      title: 'Meet the band heading',
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
        'The members shown on this page, in the order they should appear. Drag to reorder — this order is the render order.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'bandMember'}]})],
      validation: (Rule) => Rule.required().min(1).max(8),
    }),
    defineField({
      name: 'testimonialsIntro',
      title: 'Testimonials heading (About Page)',
      description:
        'This controls only the About page section heading. Testimonial quotes, sources, logos, links, and display order are managed in “Testimonials” in the Studio sidebar and are shared with the Homepage. The Homepage heading is edited separately.',
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
            'Optional image used when the About page is shared. Independent of the Homepage and Shows page share images.',
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
