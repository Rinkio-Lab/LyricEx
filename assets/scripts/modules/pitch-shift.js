/* LyricEx v2.0.0 – real-time granular pitch shifter (Web Audio; needs AudioContext).
   Tape-style shifter: two delay lines modulated by a linear ramp (constant slope
   => constant pitch offset) with a complementary raised-cosine crossfade so each
   tap's reset glitch is masked by the other. Math lives in js/utils/pitch.js.

   ponytail: this is practice-grade DSP — it shifts pitch in real time with no
   dependency, but large shifts (>~7 semitones) and long base delay produce
   audible granular "choppiness". Ceiling: swap the delay-line core for a
   phase-vocoder (e.g. SoundTouch WASM) if pristine quality is ever needed.
   Also the crossfade is aligned to the ramp phase, not delay-compensated for the
   ~30ms base latency — negligible at moderate shift depths. */
(function (root) {
    'use strict';

    function create(ctx) {
        var U = root.__lyricexUtils;
        var ratio = 1,
            f = 0,
            active = false;
        var phaseA = 0,
            last = 0;

        var input = ctx.createGain(); // unity input tap
        var output = ctx.createGain(); // unity output tap
        var bypass = ctx.createGain(); // transparent path when ratio == 1

        var delayA = ctx.createDelay(0.2);
        var delayB = ctx.createDelay(0.2);
        delayA.delayTime.value = U.pitchShift.base;
        delayB.delayTime.value = U.pitchShift.base;
        var gainA = ctx.createGain();
        var gainB = ctx.createGain();
        gainA.gain.value = 0;
        gainB.gain.value = 0;

        input.connect(bypass);
        bypass.connect(output); // bypass (ratio 1)
        input.connect(delayA);
        delayA.connect(gainA);
        gainA.connect(output);
        input.connect(delayB);
        delayB.connect(gainB);
        gainB.connect(output);

        function setSemitones(n) {
            n = Number(n) || 0;
            n = Math.max(-12, Math.min(12, Math.round(n)));
            ratio = U.semitoneToRatio(n);
            f = U.pitchShift.lfoFreq(ratio);
            active = n !== 0;
            phaseA = 0;
            last = 0;
            // swap transparent <-> active path (avoid doubling / dead air)
            bypass.gain.value = active ? 0 : 1;
            if (!active) {
                gainA.gain.value = 0;
                gainB.gain.value = 0;
            }
        }

        // Advance phases by the audio-clock delta and schedule smooth ramps so
        // delayTime follows a clean sawtooth (piecewise-linear via
        // linearRampToValueAtTime each frame) instead of 60Hz zipper steps.
        // Call once per animation frame while audio is playing; uses ctx.currentTime
        // internally so ramps are scheduled in the AudioContext's own clock.
        function tick() {
            if (!active) return;
            var now = ctx.currentTime;
            if (!last) {
                last = now;
                return;
            } // first frame: nothing to ramp yet
            var dt = Math.max(0, now - last);
            last = now;
            phaseA = (phaseA + f * dt) % 1;
            var phaseB = (phaseA + 0.5) % 1;

            var nextA = U.pitchShift.delayAt(phaseA, ratio);
            var nextB = U.pitchShift.delayAt(phaseB, ratio);
            delayA.delayTime.linearRampToValueAtTime(nextA, now + dt);
            delayB.delayTime.linearRampToValueAtTime(nextB, now + dt);

            gainA.gain.setTargetAtTime(U.pitchShift.window(phaseA), now, 0.01);
            gainB.gain.setTargetAtTime(U.pitchShift.window(phaseB), now, 0.01);
        }

        return { input: input, output: output, setSemitones: setSemitones, tick: tick };
    }

    root.__lyricexPitchShift = { create: create };
})(typeof window !== 'undefined' ? window : globalThis);
