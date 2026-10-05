// inject-content.js
import { sideBar } from "../ui/toggle-sidebar.js";
import {
    getLastCLICKEDLink,
    setLastCLICKEDLink,
    setLastFocusedLink
} from "../nav/sidebar-state.js";
import { updateSteps } from "../nav/step-nav.js";
import { refreshImages } from "../ui/toggle-img-sizes.js";
import { initCopyCode } from "../ui/copy-code.js";
import { initAllVideos } from "../ui/video-controls.js";
import { changeTutorialLink } from "../ui/change-tutorial-link.js";

export const mainTargetDiv = document.querySelector('#mainTargetDiv');
export const endNxtBtn = document.querySelector('#endNxtBtn');
export const prevBtn = document.querySelector('#prevBtn');

const navTitleH1 = document.querySelector('#navTitle h1');
let lastActivatedSidebarLink = null;
let initialized = false;

function getSidebarLinks() {
    return [...document.querySelectorAll('.side-bar-links-container ul a')];
}

function markActiveLink(link) {
    getSidebarLinks().forEach(item => {
        item.classList.remove('sideLinkChange', 'highlight');
        item.removeAttribute('aria-current');
    });

    link?.classList.add('sideLinkChange', 'highlight');
    link?.setAttribute('aria-current', 'page');
}

async function activateSidebarLink(
    link,
    {
        focusRepeatedLesson = true
    } = {}
) {
    if (!link) return;

    const isRepeatActivation =
        link === lastActivatedSidebarLink;

    lastActivatedSidebarLink = link;

    setLastCLICKEDLink(link);
    setLastFocusedLink(link);

    changeTutorialLink({
        target: link,
        currentTarget: link
    });

    await injectFromHref(link.href);

    markActiveLink(link);

    requestAnimationFrame(() => {
        if (
            isRepeatActivation &&
            focusRepeatedLesson
        ) {
            mainTargetDiv?.focus();

            mainTargetDiv?.scrollIntoView({
                behavior: 'instant',
                block: 'start'
            });

        } else {
            link.focus();
        }
    });
}

async function navigateLesson(
    direction,
    button
) {
    const links = getSidebarLinks();

    if (!links.length) return;

    const current =
        getLastCLICKEDLink();

    const currentIndex =
        links.indexOf(current);

    const startIndex =
        currentIndex === -1
            ? (
                direction > 0
                    ? -1
                    : 0
            )
            : currentIndex;

    const targetIndex =
        (
            startIndex +
            direction +
            links.length
        ) %
        links.length;

    const targetLink =
        links[targetIndex];

    document
        .querySelector('.main-container')
        ?.classList.remove('collapsed');

    await activateSidebarLink(
        targetLink,
        {
            focusRepeatedLesson: false
        }
    );

    /*
    activateSidebarLink() schedules its own focus with RAF.

    Wait TWO frames so all lesson/sidebar focus behavior
    finishes first, then put focus back on Next/Previous.
    */

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (
                button &&
                button.isConnected
            ) {
                button.focus({
                    preventScroll: true
                });
            }
        });
    });
}

function handleLessonButtonKeydown(e) {
    const key = e.key.toLowerCase();
    const steps = [...mainTargetDiv.querySelectorAll('.step-float')];

    if (key === 'a') steps.at(-1)?.focus();
    if (key === 'f') steps[0]?.focus();
    if (key === 'm') {
        mainTargetDiv.focus();
        window.scrollTo(0, 0);
    }
}

export function initInjectContentListeners() {
    if (initialized) return;
    initialized = true;

    endNxtBtn?.addEventListener('click', e => {
        e.preventDefault();

        navigateLesson(
            1,
            endNxtBtn
        );
    });


    prevBtn?.addEventListener('click', e => {
        e.preventDefault();

        navigateLesson(
            -1,
            prevBtn
        );
    });
    endNxtBtn?.addEventListener('keydown', handleLessonButtonKeydown);
    prevBtn?.addEventListener('keydown', handleLessonButtonKeydown);

    sideBar?.addEventListener('focusin', e => {
        const link = e.target.closest('a');
        if (link) setLastFocusedLink(link);
    });

    sideBar?.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;

        e.preventDefault();
        e.stopPropagation();
        activateSidebarLink(link);
        window.scrollTo(0, 0);
    });

    sideBar?.addEventListener('keydown', e => {
        const link = e.target.closest('a');
        if (!link || e.key !== 'Enter') return;

        e.preventDefault();
        e.stopPropagation();
        activateSidebarLink(link);
    });

    const autoLink = getSidebarLinks().find(link => link.hasAttribute('autofocus'));
    if (autoLink) {
        lastActivatedSidebarLink = autoLink;
        setLastCLICKEDLink(autoLink);
        setLastFocusedLink(autoLink);
        changeTutorialLink({ target: autoLink, currentTarget: autoLink });
        markActiveLink(autoLink);
        injectFromHref(autoLink.href).then(() => autoLink.focus());
    } else {
        injectFromHref(mainTargetDiv?.dataset.href || 'home-page.html');
    }
}

export async function injectFromHref(href) {
    if (!href || !mainTargetDiv) return;

    try {
        const response = await fetch(href);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        doc.querySelectorAll('script').forEach(script => script.remove());
        doc.querySelectorAll('[src], [href], [action]').forEach(element => {
            ['src', 'href', 'action'].forEach(attribute => {
                const value = element.getAttribute(attribute);
                if (!value || value === 'undefined') element.removeAttribute(attribute);
            });
        });

        const content =
            doc.querySelector('#targetDivInjected') ||
            doc.querySelector('#targetDiv') ||
            doc.body;

        mainTargetDiv.innerHTML = content.innerHTML;

        const lessonTitle = mainTargetDiv.querySelector('#lessonTitle');
        if (lessonTitle && navTitleH1) {
            navTitleH1.textContent = lessonTitle.textContent.trim();
        }

        mainTargetDiv.scrollTo(0, 0);
        window.scrollTo(0, 0);

        await new Promise(resolve => requestAnimationFrame(resolve));
        refreshImages(mainTargetDiv);
        updateSteps();
        initCopyCode(mainTargetDiv);
        initAllVideos(mainTargetDiv);
    } catch (error) {
        console.error('Failed to load content:', error);
        mainTargetDiv.innerHTML = '<p role="alert">Failed to load lesson content.</p>';
    }

    const autoFocusEl = mainTargetDiv.querySelector('[data-auto-focus]');
    if (autoFocusEl) {
        requestAnimationFrame(() => {
            autoFocusEl.focus();
            autoFocusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
}
