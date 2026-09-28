/**
 * Validates the public hosted-newsletter destinations. The Astro site only
 * links to these URLs; it never collects, submits, or proxies subscriber
 * information itself.
 */
function isNonEmptyHttpsUrl(value: string | undefined): value is string {
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
  return isNonEmptyHttpsUrl(raw) ? raw : null;
}

/**
 * Returns the hosted unsubscribe URL or `null` so the UI fails closed.
 * Validated and rendered independently of the signup URL — an opt-out stays
 * available even if signup is temporarily disabled, and vice versa.
 */
export function getNewsletterUnsubscribeUrl(): string | null {
  const raw = import.meta.env.PUBLIC_NEWSLETTER_UNSUBSCRIBE_URL;
  return isNonEmptyHttpsUrl(raw) ? raw : null;
}
