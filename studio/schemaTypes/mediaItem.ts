import {defineField, defineType} from 'sanity'

type MediaItemDoc = {
  mediaType?: 'image' | 'video'
  videoProvider?: 'youtube' | 'vimeo' | 'other'
}

function isVideo(document: Record<string, unknown> | undefined) {
  return (document as MediaItemDoc | undefined)?.mediaType === 'video'
}

function isImage(document: Record<string, unknown> | undefined) {
  return (document as MediaItemDoc | undefined)?.mediaType === 'image'
}

export const mediaItem = defineType({
  name: 'mediaItem',
  title: 'Media item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'The display title/caption for this item.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaType',
      title: 'Media type',
      type: 'string',
      options: {
        list: [
          {title: 'Image', value: 'image'},
          {title: 'Video', value: 'video'},
        ],
        layout: 'radio',
      },
      /**
       * The "an image item must actually have an image" check lives HERE, on
       * the primitive `mediaType` string, not on the `image` field itself.
       *
       * Why: custom validation attached to an object-typed field (`image` is
       * one) is emitted at `warning` level by the installed Sanity version,
       * and Studio only blocks publishing on `error`. Anchored to this
       * primitive field instead, the same check blocks publishing.
       */
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          if (value !== 'image') return true
          const document = context.document as Record<string, unknown> | undefined
          if (!document?.image) {
            return 'Upload an image in the Image field below before publishing an image media item.'
          }
          return true
        }),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      hidden: ({document}) => !isImage(document),
      // Required-ness is enforced on `mediaType` above — a custom rule here
      // would only ever produce a non-blocking warning.
    }),
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      hidden: ({document}) => !isImage(document),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (isImage(context.document as Record<string, unknown>) && !value) {
            return 'Required for image media items'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoProvider',
      title: 'Video provider',
      type: 'string',
      options: {
        list: [
          {title: 'YouTube', value: 'youtube'},
          {title: 'Vimeo', value: 'vimeo'},
          {title: 'Other external video', value: 'other'},
        ],
        layout: 'radio',
      },
      hidden: ({document}) => !isVideo(document),
      /**
       * Two checks live here: the provider is required for video items, and —
       * for the "Other external video" provider — a poster image must exist.
       * The poster check is anchored to this primitive string rather than to
       * the object-typed `videoPoster` field, because custom validation on an
       * object field is only ever emitted as a non-blocking warning.
       */
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const document = context.document as Record<string, unknown> | undefined
          if (!isVideo(document)) return true
          if (!value) return 'Required for video media items'
          if (value === 'other' && !document?.videoPoster) {
            return 'Upload a Video poster below — no reliable thumbnail can be assumed for "Other external video."'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      hidden: ({document}) => !isVideo(document),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const document = context.document as MediaItemDoc | undefined
          if (!isVideo(document as Record<string, unknown>)) return true
          if (!value) return 'Required for video media items'

          let hostname: string
          try {
            hostname = new URL(value).hostname.replace(/^www\./, '')
          } catch {
            return 'Must be a valid URL'
          }

          const provider = document?.videoProvider
          if (provider === 'youtube') {
            return (
              ['youtube.com', 'm.youtube.com', 'youtu.be'].includes(hostname) ||
              'Must be a YouTube URL'
            )
          }
          if (provider === 'vimeo') {
            return hostname === 'vimeo.com' || 'Must be a Vimeo URL'
          }
          if (provider === 'other') {
            return value.startsWith('https://') || 'Must be a valid https:// URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoPoster',
      title: 'Video poster',
      description:
        'Optional for YouTube/Vimeo (a provider thumbnail may be used instead). Required for "Other external video," since no reliable thumbnail can be assumed.',
      type: 'image',
      options: {hotspot: true},
      hidden: ({document}) => !isVideo(document),
      // Required-ness for the "other" provider is enforced on `videoProvider`
      // above — a custom rule here would only ever produce a warning.
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      mediaType: 'mediaType',
      videoProvider: 'videoProvider',
    },
    prepare({title, media, mediaType, videoProvider}) {
      const providerLabel =
        videoProvider === 'youtube'
          ? 'YouTube'
          : videoProvider === 'vimeo'
            ? 'Vimeo'
            : videoProvider === 'other'
              ? 'Other'
              : 'no provider set'
      return {
        title: title || 'Untitled media item',
        subtitle: mediaType === 'video' ? `Video · ${providerLabel}` : 'Image',
        media,
      }
    },
  },
})
