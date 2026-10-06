// change-tutorial-link.js
export const tutorialLink = document.querySelector('#tutorialLink')
const tutorialImg = tutorialLink?.querySelector('img')
const defaultTutorialImg = tutorialImg?.getAttribute('src')

export function changeTutorialLink(e) {
    if (!tutorialLink) return
    const linkEl = e.target.closest('a') || e.target.closest('.step-float,.step')
    const isSideBar = linkEl?.closest('.side-bar')
    const step = e.target.closest('.step-float,.step')

    if (tutorialImg) {
        const imageSource = isSideBar ? linkEl : step
        tutorialImg.src = imageSource?.getAttribute('data-vid-img') || defaultTutorialImg
    }

    if (!linkEl) return

    const currentTutorialHref = tutorialLink?.href || ''

    if (isSideBar) {
        const vidBase = linkEl.getAttribute('data-tutorial-link') || currentTutorialHref
        const ts = linkEl.getAttribute('data-timestamp')
        if (!vidBase) return
        let vidHref = vidBase
        if (ts) {
            vidHref += (vidBase.includes('?') ? '&' : '?') + `t=${ts}s`
        }

        tutorialLink.href = vidHref
        return
    }

    if (step) {
        const vidBase = step.getAttribute("data-video")
        const ts = step.getAttribute("data-timestamp")

        if (!vidBase) return
        let vidHref = vidBase
        if (ts) {
            vidHref += (vidBase.includes("?") ? "&" : "?") + `t=${ts}s`
        }

        tutorialLink.href = vidHref
        return
    }
}