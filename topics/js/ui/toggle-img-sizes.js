// toggle-img-sizes.js

let allMedia = [];


/* =========================================================
   GET MEDIA IN STEP
   ========================================================= */

function getStepMedia(step) {
    if (!step) return [];

    return [
        ...step.querySelectorAll(
            '.step-img, .step-vid'
        )
    ];
}


/* =========================================================
   SET MEDIA INDEX
   ========================================================= */

function setMediaIndex(media, enlarged) {
    const step = media?.closest('.step-float');

    if (!step) return;

    if (!enlarged) {
        step.dataset.mediaIndex = -1;
        return;
    }

    const mediaItems = getStepMedia(step);

    step.dataset.mediaIndex =
        mediaItems.indexOf(media);
}


/* =========================================================
   REMOVE ENLARGE

   IMPORTANT:
   - removes ALL enlarged state
   - pauses video
   - removes is-playing immediately
   - resets media index
   - DOES NOT reset currentTime
   ========================================================= */

export function removeEnlarge(media) {
    if (!media) return;

    media.classList.remove(
        'enlarge',
        'first-vid-enlarge',
        'is-playing'
    );

    const video = media.matches('.step-vid')
        ? media.querySelector('video')
        : null;

    if (video && !video.paused) {
        video.pause();
    }

    setMediaIndex(media, false);
}


/* =========================================================
   REFRESH MEDIA CACHE
   ========================================================= */

export function refreshImages(root = document) {
    allMedia = [
        ...root.querySelectorAll(
            '.step-img, .step-vid'
        )
    ];

    /*
    Images get their own direct click binding.

    Videos are handled by video-controls.js.
    */
    allMedia.forEach(media => {

        if (!media.matches('.step-img')) return;

        if (
            media.dataset.mediaClickBound ===
            'true'
        ) {
            return;
        }

        media.dataset.mediaClickBound = 'true';

        media.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            toggleMediaSize(media);
        });
    });

    return allMedia;
}


/* =========================================================
   DE-ENLARGE ALL MEDIA
   ========================================================= */

export function denlargeAllImages(
    mediaItems = allMedia
) {
    mediaItems.forEach(removeEnlarge);
}


/* =========================================================
   TOGGLE ONE MEDIA ITEM

   THIS IS NOW THE SINGLE SOURCE OF TRUTH FOR:
   - images
   - videos
   - enlarge
   - shrink
   - mediaIndex
   ========================================================= */

export function toggleMediaSize(media) {
    if (!media) return null;

    const step = media.closest('.step-float');

    const stepMedia = step
        ? getStepMedia(step)
        : [media];

    const wasEnlarged =
        media.classList.contains('enlarge') ||
        media.classList.contains(
            'first-vid-enlarge'
        );


    /* =====================================================
       CURRENT MEDIA IS ENLARGED -> SHRINK IT
       ===================================================== */

    if (wasEnlarged) {
        removeEnlarge(media);

        return null;
    }


    /* =====================================================
       CLOSE ALL OTHER MEDIA FIRST
       ===================================================== */

    stepMedia.forEach(otherMedia => {

        if (otherMedia !== media) {
            removeEnlarge(otherMedia);
        }

    });


    /* =====================================================
       ENLARGE THIS MEDIA
       ===================================================== */

    media.classList.remove(
        'first-vid-enlarge'
    );

    media.classList.add('enlarge');

    setMediaIndex(media, true);

    return media;
}


/* =========================================================
   EXISTING API

   Keep this export so other existing Tech With Tim scripts
   do NOT break.
   ========================================================= */

export function clickToggleImgSize(target) {
    const media = target?.closest?.(
        '.step-img, .step-vid'
    );

    if (!media) return null;

    return toggleMediaSize(media);
}


/* =========================================================
   ENTER / MEDIA CYCLING
   ========================================================= */

export function handleImgSizes({ e }) {
    if (!e || e.key !== 'Enter') {
        return null;
    }

    const step =
        e.target.closest('.step-float');

    if (!step) return null;

    const media = getStepMedia(step);

    if (!media.length) return null;


    /* =====================================================
       FIND CURRENT MEDIA
       ===================================================== */

    const enlargedIndex =
        media.findIndex(item =>
            item.classList.contains('enlarge') ||
            item.classList.contains(
                'first-vid-enlarge'
            )
        );


    /*
    Prefer actual DOM state.

    Fall back to dataset only when nothing currently
    has an enlargement class.
    */
    const currentIndex =
        enlargedIndex !== -1
            ? enlargedIndex
            : Number(
                step.dataset.mediaIndex ?? -1
            );


    const nextIndex = currentIndex + 1;


    /* =====================================================
       CLOSE CURRENT MEDIA
       ===================================================== */

    media.forEach(removeEnlarge);


    /* =====================================================
       END OF LIST = NORMAL STATE

       Example with one image:

       Enter 1 -> enlarge
       Enter 2 -> shrink

       Example with three:

       Enter 1 -> media 1
       Enter 2 -> media 2
       Enter 3 -> media 3
       Enter 4 -> all normal
       ===================================================== */

    if (nextIndex >= media.length) {
        step.dataset.mediaIndex = -1;

        return null;
    }


    /* =====================================================
       ENLARGE NEXT MEDIA
       ===================================================== */

    const nextMedia = media[nextIndex];

    nextMedia.classList.remove(
        'first-vid-enlarge'
    );

    nextMedia.classList.add('enlarge');

    setMediaIndex(nextMedia, true);

    return nextMedia;
}


/* =========================================================
   ESCAPE

   - shrink image
   - pause video
   - shrink video
   - KEEP current timestamp
   - DO NOT restore poster
   ========================================================= */

document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;

    const enlarged = [
        ...document.querySelectorAll(
            '.step-img.enlarge, ' +
            '.step-img.first-vid-enlarge, ' +
            '.step-vid.enlarge, ' +
            '.step-vid.first-vid-enlarge'
        )
    ];

    if (!enlarged.length) return;

    e.preventDefault();

    enlarged.forEach(removeEnlarge);
});


/* =========================================================
   CLICK OUTSIDE MEDIA

   Return enlarged media to normal.
   ========================================================= */

document.addEventListener(
    'pointerdown',
    e => {

        if (
            e.target.closest(
                '.step-img, ' +
                '.step-vid, ' +
                '.vid-cntrl-btns'
            )
        ) {
            return;
        }

        denlargeAllImages();
    }
);