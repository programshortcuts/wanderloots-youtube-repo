// step-clicked-nav.js
import { tutorialLink } from "../ui/change-tutorial-link.js"
import { scrollToCenter } from "./step-nav.js"
// import { handleImgSizes } from "../ui/toggle-img-sizes.js"
let allStepCopyCodes = []
export function handleStepClickedNav({ e, iCopyCodes }) {
    const step = e.target.closest('.step-float')
    const key = e.key.toLowerCase()
    let stepCopyCodes = updateStepCopyCodes(step)
    if(!document.allCopyCodesAdded){
        allStepCopyCodes = document.querySelectorAll('.copy-code')
        allStepCopyCodes.forEach(el => {
            el.addEventListener('keydown', e => {
                let key = e.key.toLowerCase()
                if(e.shiftKey && key === 'enter'){
                    scrollToCenter({el})
                }

            });
        })
        document.allCopyCodesAdded = true
    }
    if (!isNaN(key)) {
        iCopyCodes = parseInt(key) - 1
        stepCopyCodes[iCopyCodes]?.focus()
        return iCopyCodes
    } else {
        if (key === 'a') {
            iCopyCodes = (iCopyCodes - 1 + stepCopyCodes.length) % stepCopyCodes.length
        }
        if (key === 'f') {
            iCopyCodes = (iCopyCodes + 1) % stepCopyCodes.length
        }
        if (key === 'm') {
            step?.focus()
        }
        if (key === 't') {
            tutorialLink?.focus()
            return
        }

        if (key === 'enter') {
            if (!step) return
            if(e.shiftKey){
                const el = e.target
                scrollToCenter({el})
            }
            stepCopyCodes = getCopyCodes(step)
        
            stepCopyCodes[iCopyCodes]?.focus()
        }
        stepCopyCodes[iCopyCodes]?.focus()
        return iCopyCodes
    }
}                         

function updateStepCopyCodes(step){
    if (!step) return []
    return [...step.querySelectorAll('.copy-code')]
}
function getCopyCodes(step) {
    if (!step) return
    let copyCodes = step.querySelectorAll('.copy-code')
    copyCodes.forEach(el => {
        if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '0')
        }
    })
    if (copyCodes) return [...copyCodes]
}
