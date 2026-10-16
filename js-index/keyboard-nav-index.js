import { letterFocusIndex } from "./letter-focus-index.js";
const pListVids = document.querySelectorAll('.playlist > .vids-container > .vid')
const navState = {
    inPlaylist: true
}
function initKeyboardNavIndex() {
    addEventListener('keydown', e => {
        const active = document.activeElement
        const key = e.key.toLowerCase()
        if(!isNaN(key) && navState.inPlaylist){
            const intKey = parseInt(key)
            pListVids[intKey - 1].focus()
        }
        letterFocusIndex({ e })
    });
}
initKeyboardNavIndex()