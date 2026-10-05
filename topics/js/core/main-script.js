// main-script.js
export const pageWrapper = document.querySelector('.page-wrapper')
export const mainContainer = document.querySelector('.main-container')
import { navLessonTitle } from "../nav/nav-lesson-title-nav.js";
import { initDarkMode } from "../dark-mode.js";
import { keyboardNav } from "../nav/keyboard-nav.js";
import { initToggleSideBar } from "../ui/toggle-sidebar.js";
import {
    endNxtBtn,
    initInjectContentListeners,
    prevBtn
} from "./inject-content.js";
import { initSideBarListeners } from "../nav/sidebar-nav.js";
import { initStepNav } from "../nav/step-nav.js";
import { initCopyCode } from "../ui/copy-code.js";
import { initAllVideos } from "../ui/video-controls.js";

export const tutorialLink = document.querySelector('#tutorialLink');

document.addEventListener('DOMContentLoaded', initMain);

function initMain() {
    if (window._techWithTimMainInitialized) return;
    window._techWithTimMainInitialized = true;

    initCopyCode();
    initSideBarListeners();
    initInjectContentListeners();
    initToggleSideBar();
    initDarkMode();
    setupGlobalKeyListener();
    initStepNav();
    initAllVideos();

}

function setupGlobalKeyListener() {
    addEventListener('keydown', e => {
        if (e.defaultPrevented || !e.key) return;

        const tag = e.target.tagName;
        const isTyping =
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            e.target.isContentEditable;

        if (isTyping) return;

        if (keyboardNav({ e })) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        const key = e.key.toLowerCase();

        if (key === 't') tutorialLink?.focus();
        if (key === 'e') endNxtBtn?.focus();
        if (key === 'p') prevBtn?.focus();
        if (key === 'n') navLessonTitle?.focus();
    });
}
