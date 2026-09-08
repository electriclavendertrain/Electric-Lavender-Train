import {defineField, defineType} from 'sanity'

/**
 * A reusable ELT music release. Ordinary generated `_id`s, selected into
 * `musicPage.releases` in editor-chosen order — the same "reusable document
 * + ordered reference array in the page singleton" convention already used
 * by `aboutPage.members`, `galleryPage.gallery.items`, and
 * `galleryPage.merch.items`.
 *
 * `state` decides which of the two page sections a release appears in
 * (Upcoming vs. Released) — it is a fact about the release itself, not
 * something derived from the release date, so a release can be marked
 * "released" the moment it's actually out even if that happens slightly
 * ahead of or behind the stored date.
 *
 * Streaming/pre-save/video links are all optional, deliberately: an
 * upcoming release announced before Spotify/Apple Music links exist must
 * still be publishable. `spotifyUrl`/`appleMusicUrl` are validated against
 * their real hosts (not merely "https") so an editor cannot accidentally
 * publish a lookalike-domain link under a trusted-looking label.
 */
export const musicRelease = defineType({
  name: 'musicRelease',
  title: 'Music Release',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'Optional stable identifier for this release. No public route uses it yet — reserved for a future dedicated release page.',
      type: 'slug',
      options: {source: 'title'},
    }),
    defineField({
      name: 'releaseType',
      title: 'Release type',
      type: 'string',
      options: {
        list: [
          {title: 'Single', value: 'single'},
          {title: 'EP', value: 'ep'},
          {title: 'Album', value: 'album'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'state',
      title: 'State',
      description:
        'Released releases appear on the public Music page. Upcoming releases stay in Studio only — not shown publicly — so you can prepare content ahead of time, then switch this to Released when it’s out.',
      type: 'string',
      options: {
        list: [
          {title: 'Upcoming', value: 'upcoming'},
          {title: 'Released', value: 'released'},
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'releaseDate',
      title: 'Release date',
      description: 'The release date shown alongside this release once it’s Released.',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverArtwork',
      title: 'Cover artwork',
      description:
        'Optional — an upcoming release may be announced before artwork is final. Image media items only; alt text comes from the selected media item.',
      type: 'reference',
      to: [{type: 'mediaItem'}],
      options: {filter: 'mediaType == "image"'},
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Optional, concise. No lyrics and no detailed credits — see docs.',
      type: 'text',
    }),
    defineField({
      name: 'spotifyUrl',
      title: 'Spotify URL',
      description: 'Optional. Must be a real open.spotify.com or spotify.com link.',
      type: 'url',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          let parsed: URL
          try {
            parsed = new URL(value)
          } catch {
            return 'Must be a valid URL'
          }
          if (parsed.protocol !== 'https:') return 'Must be an https:// link'
          const hostname = parsed.hostname.replace(/^www\./, '')
          return (
            hostname === 'open.spotify.com' ||
            hostname === 'spotify.com' ||
            'Must be a real open.spotify.com or spotify.com link — not a lookalike domain'
          )
        }),
    }),
    defineField({
      name: 'appleMusicUrl',
      title: 'Apple Music URL',
      description: 'Optional. Must be a real music.apple.com link.',
      type: 'url',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          let parsed: URL
          try {
            parsed = new URL(value)
          } catch {
            return 'Must be a valid URL'
          }
          if (parsed.protocol !== 'https:') return 'Must be an https:// link'
          return (
            parsed.hostname.replace(/^www\./, '') === 'music.apple.com' ||
            'Must be a real music.apple.com link — not a lookalike domain'
          )
        }),
    }),
    defineField({
      name: 'preSaveUrl',
      title: 'Pre-save URL',
      description:
        'Optional. Pre-save providers vary, so any valid https:// link is accepted — no single provider is hardcoded.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'watchVideoUrl',
      title: 'Watch video URL',
      description:
        'Optional link to a video for this specific release (e.g. a lyric video or visualizer), shown as a plain "Watch Video" link rather than an embedded player. For the one page-level embedded video, use "Featured video" on the Music Page singleton instead.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['https']}),
    }),
  ],
  preview: {
    select: {title: 'title', state: 'state', releaseDate: 'releaseDate', media: 'coverArtwork.image'},
    prepare({title, state, releaseDate, media}) {
      const stateLabel = state === 'released' ? 'Released' : 'Upcoming'
      return {
        title: title || 'Untitled release',
        subtitle: releaseDate ? `${stateLabel} · ${releaseDate}` : stateLabel,
        media,
      }
    },
  },
})
