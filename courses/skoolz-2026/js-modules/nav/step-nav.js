// step-nav.js
import {
    mainTargetDiv,
    tutorialLink
} from '../core/elements.js';
import {
    changeTutorialLink
} from '../ui/change-tutorial-link.js';
import {
    denlargeAllImages,
    clickToggleImgSize
} from '../ui/toggle-img-sizes.js';
import {
    resetVideoToPoster
} from '../ui/video-controls.js';
import {
    isTypingTarget
} from './get-focus-zone.js';
let steps = [];
let lastStep = null;
let initialized = false;
/* =========================================================
   HELPERS
   ========================================================= */
const mediaIn = step =>
    [
        ...(
            step?.querySelectorAll(
                '.step-img, .step-vid'
            ) || []
        )
    ];
const itemsIn = step =>
    [
        ...(
            step?.querySelectorAll(
                '.copy-code, a[href]'
            ) || []
        )
    ];
const getStepActivationFocusTarget = step =>
    step?.querySelector('.copy-code') ||
    step?.querySelector('a[href]') ||
    null;
const resetVideos = step =>
    step
        ?.querySelectorAll('video')
        .forEach(resetVideoToPoster);
/* =========================================================
   EXPORTS
   ========================================================= */
export const getSteps = () =>
    steps;
export const getLastStep = () =>
    lastStep?.isConnected
        ? lastStep
        : null;
/* =========================================================
   SCROLL TO CENTER
   ========================================================= */
export function scrollToCenter({
    el,
    smooth = false
} = {}) {
    el?.scrollIntoView({
        behavior:
            smooth
                ? 'smooth'
                : 'instant',
        block: 'center',
        inline: 'center'
    });
}
/* =========================================================
   FOCUS ACTUAL STEP
   This remains step-only.
   Number keys continue to work specifically against
   .step-float elements.
   ========================================================= */
function focusStep(index) {
    if (!steps.length) {
        return false;
    }
    const step =
        steps[
        (
            index +
            steps.length
        ) %
        steps.length
        ];
    lastStep = step;
    step.focus({
        preventScroll: true
    });
    scrollToCenter({
        el: step,
        smooth: true
    });
    return true;
}
/* =========================================================
   MAIN NAVIGATION TARGETS
   F / A top-level navigation includes:
   - .step-float
   - .drop-step > .drop-down
   DOM order determines navigation order.
   Example:
       step
       AI Basics button
       LLM
       Token
       Hallucination
       next dropdown
       etc.
   If .drop-snips is inert/hidden, its inner steps are
   automatically ignored.
   ========================================================= */
function getMainNavTargets() {
    if (!mainTargetDiv) {
        return [];
    }
    return [
        ...mainTargetDiv.querySelectorAll(
            '.step-float, ' +
            '.drop-step > .drop-down'
        )
    ].filter(target => {
        /*
        Ignore elements inside inert containers.
        */
        if (
            target.closest('[inert]')
        ) {
            return false;
        }
        /*
        Ignore display:none / hidden elements.
        */
        if (
            target.getClientRects().length === 0
        ) {
            return false;
        }
        return true;
    });
}
/* =========================================================
   FOCUS MAIN NAV TARGET
   ========================================================= */
function focusMainNavTarget(index) {
    const targets =
        getMainNavTargets();
    if (!targets.length) {
        return false;
    }
    const normalized =
        (
            index +
            targets.length
        ) %
        targets.length;
    const target =
        targets[normalized];
    /*
    Preserve lastStep only when actual target is a step.
    */
    if (
        target.matches('.step-float,.step')
    ) {
        lastStep = target;
    }
    target.focus({
        preventScroll: true
    });
    scrollToCenter({
        el: target,
        smooth: true
    });
    return true;
}
/* =========================================================
   MOVE BETWEEN MAIN NAV TARGETS
   ========================================================= */
function moveMainNavTarget(
    currentTarget,
    direction
) {
    const targets =
        getMainNavTargets();
    if (!targets.length) {
        return false;
    }
    const currentIndex =
        targets.indexOf(
            currentTarget
        );
    /*
    If focus is not currently one of the targets:
        F -> first
        A -> last
    */
    if (
        currentIndex === -1
    ) {
        return focusMainNavTarget(
            direction > 0
                ? 0
                : targets.length - 1
        );
    }
    return focusMainNavTarget(
        currentIndex +
        direction
    );
}
/* =========================================================
   FIRST LETTER -> DROPDOWN
   Used when mainTargetDiv itself has focus.
   Example:
       AI Basics  -> A
       Models     -> M
       Context    -> C
   IMPORTANT:
   Once focus is actually on a step/dropdown:
       F = forward
       A = backward
   This avoids A meaning two different things at once.
   ========================================================= */
function focusDropdownByFirstLetter(key) {
    if (!mainTargetDiv) {
        return false;
    }
    const dropdowns = [
        ...mainTargetDiv.querySelectorAll(
            '.drop-step > .drop-down'
        )
    ].filter(button => {
        if (
            button.closest('[inert]')
        ) {
            return false;
        }
        return (
            button.getClientRects()
                .length > 0
        );
    });
    const match =
        dropdowns.find(button => {
            const text =
                button
                    .textContent
                    ?.trim()
                    .toLowerCase();
            return (
                text &&
                text.startsWith(key)
            );
        });
    if (!match) {
        return false;
    }
    match.focus({
        preventScroll: true
    });
    scrollToCenter({
        el: match,
        smooth: true
    });
    return true;
}
/* =========================================================
   CYCLE STEP MEDIA
   ========================================================= */
function cycleStepMedia(step) {
    const media =
        mediaIn(step);
    if (!media.length) {
        return;
    }
    const nextIndex =
        Number(
            step.dataset.mediaIndex ??
            -1
        ) + 1;
    denlargeAllImages();
    /*
    End of media list -> normal size.
    */
    if (
        nextIndex >=
        media.length
    ) {
        step.dataset.mediaIndex =
            -1;
        return;
    }
    const selected =
        media[nextIndex];
    selected.classList.add(
        'enlarge'
    );
    step.dataset.mediaIndex =
        nextIndex;
    const video =
        selected.matches(
            '.step-vid'
        )
            ? selected.querySelector(
                'video'
            )
            : null;
    if (video) {
        mainTargetDiv
            .querySelectorAll('video')
            .forEach(other => {
                if (
                    other !== video
                ) {
                    other.pause();
                }
            });
        try {
            video.currentTime = 0;
        } catch {
            /*
            Metadata may still be loading.
            */
        }
        video
            .play()
            ?.catch(() => { });
    }
}
/* =========================================================
   UPDATE STEPS
   ========================================================= */
export function updateSteps() {
    initStepNav();
    /*
    Actual steps remain separate from dropdown buttons.
    This preserves number navigation and lastStep behavior.
    */
    steps = [
        ...(
            mainTargetDiv
                ?.querySelectorAll(
                    '.step-float,.step'
                ) || []
        )
    ];
    if (
        !steps.includes(lastStep)
    ) {
        lastStep = null;
    }
    steps.forEach(step => {
        step.setAttribute(
            'tabindex',
            '0'
        );
        itemsIn(step)
            .forEach(item => {
                if (
                    !item.hasAttribute(
                        'tabindex'
                    ) &&
                    !item.matches(
                        'a[href]'
                    )
                ) {
                    item.setAttribute(
                        'tabindex',
                        '0'
                    );
                }
            });
    });
    return steps;
}
/* =========================================================
   INIT STEP NAV
   ========================================================= */
export function initStepNav() {
    if (
        initialized ||
        !mainTargetDiv
    ) {
        return;
    }
    initialized = true;
    /* =====================================================
       FOCUS IN
       ===================================================== */
    mainTargetDiv.addEventListener(
        'focusin',
        e => {
            const step =
                e.target.closest(
                    '.step-float,.step'
                );
            if (!step) {
                return;
            }
            lastStep = step;
            if (
                e.target === step
            ) {
                denlargeAllImages();
                step.dataset.mediaIndex =
                    -1;
                scrollToCenter({
                    el: step,
                    smooth: true
                });
            }
        }
    );
    /* =====================================================
       FOCUS OUT
       ===================================================== */
    mainTargetDiv.addEventListener(
        'focusout',
        e => {
            const step =
                e.target.closest(
                    '.step-float,.step'
                );
            if (
                !step ||
                step.contains(
                    e.relatedTarget
                )
            ) {
                return;
            }
            resetVideos(step);
            denlargeAllImages();
            step.dataset.mediaIndex =
                -1;
        }
    );
    /* =====================================================
       CLICK
       ===================================================== */
    mainTargetDiv.addEventListener('click',e => {
            const step =
                e.target.closest(
                    '.step-float,.step'
                );
            if (!step) {
                return;
            }
            /*
            Do not hijack interactive elements.
            */
            if (
                e.target.closest(
                    'a[href], ' +
                    'button, ' +
                    '.copy-code, ' +
                    '.step-vid, ' +
                    '.vid-cntrl-btns'
                ) ||
                isTypingTarget(
                    e.target
                )
            ) {
                return;
            }
            lastStep = step;
            changeTutorialLink({
                target: step
            });
            const image =
                e.target.closest(
                    '.step-img'
                );
            if (image) {
                e.preventDefault();
                clickToggleImgSize(
                    image
                );
                return;
            }
            step.focus({
                preventScroll: true
            });
            scrollToCenter({
                el: step,
                smooth: true
            });
            getStepActivationFocusTarget(step)?.focus({
                preventScroll: true
            });
        }
    );
    updateSteps();
}
/* =========================================================
   STEP KEYBOARD NAVIGATION
   ========================================================= */
export function stepNav({
    e,
    navState
}) {
    if (
        navState.zone !==
        'mainTargetDiv' ||
        !e.key ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        isTypingTarget(
            e.target
        )
    ) {
        return false;
    }
    const key =
        e.key.toLowerCase();
    const step =
        e.target.closest(
            '.step-float,.step'
        );
    const dropdownButton =
        e.target.closest(
            '.drop-step > .drop-down'
        );
    /* =====================================================
       T
       ===================================================== */
    if (
        key === 't' &&
        tutorialLink
    ) {
        e.preventDefault();
        tutorialLink.focus();
        window.scrollTo(
            0,
            0
        );
        return true;
    }
    /* =====================================================
       FIRST LETTER -> DROPDOWN
       Only when mainTargetDiv itself has focus.
       Example:
           A -> AI Basics
           M -> Models
       Once on a dropdown or step:
           F = forward
           A = backward
       ===================================================== */
    if (
        e.target ===
        mainTargetDiv &&
        /^[a-z0-9]$/.test(key)
    ) {
        const handled =
            focusDropdownByFirstLetter(
                key
            );
        if (handled) {
            e.preventDefault();
            return true;
        }
    }
    /* =====================================================
       NUMBER KEYS
       ===================================================== */
    if (
        /^[1-9]$/.test(key)
    ) {
        const index =
            Number(key) - 1;
        /*
        Inside step child:
        number selects copy-code.
        */
        if (
            step &&
            e.target !== step
        ) {
            const copy =
                step
                    .querySelectorAll(
                        '.copy-code'
                    )[index];
            if (!copy) {
                return false;
            }
            e.preventDefault();
            copy.focus();
            return true;
        }
        /*
        Otherwise:
        number selects actual .step-float.
        */
        if (
            !steps[index]
        ) {
            return false;
        }
        e.preventDefault();
        return focusStep(
            index
        );
    }
    /* =====================================================
       DROPDOWN BUTTON
       It is not a .step-float, so it needs its own
       top-level branch.
       ===================================================== */
    if (dropdownButton) {
        /*
        ENTER
        Leave native button activation alone.
        Your steps-dropdowns.js handles opening/closing.
        */
        if (
            key === 'enter'
        ) {
            return false;
        }
        /*
        F / A
        Move to previous/next main navigation target.
        */
        if (
            key === 'f' ||
            key === 'a'
        ) {
            e.preventDefault();
            return moveMainNavTarget(
                dropdownButton,
                key === 'f'
                    ? 1
                    : -1
            );
        }
        return false;
    }
    /* =====================================================
       NOT INSIDE STEP
       Usually means mainTargetDiv itself has focus.
       ===================================================== */
    if (!step) {
        if (
            ![
                'enter',
                'f',
                'a'
            ].includes(key)
        ) {
            return false;
        }
        /*
        ENTER
        Preserve original behavior:
        enter first actual step.
        */
        if (
            key === 'enter'
        ) {
            if (!e.shiftKey && e.target.matches('a[href]')) return false;
            e.preventDefault();
            return focusStep(0);
        }
        /*
        F / A
        Now use the combined navigation list.
        This allows dropdown buttons to participate.
        */
        e.preventDefault();
        return moveMainNavTarget(
            e.target,
            key === 'f'
                ? 1
                : -1
        );
    }
    /* =====================================================
       ENTER
       ===================================================== */
    if (
        key === 'enter'
    ) {
        /*
        Let real interactive controls behave normally.
        */
        if (
            !e.shiftKey &&
            e.target.closest(
                'a[href], ' +
                'button, ' +
                '[role="button"]'
            )
        ) {
            return false;
        }
        e.preventDefault();
        changeTutorialLink({
            target: step
        });
        /* =================================================
           SHIFT + ENTER
           Reset video / cycle media.
           ================================================= */
        if (
            e.shiftKey
        ) {
            resetVideos(
                step
            );
            cycleStepMedia(
                step
            );
        }
        /* =================================================
           ENTER ON STEP
           First Enter enters first child.
           Does NOT enlarge media.
           ================================================= */
        else if (
            e.target === step
        ) {
            // if (itemsIn(step)[0].tagName == 'A'){}
            getStepActivationFocusTarget(step)
                ?.focus();
        }
        /* =================================================
           ENTER INSIDE STEP
           Cycle media.
           ================================================= */
        else {
            cycleStepMedia(
                step
            );
        }
        lastStep = step;
        return true;
    }
    /* =====================================================
       F / A
       ===================================================== */
    if (
        key === 'f' ||
        key === 'a'
    ) {
        const direction =
            key === 'f'
                ? 1
                : -1;
        /* =================================================
           F / A DIRECTLY ON STEP
           OLD:
               focusStep(...)
           NEW:
               moveMainNavTarget(...)
           This is the critical change allowing dropdown
           buttons to appear in the navigation sequence.
           ================================================= */
        if (
            e.target === step
        ) {
            e.preventDefault();
            return moveMainNavTarget(
                step,
                direction
            );
        }
        /* =================================================
           F / A INSIDE STEP
           Preserve your existing child navigation.
           ================================================= */
        const items =
            itemsIn(step);
        if (!items.length) {
            return false;
        }
        e.preventDefault();
        /*
        Shrink media but keep playing video.
        */
        mediaIn(step)
            .forEach(media => {
                media.classList.remove(
                    'enlarge',
                    'first-vid-enlarge'
                );
            });
        step.dataset.mediaIndex =
            -1;
        const current =
            items.indexOf(
                document.activeElement
            );
        const start =
            current < 0
                ? (
                    direction > 0
                        ? -1
                        : 0
                )
                : current;
        items[
            (
                start +
                direction +
                items.length
            ) %
            items.length
        ].focus();
        return true;
    }
    return false;
}