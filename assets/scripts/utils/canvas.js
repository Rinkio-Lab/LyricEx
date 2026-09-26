/* LyricEx v1.7.0 – DOM/HTML → canvas rasterizer (zero-dependency) */
(function (root) {
    'use strict';
    var u = root.__lyricexUtils = root.__lyricexUtils || {};

    // Rasterize an HTML string to a canvas via SVG <foreignObject>. The HTML
    // runs as its own document, so @font-face webfonts from the host page are
    // NOT inherited — system fonts render. Good enough for a share card; the
    // fallback stacks in the card CSS keep CJK/JP glyphs legible.
    // ponytail: live-font + full-CSS fidelity would need html2canvas or a
    // service worker; not worth a dependency for a static image.
    u.renderHtmlToCanvas = function (html, width, height) {
        return new Promise(function (resolve, reject) {
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
                '<foreignObject width="100%" height="100%">' +
                '<div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;width:100%;height:100%;box-sizing:border-box;">' +
                html +
                '</div></foreignObject></svg>';
            var blob;
            try { blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }); }
            catch (_) { blob = new Blob([svg], { type: 'image/svg+xml' }); }
            var url = root.URL.createObjectURL(blob);
            var img = new root.Image();
            img.onload = function () {
                var canvas = root.document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                root.URL.revokeObjectURL(url);
                // v2.8.1: Chrome can resolve this promise with a TAINTED canvas
                // (Blob-URL SVG + <foreignObject>); drawImage succeeds, but any
                // later toDataURL/toBlob throws SecurityError, which silently
                // broke share-card previews and poster export. Probe 1px — on a
                // tainted canvas getImageData throws — and reject so callers
                // (renderShareCard/renderPoster) fall back to the 2D renderer.
                try { ctx.getImageData(0, 0, 1, 1); }
                catch (e) { reject(e); return; }
                resolve(canvas);
            };
            img.onerror = function (e) {
                root.URL.revokeObjectURL(url);
                reject(e);
            };
            img.src = url;
        });
    };
})(typeof window !== 'undefined' ? window : globalThis);
