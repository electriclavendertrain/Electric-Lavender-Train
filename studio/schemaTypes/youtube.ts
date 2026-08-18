/**
 * Extracts an 11-character YouTube video ID from a full URL, or returns
 * `null` for anything malformed, unsupported, or unrecognized.
 *
 * This exact function is intentionally duplicated at
 * `web/src/lib/youtube.ts`, which the public site uses to decide whether a
 * `mediaItem.videoUrl` is actually playable. `mediaItem.ts`'s `videoUrl`
 * validation below requires this same extraction to succeed before Studio
 * will let a YouTube media item publish — a recognized hostname alone
 * (e.g. a channel or playlist URL) is not enough; there must be a real
 * video ID. `studio/` and `web/` are two separate npm packages with no
 * shared workspace, so keeping one imported module isn't the "least
 * complicated" option here — an explicit, mirrored copy is. **If you
 * change the accepted URL shapes, the ID pattern, or the host lists below,
 * make the identical change in `web/src/lib/youtube.ts` in the same
 * commit.** Both files carry this same warning.
 */

const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/

/** Hosts that serve real watch/embed/shorts pages. */
const YOUTUBE_WATCH_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com'])

/** youtube-nocookie.com only ever serves `/embed/<id>` — it has no
 * `/watch` or `/shorts` pages, so those paths must NOT be accepted here
 * just because the hostname matches. This is deliberately a separate set
 * from `YOUTUBE_WATCH_HOSTS`, routed through a narrower branch below. */
const YOUTUBE_EMBED_ONLY_HOSTS = new Set(['youtube-nocookie.com', 'www.youtube-nocookie.com'])

export function getYouTubeVideoId(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  // Reject non-HTTPS (http:, or any other scheme) outright — a YouTube
  // video URL is never legitimately anything else.
  if (parsed.protocol !== 'https:') return null

  let id: string | null = null

  if (parsed.hostname === 'youtu.be') {
    id = parsed.pathname.slice(1)
  } else if (YOUTUBE_WATCH_HOSTS.has(parsed.hostname)) {
    if (parsed.pathname === '/watch') {
      id = parsed.searchParams.get('v')
    } else if (parsed.pathname.startsWith('/embed/')) {
      id = parsed.pathname.slice('/embed/'.length)
    } else if (parsed.pathname.startsWith('/shorts/')) {
      id = parsed.pathname.slice('/shorts/'.length)
    }
  } else if (YOUTUBE_EMBED_ONLY_HOSTS.has(parsed.hostname)) {
    if (parsed.pathname.startsWith('/embed/')) {
      id = parsed.pathname.slice('/embed/'.length)
    }
  }

  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null
}
