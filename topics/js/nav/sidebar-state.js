// sidebar-state.js
import { sideBarBtn } from "../ui/toggle-sidebar.js"
let lastFocusedLink = null
let lastClickedLink = null
// LastFocused
export function setLastFocusedLink(el){lastFocusedLink = el}
export function getLastFocusedLink(){return lastFocusedLink}
export function clearLastFocusedLink(el){lastFocusedLink = null}

export function setLastCLICKEDLink(el){
    lastClickedLink = el
}
export function getLastCLICKEDLink() { return lastClickedLink }
export function clearLastCLICKEDLink(el) { lastClickedLink = null}