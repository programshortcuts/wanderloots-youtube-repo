// toggle-sidebar.js
import { mainContainer } from "../core/main-script.js"
import { navLessonTitle } from "../nav/nav-lesson-title-nav.js"
export const sideBar = document.querySelector('.page-wrapper .side-bar')
export const sideBarBtn = document.querySelector('#sideBarBtn')
let initialized = false

export function initToggleSideBar() {
    if (initialized || !sideBar || !sideBarBtn || !navLessonTitle) return
    initialized = true

    sideBar.addEventListener('click', toggleSidebar)
    sideBarBtn.addEventListener('click', toggleSidebar)
    sideBarBtn.addEventListener('keydown', toggleSidebar)
    navLessonTitle.addEventListener('click', toggleSidebar)
    navLessonTitle.addEventListener('keydown', toggleSidebar)

    sideBarBtn.setAttribute('role', 'button')
    sideBarBtn.setAttribute('aria-label', 'Toggle lesson sidebar')
    sideBarBtn.setAttribute('aria-expanded', String(!mainContainer.classList.contains('collapsed')))

    function applyCollapsedState() {
        mainContainer.classList.toggle('collapsed')
        sideBarBtn.setAttribute('aria-expanded', String(!mainContainer.classList.contains('collapsed')))
    }

    function toggleSidebar(e) {
        if (e.type == 'click') {
            e.stopPropagation()
            if (e.target === sideBar    || 
                e.target === sideBarBtn ||
                e.currentTarget === navLessonTitle) {
                    applyCollapsedState()
            }
        }
        if (e.type == 'keydown') {
            if (e.key === 'Enter') {
                e.preventDefault()
                applyCollapsedState()
            }
        }
    }
}
