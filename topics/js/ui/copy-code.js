// copy-code.js
export function initCopyCode(root = document) {
    root.querySelectorAll('.step-txt a[href], .step-float a[href]').forEach(link => {
        if (!isCopyLink(link) || link.dataset.copyLinkBound === 'true') return;
        link.dataset.copyLinkBound = 'true';

        // Native Enter on an anchor also uses this click handler.
        link.addEventListener('click', e => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !isCopyLink(link)) return;
            e.preventDefault();
            e.stopPropagation();
            link.focus({ preventScroll: true });
            copyElementText(link);
            animate(link);
        });
    });

    root.querySelectorAll('.copy-code').forEach(element => {
        if (element.dataset.copyCodeBound === 'true') return;
        element.dataset.copyCodeBound = 'true';

        element.addEventListener('keydown', e => {
            if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'c') return;
            e.preventDefault();
            copyElementText(element);
            animate(element);
        });

        element.addEventListener('click', e => {
            if (e.target.closest('a[href]')) return;

            e.preventDefault();
            e.stopPropagation();
            copyElementText(element);
            animate(element);
            element.closest('.step-float')?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        });
    });
}

function isCopyLink(link) {
    if (!link.closest('.step-txt, .step-float')) return false;
    const href = link.getAttribute('href')?.trim();
    if (!href || href.startsWith('#')) return false;
    if (link.closest('.side-bar, .drop-down, .step-img, .step-vid, .vid-cntrl-btns, #tutorialLink') || link.querySelector('video')) return false;
    if ([...document.querySelectorAll('.side-bar-links-container a[href]')].some(item => item.href === link.href)) return false;

    let url;
    try { url = new URL(link.href); }
    catch { return false; }
    if (/\.(?:mp4|webm|ogg|ogv|mov|m4v|mkv|avi|m3u8)$/i.test(url.pathname)) return false;
    const host = url.hostname.toLowerCase();
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) return false;
    if ((host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')) && /^\/(?:watch|embed|shorts|live|v)(?:\/|$)/i.test(url.pathname)) return false;
    return true;
}

function copyElementText(element) {
    const text = element.matches('a[href]') && isCopyLink(element)
        ? element.href
        : 'value' in element ? element.value : element.innerText;
    if (!text) return;

    navigator.clipboard.writeText(text).catch(error => {
        console.error('Unable to copy text to clipboard:', error);
    });
}

function animate(element) {
    element.classList.remove('copied');
    void element.offsetWidth;
    element.classList.add('copied');
    setTimeout(() => element.classList.remove('copied'), 250);
}
