import { mainTargetDiv, navLessonTitle, sideBar, endNxtBtn, prevBtn } from './elements.js';
import { lessonURL, prepareContent } from './content-paths.js';
import {
    clearActiveSidebarLink,
    getLastCLICKEDLink,
    getLastFocusedLink,
    setLastCLICKEDLink,
    setActiveSidebarLink
} from '../nav/sidebar-state.js';
import { updateSteps } from '../nav/step-nav.js';
import { refreshImages } from '../ui/toggle-img-sizes.js';
import { initCopyCode } from '../ui/copy-code.js';
import { initAllVideos } from '../ui/video-controls.js';
import { changeTutorialLink } from '../ui/change-tutorial-link.js';
import { setSidebarExpanded } from '../ui/toggle-sidebar.js';
import { getSidebarSubmenu, revealSidebarLink, setDropdownExpanded } from '../ui/sidebar-dropdowns.js';

export { mainTargetDiv, endNxtBtn, prevBtn };

let initialized = false;
let request = null;
let lastSidebarActivation = null;
const sidebarLinks = () => [...sideBar.querySelectorAll('.side-bar-links a[href]')];
const homeHref = () => mainTargetDiv.dataset.href || 'homepage.html';

function setLessonButtonInjectionLink(link) {
    sideBar?.querySelectorAll('.lesson-button-injecting').forEach(item => {
        item.classList.remove('lesson-button-injecting');
    });
    link?.classList.add('lesson-button-injecting');
}

export async function injectFromHref(
    href,
    sourceLink = null,
    {
        fromLessonButton = false
    } = {}
) {
    if (
        !href ||
        !mainTargetDiv
    ) {
        return null;
    }

    request?.abort();

    const current =
        new AbortController();

    request = current;

    setLessonButtonInjectionLink(
        fromLessonButton
            ? sourceLink
            : null
    );

    mainTargetDiv.setAttribute(
        'aria-busy',
        'true'
    );

    let url;
    let failed = false;


    async function load(path) {
        const target =
            lessonURL(path);

        const response =
            await fetch(
                target,
                {
                    signal:
                        current.signal
                }
            );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        return {
            url: target,
            nodes:
                prepareContent(
                    await response.text(),
                    target
                )
        };
    }


    try {
        let result;


        try {
            result =
                await load(href);

        } catch (error) {

            if (
                current.signal.aborted
            ) {
                return null;
            }

            failed = true;

            setLessonButtonInjectionLink(
                null
            );

            result =
                await load(
                    homeHref()
                );
        }


        if (
            current.signal.aborted
        ) {
            return null;
        }


        url =
            result.url.href;


        mainTargetDiv
            .querySelectorAll('video')
            .forEach(video =>
                video.pause()
            );


        mainTargetDiv.replaceChildren(
            ...result.nodes
        );


        mainTargetDiv.dataset.loadedHref =
            url;


        if (failed) {
            const notice =
                document.createElement(
                    'p'
                );

            notice.setAttribute(
                'role',
                'status'
            );

            notice.textContent =
                'This lesson is unavailable. Showing the module homepage.';

            mainTargetDiv.prepend(
                notice
            );
        }


        mainTargetDiv.scrollTo(
            0,
            0
        );


        refreshImages(
            mainTargetDiv
        );

        updateSteps();

        initCopyCode(
            mainTargetDiv
        );

        initAllVideos(
            mainTargetDiv
        );


        const loadedLink =
            sourceLink?.href === url
                ? sourceLink
                : sidebarLinks()
                    .find(
                        link =>
                            link.href === url
                    );

        const title = navLessonTitle?.querySelector(':scope > h1');
        if (loadedLink && title) {
            title.replaceChildren(
                ...[...loadedLink.childNodes].map(node => node.cloneNode(true))
            );
        }

        /*
        Track lesson for navigation.
        */

        setLastCLICKEDLink(
            loadedLink || null
        );


        /*
        Track lesson visually.

        This is independent from keyboard focus.
        */

        /*
Persistent sidebar effect is ONLY for
Next / Previous button navigation.

Normal sidebar navigation uses :focus.
*/

        if (fromLessonButton) {
            setActiveSidebarLink(
                loadedLink || null
            );
        } else {
            clearActiveSidebarLink();
        }


        changeTutorialLink({
            target:
                loadedLink ||
                mainTargetDiv
        });


        return {
            url,
            failed
        };


    } catch (error) {

        if (
            current.signal.aborted
        ) {
            return null;
        }


        const notice =
            document.createElement(
                'p'
            );


        notice.setAttribute(
            'role',
            'alert'
        );


        notice.textContent =
            'Unable to load this module. Choose a lesson to try again.';


        mainTargetDiv.replaceChildren(
            notice
        );


        delete mainTargetDiv
            .dataset
            .loadedHref;


        updateSteps();


        setLastCLICKEDLink(
            null
        );


        setActiveSidebarLink(
            null
        );


        return null;


    } finally {

        if (
            request === current
        ) {
            mainTargetDiv.removeAttribute(
                'aria-busy'
            );

            setLessonButtonInjectionLink(
                null
            );
        }
    }
}

async function activateSidebarLink(
    link,
    {
        toggleDropdown = true,
        fromLessonButton = false,
        fromSidebarActivation = false,
        preserveFocus = null
    } = {}
) {
    const repeated =
        getLastCLICKEDLink() === link;

    const submenu =
        getSidebarSubmenu(link);

    // Check the state before toggling or focusing the link. A closed submenu
    // must open first, even when this is a consecutive activation.
    const sidebarActivation = fromSidebarActivation
        ? {
            link,
            repeated: lastSidebarActivation?.link === link && (
                !submenu || (
                    !submenu.classList.contains('hide') &&
                    getLastFocusedLink() === link &&
                    repeated
                )
            )
        }
        : null;

    revealSidebarLink(link);

    if (
        toggleDropdown &&
        submenu &&
        !sidebarActivation?.repeated
    ) {
        setDropdownExpanded(
            link,
            submenu.classList.contains('hide')
        );
    }

    /*
    Normal sidebar navigation:
    focus the sidebar link.

    Lesson-button navigation:
    DO NOT steal focus from Next / Previous.
    */

    if (!fromLessonButton) {
        link.focus({
            preventScroll: true
        });

        link.scrollIntoView({
            block: 'nearest'
        });
    }

    // Keep consecutive activations separate from the loaded lesson used by Next / Previous.
    if (fromSidebarActivation) lastSidebarActivation = sidebarActivation;

    const result =
        await injectFromHref(
            link.href,
            link,
            {
                fromLessonButton
            }
        );


    if (!result) {
        return;
    }


    /*
    NEXT / PREVIOUS BUTTON NAVIGATION

    Restore focus to the button that triggered navigation.
    Do this after injection has completely finished.
    */

    if (
        fromLessonButton &&
        preserveFocus?.isConnected
    ) {
        preserveFocus.focus({
            preventScroll: true
        });

        return;
    }


    if (
        document.activeElement !== link
    ) {
        return;
    }

    if (fromSidebarActivation) {
        // A focus change also invalidates an activation whose injection is still pending.
        if (lastSidebarActivation === sidebarActivation && sidebarActivation.repeated) {
            mainTargetDiv.focus({ preventScroll: true });
        }
        return;
    }

    if (result.failed) {

        sidebarLinks()
            .find(
                item =>
                    item.href ===
                    result.url
            )
            ?.focus();

    } else if (repeated) {

        (
            mainTargetDiv.querySelector(
                '.step-float,step'
            ) ||
            mainTargetDiv
        ).focus({
            preventScroll: true
        });

    } else {

        mainTargetDiv
            .querySelector(
                '[data-auto-focus]'
            )
            ?.focus();
    }
}

function navigateLesson(
    direction,
    button
) {
    const links =
        sidebarLinks();

    if (!links.length) {
        return;
    }


    const index =
        links.indexOf(
            getLastCLICKEDLink()
        );


    const start =
        index < 0
            ? (
                direction > 0
                    ? -1
                    : 0
            )
            : index;


    const targetLink =
        links[
        (
            start +
            direction +
            links.length
        ) %
        links.length
        ];


    setSidebarExpanded(true);


    activateSidebarLink(
        targetLink,
        {
            fromLessonButton: true,
            preserveFocus: button
        }
    );
}

export function initInjectContentListeners() {
    if (initialized || !mainTargetDiv || !sideBar) return;
    initialized = true;
    sideBar.addEventListener('click', e => {
        const link = e.target.closest('.side-bar-links a[href]');
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        activateSidebarLink(link, { fromSidebarActivation: true });
    });
    // Native Enter on anchors emits a click; no competing keydown injector.
    sideBar.addEventListener('focusout', e => {
        if (e.target === lastSidebarActivation?.link) lastSidebarActivation = null;
    });
    window.addEventListener('blur', () => {
        lastSidebarActivation = null;
    });
    endNxtBtn?.addEventListener(
        'click',
        () => {
            navigateLesson(
                1,
                endNxtBtn
            );
        }
    );

    endNxtBtn?.addEventListener(
        'blur',
        clearActiveSidebarLink
    );
    prevBtn?.addEventListener(
        'click',
        () => {
            navigateLesson(
                -1,
                prevBtn
            );
        }
    );
    mainTargetDiv.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (target && sideBar.contains(target) && target.matches('a[href]')) {
            e.preventDefault();
            setSidebarExpanded(true);
            activateSidebarLink(target);
        }
    });
    const autoLink = sidebarLinks().find(link => link.hasAttribute('autofocus'));
    if (autoLink) activateSidebarLink(autoLink, { toggleDropdown: false });
    else injectFromHref(homeHref()).then(result => {
        if (result && document.activeElement === document.body) {
            sidebarLinks().find(link => link.href === result.url)?.focus();
        }
    });
}
