import {createImageUrlBuilder} from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url'
import {sanityClient} from './client'

const builder = createImageUrlBuilder(sanityClient)

/** Builds Sanity image URLs while preserving crop and hotspot data. */
export function sanityImageUrl(
  source: SanityImageSource,
  {width, height}: {width: number; height?: number},
): string {
  let image = builder.image(source).width(width).auto('format')
  if (height) {
    image = image.height(height).fit('crop')
  }
  return image.url()
}

/** Builds a `srcset` string from a list of candidate widths — each candidate is a width-only request (same crop/hotspot behavior as `sanityImageUrl`, no forced aspect ratio), so the browser can pick whichever candidate best matches the viewport instead of one… */
export function sanityImageSrcSet(source: SanityImageSource, widths: number[]): string {
  return widths
    .map((width) => `${builder.image(source).width(width).auto('format').url()} ${width}w`)
    .join(', ')
}
