const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/**
 * Extracts an 11-character YouTube video ID from a full URL (watch, share,
 * shorts, or embed form). Returns null for anything malformed or
 * unrecognized so callers can treat "no video" and "bad URL" the same way —
 * neither should render an active play control.
 */
export function getYouTubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  let id: string | null = null;

  if (parsed.hostname === "youtu.be") {
    id = parsed.pathname.slice(1);
  } else if (YOUTUBE_HOSTS.has(parsed.hostname)) {
    if (parsed.pathname === "/watch") {
      id = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/embed/")) {
      id = parsed.pathname.slice("/embed/".length);
    } else if (parsed.pathname.startsWith("/shorts/")) {
      id = parsed.pathname.slice("/shorts/".length);
    }
  }

  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}
