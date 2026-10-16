import { sideBar } from '../core/elements.js';

let lastFocusedLink = null;
let lastClickedLink = null;


/* =========================================================
   LAST FOCUSED LINK

   Only tracks focus.
   Does NOT remove active/highlight styling.
   ========================================================= */

export function setLastFocusedLink(link) {
    if (
        !link ||
        !sideBar?.contains(link)
    ) {
        return;
    }

    lastFocusedLink = link;
}


/* =========================================================
   ACTIVE SIDEBAR LINK

   Controls the visible lesson background independently
   from keyboard focus.
   ========================================================= */

export function setActiveSidebarLink(link) {
    if (
        link &&
        !sideBar?.contains(link)
    ) {
        return;
    }

    sideBar
        ?.querySelectorAll(
            '.side-bar-links-container a'
        )
        .forEach(item => {

            const active =
                item === link;

            item.classList.toggle(
                'sideLinkChange',
                active
            );

            item.classList.toggle(
                'highlight',
                active
            );

            item.classList.toggle(
                'active',
                active
            );

            if (active) {
                item.setAttribute(
                    'aria-current',
                    'page'
                );
            } else {
                item.removeAttribute(
                    'aria-current'
                );
            }
        });
}


/* =========================================================
   GETTERS
   ========================================================= */

export const getLastFocusedLink =
    () => lastFocusedLink;


export const getLastCLICKEDLink =
    () => lastClickedLink;


/* =========================================================
   LAST CLICKED LINK
   ========================================================= */

export function setLastCLICKEDLink(link) {
    lastClickedLink = link;
}


export function clearLastCLICKEDLink() {
    lastClickedLink = null;
}


/* =========================================================
   CLEAR FOCUS STATE

   Do NOT clear lesson-active styling here.
   ========================================================= */

export function clearLastFocusedLink() {
    lastFocusedLink = null;
}


/* =========================================================
   CLEAR ACTIVE LESSON STATE
   ========================================================= */

export function clearActiveSidebarLink() {
    setActiveSidebarLink(null);
} 