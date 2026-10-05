// change-tutorial-link.js
export const tutorialLink = document.querySelector('#tutorialLink')
export function changeTutorialLink(e) {
    const linkEl = e.target.closest('a') || e.target.closest('.step-float')
    if (!linkEl) return

    const isSideBar = linkEl.closest('.side-bar')
    const currentTutorialHref = tutorialLink?.href || ''

    if (isSideBar) {
        const vidBase = linkEl.getAttribute('data-video') || currentTutorialHref.split('?')[0]
        const ts = linkEl.getAttribute('data-timestamp')
        if (!vidBase) return

        let vidHref = vidBase
        if (ts) {
            vidHref += (vidBase.includes('?') ? '&' : '?') + `t=${ts}s`
        }

        tutorialLink.href = vidHref
        return
    }

    const step = e.target.closest('.step-float')
    if (step) {
        const vidBase = step.getAttribute("data-video")
        const ts = step.getAttribute("data-timestamp")

        let vidHref = vidBase
        if (ts) {
            vidHref += (vidBase.includes("?") ? "&" : "?") + `t=${ts}s`
        }

        tutorialLink.href = vidHref
        return
    }
}