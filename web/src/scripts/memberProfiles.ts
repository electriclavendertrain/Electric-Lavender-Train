/**
 * Member profile dialogs — the whole browser-side story for /about.
 *
 * What this script does NOT do is most of the point. It does not build a
 * backdrop, trap focus, make the background inert, or handle Escape: native
 * `showModal()` already does all of that correctly, and reimplementing any of
 * it would be strictly worse. This adds three things the platform leaves to
 * the page:
 *
 * 1. Opening the dialog when a card's control is activated, without navigating.
 * 2. Returning focus to the exact control that opened it.
 * 3. Locking background scroll while modal.
 *
 * If `showModal` is unavailable, nothing below runs and `.js-dialogs` is never
 * added — which leaves the `:target` CSS fallback in `MemberProfileDialog`
 * active, so the profiles stay reachable. That check is duplicated by a tiny
 * inline script in `about.astro`, which sets the class before first paint so a
 * deep link cannot flash the fallback panel; this module sets it again, so the
 * behavior is correct even if the inline script is stripped.
 */

const supportsModalDialog =
  typeof HTMLDialogElement !== "undefined" &&
  typeof HTMLDialogElement.prototype.showModal === "function";

if (supportsModalDialog) {
  const SCROLL_LOCK_CLASS = "member-dialog-open";

  const dialogs = Array.from(
    document.querySelectorAll<HTMLDialogElement>("dialog[data-member-dialog]"),
  );
  const triggers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-member-dialog-open]"),
  );

  if (dialogs.length > 0) {
    document.documentElement.classList.add("js-dialogs");
  }

  /**
   * The control focus returns to on close. Held here rather than read from
   * `document.activeElement` at close time, because by then focus is inside
   * the dialog that is closing.
   */
  let returnFocusTo: HTMLElement | null = null;

  const findTriggerFor = (dialogId: string) =>
    triggers.find((trigger) => trigger.dataset.memberDialogOpen === dialogId) ?? null;

  const openDialog = (dialog: HTMLDialogElement, trigger: HTMLElement | null) => {
    if (dialog.open) return;
    returnFocusTo = trigger;
    dialog.showModal();
    document.documentElement.classList.add(SCROLL_LOCK_CLASS);
  };

  for (const trigger of triggers) {
    const dialogId = trigger.dataset.memberDialogOpen;
    if (!dialogId) continue;

    const dialog = document.getElementById(dialogId);
    if (!(dialog instanceof HTMLDialogElement)) continue;

    trigger.addEventListener("click", (event) => {
      // Leave modified clicks alone — someone deliberately opening this in a
      // new tab should get the page with the fragment, not a suppressed click.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      openDialog(dialog, trigger);
    });
  }

  for (const dialog of dialogs) {
    for (const control of dialog.querySelectorAll<HTMLElement>(
      "[data-member-dialog-close]",
    )) {
      control.addEventListener("click", (event) => {
        // Without scripting this control is a real link back to the section
        // heading. With scripting, closing is the better behavior and the URL
        // is left alone.
        event.preventDefault();
        dialog.close();
      });
    }

    // Backdrop dismissal is NOT handled here. The usual `event.target ===
    // dialog` trick only works when the dialog box fills the viewport; this one
    // is sized to its panel, so a click outside it lands on inert background
    // content and produces no event on the dialog at all. The markup asks the
    // platform for it declaratively instead, with `closedby="any"`.

    // Fires for the close control, light dismissal, AND Escape (which
    // raises `cancel` and then `close`), so focus return and the scroll lock
    // are handled in exactly one place.
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove(SCROLL_LOCK_CLASS);

      // A dialog opened by deep link leaves its fragment in the URL; clearing
      // it means the same link can be opened again, and a later back/forward
      // navigation does not silently reopen it.
      if (window.location.hash === `#${dialog.id}`) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }

      returnFocusTo?.focus();
      returnFocusTo = null;
    });
  }

  /**
   * Deep links, and the narrow window between the inline class being set and
   * this module running during which a click can still navigate.
   */
  const openFromHash = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const dialog = document.getElementById(id);
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (!dialog.hasAttribute("data-member-dialog")) return;

    openDialog(dialog, findTriggerFor(id));
  };

  openFromHash();
  window.addEventListener("hashchange", openFromHash);
}
