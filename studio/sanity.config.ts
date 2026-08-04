import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {eventTemplates} from './schemaTypes/templates'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'elt-sanity',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID as string,
  dataset: process.env.SANITY_STUDIO_DATASET as string,

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Replace the auto-generated "event" template with the two named entry
    // points, and drop the auto-generated "homepage" template entirely so
    // the singleton can never be created from the generic Create menu.
    templates: (prev) =>
      [...prev.filter((item) => item.schemaType !== 'homepage' && item.schemaType !== 'event'), ...eventTemplates],
  },

  document: {
    // Belt-and-suspenders: also strip any leftover "homepage" entry from the
    // global "+" Create menu specifically, independent of the templates
    // array filtering above.
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((item) => item.templateId !== 'homepage')
      }
      return prev
    },
  },
})
