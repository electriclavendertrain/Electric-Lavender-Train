import {UserIcon} from '@sanity/icons/User'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Reusable band member schema. */

const LINK_TYPES = [
  {title: 'Instagram', value: 'instagram'},
  {title: 'Facebook', value: 'facebook'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'Spotify', value: 'spotify'},
  {title: 'Website', value: 'website'},
  {title: 'Other', value: 'other'},
]

export const bandMember = defineType({
  name: 'bandMember',
  title: 'Band member',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('Enter the member’s public name.'),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      description:
        'The complete role as it should read publicly, e.g. "Lead Vocals, Baritone Ukulele".',
      type: 'string',
      validation: (Rule) => Rule.required().error('Enter the member’s public role in the band.'),
    }),
    defineField({
      name: 'profileImage',
      title: 'Profile photo',
      description:
        'Choose an image from the Media Library. Its alt text, crop, and hotspot control both the member card and profile dialog.',
      type: 'reference',
      to: [{type: 'mediaItem'}],
      options: {filter: 'mediaType == "image"'},
      validation: (Rule) => Rule.required().error('Choose the approved profile photograph.'),
    }),
    defineField({
      name: 'biography',
      title: 'Biography',
      description:
        'One to four short paragraphs, shown in this member’s profile dialog. Written by a person and reviewed before publishing — this renders verbatim on a public page.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'text',
          validation: (Rule) => Rule.required().error('Enter text for this biography paragraph.'),
        }),
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .max(4)
          .error('Add between one and four approved biography paragraphs.'),
    }),
    defineField({
      name: 'publicLinks',
      title: 'Public links',
      description:
        'Optional. Add up to six accounts or pages this member has approved for publication. Leave empty if there are none — nothing is invented or guessed.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'publicLink',
          fields: [
            defineField({
              name: 'linkType',
              title: 'Link type',
              type: 'string',
              options: {list: LINK_TYPES, layout: 'dropdown'},
              /** The "Other needs a label" check is anchored HERE, on this primitive string, rather than on the `label` field or the enclosing object. */
              validation: (Rule) =>
                Rule.required().custom((value, context) => {
                  if (value !== 'other') return true
                  const parent = context.parent as {label?: string} | undefined
                  if (!parent?.label || parent.label.trim().length === 0) {
                    return 'Choose a visible Label for this Other link, such as “Official website”.'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              description:
                'Required for "Other" links, which have no standard name. Optional otherwise — the link type supplies the wording.',
              type: 'string',
              // Required-ness for "Other" is enforced on `linkType` above.
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required()
                  .uri({scheme: ['http', 'https']})
                  .error('Enter the full public link, including https://.'),
            }),
          ],
          preview: {
            select: {linkType: 'linkType', label: 'label', url: 'url'},
            prepare({linkType, label, url}) {
              const typeTitle = LINK_TYPES.find((item) => item.value === linkType)?.title ?? 'Link'
              return {
                title: label || typeTitle,
                subtitle: url || 'No URL set',
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.max(6).error('Keep this list to six public links or fewer.'),
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'profileImage.image'},
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Untitled band member',
        subtitle: subtitle || 'No role set',
        media,
      }
    },
  },
})
