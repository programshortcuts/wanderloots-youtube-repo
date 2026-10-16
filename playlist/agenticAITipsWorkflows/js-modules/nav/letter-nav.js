import { mainTargetDiv, mainContainer } from '../core/elements.js';
import { isTypingTarget } from './get-focus-zone.js';

let lastLetterPressed = null;

function navigationLabel(element) {
    const explicit = element.dataset.navTarget?.trim() || element.id?.trim();
    if (explicit) return explicit.toLowerCase();
    const source = element.matches('.step-float,.step')
        ? element.querySelector('h1, h2, h3, h4, h5, h6')
        : element;

    console.log(source);

    return source?.textContent?.trim().toLowerCase() || '';
}

export function isActuallyVisible(element) {
    if (!element || element.closest('[hidden], [inert]')) return false;
    if (mainContainer?.classList.contains('collapsed') && element.closest('.side-bar') && element.id !== 'sideBarBtn') return false;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const bounds = element.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0;
}

export function letterNav({ e }) {
    if (!e.key || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return false;
    const key = e.key.toLowerCase();
    if (!/^[a-z0-9]$/.test(key)) return false;
    const candidates = [...document.querySelectorAll('a[href], button, [tabindex], [data-nav-target],.  step-float,.step, .side-bar a')]
        .filter(element => !element.disabled && isActuallyVisible(element));
    const matches = candidates.filter(element => navigationLabel(element).startsWith(key));
    if (!matches.length) return false;
    const activeIndex = matches.indexOf(document.activeElement);
    const targetIndex = key !== lastLetterPressed || activeIndex < 0
        ? (e.shiftKey ? matches.length - 1 : 0)
        : (activeIndex + (e.shiftKey ? -1 : 1) + matches.length) % matches.length;
    const target = matches[targetIndex];
    if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
    target.focus();
    if (target === mainTargetDiv) window.scrollTo(0, 0);
    lastLetterPressed = key;
    return document.activeElement === target;
}
