// video-controls.js

import {
    toggleMediaSize
} from "./toggle-img-sizes.js";


const CONTROL_FLASH_TIME = 180;
const pendingEndSeeks = new WeakMap();

function clearVideoEndState(video) {
    const pendingSeek = pendingEndSeeks.get(video);
    if (pendingSeek) {
        video.removeEventListener('loadedmetadata', pendingSeek);
        video.removeEventListener('durationchange', pendingSeek);
        pendingEndSeeks.delete(video);
    }
    video.closest('.step-vid')?.classList.remove('video-paused-at-end');
}

function pauseAtVideoEnd(video) {
    clearVideoEndState(video);
    video.pause();

    const seekToLastFrame = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return false;

        clearVideoEndState(video);
        // Stay before the ended event, which normally restores the poster.
        video.currentTime = Math.max(0, video.duration - 0.05);
        video.pause();
        video.closest('.step-vid')?.classList.add('video-paused-at-end');
        return true;
    };

    if (seekToLastFrame()) return;

    pendingEndSeeks.set(video, seekToLastFrame);
    video.addEventListener('loadedmetadata', seekToLastFrame);
    video.addEventListener('durationchange', seekToLastFrame);
    // Lessons use preload="none", so request metadata without starting playback.
    if (video.readyState === 0) video.load();
}


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

    clearVideoEndState(video);
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

    clearVideoEndState(video);
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

    clearVideoEndState(video);
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

    /*
Keep a pointer press on a control button from moving focus
and triggering the step's focusout/reset behavior.
The existing click handler still performs the button action.
*/
    wrapper.addEventListener('pointerdown', e => {
        const button = e.target.closest('.vid-cntrl-btns button');

        if (
            !button ||
            button.closest('.step-vid') !== wrapper ||
            e.button !== 0
        ) {
            return;
        }

        e.preventDefault();
    }, { passive: false });
    wrapper.addEventListener('click', e => {
        const button = e.target.closest('.vid-cntrl-btns button');

        // Control buttons perform their action without changing size.
        if (
            button &&
            button.closest('.step-vid') === wrapper
        ) {
            e.preventDefault();
            e.stopPropagation();

            handleControlButton(button, video);
            return;
        }

        // Tapping the control strip itself must not toggle size.
        if (e.target.closest('.vid-cntrl-btns')) {
            e.stopPropagation();
            return;
        }

        // Only clicking the actual video toggles its size.
        if (e.target !== video) return;

        e.preventDefault();
        e.stopPropagation();

        video.focus({ preventScroll: true });
        toggleVideoSize(wrapper, video);
    });

    /* =====================================================
       PLAY
       ===================================================== */

    // video.addEventListener(
    //     'play',
    //     () => {

    //         clearVideoEndState(video);
    //         pauseOtherVideos(video);

    //         wrapper.classList.add(
    //             'is-playing'
    //         );

    //         updatePlayButton(video);
    //     }
    // );

    /* =====================================================
       PLAY — CENTER VIDEO WITHOUT MOVING FOCUS
       ===================================================== */

    video.addEventListener('play', () => {
        clearVideoEndState(video);
        pauseOtherVideos(video);

        wrapper.classList.add('is-playing');

        updatePlayButton(video);

        requestAnimationFrame(() => {
            if (!video.isConnected || video.paused) return;

            video.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        });
    });
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

            if (video.currentTime <= 0.01 && video.poster) {
                resetVideoToPoster(video);
            }
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
    // Clear the finished highlight if another control seeks away.
    video.addEventListener('seeking', () => {
        if (!wrapper.classList.contains('video-paused-at-end')) {
            return;
        }

        const endTime = Math.max(0, video.duration - 0.05);

        if (
            !Number.isFinite(endTime) ||
            Math.abs(video.currentTime - endTime) > 0.01
        ) {
            clearVideoEndState(video);
        }
    });

    // Clear the visual state when the video is reloaded/reset.
    video.addEventListener('emptied', () => {
        wrapper.classList.remove('video-paused-at-end');
    });

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
            if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey ||
                e.target.matches('input, textarea, select') || e.target.isContentEditable) return;

            if (e.key === 'Enter') {
                return;
            }


            const wrapper =
                e.target.closest('.step-vid') ||
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

            if (e.shiftKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                clearVideoEndState(video);
                video.pause();
                video.currentTime = 0;
                return;
            }

            if (e.shiftKey && e.key === 'ArrowRight') {
                e.preventDefault();
                pauseAtVideoEnd(video);
                return;
            }


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
            '.step-float,.step'
        )
        .forEach(bindStepKeyboard);
}
