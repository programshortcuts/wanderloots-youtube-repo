// keyboard-nav.js
import { popupLetterNav } from "../ui/popups.js";
import { mainContainer } from "../core/main-script.js";
import { getFocusZone } from "./get-focus-zone.js";
import { letterNav } from "./letter-nav.js";
import { sideBarNav } from "./sidebar-nav.js";
import { handleNavLessonTitle } from "./nav-lesson-title-nav.js";
import { getLastStep, stepNav } from "./step-nav.js";
import { mainTargetDiv } from "../core/inject-content.js";
import { getLastCLICKEDLink, getLastFocusedLink } from "./sidebar-state.js";
import { sideBarBtn } from "../ui/toggle-sidebar.js";

export const navState = {
    zone: null,
    isLetterNavEnabled: false
};

export function keyboardNav({ e }) {
    navState.zone = getFocusZone({ e });
    if (!navState.zone) return false;

    if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        e.stopImmediatePropagation();
        popupLetterNav({ e, navState });
        return true;
    }

    if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const topLink = document.querySelector('.page-header a#homelink');
        const sidebarLink = document.querySelector('.side-bar-links-container a:is([href="homepage.html"], [href="home-page.html"])');
        const target = document.activeElement === topLink ? (sidebarLink || topLink) : topLink;
        if (!target) return false;
        e.preventDefault();
        if (sidebarLink && target === sidebarLink) {
            mainContainer.classList.remove('collapsed');
            sideBarBtn?.setAttribute('aria-expanded', 'true');
        }
        target.focus();
        return true;
    }

    if (
        navState.isLetterNavEnabled &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        /^[a-z0-9]$/i.test(e.key)
    ) {
        e.preventDefault();
        e.stopImmediatePropagation();
        letterNav({ e });
        return true;
    }

    if (e.metaKey || e.ctrlKey || e.altKey) return false;

    return routeKey({ e });
}

function routeKey({ e }) {
    const { zone } = navState;
    const key = e.key.toLowerCase();

    const fixedHeaderTargets = {
        b: '#backlink, #backLink',
        c: '#codeComandShortcuts, #codeComShortcutsLink',
        d: '#darkModeBtn'
    };
    const fixedHeaderTarget = fixedHeaderTargets[key];
    if (fixedHeaderTarget) {
        e.preventDefault();
        document.querySelector(fixedHeaderTarget)?.focus();
        return true;
    }

    if (key === 'm') return handleMainFocus({ e, zone });
    if (key === 's') return handleSidebarFocus({ e, zone });

    if (zone === 'navLessonTitle') {
        return !!handleNavLessonTitle({ e, navState });
    }
    if (zone === 'mainTargetDiv') {
        return !!stepNav({ e, navState });
    }
    if (zone === 'sideBar') {
        return !!sideBarNav({ e, navState });
    }

    return false;
}

function handleMainFocus({ e, zone }) {
    e.preventDefault();

    const currentStep = e.target.closest?.('.step-float');
    const lastStep = getLastStep();

    if (currentStep && e.target !== currentStep) {
        currentStep.focus();
        return true;
    }

    if (currentStep && e.target === currentStep) {
        mainTargetDiv?.focus();
        mainTargetDiv?.scrollIntoView({ behavior: 'instant', block: 'start' });
        return true;
    }

    if (e.target === mainTargetDiv && lastStep) {
        lastStep.focus();
        return true;
    }

    if (zone !== 'mainTargetDiv' && lastStep) {
        lastStep.focus();
        return true;
    }

    mainTargetDiv?.focus();
    window.scrollTo(0, 0);
    return true;
}

function handleSidebarFocus({ e, zone }) {
    e.preventDefault();

    const rememberedLink = getLastCLICKEDLink() || getLastFocusedLink();

    if (zone === 'sideBar' && e.target === sideBarBtn) {
        if (!mainContainer.classList.contains('collapsed')) {
            rememberedLink?.focus();
        }
        return true;
    }

    sideBarBtn?.focus();
    window.scrollTo(0, 0);
    return true;
}
