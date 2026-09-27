/* LyricEx v2.8.1 – native-style dialog system (alert / confirm / prompt).
   Replaces the browser's alert/confirm/prompt so every prompt matches the
   settings/about modal look. One reusable overlay (index.html #dialogOverlay),
   Promise-based API:
     alert(msg, opts?)        -> Promise<undefined>   (single OK button)
     confirm(msg, {danger})   -> Promise<boolean>     (OK is red when danger)
     prompt(msg, defaultValue)-> Promise<string|null> (Enter confirms, Esc/backdrop = null)
   Focus containment + return-focus are owned by ui/focus-trap.js (.dialog-overlay
   is in its OVERLAY_SELECTOR); Esc/backdrop/Enter handling lives here.
   Test entry: e2e + boot-smoke exercise confirm (reset) and alert paths. */
(function (root) {
    'use strict';

    var overlay, messageEl, inputRow, inputEl, footerEl;
    var currentResolve = null;

    function t(key) {
        return root.__i18n && typeof root.__i18n.t === 'function' ? root.__i18n.t(key) : key;
    }

    function makeButton(label, className, onClick) {
        var b = root.document.createElement('button');
        b.className = 'close-btn' + (className ? ' ' + className : '');
        b.textContent = label;
        b.addEventListener('click', onClick);
        return b;
    }

    // v3.2.1: minimal escaping so opts.html callers can embed untrusted text
    // (e.g. GitHub release notes) without breaking out of the dialog markup.
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function close(result) {
        if (!overlay) return;
        overlay.classList.remove('open');
        inputRow.classList.add('hidden');
        footerEl.innerHTML = '';
        messageEl.textContent = '';
        inputEl.value = '';
        var r = currentResolve;
        currentResolve = null;
        if (r) r(result);
    }

    function open(kind, message, defaultValue, opts) {
        if (currentResolve) close(null); // a second dialog while one is open: cancel the first
        opts = opts || {};
        // v3.2.1: opts.html lets the update-check dialog render release notes
        // (left/right split + collapsible API payload) as markup; callers must
        // escape untrusted text themselves (see escapeHtml).
        if (opts.html) messageEl.innerHTML = String(message == null ? '' : message);
        else messageEl.textContent = String(message == null ? '' : message);
        messageEl.classList.toggle('dialog-html', !!opts.html);
        inputRow.classList.toggle('hidden', kind !== 'prompt');
        if (kind === 'prompt') inputEl.value = defaultValue == null ? '' : String(defaultValue);
        if (kind === 'alert') {
            footerEl.appendChild(
                makeButton(t('dialogOk'), 'dialog-primary', function () {
                    close(undefined);
                })
            );
        } else if (kind === 'confirm') {
            footerEl.appendChild(
                makeButton(t('dialogCancel'), '', function () {
                    close(false);
                })
            );
            footerEl.appendChild(
                makeButton(
                    opts.okLabel || t('dialogOk'),
                    opts.danger ? 'dialog-danger' : 'dialog-primary',
                    function () {
                        close(true);
                    }
                )
            );
        } else if (kind === 'prompt') {
            footerEl.appendChild(
                makeButton(t('dialogCancel'), '', function () {
                    close(null);
                })
            );
            footerEl.appendChild(
                makeButton(t('dialogOk'), 'dialog-primary', function () {
                    close(inputEl.value);
                })
            );
        } else if (kind === 'loading') {
            // v3.2.1: busy state for the update check — spinner + text, no
            // buttons; Esc/backdrop cancel (resolves null) while a fetch runs.
            messageEl.innerHTML =
                '<span class="dialog-spinner" aria-hidden="true"></span>' +
                escapeHtml(String(message == null ? '' : message));
        }
        overlay.classList.add('open');
        if (kind === 'prompt') inputEl.focus();
        else {
            var first = footerEl.querySelector('button');
            if (first) first.focus();
        }
        return new Promise(function (resolve) {
            currentResolve = resolve;
        });
    }

    function init() {
        overlay = root.document.getElementById('dialogOverlay');
        if (!overlay) return;
        messageEl = overlay.querySelector('.dialog-message');
        inputRow = overlay.querySelector('.dialog-input-row');
        inputEl = overlay.querySelector('#dialogInput');
        footerEl = overlay.querySelector('.dialog-footer');
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close(null);
        });
        overlay.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                e.stopPropagation();
                close(null);
            }
        });
        inputEl.addEventListener('keydown', function (e) {
            // isComposing guard: IME (zh/ja) Enter-to-commit must not confirm
            // the dialog before the composition finishes
            if (e.key === 'Enter' && !e.isComposing) {
                e.preventDefault();
                close(inputEl.value);
            }
        });
    }

    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init);
    else init();

    root.__lyricexDialog = {
        alert: function (message, opts) {
            return open('alert', message, null, opts);
        },
        confirm: function (message, opts) {
            return open('confirm', message, null, opts);
        },
        prompt: function (message, defaultValue) {
            return open('prompt', message, defaultValue);
        },
        loading: function (message) {
            return open('loading', message);
        },
        closeAll: function () {
            close(null);
        }
    };
})(typeof window !== 'undefined' ? window : globalThis);
