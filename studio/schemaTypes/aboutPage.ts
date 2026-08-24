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
      kicker: 'About the Band',
      heading: 'The Electric Lavender Train',
      lede: 'Dynamic rock ’n’ roll and exhilarating takes on the hit songs audiences know and love, played up and down California’s Central Coast.',
    },
    story: {
      kicker: 'Our Story',
      heading: 'Rooted in the Central Coast',
      paragraphs: [
        'Electric Lavender Train plays the songs people already know and love, with enough energy to fill a dance floor and enough ease to keep a room comfortable. Winery patios, bar lounges, outdoor concerts, resorts, private celebrations — the set changes with the room, the enthusiasm does not.',
        'The band is based on California’s Central Coast and plays across it. A night with ELT is meant to feel like a good night out: familiar hits, a band clearly enjoying itself, and a crowd that ends up singing along.',
      ],
    },
    labelAffiliation: {
      kicker: 'Our Label',
      text: 'The Electric Lavender Train is part of Heavy Crush Records.',
      logoAlt: 'Heavy Crush Records logo',
      url: 'https://www.heavycrushrecords.com/',
    },
    membersIntro: {
      kicker: 'The Lineup',
      heading: 'Meet the Band',
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
          name: 'lede',
          title: 'Lede',
          description: 'One short paragraph introducing the band.',
          type: 'text',
          validation: (Rule) => Rule.required(),
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
      name: 'story',
      title: 'Our story',
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
          description:
            'One to four short paragraphs. Avoid stating a formation date or origin details that have not been confirmed.',
          type: 'array',
          of: [defineArrayMember({type: 'text', validation: (Rule) => Rule.required()})],
          validation: (Rule) => Rule.required().min(1).max(4),
        }),
      ],
    }),
    defineField({
      name: 'labelAffiliation',
      title: 'Label affiliation',
      description:
        'A restrained, code-designed acknowledgment of the Heavy Crush Records relationship, rendered between Our Story and Meet the Band. The logo image itself is a fixed site asset, not uploaded here — this only manages the wording, its alt text, and the destination link. Optional: while empty, the section still renders using the same approved wording and link as a built-in default. Do not change the factual relationship claim without Hunter’s approval.',
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
          description: 'Keep to the approved wording: “The Electric Lavender Train is part of Heavy Crush Records.”',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'logoAlt',
          title: 'Logo alternative text',
          description: 'Accessible description of the Heavy Crush Records logo image.',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'url',
          title: 'Heavy Crush Records URL',
          type: 'url',
          validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
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
      name: 'experience',
      title: 'The ELT experience',
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
