/**
 * Human-readable name for the Sanity dataset this Studio build edits.
 *
 * The hosted Studio has its dataset fixed at deploy time from
 * SANITY_STUDIO_DATASET, so these labels tell an editor which content the
 * Studio will change: the Studio title, the browser tab, the "Website Content"
 * header, and (on any dataset other than production) the navbar banner.
 */
export function datasetLabel(dataset: string | undefined): string {
  switch (dataset) {
    case 'production':
      return 'Production'
    case 'development':
      return 'Development'
    default:
      return dataset || 'Unknown dataset'
  }
}

export function isProductionDataset(dataset: string | undefined): boolean {
  return dataset === 'production'
}
