// sidebar-dropdowns.js
import { sideBar } from '../core/elements.js';
import { isTypingTarget } from '../nav/get-focus-zone.js';
// This is ai script, not sure if it's better, i'm doing it different for 
let initialized = false;

export function getSidebarSubmenu(link) {
    if (!link?.matches('.drop-down')) return null;
    return link.closest('li')?.querySelector(':scope > .drop-snips') || null;
}

export function setDropdownExpanded(link, expanded) {
    const submenu = getSidebarSubmenu(link);
    if (!submenu) return;
    submenu.classList.toggle('hide', !expanded);
    submenu.inert = !expanded;
    link.setAttribute('aria-expanded', String(expanded));
}

export function getSidebarParentLink(link) {
    const submenu = link?.closest('.drop-snips:not(.side-bar-links)');
    return submenu?.parentElement.querySelector(':scope > a.drop-down') || null;
}

export function revealSidebarLink(link) {
    let parent = getSidebarParentLink(link);
    while (parent) {
        setDropdownExpanded(parent, true);
        parent = getSidebarParentLink(parent);
    }
}

export function initSidebarDropdowns() {
    if (initialized || !sideBar) return;
    initialized = true;
    sideBar.querySelectorAll('.drop-down').forEach(link => {
        const submenu = getSidebarSubmenu(link);
        if (submenu) setDropdownExpanded(link, submenu.classList.contains('show'));
    });
    sideBar.addEventListener('keydown', e => {
        if (e.defaultPrevented || e.key !== ' ' || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
        const link = e.target.closest('.drop-down');
        const submenu = getSidebarSubmenu(link);
        if (!submenu) return;
        e.preventDefault();
        setDropdownExpanded(link, submenu.classList.contains('hide'));
    });
}
