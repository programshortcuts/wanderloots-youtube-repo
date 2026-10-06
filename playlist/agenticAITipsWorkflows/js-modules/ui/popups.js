export const popElLetterNav = document.querySelector('#popElLetterNav')

export function popupLetterNav({ e, navState }) {
    // Navigation Mode
    if (e.key.toLowerCase() === 'x' && e.shiftKey && e.metaKey) {
        navState.isLetterNavEnabled = !navState.isLetterNavEnabled
        if (!popElLetterNav) return
        popElLetterNav.innerText = navState.isLetterNavEnabled
            ? 'Letter Navigation ON'
            : 'Letter Navigation OFF'
        popElLetterNav.setAttribute('aria-live', 'polite')
        popElLetterNav.classList.add('animate')
        document.querySelector('.page-wrapper').classList.toggle('nav-mode-colors')
        setTimeout(() => {
            popElLetterNav.classList.remove('animate')
        }, 1000);
        return
    }
}
