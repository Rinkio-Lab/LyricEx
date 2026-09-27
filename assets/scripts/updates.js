/* LyricEx v3.2.0 – update check (关于 → 检查更新 + silent startup check).
   Dual-channel: try the GitHub Releases API (releases/latest) first; on 404 or
   network failure fall back to parsing the raw CHANGELOG.md head version, so
   the check still works before any Release exists. Startup auto-check is
   throttled via localStorage (ponytail: GitHub unauthenticated API is rate-
   limited to 60 req/h per IP; the 6h throttle keeps page refreshes from
   exhausting it — manual checks always run).
   Test entry: tests/updates-test.mjs (parsing/compare), e2e (mocked network). */
(function (root) {
    'use strict';

    var REPO = 'Rinkio-Lab/LyricEx';
    var API_URL = 'https://api.github.com/repos/' + REPO + '/releases/latest';
    var RAW_URL = 'https://raw.githubusercontent.com/' + REPO + '/main/CHANGELOG.md';
    var RELEASES_URL = 'https://github.com/' + REPO + '/releases/tag/';
    var THROTTLE_MS = 6 * 60 * 60 * 1000; // 6h between silent startup checks
    var STORAGE_KEY = 'lyricex-update-check';

    var currentVersion = null; // memoized once per load (static page footer)

    function t(key) {
        return root.__i18n && typeof root.__i18n.t === 'function' ? root.__i18n.t(key) : key;
    }

    // minimal HTML escape — release notes come from GitHub and must never
    // break out of the dialog markup (see ui/dialog.js escapeHtml, same set)
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function openReleases(tag) {
        root.open(RELEASES_URL + encodeURIComponent(tag), '_blank', 'noopener');
    }

    function parseVersion(v) {
        var m = /v?(\d+)\.(\d+)\.(\d+)/.exec(String(v || ''));
        return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
    }

    // a/b are parsed triples; <0 when a older, 0 equal, >0 when a newer
    function compareVersions(a, b) {
        for (var i = 0; i < 3; i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
        }
        return 0;
    }

    function getCurrentVersion() {
        if (currentVersion) return currentVersion;
        var el = root.document.querySelector('#aboutOverlay .version');
        var parsed = el ? parseVersion(el.textContent) : null;
        currentVersion = parsed;
        return parsed;
    }

    // CHANGELOG.md head format: "## vX.Y.Z（YYYY-MM-DD · 主题）"
    function parseChangelogVersion(text) {
        var m = /^##\s+(v?\d+\.\d+\.\d+)/m.exec(String(text || ''));
        return m ? m[1] : null;
    }

    async function fetchLatest() {
        try {
            var res = await root.fetch(API_URL, { headers: { Accept: 'application/vnd.github+json' } });
            if (res.ok) {
                var data = await res.json();
                if (data && data.tag_name) {
                    // ponytail: keep a bounded copy of the raw payload for the
                    // dev-facing collapsible view — release bodies can be large.
                    return {
                        tag: String(data.tag_name),
                        body: String(data.body || ''),
                        channel: 'Releases API',
                        raw: JSON.stringify(data).slice(0, 4000)
                    };
                }
            }
        } catch (_) {
            /* fall through to raw CHANGELOG */
        }
        try {
            var raw = await root.fetch(RAW_URL);
            if (raw.ok) {
                var ver = parseChangelogVersion(await raw.text());
                if (ver) return { tag: ver, body: '', channel: 'CHANGELOG fallback', raw: '' };
            }
        } catch (_) {
            /* both channels failed */
        }
        return null;
    }

    // v3.2.1: dev mock — set localStorage lyricex-update-mock to any version
    // (e.g. "9.9.9") and a manual check pretends that is the latest release,
    // no network involved. Lets the developer exercise the whole dialog flow.
    function readMock() {
        try {
            var m = root.localStorage.getItem('lyricex-update-mock');
            var parsed = parseVersion(m);
            if (!parsed) return null;
            return { tag: 'v' + parsed.join('.'), body: '', channel: 'localStorage mock (' + m + ')', raw: '' };
        } catch (_) {
            return null;
        }
    }

    // v3.2.1: the update-found dialog is HTML — split layout with a
    // collapsible API payload and a scrollable notes column. Notes text is
    // escaped; newlines become <br> so the summary stays readable.
    function renderNotes(markdown) {
        var lines = String(markdown || '')
            .split(/\r?\n/)
            .map(function (line) {
                var s = line.replace(/^\s*[-*]\s+/, ''); // drop list bullets
                return s ? escapeHtml(s) : '&nbsp;';
            })
            .join('<br>');
        return lines || '<em>' + escapeHtml(t('updateNoNotes')) + '</em>';
    }

    function buildFoundHtml(latest, currentLabel) {
        var title =
            '<div class="update-head">' +
            '<i class="fas fa-arrow-circle-up" aria-hidden="true"></i>' +
            '<span>' +
            escapeHtml(t('updateFound')) +
            ' <strong>' +
            escapeHtml(latest.tag) +
            '</strong></span>' +
            (latest.channel.indexOf('mock') === 0
                ? '<span class="update-mock-tag">' + escapeHtml(t('updateMockTag')) + '</span>'
                : '') +
            '</div>';
        var api = latest.raw
            ? '<details class="update-api"><summary>' +
              escapeHtml(t('updateApiRaw')) +
              '</summary><pre>' +
              escapeHtml(latest.raw) +
              '</pre></details>'
            : '';
        return (
            title +
            '<div class="update-body">' +
            '<div class="update-notes">' +
            '<div class="update-col-label">' +
            escapeHtml(t('updateNotesLabel')) +
            '</div><div class="update-notes-scroll">' +
            renderNotes(latest.body) +
            '</div></div>' +
            '<div class="update-side">' +
            '<div class="update-meta"><span>' +
            escapeHtml(t('updateChannel')) +
            '</span><code>' +
            escapeHtml(latest.channel) +
            '</code></div>' +
            api +
            '</div>' +
            '</div>' +
            (currentLabel
                ? '<div class="update-current">' +
                  escapeHtml(t('updateCurrentVer')) +
                  ' ' +
                  escapeHtml(currentLabel) +
                  '</div>'
                : '')
        );
    }

    async function check(manual) {
        var dialog = root.__lyricexDialog;
        if (!manual) {
            var last = Number(root.localStorage.getItem(STORAGE_KEY) || 0);
            if (Date.now() - last < THROTTLE_MS) return; // silent throttle
        }
        try {
            root.localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch (_) {
            /* noop */
        }

        // v3.2.1: manual checks open a spinner dialog immediately — the user
        // sees feedback the moment the button is clicked, not after the fetch.
        var loadingPromise = null;
        if (manual && dialog) {
            loadingPromise = dialog.loading(t('updateChecking'));
        }

        var current = getCurrentVersion();
        var latest = readMock() || (await fetchLatest());
        var latestParsed = latest ? parseVersion(latest.tag) : null;
        if (manual && loadingPromise) dialog.closeAll(); // swap spinner -> result
        if (!latestParsed) {
            if (manual && dialog) await dialog.alert(t('updateFailed'));
            return;
        }
        if (current && compareVersions(latestParsed, current) > 0) {
            if (!dialog) return;
            var openIt = await dialog.confirm(buildFoundHtml(latest, current.join('.')), {
                html: true,
                okLabel: t('updateGoRelease')
            });
            if (openIt) openReleases(latest.tag);
        } else if (manual && dialog) {
            await dialog.alert(t('updateLatest') + (current ? ' v' + current.join('.') : ''));
        }
    }

    function init(ctx) {
        var btn = ctx && ctx.checkUpdateBtn;
        if (btn)
            btn.addEventListener('click', function () {
                check(true);
            });
        // silent startup check after a short delay, never blocking first paint
        setTimeout(function () {
            check(false);
        }, 3000);
    }

    root.__lyricexUpdates = {
        check: check,
        parseVersion: parseVersion,
        compareVersions: compareVersions,
        parseChangelogVersion: parseChangelogVersion
    };
    root.__lyricexUpdatesInit = init;
})(typeof window !== 'undefined' ? window : globalThis);
