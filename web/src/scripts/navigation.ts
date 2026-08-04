/**
 * Header scroll state + accessible mobile navigation.
 * The burger button doubles as the close control (no redundant second
 * button): its accessible name and icon state change between open/closed.
 * While open: focus is trapped inside the menu, background content
 * (brand link, main, footer) is made inert, and the menu auto-closes if
 * the viewport crosses into the desktop breakpoint.
 */

const header = document.getElementById("site-header");
const toggle = document.getElementById("nav-toggle");
const toggleLabel = document.getElementById("nav-toggle-label");
const menu = document.getElementById("primary-navigation");
const brandLink = document.getElementById("brand-link");

if (header) {
  const updateHeaderState = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  };
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

if (toggle && toggleLabel && menu) {
  const menuLinks = Array.from(menu.querySelectorAll<HTMLElement>("a, button"));
  // Focus trap includes the visible toggle itself as the first/last stop
  // (Close menu -> Home -> ... -> Book Us -> Close menu), since it's the
  // only visible close control while the overlay is open.
  const menuFocusables = [toggle, ...menuLinks];
  const backgroundInertTargets = [
    brandLink,
    document.getElementById("main-content"),
    document.querySelector("footer"),
  ].filter((el): el is HTMLElement => Boolean(el));

  // Mirrors the CSS mobile-nav breakpoint (max-width: 900px).
  const desktopBreakpoint = window.matchMedia("(min-width: 901px)");

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeMenu();
      return;
    }
    if (event.key !== "Tab" || menuFocusables.length === 0) return;

    const first = menuFocusables[0];
    const last = menuFocusables[menuFocusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onBreakpointChange = (event: MediaQueryListEvent) => {
    if (event.matches && toggle!.getAttribute("aria-expanded") === "true") {
      const activeElement = document.activeElement as HTMLElement | null;
      closeMenu(false);
      activeElement?.blur();
    }
  };

  function setState(isOpen: boolean) {
    toggle!.setAttribute("aria-expanded", String(isOpen));
    toggle!.classList.toggle("is-open", isOpen);
    toggleLabel!.textContent = isOpen ? "Close menu" : "Open menu";
    menu!.classList.toggle("is-open", isOpen);
    menu!.setAttribute("aria-hidden", String(!isOpen));
    menu!.toggleAttribute("inert", !isOpen);
    document.documentElement.classList.toggle("nav-open", isOpen);
    backgroundInertTargets.forEach((el) => el.toggleAttribute("inert", isOpen));
  }

  function openMenu() {
    setState(true);
    menuFocusables[0]?.focus();
    document.addEventListener("keydown", onKeydown);
    desktopBreakpoint.addEventListener("change", onBreakpointChange);
  }

  function closeMenu(returnFocus = true) {
    setState(false);
    document.removeEventListener("keydown", onKeydown);
    desktopBreakpoint.removeEventListener("change", onBreakpointChange);
    if (returnFocus) toggle!.focus();
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuLinks.forEach((link) =>
    link.addEventListener("click", () => closeMenu(false))
  );
}
