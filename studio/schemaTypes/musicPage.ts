import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The Music page singleton, with the fixed `_id: "musicPage"`.
 *
 * Same singleton conventions as every other page singleton: one fixed
 * Structure entry, stripped from `schema.templates` and the global "+" menu
 * (via `SINGLETON_TYPES` in `sanity.config.ts`), queried by that exact
 * `_id`. See docs/developer-guide.md §5.
 *
 * Visible page order: Featured (always rendered, supplies the page's one
 * `<h1>`) → Releases (released music only) → Heavy Crush Records label
 * affiliation.
 *
 * `releases` is ONE ordered array of `musicRelease` references, filtered by
 * Studio's own reference filter to released releases only — the public
 * Music page has no Upcoming Releases section, no countdown, and no
 * upcoming-release UI of any kind. `musicRelease.state` itself is retained
 * as a content-model fact (a release may still be authored as "upcoming"
 * before it's released), but nothing on this page renders that state
 * distinctly, and the frontend defensively excludes any non-released entry
 * that ends up in this list regardless of how it got there.
 *
 * No release titles, dates, artwork, or streaming links are seeded here —
 * inventing any of those would be worse than leaving this page's release
 * list empty until real ELT releases exist.
 */
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
        'Always rendered as the page\'s first section and its one heading — this is never conditionally omitted. The video is optional: the section still renders with just the heading when no video is selected.',
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
      name: 'labelAffiliation',
      title: 'Label affiliation',
      description:
        'A restrained, code-designed acknowledgment of the Heavy Crush Records relationship, rendered on the Music page immediately after Releases. Moved here from the About page — this is now the live owner. The logo image itself is a fixed site asset, not uploaded here — this only manages the wording, its alt text, the destination link, the mission statement, and the label’s social links. Optional: while empty, the section still renders using the same approved wording and links as a built-in default. Treated as one coherent block on the frontend — if any part below is left incomplete, the whole section falls back to the approved defaults rather than mixing live and fallback content. Do not change the factual relationship claim without Hunter’s approval.',
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
          description: 'The label’s official website. Kept as its own field for backward compatibility with the existing “Visit Heavy Crush Records” link.',
          type: 'url',
          validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
        }),
        defineField({
          name: 'missionStatement',
          title: 'Mission statement',
          description: 'A short, editable statement of the label’s mission — rendered beneath the relationship text.',
          type: 'text',
          rows: 2,
          validation: (Rule) => Rule.required(),
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
      name: 'seo',
      title: 'SEO',
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
            'Optional image used when this page is shared. Independent of every other page’s share image.',
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
