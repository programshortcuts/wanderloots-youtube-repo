// letter-nav.js
// BEST simple letter-focus Thus Far, (( put in boiler plate))

export function letterFocusIndex({ e }) {
    const key = e.key.toLowerCase();
    // console.log('dkfhs')
    // only react to single alphanumeric keys
    if (key.length !== 1 || !/^[a-z0-9]$/.test(key)) return;

    // const allEls = [...document.querySelectorAll('[data-nav-target],.sub-resources-container a')].filter(el => {
    //     const rect = el.getBoundingClientRect();
    //     return el.offsetParent !== null && rect.width > 0 && rect.height > 0;
    // });
    const allEls = [...document.querySelectorAll(
        '[data-nav-target], .side-bar-topics a, .snip, .vid'
    )].filter(el => {
        el.setAttribute('tabindex', '0')
        const rect = el.getBoundingClientRect();
        return el.offsetParent !== null && rect.width > 0 && rect.height > 0;
    });
    // filter elements whose id starts with the key
    const firstAlpha = el => {
        // If element is NOT an anchor, use its ID  
        // If anchor has ID, go to ID[0]

        if (el.id) {
            return el.id[0].toLowerCase()
        } else {
            const s = (el.innerText || '').trim().toLowerCase()
            for (let i = 0; i < s.length; i++) {
                if (/[a-z]/.test(s[i])) {
                    return s[i]
                }
            }
            return ''
        }
        // Regular  text logic
    }
    const matching = allEls.filter(el => {
        return firstAlpha(el) == key
    })
    // const matching = allEls.filter(el => el.id.toLowerCase().startsWith(key));
    // if (matching.length === 0) return;

    const activeEl = document.activeElement;
    const iActiveEl = allEls.indexOf(activeEl);

    let target;
    if (e.shiftKey) {
        // console.log("here"); // debugging
        // go backwards: find the last match before the active element
        target = [...matching].reverse().find(a => allEls.indexOf(a) < iActiveEl)
            || matching[matching.length - 1];
    } else {
        // go forwards: find the first match after the active element
        target = matching.find(a => allEls.indexOf(a) > iActiveEl)
            || matching[0];
    }

    target?.focus();
    window.lastLetterPressed = key;

}


