import {createImageUrlBuilder} from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url'
import {sanityClient} from './client'

const builder = createImageUrlBuilder(sanityClient)

/**
 * Builds a Sanity CDN image URL respecting hotspot/crop, at the requested
 * output size, with automatic modern-format negotiation. Rendered as a
 * plain <img>, not astro:assets — the CDN already does this optimization
 * for remote sources (docs/phase3-plan.md §18).
 */
export function sanityImageUrl(
  source: SanityImageSource,
  {width, height}: {width: number; height: number},
): string {
  return builder.image(source).width(width).height(height).fit('crop').auto('format').url()
}
