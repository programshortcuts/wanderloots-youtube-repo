import { pageWrapper, navLessonTitle } from '../core/elements.js';

let initialized = false;

export function initHeaderScroll() {
    if (initialized || !pageWrapper) return;
    initialized = true;
    const header = pageWrapper.querySelector('.page-header');
    const rows = [header, navLessonTitle].filter(Boolean);
    let previousHeight = -1;

    function updateHeaderHeight() {
        const height = rows.reduce((sum, row) => sum + row.getBoundingClientRect().height, 0);
        if (height === previousHeight) return;
        previousHeight = height;
        pageWrapper.style.setProperty('--module-header-height', `${height}px`);
    }

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    rows.forEach(row => observer.observe(row));
}
