// step-nav.js

import { mainTargetDiv } from "../core/inject-content.js";
import {
    changeTutorialLink,
    tutorialLink
} from "../ui/change-tutorial-link.js";

import {
    clickToggleImgSize,
    denlargeAllImages
} from "../ui/toggle-img-sizes.js";

import {
    resetVideoToPoster
} from "../ui/video-controls.js";


let steps = [];
let lastStep = null;

/* =========================================================
   SHRINK STEP MEDIA BUT KEEP VIDEO PLAYING

   Used when navigating between children with F / A.

   IMPORTANT:
   - removes enlarged size
   - does NOT pause video
   - does NOT reset timestamp
   - does NOT remove is-playing
   ========================================================= */

function shrinkStepMediaKeepPlaying(step) {
    if (!step) return;

    stepMedia(step).forEach(media => {
        media.classList.remove(
            'enlarge',
            'first-vid-enlarge'
        );
    });

    step.dataset.mediaIndex = -1;
}
/* =========================================================
   STEP MEDIA
   ========================================================= */

function stepMedia(step) {
    return step
        ? [
            ...step.querySelectorAll(
                '.step-img, .step-vid'
            )
        ]
        : [];
}


/* =========================================================
   STEP FOCUSABLE ITEMS
   ========================================================= */

function stepFocusableItems(step) {
    return step
        ? [
            ...step.querySelectorAll(
                '.copy-code, a[href]'
            )
        ]
        : [];
}


/* =========================================================
   STEP COPY CODES
   ========================================================= */

function stepCopyCodes(step) {
    return step
        ? [
            ...step.querySelectorAll(
                '.copy-code'
            )
        ]
        : [];
}


/* =========================================================
   PAUSE ALL OTHER VIDEOS
   ========================================================= */

function pauseAllExcept(videoToKeep) {
    document
        .querySelectorAll('video')
        .forEach(video => {

            if (
                video !== videoToKeep &&
                !video.paused
            ) {
                video.pause();
            }

        });
}


/* =========================================================
   RESET VIDEOS IN STEP
   ========================================================= */

function resetStepVideos(step) {
    step
        ?.querySelectorAll('video')
        .forEach(resetVideoToPoster);
}


/* =========================================================
   CYCLE STEP MEDIA

   Example with one media item:

       Enter 1 -> enlarge
       Enter 2 -> normal

   Example with multiple:

       Enter 1 -> media 1
       Enter 2 -> media 2
       Enter 3 -> media 3
       Enter 4 -> normal
   ========================================================= */

function cycleStepMedia(step) {
    const media = stepMedia(step);

    if (!media.length) return null;


    /*
    Read current index BEFORE denlarging.

    denlargeAllImages() resets media state, so we need
    this value first.
    */
    const currentIndex =
        Number(
            step.dataset.mediaIndex ?? -1
        );

    const nextIndex =
        currentIndex + 1;


    /* =====================================================
       CLOSE CURRENT MEDIA
       ===================================================== */

    denlargeAllImages();


    /* =====================================================
       END OF LIST -> NORMAL STATE
       ===================================================== */

    if (nextIndex >= media.length) {
        step.dataset.mediaIndex = -1;

        return null;
    }


    /* =====================================================
       ENLARGE NEXT MEDIA
       ===================================================== */

    const selected =
        media[nextIndex];

    selected.classList.add('enlarge');

    step.dataset.mediaIndex =
        nextIndex;


    /* =====================================================
       VIDEO

       Enlarging via Enter starts video.
       ===================================================== */

    const video =
        selected.matches('.step-vid')
            ? selected.querySelector('video')
            : null;


    if (video) {

        pauseAllExcept(video);

        try {
            video.currentTime = 0;
        } catch {
            /*
            Metadata may not be available yet.
            */
        }

        video
            .play()
            .catch(() => { });
    }


    return selected;
}


/* =========================================================
   FOCUS STEP
   ========================================================= */

function focusStep(index) {
    if (!steps.length) return false;

    const normalized =
        (
            index +
            steps.length
        ) %
        steps.length;

    const step =
        steps[normalized];

    lastStep = step;

    step.focus({
        preventScroll: true
    });

    step.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
    });

    return true;
}


/* =========================================================
   FOCUS WITHIN STEP
   ========================================================= */

function focusWithinStep(
    step,
    direction
) {

    const items =
        stepFocusableItems(step);

    if (!items.length) {
        return false;
    }


    const currentIndex =
        items.indexOf(
            document.activeElement
        );


    const startIndex =
        currentIndex === -1

            ? (
                direction > 0
                    ? -1
                    : 0
            )

            : currentIndex;


    const nextIndex =
        (
            startIndex +
            direction +
            items.length
        ) %
        items.length;


    items[nextIndex].focus();

    return true;
}


/* =========================================================
   NUMBER NAVIGATION
   ========================================================= */

function focusNumberTarget(
    step,
    target,
    number
) {

    /*
    Inside step:
    number keys navigate copy-code.
    */
    if (
        step &&
        target !== step
    ) {

        const copyCode =
            stepCopyCodes(step)[
            number - 1
            ];

        if (!copyCode) {
            return false;
        }

        copyCode.focus();

        return true;
    }


    /*
    Outside/at step level:
    number keys navigate steps.
    */
    return number <= steps.length
        ? focusStep(number - 1)
        : false;
}


/* =========================================================
   EXPORTS
   ========================================================= */

export function getSteps() {
    return steps;
}


export function getLastStep() {
    return lastStep;
}


export function updateSteps() {
    initStepNav();

    return steps;
}


/* =========================================================
   REMOVE SIDEBAR HIGHLIGHTS
   ========================================================= */

export function removeALLSideLinkChange() {

    document
        .querySelectorAll(
            '.sideLinkChange, .highlight'
        )
        .forEach(element => {

            element.classList.remove(
                'sideLinkChange',
                'highlight'
            );

            element.removeAttribute(
                'aria-current'
            );
        });
}


/* =========================================================
   SCROLL TO CENTER
   ========================================================= */

export function scrollToCenter({
    el,
    smooth
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
   INITIALIZE STEP NAVIGATION
   ========================================================= */

export function initStepNav() {

    if (!mainTargetDiv) return;


    steps = [
        ...mainTargetDiv.querySelectorAll(
            '.step-float,.step'
        )
    ];


    if (!steps.includes(lastStep)) {
        lastStep = null;
    }


    steps.forEach(step => {

        step.setAttribute(
            'tabindex',
            '0'
        );


        if (
            step.dataset
                .stepNavigationBound ===
            'true'
        ) {
            return;
        }


        step.dataset
            .stepNavigationBound =
            'true';


        /* =================================================
           STEP FOCUS
           ================================================= */

        step.addEventListener(
            'focus',
            () => {

                lastStep = step;

                denlargeAllImages();

                step.dataset.mediaIndex =
                    -1;

                step.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        );


        /* =================================================
           FOCUS ENTERED STEP
           ================================================= */

        step.addEventListener(
            'focusin',
            () => {
                lastStep = step;
            }
        );


        /* =================================================
           FOCUS LEFT STEP
           ================================================= */

        step.addEventListener(
            'focusout',
            e => {

                if (
                    step.contains(
                        e.relatedTarget
                    )
                ) {
                    return;
                }


                resetStepVideos(step);

                denlargeAllImages();

                step.dataset.mediaIndex =
                    -1;
            }
        );


        /* =================================================
           CLICK
           ================================================= */

        step.addEventListener(
            'click',
            e => {

                const image =
                    e.target.closest(
                        '.step-img, .step-img img'
                    );


                /* =========================================
                   IMAGE CLICK
                   ========================================= */

                if (image) {

                    e.preventDefault();
                    e.stopPropagation();

                    lastStep = step;

                    clickToggleImgSize(
                        image
                    );

                    changeTutorialLink({
                        target: step
                    });

                    return;
                }


                /*
                Videos own their click behavior through
                video-controls.js.
                */
                if (
                    e.target.closest(
                        'a[href], ' +
                        'button, ' +
                        '.copy-code, ' +
                        '.step-vid'
                    )
                ) {
                    return;
                }


                lastStep = step;

                changeTutorialLink({
                    target: step
                });


                step.focus({
                    preventScroll: true
                });


                step.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        );


        /* =================================================
           AUTO FOCUS
           ================================================= */

        if (
            step.hasAttribute(
                'data-auto-focus'
            )
        ) {

            lastStep = step;

            requestAnimationFrame(
                () =>
                    focusStep(
                        steps.indexOf(step)
                    )
            );
        }
    });
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
        !e?.key
    ) {
        return false;
    }


    const key =
        e.key.toLowerCase();


    const step =
        e.target.closest(
            '.step-float,.step'
        );


    /* =====================================================
       T
       ===================================================== */

    if (key === 't') {

        e.preventDefault();

        tutorialLink?.focus();

        window.scrollTo(0, 0);

        return true;
    }


    /* =====================================================
       SHIFT + ENTER

       Intentional video reset / media cycle behavior.
       ===================================================== */

    if (
        key === 'enter' &&
        e.shiftKey &&
        step
    ) {

        e.preventDefault();
        e.stopPropagation();


        resetStepVideos(step);

        cycleStepMedia(step);


        changeTutorialLink({
            target: step
        });


        lastStep = step;

        return true;
    }


    /* =====================================================
       NUMBER KEYS
       ===================================================== */

    if (/^[1-9]$/.test(key)) {

        const handled =
            focusNumberTarget(
                step,
                e.target,
                Number(key)
            );


        if (handled) {
            e.preventDefault();
        }


        return handled;
    }


    /* =====================================================
       NOT CURRENTLY INSIDE STEP
       ===================================================== */

    if (!step) {

        if (
            key === 'enter' ||
            key === 'f'
        ) {

            e.preventDefault();

            return focusStep(0);
        }


        if (key === 'a') {

            e.preventDefault();

            return focusStep(
                steps.length - 1
            );
        }


        return false;
    }
    if (
        key === 'enter' &&
        !e.shiftKey &&
        e.target.closest?.('a[href]')
    ) {
        return false;
    }

    /* =====================================================
       ENTER

       IMPORTANT FIX:

       Plain Enter works from:
       - .step-float
       - .copy-code
       - links
       - buttons
       - any other descendant

       It always cycles/toggles the step media.

       If focus started on .step-float itself, we preserve
       the existing behavior of entering the first child.

       If focus is already on a child, DO NOT move focus.
       ===================================================== */

    if (
        key === 'enter' &&
        !e.shiftKey
    ) {

        e.preventDefault();
        e.stopPropagation();

        changeTutorialLink({
            target: step
        });


        /* =====================================================
           ENTER ON .STEP-FLOAT
    
           First Enter only enters the step.
    
           DO NOT:
           - enlarge image
           - enlarge video
           - play video
           - cycle media
    
           Just focus the first focusable child.
           ===================================================== */

        if (e.target === step) {

            const firstFocusable =
                stepFocusableItems(step)[0];

            firstFocusable?.focus();

            lastStep = step;

            return true;
        }


        /* =====================================================
           ENTER FROM INSIDE STEP
    
           Keep existing behavior exactly the same.
           ===================================================== */

        cycleStepMedia(step);

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

        e.preventDefault();


        const direction =
            key === 'f'
                ? 1
                : -1;


        /*
        Already inside step:
        cycle children.
        */
        if (e.target !== step) {

            /*
            Once we're navigating through children,
            media should return to normal size.
        
            Playing videos keep playing.
            */
            shrinkStepMediaKeepPlaying(step);

            return focusWithinStep(
                step,
                direction
            );
        }

        /*
        On step:
        move between steps.
        */
        return focusStep(
            steps.indexOf(step) +
            direction
        );
    }


    return false;
}