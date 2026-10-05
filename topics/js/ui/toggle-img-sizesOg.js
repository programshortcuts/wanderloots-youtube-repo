// import { denlargeAllImages } from "./toggle-img-sizesOG"
// toggle-img-sizes.js

let allMedia = []

export function refreshImages(root = document) {
    allMedia = root.querySelectorAll('.step-img, .step-vid')
}

export function denlargeAllImages() {
    allMedia.forEach(el => {
        el.classList.remove('enlarge')
    })
}

export function handleImgSizes({ e }) {

    const key = e.key.toLowerCase()

    // if (key !== 'enter') return
    console.log(e.target)
    const step = e.target.closest('.step-float')
    if(key === 'enter' && e){
        if (!step) return
        
        const selector = '.step-img,.step-vid'
        
        cycleMedia(step, selector)
        return
    }
}

function cycleMedia(step, selector) {

    const items = [...step.querySelectorAll(selector)]

    if (!items.length) return
    console.log(step)
    const stateKey =
        selector === '.step-img'
            ? 'imgIndex'
            : 'vidIndex'

    let index = Number(step.dataset[stateKey] ?? -1)

    // remove all enlarged first
    items.forEach(el => {
        el.classList.remove('enlarge')
    })

    // SINGLE ITEM
    if (items.length === 1) {

        if (index === -1) {
            items[0].classList.add('enlarge')
            step.dataset[stateKey] = 0
        } else {
            step.dataset[stateKey] = -1
        }

        return
    }

    // MULTIPLE ITEMS
    index++

    // finished cycle
    if (index >= items.length) {

        step.dataset[stateKey] = -1
        return
    }

    items[index].classList.add('enlarge')

    step.dataset[stateKey] = index
}
export function clickToggleImgSize(img) {

    toggleImgSize(img.closest('.step-img, .step-vid'))
} 
function toggleImgSize(stepImgVid){
    stepImgVid.classList.toggle('enlarge')
}
