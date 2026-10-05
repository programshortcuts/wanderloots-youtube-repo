// ui/steps-dropdowns.js

let initialized = false;

export function initStepsDropdowns() {
    if (initialized) return;
    initialized = true;

    document.addEventListener('click', e => {
        const button = e.target.closest(
            '.drop-step > .drop-down'
        );

        if (!button) return;

        const parent = button.closest(
            '.drop-step'
        );

        const dropdown =
            parent?.querySelector(
                ':scope > .drop-snips'
            );

        if (!dropdown) return;

        const opening =
            dropdown.classList.contains('hide');

        dropdown.classList.toggle(
            'hide',
            !opening
        );

        dropdown.inert = !opening;

        button.setAttribute(
            'aria-expanded',
            String(opening)
        );
    });
}