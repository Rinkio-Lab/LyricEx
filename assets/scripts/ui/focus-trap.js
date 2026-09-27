/* LyricEx v2.2.0 – universal modal focus trap (a11y).
   Every modal overlay in index.html shows/hides via the .open class (see
   ui/about|settings|share|video-export|search|cinema.js). One MutationObserver
   per overlay traps Tab inside the open dialog, moves focus to the first
   focusable element on open, and restores it on close. Esc handling stays in
   each module — this file only owns focus containment. The overlays carry
   role="dialog" aria-modal="true" statically in index.html.
   Test entry: boot-smoke.mjs exercises overlays after loading a sample. */
(function (root) {
    'use strict';

    var FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    var OVERLAY_SELECTOR =
        '.about-overlay, .settings-overlay, .share-overlay, .video-overlay, .guide-overlay, .search-overlay, .cinema-overlay, .cover-viewer, .library-overlay, .dialog-overlay';

    function visible(el) {
        return el && (el.offsetParent !== null || el === root.document.activeElement);
    }

    function focusableWithin(overlay) {
        return Array.prototype.filter.call(overlay.querySelectorAll(FOCUSABLE), visible);
    }

    function onKeydown(overlay, e) {
        if (e.key !== 'Tab') return;
        var els = focusableWithin(overlay);
        if (!els.length) return;
        var first = els[0],
            last = els[els.length - 1];
        var active = root.document.activeElement;
        if (e.shiftKey && (active === first || active === overlay)) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function bindOverlay(overlay) {
        var returnFocus = null;
        var keyHandler = function (e) {
            onKeydown(overlay, e);
        };
        new MutationObserver(function () {
            if (overlay.classList.contains('open')) {
                returnFocus = root.document.activeElement;
                var els = focusableWithin(overlay);
                if (els.length) els[0].focus();
                overlay.addEventListener('keydown', keyHandler);
            } else {
                overlay.removeEventListener('keydown', keyHandler);
                if (returnFocus && returnFocus.focus) returnFocus.focus();
                returnFocus = null;
            }
        }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }

    function init() {
        if (typeof MutationObserver === 'undefined') return; // progressive enhancement
        var overlays = root.document.querySelectorAll(OVERLAY_SELECTOR);
        Array.prototype.forEach.call(overlays, bindOverlay);
    }

    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init);
    else init();
})(typeof window !== 'undefined' ? window : globalThis);
