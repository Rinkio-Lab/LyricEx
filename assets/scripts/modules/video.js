/* LyricEx v1.7.0 – lyrics video recorder (Canvas.captureStream + MediaRecorder) */
/* Records the canvas at ~30fps with the live audio tapped through the shared
   Web Audio graph. Real-time by design: the song plays through once while each
   frame is drawn. Requires Chromium-family (MediaRecorder + captureStream). */
(function (root) {
    'use strict';
    var v = (root.__lyricexVideo = {});

    function pickMime() {
        var candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
        if (!root.MediaRecorder) return '';
        for (var i = 0; i < candidates.length; i++) {
            try {
                if (root.MediaRecorder.isTypeSupported(candidates[i])) return candidates[i];
            } catch (_) {
                /* noop */
            }
        }
        return '';
    }

    v.supported = function () {
        return !!(
            root.MediaRecorder &&
            root.HTMLCanvasElement &&
            root.HTMLCanvasElement.prototype.captureStream &&
            root.__lyricexAudioGraph
        );
    };

    // opts: { audio, canvas, draw(ctx, time), onState(text), onProgress(pct), onDone(blob), onError(err) }
    // Returns a handle { stop() }.
    v.start = function (opts) {
        var audio = opts.audio,
            canvas = opts.canvas;
        var graph = root.__lyricexAudioGraph;
        var mime = pickMime();
        var chunks = [],
            rec = null,
            raf = null,
            stopped = false,
            audioTap = null;

        function fail(err) {
            cleanup();
            if (opts.onError) opts.onError(err);
        }

        function cleanup() {
            if (raf) {
                root.cancelAnimationFrame(raf);
                raf = null;
            }
            if (audioTap) {
                audioTap.stop();
                audioTap = null;
            }
        }

        try {
            var videoStream = canvas.captureStream(30);
            audioTap = graph.startRecording(audio);
            var tracks = videoStream.getVideoTracks().concat(audioTap ? audioTap.stream.getAudioTracks() : []);
            var stream = new root.MediaStream(tracks);
            rec = mime ? new root.MediaRecorder(stream, { mimeType: mime }) : new root.MediaRecorder(stream);
        } catch (e) {
            fail(e);
            return null;
        }

        rec.ondataavailable = function (e) {
            if (e.data && e.data.size) chunks.push(e.data);
        };
        rec.onstop = function () {
            cleanup();
            var blob = new root.Blob(chunks, { type: rec.mimeType || 'video/webm' });
            if (opts.onDone) opts.onDone(blob);
        };
        rec.onerror = function (e) {
            fail(e && e.error ? e.error : new Error('MediaRecorder error'));
        };

        var ctx = canvas.getContext('2d');
        function frame() {
            if (stopped) return;
            if (opts.draw) opts.draw(ctx, audio ? audio.currentTime : 0);
            if (opts.onProgress && audio && audio.duration) {
                opts.onProgress(Math.min(1, audio.currentTime / audio.duration));
            }
            raf = root.requestAnimationFrame(frame);
        }

        function onEnded() {
            if (stopped) return;
            stop();
        }
        audio.addEventListener('ended', onEnded);

        function stop() {
            if (stopped) return;
            stopped = true;
            if (raf) {
                root.cancelAnimationFrame(raf);
                raf = null;
            }
            audio.removeEventListener('ended', onEnded);
            try {
                if (rec && rec.state !== 'inactive') rec.stop();
            } catch (_) {
                /* noop */
            }
            // onstop fires and resolves the blob
        }

        try {
            rec.start(250);
        } catch (e) {
            fail(e);
            return null;
        }
        if (opts.onState) opts.onState('recording');
        raf = root.requestAnimationFrame(frame);
        audio.currentTime = 0;
        audio.play().catch(function (e) {
            fail(e);
        });

        return { stop: stop };
    };
})(typeof window !== 'undefined' ? window : globalThis);
