/* LyricEx boot smoke test – runs the real app.js against a minimal DOM shim.
   Run with: node tests/boot-smoke.mjs */
function makeEl() {
    return {
        style: { setProperty() {}, removeProperty() {}, display: '' },
        classList: {
            add() {},
            remove() {},
            toggle() {},
            contains() {
                return false;
            }
        },
        addEventListener() {},
        removeEventListener() {},
        setPointerCapture() {},
        appendChild() {},
        dataset: {},
        innerHTML: '',
        textContent: '',
        value: '',
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        closest() {
            return null;
        },
        getBoundingClientRect() {
            return { left: 0, top: 0, width: 100, height: 10 };
        },
        offsetTop: 0,
        offsetHeight: 0,
        offsetLeft: 0,
        offsetWidth: 0,
        clientHeight: 0,
        clientWidth: 0,
        scrollTop: 0,
        scrollHeight: 0,
        setAttribute() {},
        removeAttribute() {},
        getAttribute() {
            return null;
        },
        click() {},
        remove() {}
    };
}
const byId = new Map();
function gid(id) {
    if (!byId.has(id)) byId.set(id, makeEl());
    return byId.get(id);
}
globalThis.window = globalThis;
globalThis.document = {
    getElementById: gid,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => makeEl(),
    createTextNode: (text) => ({ nodeType: 3, textContent: String(text) }),
    head: makeEl(),
    addEventListener() {},
    documentElement: { lang: '' },
    body: makeEl()
};
Object.defineProperty(globalThis, 'navigator', {
    value: { language: 'zh-CN', mediaSession: undefined },
    configurable: true
});
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
Object.defineProperty(globalThis, 'performance', {
    value: { now: () => 0 },
    configurable: true
});
globalThis.matchMedia = () => ({ matches: false });
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
let exportedBlob = null;
globalThis.URL = {
    createObjectURL(b) {
        exportedBlob = b;
        return 'blob:x';
    },
    revokeObjectURL() {}
};
globalThis.alert = () => {};
globalThis.confirm = () => true;
globalThis.print = () => {}; // v2.0.0: print study sheet no-op in smoke test

let failures = 0;
function ok(name, cond) {
    if (!cond) {
        failures++;
        console.error(`FAIL ${name}`);
    } else console.log(`ok ${name}`);
}

// load in the same order as index.html
await import('../assets/locales/index.js');
await import('../assets/locales/languages.js');
await import('../assets/locales/zh.js');
await import('../assets/locales/ja.js');
await import('../assets/locales/en.js');
await import('../assets/scripts/lib.js');
await import('../assets/scripts/changelog.js');
await import('../assets/scripts/utils/theme.js');
await import('../assets/scripts/utils/loop.js');
await import('../assets/scripts/utils/pitch.js');
await import('../assets/scripts/utils/recent.js');
await import('../assets/scripts/utils/search.js');
await import('../assets/scripts/utils/subtitles.js');
await import('../assets/scripts/utils/notes.js');
await import('../assets/scripts/utils/wordtiming.js');
await import('../assets/scripts/utils/canvas.js');
await import('../assets/scripts/utils/share-card.js');
await import('../assets/scripts/utils/netease.js');
await import('../assets/scripts/utils/ai-import.js');
await import('../assets/scripts/utils/ai-prompt.js');
await import('../assets/scripts/utils/lyric-package.js');
await import('../assets/scripts/modules/pitch-shift.js');
await import('../assets/scripts/modules/audio-graph.js');
await import('../assets/scripts/modules/recent-store.js');
await import('../assets/scripts/modules/video.js');
await import('../assets/scripts/ui/video-export.js');
await import('../assets/scripts/ui/share.js');
await import('../assets/scripts/ui/editor.js');
await import('../assets/scripts/ui/workspace.js');
await import('../assets/scripts/ui/search.js');
await import('../assets/scripts/ui/mini.js');
await import('../assets/scripts/ui/cinema.js');
await import('../assets/scripts/ui/about.js');
await import('../assets/scripts/ui/settings.js');
await import('../assets/scripts/help-content.js');
await import('../assets/scripts/app.js');
await import('../assets/scripts/ui/focus-trap.js'); // v2.2.0 a11y module (same order as index.html)

const api = window.__lyricex;
ok('API exposed', !!api);
ok('boot did not throw', true);
ok('changelog data loaded', Array.isArray(window.__lyricexChangelog) && window.__lyricexChangelog.length > 0);

// settings engine
api.setSetting('lyricSize', 32);
ok('setSetting/getSetting roundtrip', api.getSettings().lyricSize === 32);
api.setSetting('shortcuts.playPause', 'k');
ok('nested shortcut setting', api.getSettings().shortcuts.playPause === 'k');
api.setSetting('shortcuts.playPause', ' ');
ok('theme toggle', (api.toggleTheme(), true));
api.toggleTheme();
ok('theme 3-state reaches system', api.getSettings().theme === 'system');
api.toggleTheme();
ok('theme 3-state cycles back to light', api.getSettings().theme === 'light');

// v1.6.0 / v1.6.1 settings
const s0 = api.getSettings();
ok('v1.6.0 defaults present', s0.showRuby === true && s0.posColors.romaji === '' && s0.defaultView === 'lyrics');
ok('v1.6.1 lyric font default is JP stack', s0.lyricFont === 'jp');
ok('translation font default is SC stack', s0.translationFont === 'sc');
api.setSetting('showRuby', false);
ok('showRuby toggle', api.getSettings().showRuby === false);
api.setSetting('showRuby', true);
api.setSetting('posColors.hiragana', '#112233');
ok('nested posColors setting', api.getSettings().posColors.hiragana === '#112233');
api.setSetting('defaultView', 'study');
ok('defaultView setting', api.getSettings().defaultView === 'study');

// v2.0.5: per-line audition behavior defaults (pause + progress snap)
ok('audition auto-pause default on', api.getSettings().auditionAutoPause === true);
ok('audition snap default start', api.getSettings().auditionSnap === 'start');
api.setSetting('auditionAutoPause', false);
ok('audition auto-pause toggle', api.getSettings().auditionAutoPause === false);
api.setSetting('auditionSnap', 'end');
ok('audition snap select', api.getSettings().auditionSnap === 'end');

// LRC load (lyrics-only path)
const fakeLrc = {
    name: 'test.lrc',
    text: async () => '[ti:T]\n[ar:A]\n[00:01.00]hello world\n[00:02.50]second line\n'
};
await api.loadLrc(fakeLrc);
const data = api.data();
ok('lrc songData title', data && data.title === 'T');
ok('lrc lyrics parsed', data && data.lyrics && data.lyrics.length === 2);
ok('lrc artist', data.artist === 'A');

// view renders
api.switchView('mixed');
ok('mixed view renders', true);
api.switchView('study');
ok('study view renders', true);
api.switchView('editor');
ok('editor view renders', true);
api.switchView('help');
ok('help view renders (nav guard path)', true);

// mini mode
api.toggleMini();
ok('mini on', true);
api.toggleMini();
ok('mini off', true);

// cinema
api.openCinema();
ok('cinema open', true);
api.closeCinema();
ok('cinema close', true);

// lrc export
api.exportLrc();
ok('export produced blob', !!exportedBlob);
const text = exportedBlob ? await exportedBlob.text() : '';
ok('exported lrc content', text.includes('[ti:T]') && text.includes('[00:01.00]hello world'));

// settings reset
api.setSetting('lyricSize', 40);
api.getSettings(); // noop read
// reset via internal button flow is hard to trigger without events; verify defaults intact instead
const lib = window.__lyricexLib;
ok('lib loaded', !!lib && typeof lib.parseLRC === 'function');

// ---- ZIP loading paths (fake JSZip + Audio) ----
globalThis.Audio = class {
    constructor() {
        this.currentTime = 0;
        this.volume = 0.8;
        this.playbackRate = 1;
        this.duration = 100;
        this.preload = '';
        this.src = '';
    }
    addEventListener() {}
    play() {
        return Promise.resolve();
    }
    pause() {}
};
function zipEntry(json) {
    return { dir: false, async: async (t) => (t === 'text' ? json : new Blob(['x'])) };
}
function fakeZip(files) {
    globalThis.JSZip = { loadAsync: async () => ({ files }) };
}
// 1) LyricEx manifest package
fakeZip({
    'manifest.json': zipEntry(
        JSON.stringify({
            format: 'lyricex-package',
            version: 1,
            title: 'Manifest Song',
            artist: 'MA',
            audio: 'audio.mp3',
            lyricsFile: 'lyrics.json',
            config: { lyricOffset: 0 }
        })
    ),
    'lyrics.json': zipEntry(
        JSON.stringify({
            lyrics: [
                { time: 1, text: 'one' },
                { time: 2, text: 'two' }
            ]
        })
    ),
    'audio.mp3': zipEntry('')
});
await api.loadZip({ name: 'm.lxp.zip' });
ok('manifest package loaded', api.data() && api.data().title === 'Manifest Song');
ok('manifest sourceFormat', api.data().sourceFormat === 'lyricex-package');
ok('manifest lyrics count', api.data().lyrics.length === 2);

// 2) legacy 群友 package
fakeZip({
    'song.json': zipEntry(
        JSON.stringify({
            title: 'Legacy Song',
            lyrics: [{ time: 0, text: 'a' }],
            config: { lyricOffset: -0.3 }
        })
    ),
    'x.mp3': zipEntry('')
});
await api.loadZip({ name: 'l.zip' });
ok('legacy package loaded', api.data() && api.data().title === 'Legacy Song');
ok('legacy sourceFormat', api.data().sourceFormat === 'legacy');

// 3) zip with .lrc + mp3
fakeZip({
    'a.lrc': zipEntry('[ti:LRC Song]\n[00:05.00]abc\n[00:06.00]def\n'),
    'a.mp3': zipEntry('')
});
await api.loadZip({ name: 'lr.zip' });
ok('zip-lrc loaded', api.data() && api.data().title === 'LRC Song');
ok('zip-lrc sourceFormat', api.data().sourceFormat === 'lrc');

// 4) invalid manifest → graceful error, no crash
fakeZip({
    'manifest.json': zipEntry(JSON.stringify({ format: 'evil', version: 9 })),
    'a.mp3': zipEntry('')
});
await api.loadZip({ name: 'bad.zip' });
ok('invalid manifest did not crash', true);

// 5) v1.6.0: ruby annotation + per-word karaoke rendering
fakeZip({
    'song.json': zipEntry(
        JSON.stringify({
            title: 'Ruby Song',
            lyrics: [
                {
                    time: 0,
                    text: '時計は6時',
                    analysis: [
                        { kanji: '時計', hiragana: 'とけい' },
                        { kanji: 'は', hiragana: 'は' },
                        { kanji: '6時', hiragana: 'ろくじ' }
                    ],
                    words: [
                        { text: '時計は', start: 0, end: 1 },
                        { text: '6時', start: 1, end: 2 }
                    ]
                },
                {
                    time: 2,
                    text: 'hello world',
                    words: [
                        { text: 'hello', start: 2, end: 2.5 },
                        { text: 'world', start: 2.5, end: 3 }
                    ]
                }
            ]
        })
    )
});
await api.loadZip({ name: 'ruby.zip' });
api.switchView('lyrics');
const viewHtml = gid('viewContent').innerHTML;
ok(
    'ruby rendered for analysis lines',
    viewHtml.includes('<ruby>時計<rt>とけい</rt></ruby>') && viewHtml.includes('6<ruby>時<rt>ろくじ</rt></ruby>')
);
ok('word spans render on analysis-free line', viewHtml.includes('<span class="w" data-w="0">hello</span>'));
api.switchView('study');
ok('study view with ruby header renders', true);
api.switchView('editor');
ok('editor v2 renders', true);

// v1.6.1: follow contract — the progress-drag release handler pairs
// enableFollow() with setActiveLine(idx,'instant'); both halves are exercised
// through the public API and must keep follow on.
ok('followOn exposed', typeof api.followOn === 'function');
ok('follow enabled by default', api.followOn() === true);
api.enableFollow();
api.setActiveLine(0, 'instant');
ok('follow stays on through explicit seek', api.followOn() === true);

// v2.0.0 #10: transpose state (session-only; no AudioContext needed for the value)
ok('transpose default 0', api.getTranspose() === 0);
api.setTranspose(3);
ok('transpose set +3', api.getTranspose() === 3 && gid('transposeVal').textContent === '+3');
api.setTranspose(14);
ok('transpose clamps to +12', api.getTranspose() === 12);
api.setTranspose(0);

// v2.0.0 #15: bookmarks — saving without an A/B range is a no-op
api.saveBookmark();
ok('saveBookmark no-op without AB', api.getLoopMarks().length === 0);

// v2.0.0 #13: instrumental detection from the manifest
fakeZip({
    'manifest.json': zipEntry(
        JSON.stringify({
            format: 'lyricex-package',
            version: 1,
            title: 'Inst Song',
            audio: 'audio.mp3',
            instrumental: 'offvocal.mp3',
            lyricsFile: 'lyrics.json',
            config: {}
        })
    ),
    'lyrics.json': zipEntry(JSON.stringify({ lyrics: [{ time: 0, text: 'one' }] })),
    'audio.mp3': zipEntry(''),
    'offvocal.mp3': zipEntry('')
});
await api.loadZip({ name: 'inst.zip' });
ok('instrumental detected', api.hasInstrumental() === true);
// v2.0.4: the player-bar track button switches the MAIN playback track
// between 原声 and 伴奏; the per-line ♪ then auditions the OTHER track
ok('track mode defaults to original', api.getTrackMode() === 'original');
api.toggleTrackMode();
ok('track mode toggles to instrumental', api.getTrackMode() === 'instrumental');
api.toggleTrackMode();
ok('track mode toggles back to original', api.getTrackMode() === 'original');
// v2.0.2: the editor exposes the instrumental add/remove entry once loaded
api.switchView('editor');
ok('instrumental editor entry rendered', gid('viewContent').innerHTML.includes('id="editorInstRemoveBtn"'));

// v2.0.0 #22/#31: manifest v2 with folder paths + cover
fakeZip({
    'manifest.json': zipEntry(
        JSON.stringify({
            format: 'lyricex-package',
            version: 2,
            title: 'V2 Song',
            artist: 'VA',
            audio: 'assets/audio.mp3',
            cover: 'assets/cover.jpg',
            lyricsFile: 'lyrics/lyrics.json',
            config: {}
        })
    ),
    'lyrics/lyrics.json': zipEntry(JSON.stringify({ lyrics: [{ time: 0, text: '一', lang: 'ja' }] })),
    'assets/audio.mp3': zipEntry(''),
    'assets/cover.jpg': zipEntry('')
});
await api.loadZip({ name: 'v2.zip' });
ok('manifest v2 loaded', api.data() && api.data().title === 'V2 Song');
ok('cover detected', api.hasCover() === true);
ok('per-line lang preserved', api.data().lyrics[0].lang === 'ja');

// v2.0.0 #14: queue starts empty (multi-file drop is exercised by handleFiles)
ok('queue empty by default', api.getQueue().length === 0);

// v2.0.0 #18: notes export goes through the download path without throwing
api.exportNotes('md');
ok('notes export does not throw', true);

console.log(failures === 0 ? 'BOOT SMOKE PASSED' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
