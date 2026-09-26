/* LyricEx SW registration (v2.5.0: extracted from the inline <script> for
   strict CSP `script-src 'self'`). Registers the service worker only on
   http(s) origins — file:// cannot register (see sw.js header). */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
}
