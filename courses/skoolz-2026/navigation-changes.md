# Skoolz module navigation changes

Implemented in this repository copy only. Preview while the local server is running:

- [00module](http://127.0.0.1:8765/courses/skoolz-2026/00module/00module.html)
- [01module](http://127.0.0.1:8765/courses/skoolz-2026/01module/01module.html)

Both modules now use the Topics keyboard/focus behavior, module-local HTML injection, a left sidebar and an independently scrolling content pane. Lesson 03 is absent from both module folders and is shown as unavailable; no replacement lesson was invented. Existing available lessons 01, 02, 07–11, homepage and troubleshoot are linked. The 01module header is enabled so back, home, tutorial and dark-mode controls appear in both modules.

Topics has no pushState/popstate lesson routing; the course retains that navigation model. F/A and numbers move focus; Enter activates a sidebar lesson, and repeating Enter enters the content. M/S, E/P/N/T, step navigation, letter mode (Cmd+Shift+X), image enlargement and video controls follow the reference behavior.

## Verification

Headless Chrome tested both modules at 1440px desktop and 320px, 375px and 768px widths. All nine sidebar destinations in each module were exercised. Tests passed for homepage and missing-lesson fallback, mouse/keyboard synchronization, repeated injection, numeric and letter navigation, next/previous lessons, collapsed-sidebar restoration, step/child navigation, media playback, stale-request cancellation, focus changes during loading, editable-field/modifier guards, and removal of scripts/inline handlers from fetched content.

Final browser run: 147 assertions passed, 314 observed responses, no failed resources, no JavaScript exceptions, and no console errors. All 98 local image/video/poster references across the 18 content fragments resolve. All 18 JavaScript files passed syntax/import checks. No horizontal overflow was found at the tested widths, including each sidebar destination.

The protected files outside courses/skoolz-2026 have the same combined SHA-256 checksum before and after implementation. No Topics, root index, js-index, or global styling files changed. The six existing step-text source styles and their course copies remain unchanged; the existing step-txt-modules.css imports remain wired in. No old files were deleted or renamed.

## Complete file list

Paths below are relative to courses/skoolz-2026/. This list includes this report.

| File | Action | Reason |
| --- | --- | --- |
| [js-modules/core/elements.js](js-modules/core/elements.js) | Created | Shares module-shell DOM elements without circular imports. |
| [js-modules/core/main-script.js](js-modules/core/main-script.js) | Created | Initializes the course navigation and UI once. |
| [js-modules/core/inject-content.js](js-modules/core/inject-content.js) | Created | Loads local lessons/homepage, handles fallback and stale requests, and delegates activation. |
| [js-modules/core/content-paths.js](js-modules/core/content-paths.js) | Created | Resolves module/document asset paths and removes executable fetched markup. |
| [js-modules/nav/get-focus-zone.js](js-modules/nav/get-focus-zone.js) | Created | Identifies navigation zones and editable targets. |
| [js-modules/nav/keyboard-nav.js](js-modules/nav/keyboard-nav.js) | Created | Routes established shortcuts and letter-navigation mode. |
| [js-modules/nav/letter-nav.js](js-modules/nav/letter-nav.js) | Created | Cycles visible matching navigation targets. |
| [js-modules/nav/nav-lesson-title-nav.js](js-modules/nav/nav-lesson-title-nav.js) | Created | Moves focus from the lesson title into sidebar/content. |
| [js-modules/nav/sidebar-nav.js](js-modules/nav/sidebar-nav.js) | Created | Handles sidebar focus, wrapping and numbered selection. |
| [js-modules/nav/sidebar-state.js](js-modules/nav/sidebar-state.js) | Created | Keeps focus-derived highlighting separate from loaded-lesson state. |
| [js-modules/nav/step-nav.js](js-modules/nav/step-nav.js) | Created | Handles step/child focus and media navigation with one delegated listener set. |
| [js-modules/ui/change-tutorial-link.js](js-modules/ui/change-tutorial-link.js) | Created | Updates tutorial timestamps safely when the optional header exists. |
| [js-modules/ui/copy-code.js](js-modules/ui/copy-code.js) | Created | Preserves copy-code behavior with guarded binding and pointer focus. |
| [js-modules/ui/dark-mode.js](js-modules/ui/dark-mode.js) | Created | Preserves the existing optional theme toggle and shortcut. |
| [js-modules/ui/popups.js](js-modules/ui/popups.js) | Created | Displays letter-navigation mode feedback. |
| [js-modules/ui/toggle-img-sizes.js](js-modules/ui/toggle-img-sizes.js) | Created | Preserves image enlargement, Escape behavior and media focus. |
| [js-modules/ui/toggle-sidebar.js](js-modules/ui/toggle-sidebar.js) | Created | Synchronizes sidebar visibility, inert state and ARIA state. |
| [js-modules/ui/video-controls.js](js-modules/ui/video-controls.js) | Created | Preserves video playback/seek controls with guarded initialization. |
| [css-modules/css-modules.css](css-modules/css-modules.css) | Changed | Imports the course layout, navigation, interaction and responsive styles alongside existing step-text styles. |
| [css-modules/components-modules/side-bar-modules.css](css-modules/components-modules/side-bar-modules.css) | Created | Styles independently scrolling sidebar links and collapsed state. |
| [css-modules/dark-mode-modules.css](css-modules/dark-mode-modules.css) | Created | Adapts existing Topics theme and content colors for the course. |
| [css-modules/responsive-modules.css](css-modules/responsive-modules.css) | Created | Constrains media/code widths and adapts the module panes to narrow screens. |
| [css-modules/ui-modules/interactions-modules.css](css-modules/ui-modules/interactions-modules.css) | Created | Styles media enlargement, video controls, copy feedback and navigation popup. |
| [css-modules/utilities-modules/effects-modules.css](css-modules/utilities-modules/effects-modules.css) | Created | Matches focus and sidebar highlight styles. |
| [css-modules/utilities-modules/layout-modules.css](css-modules/utilities-modules/layout-modules.css) | Created | Creates the left-sidebar/right-content grid, compact header and scroll regions. |
| [00module/00module.html](00module/00module.html) | Changed | Connects course CSS/JS, fixes homepage fallback, exposes existing lessons/troubleshoot, marks absent lesson 03 unavailable, and corrects shell asset/navigation paths. |
| [00module/homepage.html](00module/homepage.html) | Changed | Corrects missing image/video paths to their existing original assets. |
| [00module/troubleshoot.html](00module/troubleshoot.html) | Changed | Corrects missing image/video paths to their existing original assets. |
| [00module/side-bar-links-pages/01/01.html](00module/side-bar-links-pages/01/01.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [00module/side-bar-links-pages/02/02.html](00module/side-bar-links-pages/02/02.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [00module/side-bar-links-pages/07/07.html](00module/side-bar-links-pages/07/07.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [00module/side-bar-links-pages/08/08.html](00module/side-bar-links-pages/08/08.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [00module/side-bar-links-pages/09/09.html](00module/side-bar-links-pages/09/09.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [00module/side-bar-links-pages/10/10.html](00module/side-bar-links-pages/10/10.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [01module/01module.html](01module/01module.html) | Changed | Connects course CSS/JS, fixes homepage fallback, exposes existing lessons/troubleshoot, marks absent lesson 03 unavailable, and corrects shell asset/navigation paths. |
| [01module/homepage.html](01module/homepage.html) | Changed | Corrects missing image/video paths to their existing original assets. |
| [01module/troubleshoot.html](01module/troubleshoot.html) | Changed | Corrects missing image/video paths to their existing original assets. |
| [01module/side-bar-links-pages/01/01.html](01module/side-bar-links-pages/01/01.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [01module/side-bar-links-pages/02/02.html](01module/side-bar-links-pages/02/02.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [01module/side-bar-links-pages/07/07.html](01module/side-bar-links-pages/07/07.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [01module/side-bar-links-pages/08/08.html](01module/side-bar-links-pages/08/08.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [01module/side-bar-links-pages/09/09.html](01module/side-bar-links-pages/09/09.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [01module/side-bar-links-pages/10/10.html](01module/side-bar-links-pages/10/10.html) | Changed | Corrects media paths for standalone and injected use; lesson content is preserved. |
| [navigation-changes.md](navigation-changes.md) | Created | Lists all changed/created files and verification results. |
| [js-modules/ui/header-scroll.js](js-modules/ui/header-scroll.js) | Created | Measures the header/title so lesson content scrolls behind their transparent backgrounds while controls stay visible and clickable. |

## Transparent header follow-up

The lesson viewport now extends behind the transparent header and title. Matching initial padding keeps the first lesson content below the controls; scroll padding preserves keyboard focus clearance. Header-height changes on resize, image loading and lesson-title changes are observed in the new header-scroll.js module. Main-script.js initializes it once; layout-modules.css and responsive-modules.css supply the overlapping pane and transparent header styles.

Verified both modules at 1440, 768 and 375 pixels: content scrolls and accepts clicks through empty header areas; header links and dark mode stay usable; initial content clearance, sidebar injection, keyboard focus, and horizontal sizing pass. No JavaScript, CSP or resource errors were reported.
