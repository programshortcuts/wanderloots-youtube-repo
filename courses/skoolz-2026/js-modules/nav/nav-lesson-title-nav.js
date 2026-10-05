import { mainContainer, mainTargetDiv, navLessonTitle } from '../core/elements.js';
import { getLastStep, getSteps } from './step-nav.js';
import { visibleSidebarLinks } from './sidebar-nav.js';
import { isTypingTarget } from './get-focus-zone.js';

export { navLessonTitle };

export function handleNavLessonTitle({ e, navState }) {
    if (navState.zone !== 'navLessonTitle' || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return false;
    if (e.key.toLowerCase() !== 'f') return false;
    const target = mainContainer?.classList.contains('collapsed')
        ? (getLastStep() || getSteps()[0] || mainTargetDiv)
        : visibleSidebarLinks()[0];
    if (!target) return false;
    e.preventDefault();
    target.focus();
    return true;
}
