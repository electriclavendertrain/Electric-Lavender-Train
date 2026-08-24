/**
 * The newsletter signup boundary — isolates the one thing that would change
 * if the hosted-newsletter provider ever changes (currently planned as
 * Brevo): the destination URL a visitor's click sends them to. Nothing else
 * on the site — `Newsletter.astro`'s markup, the Hero's quieter link, the
 * Footer link, or the Contact page's compact CTA — needs to change if the
 * provider changes, as long as the new provider still offers a hosted
 * signup page reachable by a plain URL. Mirrors the isolation
 * `web/src/lib/formDelivery.ts` already applies to Formspree.
 *
 * `PUBLIC_NEWSLETTER_SIGNUP_URL` is public, not a secret — like a Formspree
 * endpoint, it's a value that's visible in a plain `<a href>` regardless of
 * how it reaches the browser — but it stays genuinely unset until the site
 * owner has actually configured a hosted signup page. An unset or invalid
 * value fails closed: `getNewsletterSignupUrl()` returns `null`, no fake or
 * guessed URL is ever substituted, and `Newsletter.astro` renders a clear
 * development/configuration notice instead of a link that would otherwise
 * look functional. No submission is ever attempted from this site — the
 * button, once configured, only ever navigates to the provider's own
 * hosted form.
 */

/** A real signup destination must be `https://` — never `http://`, and
 * never a bare unset/blank value trusted as-is. */
function isValidNewsletterSignupUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * The real "is the hosted newsletter signup ready" check. Returns the
 * validated URL, or `null` if missing/malformed — every caller must treat
 * `null` as "not configured yet" and fail closed rather than guessing a
 * placeholder destination.
 */
export function getNewsletterSignupUrl(): string | null {
  const raw = import.meta.env.PUBLIC_NEWSLETTER_SIGNUP_URL;
  return isValidNewsletterSignupUrl(raw) ? raw : null;
}
