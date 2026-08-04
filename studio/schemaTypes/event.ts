import {defineField, defineType} from 'sanity'

const TIME_ZONE_OPTIONS = {
  displayTimeZone: 'America/Los_Angeles',
  allowTimeZoneSwitch: false,
} as const

const PUBLIC_ONLY_FIELD_NAMES = [
  'title',
  'slug',
  'venue',
  'location',
  'description',
  'externalEventUrl',
] as const

function isPublic(document: Record<string, unknown> | undefined) {
  return document?.visibility === 'public'
}

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'startDateTime',
      title: 'Start date & time',
      type: 'datetime',
      options: TIME_ZONE_OPTIONS,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDateTime',
      title: 'End date & time',
      type: 'datetime',
      description: 'Leave blank when the ending time is unknown.',
      options: TIME_ZONE_OPTIONS,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const start = (context.document as Record<string, unknown> | undefined)
            ?.startDateTime as string | undefined
          if (value && start && value < start) {
            return 'End time cannot be before the start time.'
          }
          return true
        }),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Scheduled', value: 'scheduled'},
          {title: 'Cancelled', value: 'cancelled'},
          {title: 'Postponed', value: 'postponed'},
        ],
        layout: 'radio',
      },
      initialValue: 'scheduled',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      description:
        'Hidden from website is not the same as confidential — if the dataset allows anonymous reads, hidden events can still be read directly. Never store confidential booking details here.',
      options: {
        list: [
          {title: 'Public show', value: 'public'},
          {title: 'Private booking — show date only', value: 'busyOnly'},
          {title: 'Hidden from website', value: 'hidden'},
        ],
        layout: 'radio',
      },
      initialValue: 'public',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      hidden: ({document}) => !isPublic(document),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (isPublic(context.document as Record<string, unknown>) && !value) {
            return 'Required for public shows'
          }
          return true
        }),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      hidden: ({document}) => !isPublic(document),
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          const document = context.document as {_id?: string} | undefined
          if (!isPublic(document)) return true
          if (!value?.current) return 'Required for public shows'

          const {getClient} = context
          const client = getClient({apiVersion: '2024-01-01'})
          const id = document?._id?.replace(/^drafts\./, '')
          const isUnique = await client.fetch(
            `!defined(*[_type == "event" && !(_id in [$draft, $published]) && slug.current == $slug][0]._id)`,
            {draft: `drafts.${id}`, published: id, slug: value.current},
          )
          return isUnique || 'This slug is already used by another event'
        }),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
      hidden: ({document}) => !isPublic(document),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (isPublic(context.document as Record<string, unknown>) && !value) {
            return 'Required for public shows'
          }
          return true
        }),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      hidden: ({document}) => !isPublic(document),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (isPublic(context.document as Record<string, unknown>) && !value) {
            return 'Required for public shows'
          }
          return true
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      hidden: ({document}) => !isPublic(document),
    }),
    defineField({
      name: 'externalEventUrl',
      title: 'Tickets or external event page',
      type: 'url',
      hidden: ({document}) => !isPublic(document),
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
  ],
  validation: (Rule) =>
    Rule.custom((doc) => {
      const document = doc as Record<string, unknown> | undefined
      if (isPublic(document)) return true
      const stalePublicFields = PUBLIC_ONLY_FIELD_NAMES.filter((name) => {
        if (name === 'slug') {
          return Boolean((document?.slug as {current?: string} | undefined)?.current)
        }
        return Boolean(document?.[name])
      })
      if (stalePublicFields.length === 0) return true
      return 'Clear the public show details (title, slug, venue, location, description, ticket link) before saving this as a private or hidden event.'
    }),
  preview: {
    select: {
      title: 'title',
      visibility: 'visibility',
      status: 'status',
      startDateTime: 'startDateTime',
    },
    prepare({title, visibility, status, startDateTime}) {
      const label =
        visibility === 'public'
          ? 'Public show'
          : visibility === 'busyOnly'
            ? 'Private booking'
            : 'Hidden'
      const date = startDateTime
        ? new Date(startDateTime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'America/Los_Angeles',
          })
        : 'No date set'
      const statusSuffix = status && status !== 'scheduled' ? ` · ${status}` : ''
      return {
        title: title || (visibility === 'busyOnly' ? 'Private Event' : 'Untitled event'),
        subtitle: `${label} · ${date}${statusSuffix}`,
      }
    },
  },
})
