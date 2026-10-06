// js-index/letterFocus-txt-nums.js

addEventListener('keydown', e => {
    /* =========================================================
       GET LETTER / NUMBER
       ========================================================= */

    let key = '';

    if (/^Key[A-Z]$/.test(e.code)) {
        key = e.code.replace('Key', '').toLowerCase();
    } else if (/^Digit[0-9]$/.test(e.code)) {
        key = e.code.replace('Digit', '');
    } else {
        return;
    }


    /* =========================================================
       GET NAVIGABLE ELEMENTS

       If an element has an ID:
           use the ID for letter navigation.

       Otherwise:
           use the visible text like before.
       ========================================================= */

    const allEls = [
        ...document.querySelectorAll(
            'a, button, [tabindex], [data-nav-target]'
        )
    ].filter(el => {

        const rect = el.getBoundingClientRect();

        return (
            el.offsetParent !== null &&
            rect.width > 0 &&
            rect.height > 0
        );
    });

    /* =========================================================
       OLD PAGE SCROLL BEHAVIOR
       ========================================================= */

    if (key === 'm' || key === 't') {
        scrollTo(0, 0);
    }


    /* =========================================================
       CLEAN TEXT

       Keep the old behavior where <sup> content does not
       participate in letter navigation.
       ========================================================= */

    function getCleanText(el) {

        const clone = el.cloneNode(true);

        clone
            .querySelectorAll('sup')
            .forEach(node => node.remove());

        return clone.textContent
            .trim()
            .toLowerCase();
    }


    /* =========================================================
       GET NAVIGATION TEXT

       IDs take priority.

       Examples:

           #agents              -> "agents"
           #aiAgents-26         -> "ai agents 26"
           #codexFull01         -> "codex full 01"
           #ollamaLocalChatbot  -> "ollama local chatbot"

       Elements without IDs continue using their visible text.
       ========================================================= */

    function getNavText(el) {

        if (el.id) {

            return el.id

                // camelCase:
                // aiAgents -> ai Agents
                .replace(/([a-z0-9])([A-Z])/g, '$1 $2')

                // Separate letters and numbers:
                // codex01 -> codex 01
                .replace(/([a-zA-Z])([0-9])/g, '$1 $2')
                .replace(/([0-9])([a-zA-Z])/g, '$1 $2')

                // Treat -, _, etc. as separators
                .replace(/[^a-zA-Z0-9]+/g, ' ')

                .trim()
                .toLowerCase();
        }

        return getCleanText(el);
    }


    /* =========================================================
       DOES THIS ELEMENT MATCH THE KEY?
       ========================================================= */

    function matchesKey(el) {

        /*
        mainContainer already has special meaning:
        M explicitly navigates to it.
        */

        if (el.id === 'mainContainer') {
            return key === 'm';
        }


        const navText = getNavText(el);

        if (!navText) return false;

        const words = navText.split(/\s+/);


        return words.some(word => {

            const cleaned = word.replace(
                /^[^a-z0-9]+/i,
                ''
            );

            if (!cleaned) return false;


            /*
            Preserve your existing number behavior.

            Example:

                01

            can participate correctly when pressing
            number keys.
            */

            if (
                /^\d+$/.test(cleaned) &&
                /^[0]+[1-9]/.test(cleaned)
            ) {

                return (
                    cleaned[0] === key ||
                    cleaned.match(/[1-9]/)?.[0] === key
                );
            }


            return cleaned[0] === key;
        });
    }


    /* =========================================================
       ELEMENTS MATCHING CURRENT LETTER / NUMBER
       ========================================================= */

    const matchingEls = allEls.filter(matchesKey);

    if (matchingEls.length === 0) return;


    /* =========================================================
       CURRENT POSITION
       ========================================================= */

    const activeEl = document.activeElement;

    const activeIndex = allEls.indexOf(activeEl);

    const currentMatchIndex =
        matchingEls.indexOf(activeEl);


    const keySignature =
        `${e.shiftKey ? 'shift+' : ''}${key}`;

    let nextIndex;


    /* =========================================================
       NEW LETTER / NUMBER

       Find the next matching element after current DOM position.
       Shift reverses direction.
       ========================================================= */

    if (keySignature !== window.lastKeySignature) {

        if (e.shiftKey) {

            const previous = [...matchingEls]
                .reverse()
                .find(
                    el =>
                        allEls.indexOf(el) <
                        activeIndex
                );

            nextIndex =
                matchingEls.indexOf(previous);

            if (nextIndex === -1) {
                nextIndex = matchingEls.length - 1;
            }

        } else {

            const next = matchingEls.find(
                el =>
                    allEls.indexOf(el) >
                    activeIndex
            );

            nextIndex =
                matchingEls.indexOf(next);

            if (nextIndex === -1) {
                nextIndex = 0;
            }
        }

    }


    /* =========================================================
       SAME KEY AGAIN

       Cycle through all matches.
       ========================================================= */

    else {

        nextIndex = e.shiftKey

            ? (
                currentMatchIndex -
                1 +
                matchingEls.length
            ) % matchingEls.length

            : (
                currentMatchIndex +
                1
            ) % matchingEls.length;
    }


    /* =========================================================
       FOCUS
       ========================================================= */

    matchingEls[nextIndex]?.focus();

    // console.log(
    //     'LETTER NAV:',
    //     key,
    //     matchingEls[nextIndex]
    // );

    window.lastKeySignature = keySignature;

});