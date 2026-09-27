/* LyricEx v2.0.0 – pitch-shift math (pure; no DOM, no AudioContext).
   The runtime DSP (js/modules/pitch-shift.js) is a tape-style granular shifter:
   two delay lines modulated by a linear ramp + a complementary raised-cosine
   crossfade. This file holds only the arithmetic so it can be unit-tested in Node. */
(function (root) {
    'use strict';
    var u = (root.__lyricexUtils = root.__lyricexUtils || {});

    // semitones (12-EDO) <-> playback-ratio. ratio 2^(s/12).
    u.semitoneToRatio = function (s) {
        return Math.pow(2, s / 12);
    };
    u.ratioToSemitones = function (r) {
        return r > 0 ? 12 * (Math.log(r) / Math.LN2) : 0;
    };

    // Granular pitch-shift parameters. The delay line ramps base -> base+depth
    // (or back) once per LFO cycle; a constant ramp slope D' gives pitch factor
    // (1 - D'), so |1 - ratio| = depth * lfoFreq. For ratio < 1 (shift down)
    // the delay must ramp UP (D' > 0); for ratio > 1 it ramps DOWN.
    u.pitchShift = {
        base: 0.03, // seconds of base delay (adds ~30ms latency when active)
        depth: 0.03, // seconds of delay swing

        // LFO frequency so depth*f == |1 - ratio|, clamped to keep the granular
        // rate sane. 0 for unity ratio (bypass).
        lfoFreq: function (ratio) {
            var d = Math.abs(1 - ratio);
            if (d < 1e-4) return 0;
            return Math.min(d / u.pitchShift.depth, 30);
        },

        // ramp shape at phase p in [0,1): ratio<1 -> rising delay (down),
        // ratio>1 -> falling delay (up).
        ramp: function (phase, ratio) {
            return ratio < 1 ? phase : 1 - phase;
        },

        // delayTime at phase p for the target ratio.
        delayAt: function (phase, ratio) {
            return u.pitchShift.base + u.pitchShift.depth * u.pitchShift.ramp(phase, ratio);
        },

        // Crossfade window: a Hann window over one LFO period. It is 0 at the
        // ramp reset points (phase 0 and 1) and 1 at mid-ramp (phase 0.5), so
        // each tap's reset glitch is masked. window(p) + window(p + 0.5) === 1,
        // so the two taps sum to a flat gain.
        window: function (phase) {
            return 0.5 * (1 - Math.cos(2 * Math.PI * phase));
        }
    };
})(typeof window !== 'undefined' ? window : globalThis);
