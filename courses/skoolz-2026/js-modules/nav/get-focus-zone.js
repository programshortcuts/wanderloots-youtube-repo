export function getFocusZone({ e }) {
    const target = e.target;
    if (target.closest?.('#mainTargetDiv')) {
        return 'mainTargetDiv';
    }
    if (target.closest?.('.side-bar') || target.id === 'sideBarBtn') {
        return 'sideBar';
    }
    if (target.closest?.('.nav-lesson-title')) {
        return 'navLessonTitle';
    }
    if (target.closest?.('#endNxtBtn, #prevBtn')) {
        return 'lessonButtons';
    }
    if (target.closest?.('.page-header')) {
        return 'letterNavMode';
    }
    return 'sideBar';
}

export function isTypingTarget(target) {
    return !!(target?.isContentEditable || target?.closest?.(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'
    ));
}
