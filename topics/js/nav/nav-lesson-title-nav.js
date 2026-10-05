// nav-lessons-title-nav.js
import { mainTargetDiv } from "../core/inject-content.js"
import { mainContainer } from "../core/main-script.js"
export const navLessonTitle = document.querySelector('.nav-lesson-title')
import { sideBarAsARRAY } from "./sidebar-nav.js"
import { getSteps,getLastStep } from "./step-nav.js"
export function handleNavLessonTitle({ e, navState }){
    const key = e.key.toLowerCase()
    const {zone, isLetterNavEnable} = navState
    // This variable is repeated in step-nav at top of updateSteps(), i don't believe this is most efficient
    const sideBarEls = [...document.querySelectorAll('[id],a')].filter(el => {
        if (!el.closest('.side-bar'))
            return
    })
    if(zone != 'navLessonTitle') return
    if(key === 'm'){
        mainTargetDiv.focus()
        scrollTo(0,0)
    }
    if(key === 'f'){
        if(!mainContainer.classList.contains('collapsed')){
            sideBarAsARRAY[0].focus()
        } else {
            const steps = getSteps()
            const lastStep = getLastStep()
            if(lastStep){
                lastStep.focus()
            } else {

                getSteps()[0].focus()
            }
            return true
        }   
    } 
    return false

}