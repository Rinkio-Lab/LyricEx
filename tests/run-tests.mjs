/* LyricEx self-check – run with: node tests/run-tests.mjs */
globalThis.window = globalThis;
await import('../assets/scripts/lib.js');

const lib = globalThis.__lyricexLib;
let failures = 0;

function eq(name, got, want) {
    const g = JSON.stringify(got), w = JSON.stringify(want);
    if (g !== w) { failures++; console.error(`FAIL ${name}: got ${g} want ${w}`); }
    else console.log(`ok ${name}`);
}
function ok(name, cond) {
    if (!cond) { failures++; console.error(`FAIL ${name}`); }
    else console.log(`ok ${name}`);
}

// ---- escaping (XSS trust boundary) ----
eq('esc escapes all', lib.esc(`<a b="c">&'`), '&lt;a b=&quot;c&quot;&gt;&amp;&#39;');
eq('esc null-safe', lib.esc(null), '');
eq('esc non-string', lib.esc(42), '42');

// ---- time helpers ----
eq('formatTime basic', lib.formatTime(125), '2:05');
eq('formatTime negative', lib.formatTime(-3), '0:00');
eq('formatTimePrecise', lib.formatTimePrecise(63.5), '1:03.50');
eq('parseTimePrecise', lib.parseTimePrecise('1:03.50'), 63.5);
ok('parseTimePrecise rejects junk', isNaN(lib.parseTimePrecise('abc')));

// ---- LRC parser ----
const lrc = [
    '[ti:Test Song]',
    '[ar:Tester]',
    '[offset:+500]',
    '[00:12.34][00:15.00]hello',
    '[00:13.5]world',
    '[59:59.99]end',
    'plain text without tags'
].join('\n');
const p = lib.parseLRC(lrc);
eq('lrc title', p.title, 'Test Song');
eq('lrc artist', p.artist, 'Tester');
eq('lrc offsetMs', p.offsetMs, 500);
eq('lrc multi-tag expansion', p.lines.length, 4);
eq('lrc sorted by time', p.lines.map(l => l.text), ['hello', 'world', 'hello', 'end']);
eq('lrc offset applied', p.lines[0].time.toFixed(3), '11.840');
eq('lrc long timestamp', p.lines[3].time.toFixed(3), '3599.490');
ok('lrc ignores untagged text', !p.lines.some(l => l.text === 'plain text without tags'));

const empty = lib.parseLRC('no timestamps here\njust words');
eq('lrc empty result', empty.lines, []);

// ---- word timing (v1.6.0: real package data only, no estimation) ----
const line = { time: 10, text: 'a bc d', words: [
    { text: 'a', start: 10, end: 11 },
    { text: 'bc', start: 11.5, end: 12.5 },
    { text: 'd', start: 13, end: 14 }
] };
const w = lib.wordSpans(line);
ok('word count', w && w.length === 3);
ok('words sorted by start', w[0].start === 10 && w[2].start === 13);
ok('word text kept', w[1].text === 'bc');
ok('wordSpans null without data', lib.wordSpans({ text: 'ab cd' }) === null);
ok('wordSpans null with <2 valid', lib.wordSpans({ words: [{ text: 'a', start: 0, end: 1 }] }) === null);
ok('wordSpans filters invalid entries', lib.wordSpans({ words: [
    { text: 'a', start: 0, end: 1 }, { text: 'b', start: 1, end: 2 }, { text: 'x', start: NaN, end: 3 }
] }).length === 2);

// ---- ruby annotation (v1.6.0 / v1.6.1 per-kanji split) ----
const seg = lib.annotateRuby('もうすぐ時計は6時', [
    { kanji: 'もうすぐ', hiragana: 'もうすぐ' },
    { kanji: '時計', hiragana: 'とけい' },
    { kanji: 'は', hiragana: 'は' },
    { kanji: '6時', hiragana: 'ろくじ' }
]);
eq('ruby segment types', seg.map(s => s.type), ['text', 'furigana', 'text', 'furigana']);
eq('ruby reading', seg[1].segs.map(s => s.r).join(''), 'とけい');
eq('ruby plain text bridge', seg[0].text + seg[2].text, 'もうすぐは');
ok('ruby null when no analysis', lib.annotateRuby('abc', []) === null);
ok('ruby null when nothing matches', lib.annotateRuby('abc', [{ kanji: '漢', hiragana: 'かん' }]) === null);
ok('ruby null for kana-only', lib.annotateRuby('abc', [{ kanji: 'abc', hiragana: 'abc' }]) === null);
const seg2 = lib.annotateRuby('時計は時計', [
    { kanji: '時計', hiragana: 'とけい' }, { kanji: 'は', hiragana: 'は' }, { kanji: '時計', hiragana: 'とけい' }
]);
eq('ruby repeated kanji uses cursor', seg2.map(s => s.type), ['furigana', 'text', 'furigana']);

// ---- per-kanji furigana split (v1.6.1) ----
const fmt = f => f.map(s => (s.r ? s.t + '(' + s.r + ')' : s.t)).join('');
eq('furigana okurigana split', fmt(lib.furiganaSegments('書き連ねても', 'かきつらねても')), '書(か)き連(つら)ねても');
eq('furigana single-kanji verb', fmt(lib.furiganaSegments('食べる', 'たべる')), '食(た)べる');
eq('furigana trailing kana', fmt(lib.furiganaSegments('悴んだ', 'かじかんだ')), '悴(かじか)んだ');
eq('furigana jukujikun with okurigana', fmt(lib.furiganaSegments('面白い', 'おもしろい')), '面白(おもしろ)い');
// contiguous kanji share ONE ruby block — no per-kanji guessing, kana never
// annotated (v1.6.1.1 per user request)
eq('furigana contiguous kanji one block', fmt(lib.furiganaSegments('学校', 'がっこう')), '学校(がっこう)');
eq('furigana jukujikun stays unsplit', fmt(lib.furiganaSegments('大人', 'おとな')), '大人(おとな)');
eq('furigana 3-kanji one block', fmt(lib.furiganaSegments('図書館', 'としょかん')), '図書館(としょかん)');
eq('furigana 2-kanji one block', fmt(lib.furiganaSegments('時計', 'とけい')), '時計(とけい)');
eq('furigana katakana anchor folds', fmt(lib.furiganaSegments('メモ帳', 'めもちょう')), 'メモ帳(ちょう)');
eq('furigana digit stays plain', fmt(lib.furiganaSegments('6時', 'ろくじ')), '6時(ろくじ)');
ok('furigana null without kanji', lib.furiganaSegments('かな', 'かな') === null);
ok('furigana null when reading has kanji', lib.furiganaSegments('漢字', '漢字') === null);
ok('furigana null on out-of-sync anchors', lib.furiganaSegments('食べた', 'のんだ') === null);
// degenerate package data (reading shorter than the kanji): still one block,
// visually identical to the whole-word ruby fallback — no guessing involved
eq('furigana degenerate reading single block', fmt(lib.furiganaSegments('大人', 'お')), '大人(お)');
eq('foldKana', lib.foldKana('カタカナメモ'), 'かたかなめも');
eq('foldKana keeps hiragana', lib.foldKana('ひらがな'), 'ひらがな');

// ---- v2 explicit per-char furigana (analysis[].furigana) ----
eq('furiganaFromArray jukujikun per-char',
    fmt(lib.furiganaFromArray('時計', [{ t: '時', r: 'と' }, { t: '計', r: 'けい' }])), '時(と)計(けい)');
eq('furiganaFromArray drops kana ruby',
    fmt(lib.furiganaFromArray('書く', [{ t: '書', r: 'か' }, { t: 'く', r: 'く' }])), '書(か)く');
ok('furiganaFromArray rejects surface mismatch', lib.furiganaFromArray('時計', [{ t: '時', r: 'と' }]) === null);
ok('furiganaFromArray rejects empty array', lib.furiganaFromArray('時計', []) === null);
ok('furiganaFromArray rejects missing t', lib.furiganaFromArray('時計', [{ r: 'と' }]) === null);
const seg3 = lib.annotateRuby('時計は6時', [
    { kanji: '時計', furigana: [{ t: '時', r: 'と' }, { t: '計', r: 'けい' }] },
    { kanji: 'は', hiragana: 'は' },
    { kanji: '6時', hiragana: 'ろくじ' }
]);
eq('v2 furigana overrides whole-word split', fmt(seg3[0].segs), '時(と)計(けい)');
ok('v2 furigana falls back to anchor split on bad array',
    lib.annotateRuby('時計', [{ kanji: '時計', hiragana: 'とけい', furigana: [{ t: '時', r: 'と' }] }])[0].segs[0].t === '時計');

// ---- fonts (v1.6.1) ----
eq('lyric font defaults to JP stack', lib.SETTINGS_DEFAULTS.lyricFont, 'jp');
ok('jp preset is JP-first without Noto fallback',
    lib.fontStack('jp', '').indexOf("'M PLUS Rounded 1c'") === 0 &&
    lib.fontStack('jp', '').indexOf('Noto Sans SC') === -1);
eq('translation font defaults to SC stack', lib.SETTINGS_DEFAULTS.translationFont, 'sc');
ok('sc preset is SC-first without M PLUS fallback',
    lib.fontStack('sc', '').indexOf("'Noto Sans SC'") === 0 &&
    lib.fontStack('sc', '').indexOf('M PLUS Rounded 1c') === -1);
eq('inherit preset follows UI font', lib.fontStack('inherit', ''), 'var(--font)');
eq('lyric weight defaults to regular', lib.SETTINGS_DEFAULTS.lyricWeight, 'regular');

// ---- per-line script detection (v1.6.2) ----
ok('isChinese true for simplified CN', lib.isChinese('我的心是巧克力螺') === true);
ok('isChinese true for kana-less hanzi', lib.isChinese('月光') === true);
ok('isChinese false for hiragana line', lib.isChinese('もうすぐ時計は6時') === false);
ok('isChinese false for katakana line', lib.isChinese('カタカナメモ') === false);
ok('isChinese false for iteration mark', lib.isChinese('時々') === false);
ok('isChinese false for latin', lib.isChinese('hello world') === false);
ok('isChinese false for empty', lib.isChinese('') === false);
ok('isChinese false for null', lib.isChinese(null) === false);

// ---- color helpers (v1.6.0) ----
eq('hexToRgb 6-digit', lib.hexToRgb('#8a7a6a'), [138, 122, 106]);
eq('hexToRgb 3-digit', lib.hexToRgb('#abc'), [170, 187, 204]);
ok('hexToRgb rejects junk', lib.hexToRgb('nope') === null);
eq('darken', lib.darken('#8a7a6a', 0.15), '#75685a');
eq('darken keeps invalid input', lib.darken('not-a-color', 0.2), 'not-a-color');
eq('hexToRgba', lib.hexToRgba('#8a7a6a', 0.15), 'rgba(138, 122, 106, 0.15)');
eq('hexToRgba clamps alpha', lib.hexToRgba('#8a7a6a', 2), 'rgba(138, 122, 106, 1)');

// ---- settings merge ----
const merged = lib.mergeSettings(
    { theme: 'dark', lyricSize: 99, shortcuts: { mute: 'x' }, posColors: { hiragana: '#123456' } },
    lib.SETTINGS_DEFAULTS
);
ok('merge keeps provided', merged.theme === 'dark' && merged.lyricSize === 99 && merged.shortcuts.mute === 'x');
ok('merge fills defaults', merged.subLine === 'auto' && merged.shortcuts.playPause === ' ');
ok('merge fills nested posColors', merged.posColors.hiragana === '#123456' && merged.posColors.romaji === '');
ok('merge drops unknown keys', !('nope' in merged));
ok('v1.6.0 defaults present',
    merged.showRuby === true && merged.defaultView === 'lyrics' && merged.customAccent === '#8a7a6a' &&
    typeof merged.cinemaLyricSize === 'number');
eq('merge on empty stored', lib.mergeSettings({}, lib.SETTINGS_DEFAULTS), lib.SETTINGS_DEFAULTS);
ok('settingsChanged detects diff', lib.settingsChanged(merged, lib.SETTINGS_DEFAULTS) === true);
ok('settingsChanged false on defaults',
    !lib.settingsChanged(JSON.parse(JSON.stringify(lib.SETTINGS_DEFAULTS)), lib.SETTINGS_DEFAULTS));

// ---- key normalization ----
eq('normalize space', lib.normalizeKey(' '), ' ');
eq('normalize letter', lib.normalizeKey('M'), 'm');
eq('normalize arrow', lib.normalizeKey('ArrowLeft'), 'ArrowLeft');
eq('normalize junk', lib.normalizeKey(''), '');

// ---- manifest validation ----
ok('manifest valid', lib.validateManifest({ format: 'lyricex-package', version: 1, title: 'T', lyricsFile: 'lyrics.json' }));
ok('manifest v2 valid', lib.validateManifest({ format: 'lyricex-package', version: 2, title: 'T', lyricsFile: 'lyrics.json' }));
ok('manifest wrong format', !lib.validateManifest({ format: 'x', version: 1, title: 'T', lyricsFile: 'l.json' }));
ok('manifest missing lyricsFile', !lib.validateManifest({ format: 'lyricex-package', version: 1, title: 'T' }));

// ---- font stack ----
eq('font default preset', lib.fontStack('default', ''), 'var(--font)');
eq('font custom wins', lib.fontStack('serif', '  My Font  '), 'My Font');
eq('font unknown preset fallback', lib.fontStack('nope', ''), 'var(--font)');

// ---- sibling suites (v2.4.1): run-tests is the FULL self-check. Each suite
// runs as a subprocess; a failing suite fails the whole run. Previously this
// file only tested lib, so other suites could break unnoticed.
const { execFileSync } = await import('child_process');
const suites = ['i18n-check.mjs', 'boot-smoke.mjs', 'lang-switch.mjs', 'utils-test.mjs', 'library-test.mjs'];
for (const name of suites) {
    try {
        execFileSync(process.execPath, ['tests/' + name], { stdio: 'inherit' });
        console.log('ok suite ' + name);
    } catch (_) {
        failures++;
        console.error('FAIL suite ' + name);
    }
}

console.log(failures === 0 ? 'ALL TESTS PASSED' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
