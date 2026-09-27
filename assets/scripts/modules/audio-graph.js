/* LyricEx v1.7.0+ – shared Web Audio graph (spectrum + transpose + recording tap) */
/* One AudioContext + one MediaElementSource per audio element: Web Audio allows
   a single MediaElementSource per element, so spectrum, the pitch shifter and
   the video recorder must share it. Routing: element → source → shifter →
   analyser → speakers, with an extra source → MediaStreamDestination branch
   while recording. The shifter is a transparent bypass at 0 semitones. */
(function (root) {
    'use strict';
    var g = { ctx: null, analyser: null, data: null, shifter: null, transpose: 0 };

    function AC() {
        return root.AudioContext || root.webkitAudioContext;
    }

    // Ensure context + analyser + shifter exist, and the given audio element's
    // source is created and routed (audibly) through the analyser. Returns the
    // source node, or null when unavailable.
    g.ensure = function (audio) {
        if (!audio) return null;
        if (!g.ctx) {
            var C = AC();
            if (!C) return null;
            g.ctx = new C();
        }
        if (g.ctx.state === 'suspended') g.ctx.resume().catch(function () {});
        if (!g.analyser) {
            g.analyser = g.ctx.createAnalyser();
            g.analyser.fftSize = 128;
            g.analyser.smoothingTimeConstant = 0.8;
            g.data = new Uint8Array(g.analyser.frequencyBinCount);
            g.analyser.connect(g.ctx.destination); // one-time route to speakers
        }
        if (!g.shifter && root.__lyricexPitchShift) {
            g.shifter = root.__lyricexPitchShift.create(g.ctx);
            g.shifter.setSemitones(g.transpose);
            g.shifter.output.connect(g.analyser);
        }
        var src = audio.__lyricexSource;
        if (!src) {
            try {
                src = g.ctx.createMediaElementSource(audio);
                audio.__lyricexSource = src;
            } catch (_) {
                return null;
            }
        }
        // Fall back to a direct route when the pitch-shift module is missing.
        if (!src.__lyricexRouted) {
            src.connect(g.shifter ? g.shifter.input : g.analyser);
            src.__lyricexRouted = true;
        }
        return src;
    };

    // Transpose in semitones, -12..+12; 0 = bypass. May be called before any
    // audio element exists — the value is stored and applied when the graph is
    // first built.
    g.setTranspose = function (n) {
        g.transpose = Math.max(-12, Math.min(12, Math.round(Number(n) || 0)));
        if (g.shifter) g.shifter.setSemitones(g.transpose);
    };

    // Drive the pitch shifter's phase ramp. Call once per animation frame while
    // playing (no-op at 0 semitones).
    g.tick = function () {
        if (g.shifter) g.shifter.tick();
    };

    // Spectrum enable (passthrough analyser is always wired by ensure()).
    g.startSpectrum = function (audio) {
        return !!g.ensure(audio);
    };

    // Recording tap: branch the element's source into a MediaStreamDestination.
    // Returns { stream, stop() } or null.
    g.startRecording = function (audio) {
        var src = g.ensure(audio);
        if (!src) return null;
        try {
            if (!src.__lyricexRecordDest) {
                src.__lyricexRecordDest = g.ctx.createMediaStreamDestination();
                src.connect(src.__lyricexRecordDest);
            }
            return {
                stream: src.__lyricexRecordDest.stream,
                stop: function () {
                    if (src.__lyricexRecordDest) {
                        try {
                            src.disconnect(src.__lyricexRecordDest);
                        } catch (_) {
                            /* noop */
                        }
                        src.__lyricexRecordDest = null;
                    }
                }
            };
        } catch (_) {
            return null;
        }
    };

    g.getAnalyser = function () {
        return g.analyser;
    };
    g.getData = function () {
        return g.data;
    };

    root.__lyricexAudioGraph = g;
})(typeof window !== 'undefined' ? window : globalThis);
