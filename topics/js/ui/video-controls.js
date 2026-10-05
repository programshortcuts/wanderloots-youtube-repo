// video-controls.js

import {
    toggleMediaSize
} from "./toggle-img-sizes.js";


const CONTROL_FLASH_TIME = 180;


/* =========================================================
   GET CONTROL BUTTONS
   ========================================================= */

function getButtons(video) {
    const container =
        video?.closest('.step-vid');

    const buttons = [
        ...(
            container?.querySelectorAll(
                '.vid-cntrl-btns button'
            ) || []
        )
    ];

    return {
        play:
            container?.querySelector(
                '.playbtn'
            ) || null,

        rewind:
            buttons.find(button =>
                button.textContent
                    .replace(/\s/g, '')
                    .includes('<<')
            ) || null,

        forward:
            buttons.find(button =>
                button.textContent
                    .replace(/\s/g, '')
                    .includes('>>')
            ) || null
    };
}


/* =========================================================
   FLASH CONTROL
   ========================================================= */

function flash(button) {
    if (!button) return;

    button.classList.add('active');

    setTimeout(
        () =>
            button.classList.remove(
                'active'
            ),
        CONTROL_FLASH_TIME
    );
}


/* =========================================================
   UPDATE PLAY BUTTON
   ========================================================= */

function updatePlayButton(video) {
    const playButton =
        getButtons(video).play;

    if (!playButton) return;

    if (!playButton.dataset.playText) {
        playButton.dataset.playText =
            playButton.textContent.trim() ||
            '>';
    }

    playButton.textContent =
        video.paused
            ? playButton.dataset.playText
            : '❚❚';

    playButton.setAttribute(
        'aria-label',
        video.paused
            ? 'Play video'
            : 'Pause video'
    );
}


/* =========================================================
   PAUSE OTHER VIDEOS
   ========================================================= */

function pauseOtherVideos(currentVideo) {
    document
        .querySelectorAll('video')
        .forEach(video => {

            if (
                video !== currentVideo &&
                !video.paused
            ) {
                video.pause();
            }

        });
}


/* =========================================================
   PLAY
   ========================================================= */

function playVideo(video) {
    if (!video) return;

    pauseOtherVideos(video);

    const playPromise = video.play();

    if (playPromise?.catch) {
        playPromise.catch(() =>
            updatePlayButton(video)
        );
    }
}


/* =========================================================
   PLAY / PAUSE
   ========================================================= */

function togglePlay(video) {
    if (video.paused) {
        playVideo(video);
    } else {
        video.pause();
    }
}


/* =========================================================
   RESET VIDEO TO BEGINNING / POSTER

   Used by:
   - end of video
   - rewind to 0
   - forward past end
   - intentional reset behavior
   ========================================================= */

export function resetVideoToPoster(video) {
    if (!video) return;

    video.pause();

    if (video.poster) {
        video.load(); // Restores the actual poster image.
    } else {
        try {
            video.currentTime = 0;
        } catch {
            /* Metadata may not be available yet. */
        }
    }

    updatePlayButton(video);
}


/* =========================================================
   SEEK
   ========================================================= */

function seek(video, amount) {
    if (!video) return;

    const duration =
        Number.isFinite(video.duration)
            ? video.duration
            : Infinity;

    const nextTime =
        Math.max(
            0,
            Math.min(
                duration,
                video.currentTime + amount
            )
        );


    /* =====================================================
       REACHED BEGINNING OR END

       Pause + timestamp 0 + poster.
       ===================================================== */

    if (
        nextTime <= 0 ||
        nextTime >= duration
    ) {
        resetVideoToPoster(video);

        return;
    }

    video.currentTime = nextTime;
}


/* =========================================================
   TOGGLE VIDEO SIZE

   IMPORTANT:

   Enlargement itself is controlled ONLY by
   toggle-img-sizes.js now.
   ========================================================= */

function toggleVideoSize(wrapper, video) {
    const wasEnlarged =
        wrapper.classList.contains(
            'enlarge'
        ) ||
        wrapper.classList.contains(
            'first-vid-enlarge'
        );


    /*
    toggleMediaSize() handles:
    - enlarge
    - shrink
    - mediaIndex
    - competing media
    - z-index classes
    */
    toggleMediaSize(wrapper);


    /* =====================================================
       ENLARGE -> PLAY

       SHRINK -> PAUSE
       ===================================================== */

    if (wasEnlarged) {
        video.pause();
    } else {
        playVideo(video);
    }
}


/* =========================================================
   CONTROL BUTTON
   ========================================================= */

function handleControlButton(
    button,
    video
) {

    if (
        button.classList.contains(
            'playbtn'
        )
    ) {
        flash(button);

        togglePlay(video);

        return;
    }


    const label =
        button.textContent.replace(
            /\s/g,
            ''
        );


    if (label.includes('<<')) {
        flash(
            getButtons(video).rewind
        );

        seek(video, -0.5);

        return;
    }


    if (label.includes('>>')) {
        flash(
            getButtons(video).forward
        );

        seek(video, 0.5);
    }
}


/* =========================================================
   BIND VIDEO WRAPPER
   ========================================================= */

function bindVideoWrapper(wrapper) {
    if (
        wrapper.dataset
            .videoControlsBound ===
        'true'
    ) {
        return;
    }


    const video =
        wrapper.querySelector('video');

    if (!video) return;


    wrapper.dataset.videoControlsBound =
        'true';


    if (
        !video.hasAttribute(
            'tabindex'
        )
    ) {
        video.setAttribute(
            'tabindex',
            '0'
        );
    }


    /* =====================================================
       CLICK

       Control button:
           perform control action

       Video:
           enlarge/play or shrink/pause
       ===================================================== */

    wrapper.addEventListener(
        'click',
        e => {

            const button =
                e.target.closest(
                    '.vid-cntrl-btns button'
                );

            e.preventDefault();
            e.stopPropagation();


            if (button) {
                handleControlButton(
                    button,
                    video
                );

                return;
            }


            toggleVideoSize(
                wrapper,
                video
            );
        }
    );


    /* =====================================================
       PLAY
       ===================================================== */

    video.addEventListener(
        'play',
        () => {

            pauseOtherVideos(video);

            wrapper.classList.add(
                'is-playing'
            );

            updatePlayButton(video);
        }
    );


    /* =====================================================
       PAUSE

       Immediately return normal-playing z-index.
       ===================================================== */

    video.addEventListener(
        'pause',
        () => {

            wrapper.classList.remove(
                'is-playing'
            );

            updatePlayButton(video);
        }
    );


    /* =====================================================
       NATURAL END
       ===================================================== */

    video.addEventListener(
        'ended',
        () => {

            wrapper.classList.remove(
                'is-playing'
            );

            resetVideoToPoster(video);
        }
    );


    updatePlayButton(video);
}


/* =========================================================
   STEP KEYBOARD VIDEO CONTROLS
   ========================================================= */

function bindStepKeyboard(step) {
    if (
        step.dataset
            .videoKeyboardBound ===
        'true'
    ) {
        return;
    }

    step.dataset.videoKeyboardBound =
        'true';


    step.addEventListener(
        'keydown',
        e => {

            /*
            Enter enlargement/cycling remains owned
            by step-nav / toggle-img-sizes.
            */
            if (e.key === 'Enter') {
                return;
            }


            const wrapper =
                step.querySelector(
                    '.step-vid.enlarge'
                ) ||
                step.querySelector(
                    '.step-vid.first-vid-enlarge'
                ) ||
                step.querySelector(
                    '.step-vid'
                );


            const video =
                wrapper?.querySelector(
                    'video'
                );

            if (!video) return;


            /* =================================================
               SPACE
               ================================================= */

            if (
                e.key === ' ' ||
                e.key === 'Spacebar'
            ) {
                e.preventDefault();
                e.stopPropagation();

                flash(
                    getButtons(video).play
                );

                togglePlay(video);

                return;
            }


            /* =================================================
               LEFT
               ================================================= */

            if (
                e.key === 'ArrowLeft'
            ) {
                e.preventDefault();

                flash(
                    getButtons(video).rewind
                );

                seek(video, -0.5);

                return;
            }


            /* =================================================
               RIGHT
               ================================================= */

            if (
                e.key === 'ArrowRight'
            ) {
                e.preventDefault();

                flash(
                    getButtons(video).forward
                );

                seek(video, 0.5);
            }
        }
    );
}


/* =========================================================
   INITIALIZE VIDEOS
   ========================================================= */

export function initAllVideos(
    root = document
) {

    root
        .querySelectorAll(
            '.step-vid'
        )
        .forEach(bindVideoWrapper);


    root
        .querySelectorAll(
            '.step-float'
        )
        .forEach(bindStepKeyboard);
}