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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
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
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (isVideo(context.document as Record<string, unknown>) && !value) {
            return 'Required for video media items'
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
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const document = context.document as MediaItemDoc | undefined
          if (isVideo(document as Record<string, unknown>) && document?.videoProvider === 'other' && !value) {
            return 'Required when the video provider is "Other" — no reliable thumbnail can be assumed.'
          }
          return true
        }),
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
