// letter-nav.js
import { mainTargetDiv } from "../core/inject-content.js";

let lastLetterPressed = null;

function navigationLabel(element) {
    const navTarget = element.dataset.navTarget?.trim().toLowerCase();
    if (navTarget) return navTarget;

    const id = element.id?.trim().toLowerCase();
    if (id) return id;

    const textSource = element.matches('.step-float')
        ? element.querySelector('h1, h2, h3, h4, h5, h6')
        : element;

    return textSource?.textContent?.trim().toLowerCase() || '';
}

export function letterNav({ e }) {
    if (!e?.key || e.metaKey || e.ctrlKey || e.altKey) return false;

    const key = e.key.toLowerCase();
    if (!/^[a-z0-9]$/.test(key)) return false;

    const candidates = [...new Set([
        ...document.querySelectorAll('a, [id], [data-nav-target], .step-float')
    ])].filter(element => {
        if (element === mainTargetDiv) return true;
        return isActuallyVisible(element);
    });

    const matching = candidates.filter(element => navigationLabel(element).startsWith(key));
    if (!matching.length) return false;

    const activeIndex = matching.indexOf(document.activeElement);
    let targetIndex;

    if (key !== lastLetterPressed || activeIndex === -1) {
        targetIndex = e.shiftKey ? matching.length - 1 : 0;
    } else {
        targetIndex = e.shiftKey
            ? (activeIndex - 1 + matching.length) % matching.length
            : (activeIndex + 1) % matching.length;
    }

    const target = matching[targetIndex];
    target?.focus();
    if (target === mainTargetDiv) window.scrollTo(0, 0);

    lastLetterPressed = key;
    return true;
}

export function isActuallyVisible(element) {
    if (!element) return false;

    if (
        document.querySelector('.main-container')?.classList.contains('collapsed') &&
        element.closest('.side-bar') &&
        element.id !== 'sideBarBtn'
    ) {
        return false;
    }

    const style = getComputedStyle(element);
    if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
    ) {
        return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
