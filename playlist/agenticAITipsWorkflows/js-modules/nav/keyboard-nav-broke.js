// keyboard-nav.js
import { isActuallyVisible, letterNav } from './letter-nav.js';
import { getLastCLICKEDLink, getLastFocusedLink } from './sidebar-state.js';
import { getSidebarFocusTarget, sideBarNav } from './sidebar-nav.js';
import { handleNavLessonTitle } from './nav-lesson-title-nav.js';
import { endNxtBtn, prevBtn } from '../core/elements.js';
import { getFocusZone, isTypingTarget } from './get-focus-zone.js';
import { getLastStep, getSteps, stepNav } from './step-nav.js';
import { popupLetterNav } from '../ui/popups.js';

export const navState = { zone: null, isLetterNavEnabled: false };



export function keyboardNav({ e }) {
    if (e.defaultPrevented || !e.key || isTypingTarget(e.target)) return false;
    navState.zone = getFocusZone({ e });
    const key = e.key.toLowerCase();
    if (e.metaKey && e.shiftKey && !e.ctrlKey && !e.altKey && key === 'x') {
        e.preventDefault();
        popupLetterNav({ e, navState });
        return true;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return false;

    handleZones({ e, navState });
}
function handleZones({ e, navState, key }) {
    if (key === 's') {
        const rememberedLink = [getLastCLICKEDLink(), getLastFocusedLink()].find(link =>
            link?.isConnected && sideBar?.contains(link) && link.matches('a[href]') &&
            !link.closest('.drop-snips.hide') && isActuallyVisible(link)
        );
        if (navState.zone === 'mainTargetDiv' && (
            e.target === mainTargetDiv ||
            (e.target.matches?.('.step-float') && isActuallyVisible(e.target))
        )) {
            return focusTarget(e, rememberedLink || sideBarBtn);
        }
        if (e.target === rememberedLink) return focusTarget(e, sideBarBtn, true);
        if (navState.zone === 'sideBar' && e.target !== sideBarBtn) return sideBarNav({ e, navState });
        if (e.target !== sideBarBtn) return focusTarget(e, sideBarBtn, true);
        setSidebarExpanded(true);
        return focusTarget(e, getSidebarFocusTarget());
    }
    if (key === 't') return focusTarget(e, tutorialLink, true);
    if (key === 'e') return focusTarget(e, endNxtBtn);
    if (key === 'p') return focusTarget(e, prevBtn);
    if (key === 'n') return focusTarget(e, navLessonTitle);
    if (key === 'm') { return handleMainLandingNav(e); }
    if (navState.zone === 'navLessonTitle') { return handleNavLessonTitle({ e, navState }); }
    if (navState.zone === 'mainTargetDiv') { return stepNav({ e, navState }); }
    if (navState.zone === 'sideBar') { return sideBarNav({ e, navState }); }

    if (navState.zone === 'lessonButtons' && (key === 'f' || key === 'a')) {
        const steps = getSteps();
        return focusTarget(e, key === 'f' ? steps[0] : steps.at(-1));
    }
    return false;
}
function focusTarget(e, target, scrollTop = false) {
    console.log(target);
    if (!target) return false;
    e.preventDefault();
    target.focus();
    if (scrollTop) window.scrollTo(0, 0);

    return true;
}
function handleMainLandingNav(e) {
    const step = e.target.closest?.('.step-float');
    const lastStep = getLastStep();
    if (step && e.target !== step) return focusTarget(e, step);
    if (step) return focusTarget(e, mainTargetDiv, true);
    if (lastStep) return focusTarget(e, lastStep);
    if (e.target === sideBarBtn && getSteps()[0]) return focusTarget(e, getSteps()[0]);
    return focusTarget(e, mainTargetDiv, true);
}
