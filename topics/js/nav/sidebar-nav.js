// sidebar-nav.js
import {
    getLastCLICKEDLink,
    getLastFocusedLink,
    setLastFocusedLink
} from "./sidebar-state.js";
import { sideBar, sideBarBtn } from "../ui/toggle-sidebar.js";
import { mainTargetDiv } from "../core/inject-content.js";
import { getLastStep, getSteps } from "./step-nav.js";
import { tutorialLink } from "../ui/change-tutorial-link.js";

export const sideBarAs = document.querySelectorAll('.side-bar-links-container ul a');
export const sideBarAsARRAY = [...sideBarAs];

let iSideBarAs = 0;
let initialized = false;

export function setIndexSideBarAs(index) {
    iSideBarAs = index;
}

export function getIndexSideBarAs() {
    return iSideBarAs;
}

function isVisible(element) {
    return !!element && element.offsetParent !== null;
}

function visibleSidebarLinks() {
    return sideBarAsARRAY.filter(isVisible);
}

function focusSidebarLink(link) {
    if (!link) return false;
    iSideBarAs = sideBarAsARRAY.indexOf(link);
    setLastFocusedLink(link);
    link.focus();
    return true;
}

export function initSideBarListeners() {
    if (initialized) return;
    initialized = true;

    sideBarAsARRAY.forEach((link, index) => {
        link.addEventListener('focus', () => {
            iSideBarAs = index;
            setLastFocusedLink(link);
        });
    });

    sideBarBtn?.addEventListener('focus', () => window.scrollTo(0, 0));
    sideBarBtn?.addEventListener('keydown', handleSidebarButtonKeydown);
}

function handleSidebarButtonKeydown(e) {
    const key = e.key.toLowerCase();

    if (key === 'f') {
        e.preventDefault();
        focusSidebarLink(visibleSidebarLinks()[0]);
    }

    if (/^[1-9]$/.test(key)) {
        e.preventDefault();
        focusSidebarLink(visibleSidebarLinks()[Number(key) - 1]);
    }

    if (key === 'm') {
        e.preventDefault();
        const lastStep = getLastStep();
        const steps = getSteps();
        (lastStep || steps[0] || mainTargetDiv)?.focus();
    }

    if (key === 's') {
        e.preventDefault();
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer?.classList.contains('collapsed')) {
            mainContainer.classList.remove('collapsed');
            sideBarBtn?.setAttribute('aria-expanded', 'true');
        }
        const remembered = getLastCLICKEDLink() || getLastFocusedLink();
        remembered?.focus();
    }
}

export function sideBarNav({ e, navState }) {
    if (navState.zone !== 'sideBar' || !e?.key) return false;

    const key = e.key.toLowerCase();
    const visibleLinks = visibleSidebarLinks();

    if (/^[1-9]$/.test(key)) {
        e.preventDefault();
        return focusSidebarLink(visibleLinks[Number(key) - 1]);
    }

    if (key === 'f' || key === 'a') {
        if (!visibleLinks.length) return false;
        e.preventDefault();

        const activeIndex = visibleLinks.indexOf(document.activeElement);
        const startIndex = activeIndex === -1
            ? (key === 'f' ? -1 : 0)
            : activeIndex;
        const direction = key === 'f' ? 1 : -1;
        const nextIndex = (startIndex + direction + visibleLinks.length) % visibleLinks.length;
        return focusSidebarLink(visibleLinks[nextIndex]);
    }

    if (key === 's') {
        e.preventDefault();
        sideBarBtn?.focus();
        return true;
    }

    if (key === 'm') {
        e.preventDefault();
        const lastStep = getLastStep();
        (lastStep || mainTargetDiv)?.focus();
        return true;
    }

    if (key === 't') {
        e.preventDefault();
        tutorialLink?.focus();
        window.scrollTo(0, 0);
        return true;
    }

    return false;
}
