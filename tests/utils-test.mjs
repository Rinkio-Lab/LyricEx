/* LyricEx utils self-check – node tests/utils-test.mjs */
globalThis.window = globalThis;
await import('../assets/scripts/lib.js');
await import('../assets/scripts/utils/theme.js');
await import('../assets/scripts/utils/loop.js');
await import('../assets/scripts/utils/pitch.js');
await import('../assets/scripts/utils/recent.js');
await import('../assets/scripts/utils/search.js');
await import('../assets/scripts/utils/subtitles.js');
await import('../assets/scripts/utils/notes.js');
await import('../assets/scripts/utils/wordtiming.js');
await import('../assets/scripts/utils/share-card.js');

const u = globalThis.__lyricexUtils;
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

// ---- theme three-state ----
eq('theme cycle light->dark', u.nextTheme('light'), 'dark');
eq('theme cycle dark->system', u.nextTheme('dark'), 'system');
eq('theme cycle system->light', u.nextTheme('system'), 'light');
eq('resolveTheme passthrough dark', u.resolveTheme('dark'), 'dark');
eq('resolveTheme passthrough light', u.resolveTheme('light'), 'light');
ok('resolveTheme system resolves to a theme', ['dark', 'light'].indexOf(u.resolveTheme('system')) !== -1);

// ---- sentence loop ----
eq('loop cycle none->single', u.nextLoopMode('none'), 'single');
eq('loop cycle single->line', u.nextLoopMode('single'), 'line');
eq('loop cycle line->none', u.nextLoopMode('line'), 'none');
const lyrics = [
    { time: 10, text: 'a' }, { time: 12, text: 'b' }, { time: 15, text: 'c' }
];
eq('line bounds uses next line', u.lineLoopBounds(lyrics, 0, 0, 100), { start: 10, end: 12 });
eq('line bounds last line uses duration', u.lineLoopBounds(lyrics, 0, 2, 100), { start: 15, end: 100 });
eq('line bounds last line pads when no duration', u.lineLoopBounds(lyrics, 0, 2, 0), { start: 15, end: 18 });
eq('line bounds applies offset', u.lineLoopBounds(lyrics, 1, 1, 100), { start: 11, end: 14 });
ok('line bounds null for bad index', u.lineLoopBounds(lyrics, 0, 9, 100) === null);

// ---- search ----
const idx = u.buildSearchIndex([
    { text: '悴んだ心', translation: '内心憔悴', analysis: [{ romaji: 'kaji kan da', hiragana: 'かじかんだ', kanji: '悴んだ', partOfSpeech: '動詞', meaning: '冻僵' }] },
    { text: 'hello world', translation: '你好世界', note: 'english' }
]);
ok('search index length', idx.length === 2);
eq('search hits text', u.searchLyrics(idx, 'んだ心'), [{ lineIndex: 0, fields: ['text'] }]);
// a query present in several fields reports all of them (multi-field search)
eq('search multi-field hits', u.searchLyrics(idx, '悴'), [{ lineIndex: 0, fields: ['text', 'translation', 'kanji'] }]);
eq('search hits translation', u.searchLyrics(idx, '内心'), [{ lineIndex: 0, fields: ['translation'] }]);
eq('search hits analysis field', u.searchLyrics(idx, '動詞'), [{ lineIndex: 0, fields: ['pos'] }]);
eq('search hits romaji', u.searchLyrics(idx, 'kaji'), [{ lineIndex: 0, fields: ['romaji'] }]);
eq('search case-insensitive', u.searchLyrics(idx, 'HELLO'), [{ lineIndex: 1, fields: ['text'] }]);
eq('search empty query', u.searchLyrics(idx, ''), []);
ok('highlight escapes and wraps', u.highlight('a <b> c', '<b>') === 'a <mark>&lt;b&gt;</mark> c');
ok('highlight empty query escapes only', u.highlight('<x>', '') === '&lt;x&gt;');

// ---- subtitles ----
eq('srt time', u.formatSrtTime(65.045), '00:01:05,045');
eq('ass time', u.formatAssTime(65.05), '0:01:05.05');
const srt = u.buildSrt(lyrics, 0, { includeTranslation: false, endPad: 3 });
ok('srt has sequence numbers', srt.includes('1\n') && srt.includes('2\n'));
ok('srt uses --> arrows', srt.includes(' --> '));
const ass = u.buildAss(lyrics, 0, { includeTranslation: true });
ok('ass has script info', ass.includes('[Script Info]'));
ok('ass has styles', ass.includes('[V4+ Styles]') && ass.includes('Style: Lyric'));
ok('ass has dialogue', ass.includes('Dialogue: 0,'));

// ---- multi-bookmark loop (v2.0.0 #15) ----
const marks = [
    { id: 'a', start: 5, end: 20, active: true },
    { id: 'b', start: 8, end: 12, active: true },
    { id: 'c', start: 30, end: 40, active: false }
];
ok('bookmark picks innermost', u.activeBookmark(marks, 9) === marks[1]);
ok('bookmark falls back to outer', u.activeBookmark(marks, 6) === marks[0]);
ok('bookmark skips inactive', u.activeBookmark(marks, 35) === null);
ok('bookmark ignores invalid range', u.activeBookmark([{ start: 5, end: 2, active: true }], 5) === null);
ok('bookmark null on empty', u.activeBookmark([], 5) === null);

// ---- pitch-shift math (v2.0.0 #10) ----
eq('semitone 0 ratio', u.semitoneToRatio(0), 1);
ok('semitone 12 ratio ~2', Math.abs(u.semitoneToRatio(12) - 2) < 1e-9);
ok('ratio roundtrip', Math.abs(u.ratioToSemitones(u.semitoneToRatio(7)) - 7) < 1e-9);
eq('pitch lfoFreq unity -> 0', u.pitchShift.lfoFreq(1), 0);
ok('pitch lfoFreq = |1-r|/depth', Math.abs(u.pitchShift.lfoFreq(0.5) - 0.5 / 0.03) < 1e-9);
eq('pitch lfoFreq clamps', u.pitchShift.lfoFreq(2), 30);
eq('pitch ramp up for down-shift', u.pitchShift.ramp(0.25, 0.5), 0.25);
eq('pitch ramp down for up-shift', u.pitchShift.ramp(0.25, 2), 0.75);
eq('pitch delayAt base', u.pitchShift.delayAt(0, 0.5), u.pitchShift.base);
ok('pitch delayAt grows for down-shift', u.pitchShift.delayAt(0.5, 0.5) > u.pitchShift.delayAt(0, 0.5));
ok('pitch delayAt shrinks for up-shift', u.pitchShift.delayAt(0.5, 2) < u.pitchShift.delayAt(0, 2));
ok('pitch window sums to 1 with half-period partner',
    Math.abs(u.pitchShift.window(0.3) + u.pitchShift.window(0.8) - 1) < 1e-9);
ok('pitch window peaks at mid-phase', Math.abs(u.pitchShift.window(0.5) - 1) < 1e-9);
ok('pitch window 0 at reset points', u.pitchShift.window(0) < 1e-9 && u.pitchShift.window(1) < 1e-9);

// ---- recent prune (v2.0.0 #14) ----
const recent = [
    { name: 'b.zip', ts: 3 }, { name: 'a.zip', ts: 1 }, { name: 'c.zip', ts: 2 }, { name: 'b.zip', ts: 5 }
];
eq('pruneRecent newest first + dedupe', u.pruneRecent(recent, 10).map(e => e.name), ['b.zip', 'c.zip', 'a.zip']);
eq('pruneRecent caps', u.pruneRecent(recent, 2).map(e => e.name), ['b.zip', 'c.zip']);
ok('pruneRecent does not mutate', recent.length === 4);
eq('pruneRecent empty', u.pruneRecent([], 5), []);
eq('queuePeek first', u.queuePeek([{ name: 'x' }, { name: 'y' }]).name, 'x');
eq('queuePeek empty', u.queuePeek([]), null);

// ---- study notes export (v2.0.0 #18) ----
const noteLyrics = [
    { time: 1, text: '時計', translation: '时钟', romaji: 'tokei', note: 'n1',
        analysis: [{ romaji: 'tokei', hiragana: 'とけい', kanji: '時計', partOfSpeech: '名詞', meaning: '钟' }] },
    { time: 2.5, text: 'hello' }
];
const md = u.buildStudyNotes(noteLyrics, { title: 'Song', artist: 'A', format: 'md', labels: {} });
ok('notes md header', md.indexOf('# Song · A') === 0);
ok('notes md line heading', md.includes('## [00:01.00] 時計'));
ok('notes md translation', md.includes('翻译：时钟'));
ok('notes md table header', md.includes('| romaji | hiragana | kanji | partOfSpeech | meaning |'));
ok('notes md table row', md.includes('| tokei | とけい | 時計 | 名詞 | 钟 |'));
ok('notes md skips analysis-free table', !md.includes('hello') || md.indexOf('hello') > md.indexOf('時計'));
const htmlNotes = u.buildStudyNotes(noteLyrics, { title: 'Song', format: 'html' });
ok('notes html doctype', htmlNotes.indexOf('<!DOCTYPE html>') === 0);
ok('notes html table', htmlNotes.includes('<table') && htmlNotes.includes('<h1>Song</h1>'));

// ---- poster (v2.0.0 #19) ----
const poster = u.buildPosterHTML({ title: 'T', lyricHtml: '歌詞', translation: '译', romaji: 'kashi' });
ok('poster portrait dims', poster.includes('1080px') && poster.includes('1920px'));
ok('poster has lyric + powered', poster.includes('歌詞') && poster.includes('Powered by LyricEx'));

// ---- word timing import (v2.0.0 #28) ----
const wlrc = u.parseLrcWordLines('[00:01.00]<00:01.00>こ<00:01.50>ん<00:02.00>にちは\n[00:03.00]hello\n');
eq('wlrc line count', wlrc.lines.length, 2);
eq('wlrc strips inline tags', wlrc.lines[0].text, 'こんにちは');
eq('wlrc word texts', wlrc.lines[0].words.map(w => w.text), ['こ', 'ん', 'にちは']);
eq('wlrc word ends borrow next line', wlrc.lines[0].words.map(w => w.end), [1.5, 2, 3]);
ok('wlrc no words on untagged line', wlrc.lines[1].words.length === 0);
const assK = u.parseAssKaraoke('[Events]\nDialogue: 0,0:00:01.00,0:00:03.00,Lyric,,0,0,0,,{\\k20}こ{\\k30}ん{\\k50}にちは\n');
eq('ass line count', assK.length, 1);
eq('ass line text', assK[0].text, 'こんにちは');
eq('ass word texts', assK[0].words.map(w => w.text), ['こ', 'ん', 'にちは']);
ok('ass word times cumulative',
    Math.abs(assK[0].words[0].start - 1) < 1e-9 && Math.abs(assK[0].words[2].end - 2) < 1e-9);
const merged = u.mergeWordTimings(
    [{ time: 1, text: 'a' }, { time: 3, text: 'b' }],
    [{ time: 1.2, text: 'x', words: [{ text: 'x', start: 1, end: 2 }] }],
    1
);
ok('mergeWordTimings attaches to nearest', merged[0].words && merged[0].words[0].text === 'x' && !merged[1].words);

console.log(failures === 0 ? 'UTILS TESTS PASSED' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
