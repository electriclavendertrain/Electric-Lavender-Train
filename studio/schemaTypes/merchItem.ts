import {TagIcon} from '@sanity/icons/Tag'
import {defineField, defineType} from 'sanity'

/**
 * A reusable, editorial, inquiry-only merchandise item.
 *
 * Ordinary Sanity-generated `_id`s — this is NOT a singleton. Display order is
 * controlled entirely by `galleryPage.merch.items`, the same "reference array
 * order is render order" convention as `homepage.featuredMedia` and
 * `aboutPage.members`, so no `displayOrder` field is added here.
 *
 * Deliberately absent, and to stay absent — this is editorial content, not a
 * commerce record:
 *
 * - No numeric price or currency field. `priceDisplay` is free display text
 *   (e.g. "$25" or "Ask for pricing"), never a number a checkout could total.
 * - No SKU, inventory/stock count, size or variant selection, or shipping/tax
 *   fields. `availabilityNote` is a free-text note, not an inventory system.
 * - No cart, order, or payment-related field of any kind.
 */
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description:
        'A short editorial description. This page is inquiry-only — do not describe the item as available for direct purchase, and do not mention a cart, checkout, or order.',
      type: 'text',
      validation: (Rule) => Rule.required(),
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
