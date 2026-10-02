/* LyricEx service worker (v2.0.0 #24, PWA offline install).
   ponytail: a service worker can only register on http(s) origins — the
   file://-opened index.html cannot install or precache. Serve the folder over
   HTTP (e.g. `python -m http.server` or any static server) to enable offline
   install. Strategy: navigations (HTML) are network-first so a re-deployed
   index.html arrives on the next refresh; every other same-origin GET is
   cache-first with network fallback and gets added to the cache, so a full
   first visit works offline. */
// Bump this name whenever index.html or any precached asset changes: an
// unchanged name would keep serving the stale cached document to clients that
// have not refreshed since the deploy.
const CACHE = 'lyricex-v3.3.13'; // v3.3.0: unified export dialog — bump cache for re-fetch

// Core assets precached at install: a CACHE bump then serves the new
// styles/scripts/zh locale on the very next refresh (no cache-warmup lag).
// Non-zh locale dicts stay out on purpose — they load on demand.
const PRECACHE = [
    './', './index.html',
    'vendor/fontawesome/css/all.min.css',
    'vendor/fonts/noto-sans-sc.css', 'vendor/fonts/m-plus-rounded-1c.css', 'vendor/fonts/courier-prime.css',
    'assets/styles/base.css', 'assets/styles/layout.css', 'assets/styles/views.css',
    'assets/styles/overlays.css', 'assets/styles/responsive.css',
    'assets/locales/index.js', 'assets/locales/languages.js', 'assets/locales/zh.js',
    'vendor/jszip/jszip.min.js',
    'assets/scripts/lib.js', 'assets/scripts/changelog.js',
    'assets/scripts/utils/theme.js', 'assets/scripts/utils/loop.js', 'assets/scripts/utils/pitch.js',
    'assets/scripts/utils/recent.js', 'assets/scripts/utils/search.js', 'assets/scripts/utils/subtitles.js',
    'assets/scripts/utils/notes.js', 'assets/scripts/utils/wordtiming.js', 'assets/scripts/utils/canvas.js',
    'assets/scripts/utils/share-card.js',
    'assets/scripts/modules/pitch-shift.js', 'assets/scripts/modules/audio-graph.js',
    'assets/scripts/modules/recent-store.js', 'assets/scripts/modules/video.js',
    'assets/scripts/ui/video-export.js', 'assets/scripts/ui/share.js', 'assets/scripts/ui/editor.js',
    'assets/scripts/ui/export-dialog.js',
    'assets/scripts/ui/search.js', 'assets/scripts/ui/mini.js', 'assets/scripts/ui/cinema.js',
    'assets/scripts/ui/about.js', 'assets/scripts/ui/settings.js', 'assets/scripts/app.js',
    'assets/scripts/ui/focus-trap.js',
    'assets/scripts/locale-boot.js', 'assets/scripts/sw-register.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(PRECACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    // Navigations go network-first: cache-first here served the pre-move
    // index.html (css/, js/, i18n/) and broke the v2.1.0 assets/ restructure.
    // Offline still works because 'install' precaches './' and './index.html'.
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request)
                .then((res) => {
                    if (res && res.status === 200 && res.type === 'basic') {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(e.request, copy));
                    }
                    return res;
                })
                .catch(() => caches.open(CACHE).then((c) => c.match(e.request)))
        );
        return;
    }
    e.respondWith(
        caches.open(CACHE).then((cache) =>
            cache.match(e.request).then((hit) => {
                const network = fetch(e.request)
                    .then((res) => {
                        // Only same-origin ('basic') responses are stored:
                        // cross-origin calls (GitHub update checks, sample-pack
                        // manifest) must stay live — caching them wastes storage
                        // and serves stale release info.
                        if (res && res.status === 200 && res.type === 'basic') {
                            cache.put(e.request, res.clone());
                        }
                        return res;
                    })
                    .catch(() => hit);
                return hit || network;
            })
        )
    );
});
