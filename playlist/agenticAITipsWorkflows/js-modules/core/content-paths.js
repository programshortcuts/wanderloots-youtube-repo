export const moduleBase = new URL('.', window.location.href);

export function lessonURL(href) {
    const url = new URL(href, moduleBase);
    if (url.origin !== moduleBase.origin || !url.pathname.startsWith(moduleBase.pathname)) {
        throw new Error('Lesson must belong to this module.');
    }
    return url;
}

export function prepareContent(html, sourceURL) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script, base, style, link, meta, iframe, object, embed').forEach(el => el.remove());
    doc.querySelectorAll('*').forEach(el => {
        [...el.attributes].forEach(({ name, value }) => {
            if (/^on/i.test(name) || name === 'srcdoc' || name === 'style') {
                el.removeAttribute(name);
            }
            if (!['src', 'poster', 'href', 'action', 'xlink:href'].includes(name)) return;
            const path = value.trim();
            if (!path || path === 'undefined' || /^javascript:/i.test(path.replace(/\s/g, ''))) {
                el.removeAttribute(name);
                return;
            }
            // Topics fragments use module-relative lesson paths; ordinary paths
            // (including images/...) belong to the fetched document itself.
            if (path.startsWith('#')) return;
            const base = /^(?:\.\/)?side-bar-links-pages\//.test(path) ? moduleBase : sourceURL;
            el.setAttribute(name, new URL(path, base).href);
        });
    });
    doc.querySelectorAll('#targetDivInjected > header').forEach(header => {
        if (header.querySelector('#lessonTitle')) header.remove();
    });
    const content = doc.querySelector('#targetDivInjected, #targetDiv') || doc.body;
    return [...content.childNodes];
}
