/**
 * Shared Studio-side validation for a public Google Forms visitor link.
 * Used by every "share something with us via Google Form" field
 * (`galleryPage.eventMediaSubmission.formUrl`,
 * `aboutPage.testimonialSubmission.formUrl`) so the accepted URL *shape*
 * cannot drift between them. Re-validated independently at render time in
 * `web/src/sanity/normalize.ts`'s `safeGoogleFormUrl` — this function binds
 * the Studio UI only, not the Content API.
 */
export function validateGoogleFormUrl(value: string | undefined): true | string {
  if (!value) return true
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return 'Must be a valid URL'
  }
  if (parsed.protocol !== 'https:') return 'Must be an https:// link'
  if (parsed.username || parsed.password) {
    return 'Must not contain a username or password in the URL'
  }
  const hostname = parsed.hostname.replace(/^www\./, '')
  // Each host accepts exactly one specific URL *shape*, not merely "any
  // non-empty path under it" — that looser check previously let through
  // malformed paths like docs.google.com/forms/not-a-form.
  if (hostname === 'forms.gle') {
    return (
      /^\/[^/]+$/.test(parsed.pathname) ||
      'Must be a real forms.gle short link with its own code, e.g. forms.gle/AbCdEfGh — not the bare forms.gle root or a multi-segment path'
    )
  }
  if (hostname === 'docs.google.com') {
    return (
      /^\/forms\/d\/e\/[^/]+\/viewform$/.test(parsed.pathname) ||
      'Must be a real docs.google.com/forms/d/e/<id>/viewform link (query parameters for a prefilled form are fine) — not the bare /forms/ root, an arbitrary /forms/... path, a /edit link, or a /formResponse endpoint'
    )
  }
  return 'Must be a real docs.google.com/forms/... link or a forms.gle/... short link'
}
