// get-focus-zone.js
export function getFocusZone({e}){
    let key = e.key
    let zone= 'sideBar'
    if (e.target.closest('.page-header')) {zone= 'letterNavMode'}
    if (e.target.closest('.nav-lesson-title')) {zone= 'navLessonTitle'}
    if (e.target.closest('.side-bar') || e.target.id == 'sideBarBtn') {zone= 'sideBar'}
    if (e.target.closest('#mainTargetDiv')) {zone= 'mainTargetDiv'}
    return zone
}

