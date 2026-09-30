import {TagIcon} from '@sanity/icons/Tag'
import {defineField, defineType} from 'sanity'

/** Reusable inquiry-only merchandise schema. */
export const merchItem = defineType({
  name: 'merchItem',
  title: 'Merch item',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('Enter the public merchandise item name.'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description:
        'A short editorial description. This page is inquiry-only — do not describe the item as available for direct purchase, and do not mention a cart, checkout, or order.',
      type: 'text',
      validation: (Rule) => Rule.required().error('Enter a short public description of this item.'),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description:
        'Optional. Choose an image from the Media Library. With no image, the item renders as a polished text-only card.',
      type: 'reference',
      to: [{type: 'mediaItem'}],
      options: {filter: 'mediaType == "image"'},
    }),
    defineField({
      name: 'priceDisplay',
      title: 'Price (display text)',
      description:
        'Optional display-only text, e.g. "$25" or "Ask for pricing." This is editorial text, not a commerce price — there is no numeric price or currency field.',
      type: 'string',
    }),
    defineField({
      name: 'availabilityNote',
      title: 'Availability note',
      description:
        'Optional short note, e.g. "Limited sizes available." This is editorial text, not an inventory or stock system.',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'priceDisplay', media: 'image.image'},
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Untitled merch item',
        subtitle: subtitle || 'No price text set',
        media,
      }
    },
  },
})
