import {UserIcon} from '@sanity/icons/User'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A reusable band-member profile.
 *
 * Ordinary Sanity-generated `_id`s — this is NOT a singleton. The About page
 * selects and orders members through `aboutPage.members`, so adding a member
 * here does not publish them anywhere until they are referenced.
 *
 * Deliberately absent, and to stay absent:
 *
 * - No route slug and no per-member SEO. Member detail pages are deferred and
 *   nothing links to one, so a slug would be dead data (the same reasoning
 *   that keeps `event.slug` out of every Shows query).
 * - No private email, phone, address, or internal notes. The dataset permits
 *   anonymous reads — see docs/developer-guide.md §9. Anything stored here is
 *   public, whatever any query selects.
 * - No layout or style controls. Presentation lives in Astro/CSS.
 * - No placeholder social URLs. A member with no approved link simply has an
 *   empty `publicLinks`, and the frontend omits the link area cleanly.
 *
 * The profile photograph is a Media Library reference so editors can replace,
 * crop, and reassign it without a code change.
 */

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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      description:
        'The complete role as it should read publicly, e.g. "Lead Vocals, Baritone Ukulele".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'profileImage',
      title: 'Profile photo',
      description:
        'Choose an image from the Media Library. Its alt text, crop, and hotspot control both the member card and profile dialog.',
      type: 'reference',
      to: [{type: 'mediaItem'}],
      options: {filter: 'mediaType == "image"'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'biography',
      title: 'Biography',
      description:
        'One to four short paragraphs, shown in this member’s profile dialog. Written by a person and reviewed before publishing — this renders verbatim on a public page.',
      type: 'array',
      of: [defineArrayMember({type: 'text', validation: (Rule) => Rule.required()})],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),
    defineField({
      name: 'publicLinks',
      title: 'Public links',
      description:
        'Optional. Only add accounts and pages this member has approved for publication. Leave empty if there are none — nothing is invented or guessed.',
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
              /**
               * The "Other needs a label" check is anchored HERE, on this
               * primitive string, rather than on the `label` field or the
               * enclosing object.
               *
               * Custom validation attached to an object-typed node is emitted
               * at `warning` level by the installed Sanity version, and Studio
               * only blocks publishing on `error`. Anchored to a primitive it
               * blocks properly. See docs/developer-guide.md §5.
               *
               * `context.parent` is this link object, so the sibling label is
               * read from there rather than from the whole document.
               */
              validation: (Rule) =>
                Rule.required().custom((value, context) => {
                  if (value !== 'other') return true
                  const parent = context.parent as {label?: string} | undefined
                  if (!parent?.label || parent.label.trim().length === 0) {
                    return 'Add a Label describing where this "Other" link goes — it becomes the visible link text.'
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
              validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
            }),
          ],
          preview: {
            select: {linkType: 'linkType', label: 'label', url: 'url'},
            prepare({linkType, label, url}) {
              const typeTitle =
                LINK_TYPES.find((item) => item.value === linkType)?.title ?? 'Link'
              return {
                title: label || typeTitle,
                subtitle: url || 'No URL set',
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.max(6),
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
