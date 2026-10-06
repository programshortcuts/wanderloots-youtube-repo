// sidebar-nav.js
import { setSidebarExpanded } from '../ui/toggle-sidebar.js';
import { sideBar, sideBarBtn, mainContainer, mainTargetDiv, tutorialLink } from '../core/elements.js';
import {
    clearActiveSidebarLink,
    getLastCLICKEDLink,
    getLastFocusedLink,
    setLastFocusedLink
} from './sidebar-state.js';
import { getLastStep, getSteps } from './step-nav.js';
import { isTypingTarget } from './get-focus-zone.js';
import { isActuallyVisible } from './letter-nav.js';
import { getSidebarParentLink, initSidebarDropdowns } from '../ui/sidebar-dropdowns.js';

export const sideBarAs = sideBar?.querySelectorAll('.side-bar-links-container ul a') || [];
export const sideBarAsARRAY = [...sideBarAs];
let index = 0;
let initialized = false;

export const getIndexSideBarAs = () => index;
export function setIndexSideBarAs(value) { index = value; }
export function getSidebarLinks() {
    return [...(sideBar?.querySelectorAll('.side-bar-links-container ul a') || [])];
}
export function visibleSidebarLinks() { return getSidebarLinks().filter(isActuallyVisible); }
export function getSidebarFocusTarget() {
    return [getLastCLICKEDLink(), getLastFocusedLink(), ...getSidebarLinks()].find(isActuallyVisible);
}

export function focusSidebarLink(link) {
    if (!link) return false;
    link.focus();
    return document.activeElement === link;
}

export function initSideBarListeners() {
    if (initialized || !sideBar) return;
    initialized = true;
    initSidebarDropdowns();
    sideBar.addEventListener('focusin', e => {
        const link =
            e.target.closest(
                '.side-bar-links-container a'
            );

        if (!link) return;

        /*
        Once actual keyboard focus enters the sidebar,
        normal :focus styling takes over.
    
        There must never be a second persistent highlight.
        */
        clearActiveSidebarLink();

        index =
            getSidebarLinks().indexOf(link);

        setLastFocusedLink(link);
    });
    sideBarBtn?.addEventListener('focus', () => window.scrollTo(0, 0));
    const focused = document.activeElement;
    if (focused?.matches('.side-bar-links-container a')) setLastFocusedLink(focused);
}

export function sideBarNav({ e, navState }) {
    if (navState.zone !== 'sideBar' || !e.key || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return false;
    const key = e.key.toLowerCase();
    const links = visibleSidebarLinks();
    let target = null;

    if (/^[1-9]$/.test(key)) {
        const scope = e.target.closest('.drop-snips:not(.side-bar-links)') || sideBar.querySelector('.side-bar-links');
        const numberedLinks = [...(scope?.querySelectorAll(':scope > li > a[href]') || [])].filter(isActuallyVisible);
        target = numberedLinks[Number(key) - 1];
    }
    if (key === 'f' || key === 'a') {
        const direction = key === 'f' && !e.shiftKey ? 1 : -1;
        const activeIndex = links.indexOf(document.activeElement);
        const start = activeIndex < 0 ? (direction > 0 ? -1 : 0) : activeIndex;
        target = links[(start + direction + links.length) % links.length];
    }
    if (key === 's') {
        if (e.target === sideBarBtn) {
            setSidebarExpanded(true);
            target = getSidebarFocusTarget();
        } else target = getSidebarParentLink(e.target) || sideBarBtn;
    }
    if (key === 'm') target = getLastStep() || getSteps()[0] || mainTargetDiv;
    if (key === 't') target = tutorialLink;
    if (!target) return false;
    e.preventDefault();
    target.focus();
    if (key === 't') window.scrollTo(0, 0);
    return true;
}
