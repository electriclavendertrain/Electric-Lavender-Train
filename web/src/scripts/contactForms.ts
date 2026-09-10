/**
 * Contact & Booking page: the inquiry switcher, and each form's validation.
 * Two independent features in one file, mirroring `mediaGallery.ts`'s split
 * — neither fetches anything on page load, and neither does this file: the
 * FIRST valid submission is an ordinary browser `POST` straight to the
 * form's own `action` (Formspree), not something this script constructs,
 * intercepts, or ever calls `preventDefault()`/`fetch` on. Formspree's
 * built-in CAPTCHA protection stays enabled — an AJAX
 * (`fetch`/`Accept: application/json`) submission is deliberately not used,
 * since that combination is what Formspree rejects without a separate,
 * custom reCAPTCHA integration this project isn't adding. See
 * `docs/contact-booking.md` §9.
 *
 * What this script DOES do around that native submission, once a form is
 * confirmed valid: disable its submit button and swap its label to
 * "Sending…" so a second `submit` event (a rapid double-click, or pressing
 * Enter twice) is discarded rather than firing a duplicate navigation — see
 * the `resetPendingState`/`submitting` handling near the bottom of this
 * file. That pending state is purely cosmetic and never blocks the first,
 * genuinely valid submission. It also resets automatically if the visitor
 * returns to this exact page via the browser's back/forward cache (the
 * `pageshow`/`persisted` handling below), so the button never gets stuck
 * showing "Sending…" after a completed trip to Formspree and back.
 *
 * The server-rendered form carries NO `novalidate` (see `ContactForms.astro`'s
 * doc comment), so native `required`/`type`/`maxlength`/`pattern` validation
 * is what a no-JS visitor gets — and it is what actually blocks an invalid
 * no-JS submission; this script never runs for that visitor at all. This
 * script adds `novalidate` itself, per form, ONLY once it has confirmed that
 * form is actually configured and about to be driven by the enhanced
 * validation below — never unconditionally, and never for a fail-closed
 * (unconfigured) form, which keeps native validation as the only thing
 * standing between it and... nothing, since its submit button is already
 * disabled either way.
 */

import { contactCopy } from "../data/contactData";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARACTERS_PATTERN = /^\+?[0-9() .-]+$/;
const WHOLE_DOLLAR_PATTERN = /^\d+$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;
/** Same rule as `contactData.ts`'s `REQUIRES_LETTER_PATTERN` (the native
 * `pattern` fallback) — this is the authoritative check whenever JavaScript
 * runs. At least one Unicode letter anywhere in the value; every other
 * character (digits, spaces, hyphens, apostrophes, periods, diacritics) is
 * unrestricted, so legitimate names and product names are never rejected. */
const REQUIRES_LETTER_PATTERN = /\p{L}/u;
const MAX_ITEM_PARAM_LENGTH = 200;
const ALLOWED_INQUIRIES = ["booking", "merch", "other", "removal"];

/* -------------------------------------------------------------------------
 * Inquiry switcher — ARIA tabs pattern, automatic activation.
 *
 * Hidden until this script confirms it can wire the tabs up; every panel's
 * `hidden` attribute is only ever set here — the server-rendered markup has
 * none, so a script failure or unavailability leaves all four forms
 * visible in document order with no dead switcher control.
 * ---------------------------------------------------------------------- */

const switcher = document.querySelector<HTMLElement>("[data-inquiry-switcher]");
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-inquiry-tab]"));
const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-inquiry-panel]"));

function normalizeInquiry(value: string | null): string {
  return value && ALLOWED_INQUIRIES.includes(value) ? value : "booking";
}

function selectInquiry(value: string, options: { focus?: boolean; updateUrl?: boolean } = {}) {
  for (const tab of tabs) {
    const isSelected = tab.dataset.inquiryTab === value;
    tab.setAttribute("aria-selected", isSelected ? "true" : "false");
    tab.tabIndex = isSelected ? 0 : -1;
    if (isSelected && options.focus) tab.focus();
  }
  for (const panel of panels) {
    panel.hidden = panel.dataset.inquiryPanel !== value;
  }
  if (options.updateUrl !== false) {
    const url = new URL(window.location.href);
    url.searchParams.set("inquiry", value);
    window.history.replaceState(null, "", url);
  }
}

if (switcher && tabs.length > 0 && panels.length > 0) {
  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      const value = tab.dataset.inquiryTab;
      if (value) selectInquiry(value);
    });
  }

  switcher.addEventListener("keydown", (event) => {
    const currentIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      const value = tabs[nextIndex].dataset.inquiryTab;
      if (value) selectInquiry(value, { focus: true });
    }
  });

  switcher.classList.add("is-active");

  // Initialize from `?inquiry=`; an invalid or missing value falls back to
  // Booking. Does not touch the URL on load — only actual switching does.
  const initialParams = new URLSearchParams(window.location.search);
  selectInquiry(normalizeInquiry(initialParams.get("inquiry")), { updateUrl: false });

  // Merch item prefill: plain text only, never HTML, capped and treated as
  // opaque display text rather than a product-record lookup. Capped at the
  // field's own `maxlength` (set from `contactData.ts`'s centralized limit)
  // so the URL-prefill cap and the field's real limit can never drift apart.
  const itemParam = initialParams.get("item");
  if (itemParam) {
    const merchItemField = document.querySelector<HTMLInputElement>("[data-merch-item-field]");
    if (merchItemField) {
      const cap = merchItemField.maxLength > 0 ? merchItemField.maxLength : MAX_ITEM_PARAM_LENGTH;
      merchItemField.value = itemParam.slice(0, cap);
    }
  }
}

/* -------------------------------------------------------------------------
 * Per-form validation and submission.
 * ---------------------------------------------------------------------- */

/**
 * Validates every named field in `form`, including each field's own
 * `maxlength` (client-side courtesy only — see `contactData.ts`'s doc
 * comment on `ContactFieldConfig.maxLength`). Returns the first invalid
 * field, if any, so the caller can move focus to it — never logs field
 * values.
 */
function validateForm(form: HTMLFormElement): HTMLElement | null {
  let firstInvalid: HTMLElement | null = null;

  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-field]"),
  );

  for (const field of fields) {
    const errorEl = document.getElementById(`${field.id}-error`);
    const label = field.dataset.label ?? field.name;
    const value = field.value.trim();
    let message = "";

    if (field.required && !value) {
      message = contactCopy.validation.required(label);
    } else if (field instanceof HTMLInputElement && field.type === "email" && value && !EMAIL_PATTERN.test(value)) {
      message = contactCopy.validation.email;
    } else if (field.dataset.validationKind === "phone" && value) {
      const digitCount = value.replace(/\D/g, "").length;
      if (!PHONE_CHARACTERS_PATTERN.test(value) || digitCount < 7 || digitCount > 15) {
        message = contactCopy.validation.phone;
      }
    } else if (field.dataset.validationKind === "budget" && value) {
      const amount = Number(value);
      if (!WHOLE_DOLLAR_PATTERN.test(value) || !Number.isSafeInteger(amount) || amount < 0) {
        message = contactCopy.validation.budget;
      }
    } else if (field.dataset.validationKind === "requiresLetter" && value) {
      if (!REQUIRES_LETTER_PATTERN.test(value)) {
        message = contactCopy.validation.requiresLetter(label);
      }
    } else if (field.dataset.validationKind === "positiveInteger" && value) {
      const amount = Number(value);
      if (!WHOLE_NUMBER_PATTERN.test(value) || !Number.isSafeInteger(amount) || amount <= 0) {
        message = contactCopy.validation.positiveInteger(label);
      }
    } else if (field.dataset.validationKind === "url" && value) {
      // Format only: a syntactically valid absolute http(s) URL. No network
      // request, no existence check, no domain restriction — see
      // `contactData.ts`'s doc comment on the `contentLocation` field.
      let isValidHttpUrl = false;
      try {
        isValidHttpUrl = ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        isValidHttpUrl = false;
      }
      if (!isValidHttpUrl) {
        message = contactCopy.validation.url;
      }
    }

    // `maxLength` is independent of every check above, not a final fallback
    // among them: a field can carry BOTH a `validationKind` AND a
    // `maxLength` (Name, Phone, Merchandise Item, and Content URL all do —
    // see `contactData.ts`), so a value that passes its format check must
    // still be rejected if it's too long. Only skipped when a
    // higher-priority error (required/email/format) already applies, so
    // the existing error priority is unchanged — this only adds a check
    // that a same-field `validationKind` branch previously skipped by
    // being chained as a mutually exclusive `else if`.
    if (!message && !(field instanceof HTMLSelectElement) && field.maxLength >= 0 && value.length > field.maxLength) {
      message = contactCopy.validation.tooLong(label, field.maxLength);
    }

    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }
      if (!firstInvalid) firstInvalid = field;
    } else {
      field.removeAttribute("aria-invalid");
      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = "";
      }
    }
  }

  return firstInvalid;
}

const forms = Array.from(document.querySelectorAll<HTMLFormElement>("[data-inquiry-form]"));

/**
 * Every enabled form's pending-state resetter, collected so the single
 * `pageshow` listener below (registered once, not once per form) can reset
 * all of them together. A page returned to via the browser's back/forward
 * cache (bfcache) — e.g. a visitor who submitted, arrived at Formspree, then
 * pressed Back — restores this exact frozen DOM/JS state rather than
 * re-running this script, so without this the button would stay disabled
 * and reading "Sending…" forever. `event.persisted` is `true` only for a
 * genuine bfcache restore, never an ordinary load, so this can't affect
 * anything else.
 */
const resetPendingState: Array<() => void> = [];
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  for (const reset of resetPendingState) reset();
});

for (const form of forms) {
  const deliveryConfigured = form.dataset.deliveryConfigured === "true";

  // `form.action` (the DOM property) is not used here — it resolves to the
  // current page URL when the `action` ATTRIBUTE is absent, so it is always
  // truthy and cannot signal "unconfigured." `getAttribute` returns the
  // literal attribute value instead: the real endpoint when configured, or
  // `null` when `ContactForms.astro` omitted it. Not otherwise used by this
  // script — the browser reads the same attribute itself at submit time.
  const endpoint = form.getAttribute("action");

  // The submit button's disabled state is decided at build time in
  // ContactForms.astro from that inquiry type's OWN delivery endpoint —
  // this file never flips it on, and never wires up enhanced validation for
  // a form with nowhere to actually deliver to (a configured contact email
  // does not change this — the two are separate states).
  if (!deliveryConfigured || !endpoint) continue;

  // Only now — confirmed this exact form is real and configured, and about
  // to be driven by the accessible custom validation below — suppress
  // native browser validation UI in favor of it. See this file's module doc
  // comment for why this must not happen unconditionally or earlier.
  form.setAttribute("novalidate", "");

  const submitButton = form.querySelector<HTMLButtonElement>("[data-inquiry-submit]");
  const submitLabel = form.querySelector<HTMLElement>("[data-submit-label]");
  let submitting = false;

  resetPendingState.push(() => {
    submitting = false;
    if (submitButton) submitButton.disabled = false;
    if (submitLabel) submitLabel.textContent = contactCopy.submitLabel;
  });

  form.addEventListener("submit", (event) => {
    const firstInvalid = validateForm(form);
    if (firstInvalid) {
      // Invalid: block this submission and never enter the pending state —
      // a rejected submission must leave the button exactly as it was.
      event.preventDefault();
      firstInvalid.focus();
      return;
    }

    if (submitting) {
      // A second `submit` event (e.g. a rapid double-click or double Enter)
      // fired before the browser has actually navigated away from the
      // first, already-valid submission — this one is discarded. The FIRST
      // valid submission itself is never prevented; only a genuine repeat
      // of it is.
      event.preventDefault();
      return;
    }

    // Valid, and the first such submission: do NOT call `preventDefault()`
    // and do NOT `fetch` — the browser submits this ordinary
    // `<form method="POST" action="…">` exactly as it would with no
    // JavaScript at all, so Formspree sees a normal navigation and its
    // hosted CAPTCHA/response flow applies. See this file's module doc
    // comment for why AJAX is deliberately not used. The only thing this
    // branch does is give the visitor a pending-state cue and block a
    // duplicate — it never blocks the navigation itself.
    submitting = true;
    if (submitButton) submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = contactCopy.submittingLabel;
  });
}
