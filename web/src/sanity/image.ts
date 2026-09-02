import {createImageUrlBuilder} from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url'
import {sanityClient} from './client'

const builder = createImageUrlBuilder(sanityClient)

/**
 * Builds a Sanity CDN image URL respecting hotspot/crop, with automatic
 * modern-format negotiation. Rendered as a plain <img>, not astro:assets —
 * the CDN already does this optimization for remote sources
 * (docs/phase3-plan.md §18).
 *
 * `height` is optional and deliberately so: passing both width AND height
 * forces Sanity to crop to that exact aspect ratio (used for the fixed-shape
 * social-share image). Passing width alone requests the image at its
 * natural (or manually-cropped) aspect ratio with no forced crop — used by
 * the homepage gallery, which renders each image into several different
 * final shapes across tile positions and breakpoints and instead applies
 * the focal point itself via CSS `object-position` (see
 * `normalize.ts`'s `computeObjectPosition`) so one downloaded image stays
 * correctly framed in every shape, rather than pre-cropping to one shape
 * and then re-cropping it again with a generic center crop.
 */
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

/**
 * Builds a `srcset` string from a list of candidate widths — each candidate
 * is a width-only request (same crop/hotspot behavior as `sanityImageUrl`,
 * no forced aspect ratio), so the browser can pick whichever candidate best
 * matches the viewport instead of one caller always downloading the largest
 * request. Candidates should never exceed the width already requested via
 * `sanityImageUrl` for that same image — this narrows what's requested on
 * small screens, it never widens it.
 */
export function sanityImageSrcSet(source: SanityImageSource, widths: number[]): string {
  return widths
    .map((width) => `${builder.image(source).width(width).auto('format').url()} ${width}w`)
    .join(', ')
}
