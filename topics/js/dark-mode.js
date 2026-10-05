export function initDarkMode() {
    const body = document.querySelector('body')
    const darkModeBtn = document.querySelector('#darkModeBtn')
    if (!body || !darkModeBtn || darkModeBtn.dataset.darkModeBound === 'true') return
    darkModeBtn.dataset.darkModeBound = 'true'
    
    body.addEventListener('keydown', e => {
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
        if (e.key !== 'Enter') return
        e.preventDefault()
        e.stopPropagation()
        toggleDarkMode()
    })
    function toggleDarkMode() {
        
        body.classList.toggle('dark-mode')
    }
    
}
