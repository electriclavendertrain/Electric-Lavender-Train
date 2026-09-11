/**
 * Validates the public hosted-newsletter destination. The Astro site only
 * links to this URL; it never collects or submits subscriber information.
 */
function isValidNewsletterSignupUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Returns the hosted signup URL or `null` so the UI fails closed. */
export function getNewsletterSignupUrl(): string | null {
  const raw = import.meta.env.PUBLIC_NEWSLETTER_SIGNUP_URL;
  return isValidNewsletterSignupUrl(raw) ? raw : null;
}
