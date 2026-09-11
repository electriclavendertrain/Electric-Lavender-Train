import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {eventTemplates} from './schemaTypes/templates'
import {structure} from './structure'

/** Sanity Studio configuration and singleton creation guards. */
const SINGLETON_TYPES = [
  'homepage',
  'aboutPage',
  'showsPage',
  'galleryPage',
  'contactPage',
  'musicPage',
]

export default defineConfig({
  name: 'default',
  title: 'elt-sanity',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID as string,
  dataset: process.env.SANITY_STUDIO_DATASET as string,

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Use named event templates and remove singleton creation options.
    templates: (prev) =>
      [
        ...prev.filter(
          (item) => !SINGLETON_TYPES.includes(item.schemaType) && item.schemaType !== 'event',
        ),
        ...eventTemplates,
      ],
  },

  document: {
    // Also remove singleton entries from the global Create menu.
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((item) => !SINGLETON_TYPES.includes(item.templateId))
      }
      return prev
    },
  },
})
