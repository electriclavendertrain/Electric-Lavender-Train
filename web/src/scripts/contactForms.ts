/**
 * Contact & Booking page: the inquiry switcher, and each form's validate-
 * then-submit behavior. Two independent features in one file, mirroring
 * `mediaGallery.ts`'s split — neither fetches anything on page load.
 *
 * Submission itself is delegated entirely to `formDelivery.ts` — this file
 * has no idea Formspree exists beyond calling `submitForm(endpoint, data)`
 * and reacting to whether that resolved `ok`.
 *
 * The server-rendered form carries NO `novalidate` (see `ContactForms.astro`'s
 * doc comment), so native `required`/`type`/`maxlength` validation is what a
 * no-JS visitor gets. This script adds `novalidate` itself, per form, ONLY
 * once it has confirmed that form is actually configured and about to be
 * driven by the enhanced submit flow below — never unconditionally, and
 * never for a fail-closed (unconfigured) form, which keeps native validation
 * as the only thing standing between it and... nothing, since its submit
 * button is already disabled either way.
 */

import { contactCopy } from "../data/contactData";
import { submitForm } from "../lib/formDelivery";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    } else if (!(field instanceof HTMLSelectElement) && field.maxLength >= 0 && value.length > field.maxLength) {
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

for (const form of forms) {
  const deliveryConfigured = form.dataset.deliveryConfigured === "true";
  const submitButton = form.querySelector<HTMLButtonElement>("[data-inquiry-submit]");
  const submitLabel = form.querySelector<HTMLElement>("[data-submit-label]");
  const statusEl = form.querySelector<HTMLElement>("[data-form-status]");
  const errorEl = form.querySelector<HTMLElement>("[data-form-error]");

  // `form.action` (the DOM property) is not used here — it resolves to the
  // current page URL when the `action` ATTRIBUTE is absent, so it is always
  // truthy and cannot signal "unconfigured." `getAttribute` returns the
  // literal attribute value instead: the real endpoint when configured, or
  // `null` when `ContactForms.astro` omitted it.
  const endpoint = form.getAttribute("action");

  // The button's disabled state is decided at build time in
  // ContactForms.astro from that inquiry type's OWN delivery endpoint —
  // this file never flips it on, and never wires up an enhanced submit
  // flow for a form with nowhere to actually deliver to (a configured
  // contact email does not change this — the two are separate states).
  if (!deliveryConfigured || !submitButton || !endpoint) continue;

  // Only now — confirmed this exact form is real, configured, and about to
  // be driven by the accessible custom validation below — suppress native
  // browser validation UI in favor of it. See this file's module doc
  // comment for why this must not happen unconditionally or earlier.
  form.setAttribute("novalidate", "");

  let submitting = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submitting) return;

    const firstInvalid = validateForm(form);
    if (firstInvalid) {
      if (statusEl) statusEl.hidden = true;
      if (errorEl) errorEl.hidden = true;
      firstInvalid.focus();
      return;
    }

    void (async () => {
      submitting = true;
      submitButton.disabled = true;
      if (submitLabel) submitLabel.textContent = contactCopy.submittingLabel;
      if (statusEl) statusEl.hidden = true;
      if (errorEl) errorEl.hidden = true;

      try {
        // Trim before use — the server-side equivalent must also enforce
        // this at the receiving end (docs/contact-booking.md); this is a
        // courtesy, not a security boundary.
        const data: Record<string, string> = {};
        for (const [key, value] of new FormData(form).entries()) {
          if (typeof value === "string") data[key] = value.trim();
        }

        const result = await submitForm(endpoint, data);
        if (!result.ok) throw new Error("Submission failed");

        form.reset();
        if (statusEl) {
          statusEl.textContent = contactCopy.successMessage;
          statusEl.hidden = false;
          statusEl.focus();
        }
      } catch {
        if (errorEl) {
          errorEl.textContent = contactCopy.errorMessage;
          errorEl.hidden = false;
          errorEl.focus();
        }
      } finally {
        submitting = false;
        submitButton.disabled = false;
        if (submitLabel) submitLabel.textContent = contactCopy.submitLabel;
      }
    })();
  });
}
