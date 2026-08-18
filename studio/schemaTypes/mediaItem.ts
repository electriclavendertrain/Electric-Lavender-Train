import {defineField, defineType} from 'sanity'
import {getYouTubeVideoId} from './youtube'

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
      description:
        'For YouTube: paste a normal YouTube watch or share link (for example, https://www.youtube.com/watch?v=… or https://youtu.be/…). A privacy-enhanced embed link (https://www.youtube-nocookie.com/embed/…) also works if that is what you have, but you never need to convert one yourself — the public website always plays the video in YouTube’s privacy-enhanced mode once a visitor clicks play, no matter which valid link is entered here. For Vimeo, use a normal vimeo.com link. For another external video, use any valid https:// link.',
      type: 'url',
      hidden: ({document}) => !isVideo(document),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const document = context.document as MediaItemDoc | undefined
          if (!isVideo(document as Record<string, unknown>)) return true
          if (!value) return 'Required for video media items'

          let parsed: URL
          try {
            parsed = new URL(value)
          } catch {
            return 'Must be a valid URL'
          }
          const hostname = parsed.hostname.replace(/^www\./, '')

          const provider = document?.videoProvider
          if (provider === 'youtube') {
            // Not just "is this a YouTube host" — the URL must actually
            // resolve to a playable 11-character video ID, the same check
            // (and the same accepted URL shapes) the public site uses to
            // decide whether to render a play control at all. A channel,
            // playlist, search, or profile URL shares a YouTube hostname
            // with a real video URL but has no video to extract, and would
            // otherwise publish successfully while quietly never playing
            // anything on the live site. See `./youtube.ts`'s doc comment
            // for why this check is duplicated rather than imported from
            // `web/`.
            return (
              getYouTubeVideoId(value) !== null ||
              'Must be a playable YouTube video link — a channel, playlist, search, or profile link is not accepted. Paste a normal watch/share link (youtube.com/watch?v=…, youtu.be/…) or a privacy-enhanced embed link (youtube-nocookie.com/embed/…).'
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
    defineField({
      name: 'category',
      title: 'Gallery category',
      description:
        'Optional. Groups this image under the Media & Merch gallery filters (Performances / Venue & Crowd). Leave unset for "uncategorized" — it still appears in "All" but not under either named filter.',
      type: 'string',
      options: {
        list: [
          {title: 'Performances', value: 'performance'},
          {title: 'Venue & Crowd', value: 'venue-crowd'},
        ],
        layout: 'dropdown',
      },
      hidden: ({document}) => !isImage(document),
    }),
    defineField({
      name: 'creditLine',
      title: 'Media credit',
      description:
        'Optional. The exact approved public attribution text for this photo or video (e.g. "Photo by Jane Doe" or "Video by Jane Doe"). Use only wording the source has approved — never invented or reworded here. A credit is separate from rights permission and does not by itself prove this site has permission to use the media.',
      type: 'string',
      hidden: ({document}) => !isImage(document) && !isVideo(document),
    }),
    defineField({
      name: 'creditUrl',
      title: 'Media credit link',
      description:
        'Optional. Only meaningful when Media credit above is filled in — add a Media credit first.',
      type: 'url',
      hidden: ({document}) => !isImage(document) && !isVideo(document),
      /**
       * Anchored on this primitive `url` field, not the `creditLine` string it
       * depends on, purely because "URL requires a sibling to be set" reads
       * more naturally here — both are primitive fields, so either placement
       * would emit at `error` level (docs/developer-guide.md §5).
       */
      validation: (Rule) =>
        Rule.uri({scheme: ['http', 'https']}).custom((value, context) => {
          if (!value) return true
          const document = context.document as Record<string, unknown> | undefined
          const creditLine = document?.creditLine
          if (typeof creditLine !== 'string' || creditLine.trim().length === 0) {
            return 'Add a Media credit above before adding a credit link.'
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
