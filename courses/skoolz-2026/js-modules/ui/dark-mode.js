import { isTypingTarget } from '../nav/get-focus-zone.js';
export function initDarkMode() {
    const body = document.querySelector('body')
    const darkModeBtn = document.querySelector('#darkModeBtn')
    if (!body || !darkModeBtn || darkModeBtn.dataset.darkModeBound === 'true') return
    darkModeBtn.dataset.darkModeBound = 'true'
    
    body.addEventListener('keydown', e => {
        if (e.defaultPrevented || isTypingTarget(e.target) || e.ctrlKey || e.altKey) return
        let key = e.key.toLowerCase()
        if ((e.shiftKey && e.metaKey) && key === 'k') {
            toggleDarkMode()
        }
    });
    darkModeBtn.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        toggleDarkMode()
    });
    darkModeBtn.addEventListener('keydown', e => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.key !== 'Enter') return
        e.preventDefault()
        e.stopPropagation()
        toggleDarkMode()
    })
    function toggleDarkMode() {
        
        body.classList.toggle('dark-mode')
    }
    
}
