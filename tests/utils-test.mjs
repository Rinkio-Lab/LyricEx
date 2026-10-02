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
await import('../assets/scripts/utils/netease.js');
await import('../assets/scripts/utils/ai-import.js');
await import('../assets/scripts/utils/ai-prompt.js');
await import('../assets/scripts/utils/lyric-package.js');

const u = globalThis.__lyricexUtils;
let failures = 0;
function eq(name, got, want) {
    const g = JSON.stringify(got),
        w = JSON.stringify(want);
    if (g !== w) {
        failures++;
        console.error(`FAIL ${name}: got ${g} want ${w}`);
    } else console.log(`ok ${name}`);
}
function ok(name, cond) {
    if (!cond) {
        failures++;
        console.error(`FAIL ${name}`);
    } else console.log(`ok ${name}`);
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
    { time: 10, text: 'a' },
    { time: 12, text: 'b' },
    { time: 15, text: 'c' }
];
eq('line bounds uses next line', u.lineLoopBounds(lyrics, 0, 0, 100), { start: 10, end: 12 });
eq('line bounds last line uses duration', u.lineLoopBounds(lyrics, 0, 2, 100), { start: 15, end: 100 });
eq('line bounds last line pads when no duration', u.lineLoopBounds(lyrics, 0, 2, 0), { start: 15, end: 18 });
eq('line bounds applies offset', u.lineLoopBounds(lyrics, 1, 1, 100), { start: 11, end: 14 });
ok('line bounds null for bad index', u.lineLoopBounds(lyrics, 0, 9, 100) === null);

// ---- search ----
const idx = u.buildSearchIndex([
    {
        text: '悴んだ心',
        translation: '内心憔悴',
        analysis: [
            { romaji: 'kaji kan da', hiragana: 'かじかんだ', kanji: '悴んだ', partOfSpeech: '動詞', meaning: '冻僵' }
        ]
    },
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
const assPlain = u.buildAss(lyrics, 0, { includeTranslation: false, karaoke: false });
ok('ass karaoke off strips \\k tags', !assPlain.includes('\\k'));
// v3.3.1: LRC builder
const lrc = u.buildLrc(lyrics, 0, { title: 'T', artist: 'A', includeTranslation: true });
ok('lrc has ti/ar headers', lrc.includes('[ti:T]') && lrc.includes('[ar:A]'));
ok('lrc has timestamp lines', /\[\d{2}:\d{2}\.\d{2}\]/.test(lrc));
const lrcTr = u.buildLrc([{ time: 61, text: '本気', translation: '认真' }], 0, { meta: false, includeTranslation: true });
ok('lrc appends translation on same timestamp', lrcTr.includes('[01:01.00]本気') && lrcTr.includes('[01:01.00]认真'));
const lrcNoMeta = u.buildLrc(lyrics, 0, { meta: false });
ok('lrc meta off drops headers', !lrcNoMeta.includes('[ti:') && !lrcNoMeta.includes('[ar:'));
// v3.3.2: TXT lyrics builder
const txtPlain = u.buildLyricsTxt(lyrics, 0, 'plain');
ok('txt plain has bare lines', txtPlain === 'a\nb\nc\n');
const txtTr = u.buildLyricsTxt([{ time: 1, text: '本気', translation: '认真' }], 0, 'withTranslation');
ok('txt translation indented', txtTr === '本気\n    认真\n');
const txtTimed = u.buildLyricsTxt(lyrics, 0, 'timed');
ok('txt timed has stamps', txtTimed.includes('[00:10.00] a') && txtTimed.includes('[00:15.00] c'));
// v3.3.3: Markdown/HTML lyrics builders
const mdLyrics = u.buildLyricsMarkdown([{ time: 1, text: '本気', translation: '认真' }], 0, {
    title: 'T',
    includeTranslation: true,
    ruby: false,
    timed: true
});
ok('md has heading', mdLyrics.startsWith('# T'));
ok('md has timed line and quote', mdLyrics.includes('`[00:01.00]` 本気') && mdLyrics.includes('> 认真'));
const htmlDoc = u.buildLyricsHtml([{ time: 1, text: '<a>', translation: 'X' }], 0, {
    title: 'T',
    artist: 'A',
    includeTranslation: true,
    ruby: false,
    theme: 'dark'
});
ok('html is full document', htmlDoc.includes('<!DOCTYPE html>') && htmlDoc.includes('<style>'));
ok('html escapes text', htmlDoc.includes('&lt;a&gt;'));
ok('html dark theme applied', htmlDoc.includes('--bg:#16171a'));
ok('html has artist subheading', htmlDoc.includes('<h2>A</h2>'));

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
ok(
    'pitch window sums to 1 with half-period partner',
    Math.abs(u.pitchShift.window(0.3) + u.pitchShift.window(0.8) - 1) < 1e-9
);
ok('pitch window peaks at mid-phase', Math.abs(u.pitchShift.window(0.5) - 1) < 1e-9);
ok('pitch window 0 at reset points', u.pitchShift.window(0) < 1e-9 && u.pitchShift.window(1) < 1e-9);

// ---- recent prune (v2.0.0 #14) ----
const recent = [
    { name: 'b.zip', ts: 3 },
    { name: 'a.zip', ts: 1 },
    { name: 'c.zip', ts: 2 },
    { name: 'b.zip', ts: 5 }
];
eq(
    'pruneRecent newest first + dedupe',
    u.pruneRecent(recent, 10).map((e) => e.name),
    ['b.zip', 'c.zip', 'a.zip']
);
eq(
    'pruneRecent caps',
    u.pruneRecent(recent, 2).map((e) => e.name),
    ['b.zip', 'c.zip']
);
ok('pruneRecent does not mutate', recent.length === 4);
eq('pruneRecent empty', u.pruneRecent([], 5), []);
eq('queuePeek first', u.queuePeek([{ name: 'x' }, { name: 'y' }]).name, 'x');
eq('queuePeek empty', u.queuePeek([]), null);

// ---- study notes export (v2.0.0 #18) ----
const noteLyrics = [
    {
        time: 1,
        text: '時計',
        translation: '时钟',
        romaji: 'tokei',
        note: 'n1',
        analysis: [{ romaji: 'tokei', hiragana: 'とけい', kanji: '時計', partOfSpeech: '名詞', meaning: '钟' }]
    },
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
// v3.3.9: txt format + include* toggles
const txtNotes = u.buildStudyNotes(noteLyrics, { title: 'Song', format: 'txt', labels: {} });
ok('notes txt plain heading', txtNotes.startsWith('# Song'));
ok('notes txt has pipe table', txtNotes.includes('tokei | とけい | 時計'));
const leanNotes = u.buildStudyNotes(noteLyrics, {
    title: 'Song',
    format: 'md',
    labels: {},
    includeTranslation: false,
    includeRomaji: false,
    includeNote: false,
    includeTable: false
});
ok('notes toggles drop content', !leanNotes.includes('翻译：') && !leanNotes.includes('tokei') && !leanNotes.includes('| romaji'));

// ---- reverse ruby (v3.3.10) ----
const rev = globalThis.__lyricexLib.annotateReverseRuby('書き連ねても', [
    { kanji: '書き', hiragana: 'かき' },
    { kanji: '連', hiragana: 'つら' }
]);
ok('reverse ruby swaps kanji to kana', rev !== null && rev[0].text === 'かき');
ok('reverse ruby keeps kana tail', rev && rev[rev.length - 1].text === 'ねても');
const revNone = globalThis.__lyricexLib.annotateReverseRuby('アイウエオ', [{ kanji: 'a', hiragana: 'えい' }]);
ok('reverse ruby null when nothing matches', revNone === null);
const revSame = globalThis.__lyricexLib.annotateReverseRuby('本気', [{ kanji: '本気', hiragana: 'ほんき' }]);
ok('reverse ruby whole word kana', revSame !== null && revSame[0].text === 'ほんき' && revSame[0].reading === '本気');

// ---- poster (v2.0.0 #19) ----
const poster = u.buildPosterHTML({ title: 'T', lyricHtml: '歌詞', translation: '译', romaji: 'kashi' });
ok('poster portrait dims', poster.includes('1080px') && poster.includes('1920px'));
ok('poster has lyric + powered', poster.includes('歌詞') && poster.includes('Powered by LyricEx'));

// ---- word timing import (v2.0.0 #28) ----
const wlrc = u.parseLrcWordLines('[00:01.00]<00:01.00>こ<00:01.50>ん<00:02.00>にちは\n[00:03.00]hello\n');
eq('wlrc line count', wlrc.lines.length, 2);
eq('wlrc strips inline tags', wlrc.lines[0].text, 'こんにちは');
eq(
    'wlrc word texts',
    wlrc.lines[0].words.map((w) => w.text),
    ['こ', 'ん', 'にちは']
);
eq(
    'wlrc word ends borrow next line',
    wlrc.lines[0].words.map((w) => w.end),
    [1.5, 2, 3]
);
ok('wlrc no words on untagged line', wlrc.lines[1].words.length === 0);
const assK = u.parseAssKaraoke(
    '[Events]\nDialogue: 0,0:00:01.00,0:00:03.00,Lyric,,0,0,0,,{\\k20}こ{\\k30}ん{\\k50}にちは\n'
);
eq('ass line count', assK.length, 1);
eq('ass line text', assK[0].text, 'こんにちは');
eq(
    'ass word texts',
    assK[0].words.map((w) => w.text),
    ['こ', 'ん', 'にちは']
);
ok(
    'ass word times cumulative',
    Math.abs(assK[0].words[0].start - 1) < 1e-9 && Math.abs(assK[0].words[2].end - 2) < 1e-9
);
const merged = u.mergeWordTimings(
    [
        { time: 1, text: 'a' },
        { time: 3, text: 'b' }
    ],
    [{ time: 1.2, text: 'x', words: [{ text: 'x', start: 1, end: 2 }] }],
    1
);
ok('mergeWordTimings attaches to nearest', merged[0].words && merged[0].words[0].text === 'x' && !merged[1].words);

// ---- NetEase YRC / klyric word lyrics (v2.8.4) ----
const yrc = u.parseYrcLines(
    "[190871,1984](190871,361,0)For (191232,172,0)the (191404,376,0)first (191780,1075,0)time\n[193459,4198](193459,412,0)What's (193871,574,0)past (194445,506,0)is (194951,2706,0)past\n"
);
eq('yrc line count', yrc.length, 2);
eq('yrc line time', Math.round(yrc[0].time * 1000), 190871);
eq('yrc clean text', yrc[0].text, 'For the first time');
ok(
    'yrc word times absolute',
    Math.abs(yrc[0].words[0].start - 190.871) < 1e-6 && Math.abs(yrc[0].words[0].end - 191.232) < 1e-6
);
eq('yrc two-field tolerated', u.parseYrcLines('[1000,500](1000,200)ab(1200,300)cd\n')[0].words.length, 2);
eq('yrc meta line skipped', u.parseYrcLines('[by:someone]\n[1000,500](1000,200)ab\n')[0].words.length, 1);
const neK = u.parseNeteaseLyrics({
    lrc: { lyric: '[00:01.00]こんにちは世界\n[00:03.00]第二行' },
    tlyric: { lyric: '[00:01.00]你好世界' },
    klyric: {
        lyric: '[1000,1000](1000,300,0)こ(1300,200,0)ん(1500,200,0)にちは(1700,200,0)世界\n[3000,1000](3000,300,0)第(3300,300,0)二(3600,300,0)行'
    }
});
eq('netease klyric line0 words', neK.lines[0].words.length, 4);
eq('netease klyric first word text', neK.lines[0].words[0].text, 'こ');
eq('netease klyric line1 words', neK.lines[1].words.length, 3);
eq('netease klyric translation kept', neK.lines[0].translation, '你好世界');
// v3.4.2: some songs carry word timing only under yrc.lyric (klyric empty) —
// parseNeteaseLyrics must fall back to yrc.
const neYrc = u.parseNeteaseLyrics({
    lrc: { lyric: '[00:01.00]こんにちは世界\n' },
    yrc: { lyric: '[1000,1000](1000,300,0)こ(1300,200,0)ん(1500,200,0)にちは(1700,200,0)世界\n' },
    klyric: { lyric: '' }
});
eq('netease yrc fallback words', neYrc.lines[0].words.length, 4);
eq('netease yrc fallback klyric empty tolerated', neYrc.lines[0].words[0].text, 'こ');

// ---- NetEase JSON import (v2.6.0) ----
const ne = u.parseNeteaseLyrics({
    title: 'Test Song',
    lrc: { lyric: '[00:01.00]こんにちは\n[00:03.00]世界' },
    tlyric: { lyric: '[00:01.00]你好\n[00:03.00]世界（译）' }
});
eq('netease line count', ne.lines.length, 2);
eq('netease title', ne.title, 'Test Song');
eq('netease first text', ne.lines[0].text, 'こんにちは');
eq('netease first translation', ne.lines[0].translation, '你好');
eq('netease second translation', ne.lines[1].translation, '世界（译）');
const neNoTl = u.parseNeteaseLyrics({ lrc: { lyric: '[00:01.00]a' } });
eq('netease no tlyric', neNoTl.lines[0].translation, undefined);
let neThrew = false;
try {
    u.parseNeteaseLyrics({ lrc: { lyric: '' } });
} catch (e) {
    neThrew = e.name === 'NeteaseParseError';
}
ok('netease rejects empty', neThrew);
neThrew = false;
try {
    u.parseNeteaseLyrics([]);
} catch (e) {
    neThrew = e.name === 'NeteaseParseError';
}
ok('netease rejects array', neThrew);

// ---- AI result import (v2.7.0) ----
const aiLyrics = [
    { time: 15.3, text: '重大な問題抱えて眠る' },
    { time: 24.7, text: '愛されたほうが確かに無双的だけれど' }
];
const parsedAi = u.parseAiResult(
    '{"results":[{"time":15.3,"text":"重大な問題抱えて眠る","analysis":"a,あ,阿,名詞,啊|b,び,び,助詞,吧"},{"time":24.7,"text":"愛されたほうが確かに無双的だけれど","analysis":"c,し,し,動詞,是"}]}'
);
eq('ai parse result count', parsedAi.results.length, 2);
eq('ai parse analysis fields', parsedAi.results[0].analysis[0], {
    romaji: 'a',
    hiragana: 'あ',
    kanji: '阿',
    partOfSpeech: '名詞',
    meaning: '啊'
});
const matched = u.matchAnalysisToLyrics(aiLyrics, parsedAi.results);
eq('ai matched all', matched.unmatched, []);
eq('ai attaches analysis', matched.lyrics[0].analysis[0].romaji, 'a');
eq('ai marks source', matched.lyrics[0].analysisSource, 'ai');
// code-fenced result
const fenced = u.parseAiResult(
    '```json\n{"results":[{"time":15.3,"text":"重大な問題抱えて眠る","analysis":"x,ぁ,ぁ,名詞,雪"}]}\n```'
);
eq('ai fence stripped', fenced.results.length, 1);
// tolerance match: AI time drifts 0.08s, text same → still matched
const drift = u.matchAnalysisToLyrics(aiLyrics, [
    { time: 15.38, text: '重大な問題抱えて眠る', analysis: 'x,ぁ,ぁ,名詞,雪' }
]);
eq('ai tolerance match', drift.unmatched, [1]);
eq('ai tolerance attach', drift.lyrics[0].analysis[0].kanji, 'ぁ');
// mismatch: same time, different text → unmatched, no guess
const wrong = u.matchAnalysisToLyrics(aiLyrics, [{ time: 15.3, text: '完全不同的歌词', analysis: 'x,ぁ,ぁ,名詞,雪' }]);
eq('ai text mismatch unmatched', wrong.unmatched, [0, 1]);
eq('ai text mismatch no attach', wrong.lyrics[0].analysis, undefined);
let aiThrew = false;
try {
    u.parseAiResult('not json at all');
} catch (e) {
    aiThrew = e.name === 'AiImportError';
}
ok('ai rejects non-json', aiThrew);
aiThrew = false;
try {
    u.parseAiResult('{"results":[{"time":"bad","text":"x","analysis":"a,b,c,d,e"}]}');
} catch (e) {
    aiThrew = e.name === 'AiImportError';
}
ok('ai rejects bad time', aiThrew);
aiThrew = false;
try {
    u.parseAiResult('{"results":[{"time":1,"text":"x","analysis":"a,b,c"}]}');
} catch (e) {
    aiThrew = e.name === 'AiImportError';
}
ok('ai rejects short analysis', aiThrew);

// ---- AI prompt builder (v2.7.0) ----
const prompt = u.buildAnalysisPrompt(aiLyrics);
ok('prompt has role', prompt.includes('日语形态素分析引擎'));
ok('prompt has lyric', prompt.includes('重大な問題抱えて眠る'));
ok('prompt has time', prompt.includes('[00:15.3]'));
ok('prompt has output contract', prompt.includes('{"results"'));
eq('chunkLyrics no chunk', u.chunkLyrics(aiLyrics, 0).length, 1);
eq(
    'chunkLyrics splits',
    u.chunkLyrics([1, 2, 3, 4, 5], 2).map((c) => c.length),
    [2, 2, 1]
);
const prompts = u.buildAnalysisPrompts(aiLyrics, { chunkSize: 1 });
eq('buildAnalysisPrompts count', prompts.length, 2);
ok('chunked prompt announces part', prompts[1].prompt.includes('第 2 / 2 段'));

// ---- lyric package v2.1 (v2.6.0) ----
eq('sanitize strips traversal', u.sanitizeMediaName('../evil/name.mp3', 'audio.mp3'), 'name.mp3');
eq('sanitize fallback', u.sanitizeMediaName('', 'audio.mp3'), 'audio.mp3');
eq('sanitize forces ext', u.sanitizeMediaName('song.wav', 'audio.mp3', 'mp3'), 'song.mp3');
eq('mediaExt known', u.mediaExt('a.M4A'), 'm4a');
eq('mediaExt unknown', u.mediaExt('a.txt'), '');
const baked = u.bakeLyricTimes(
    [
        { time: 10.123, text: 'x' },
        { time: 5, text: 'y' }
    ],
    0.123
);
eq('bake applies offset', baked[0].time, 10);
eq('bake keeps text', baked[1].text, 'y');
ok('bake does not mutate', aiLyrics[0].time === 15.3);
const man = u.buildManifest({
    title: 'T',
    artist: 'A',
    album: 'Al',
    audioName: 'song.mp3',
    instrumentalName: 'inst.m4a',
    coverName: 'c.jpg',
    convertedFrom: 'legacy',
    analysisModel: 'glm'
});
eq('manifest version stays 2', man.version, 2);
eq('manifest audio path', man.audio, 'assets/song.mp3');
eq('manifest v2.1 audioFileName', man.audioFileName, 'song.mp3');
eq('manifest v2.1 instrumentalFileName', man.instrumentalFileName, 'inst.m4a');
eq('manifest analysisModel', man.config.analysisModel, 'glm');
const manMin = u.buildManifest({ title: 'T' });
eq('manifest minimal no media', manMin.audio, null);
eq('manifest minimal no v2.1 fields', manMin.audioFileName, undefined);
const payload = u.buildLyricsPayload([{ time: 2.5, text: 'z' }], 0.5);
eq('payload baked', payload.lyrics[0].time, 2);

// ---- lib.parseLRC NetEase inline variant + lib.splitMixedLrc (v2.7.0) ----
const lib = globalThis.__lyricexLib;
const neLrc = lib.parseLRC(
    '[00:08.55](ready set and find out[00:09.83]\n[00:09.83]ready set and find out[00:10.85]\n[00:08.55](准备好 亲自去确认[00:09.83]\n[00:09.83]准备好 亲自去确认[00:10.85]'
);
ok('netease inline variant keeps lines', neLrc.lines.length === 4);
eq('netease inline first time', neLrc.lines[0].time, 8.55);
eq('netease inline first text', neLrc.lines[0].text, '(ready set and find out');
const neTs = neLrc.lines.filter(function (l) {
    return l.time === 9.83;
});
ok('netease inline paired ts both kept', neTs.length === 2);
eq('netease inline paired ts text', neTs[0].text, 'ready set and find out');
const sm = lib.splitMixedLrc(neLrc.lines);
ok('splitMixedLrc split true', sm.split === true);
eq('splitMixedLrc main count', sm.main.length, 2);
eq('splitMixedLrc trans count', sm.trans.length, 2);
eq('splitMixedLrc main first', sm.main[0].text, '(ready set and find out');
eq('splitMixedLrc trans first', sm.trans[0].text, '(准备好 亲自去确认');
const cnOnly = lib.splitMixedLrc(lib.parseLRC('[00:01.00]你好世界\n[00:02.00]这是一首歌').lines);
ok('splitMixedLrc pure Chinese no split', cnOnly.split === false);
eq('splitMixedLrc pure Chinese keeps all', cnOnly.main.length, 2);
eq('splitMixedLrc pure Chinese no trans', cnOnly.trans.length, 0);
const jpOnly = lib.splitMixedLrc(lib.parseLRC('[00:01.00]こんにちは世界\n[00:02.00]これは歌です').lines);
ok('splitMixedLrc pure Japanese no trans', jpOnly.trans.length === 0);
eq('splitMixedLrc pure Japanese keeps all', jpOnly.main.length, 2);
// v2.8.3: three-line sheets — JP + CN + full-line romaji sharing one timestamp;
// the romaji attaches as line.romaji (never displaces JP, never dropped)
const three = lib.splitMixedLrc(
    lib.parseLRC(
        '[00:01.00]こんにちは世界[00:02.00]\n' +
            '[00:01.00]你好世界[00:02.00]\n' +
            '[00:01.00]ko n ni chi wa se ka i[00:02.00]\n' +
            '[00:02.00]これは歌です[00:03.00]\n' +
            '[00:02.00]ko re wa u ta de su[00:03.00]'
    ).lines
);
ok('splitMixedLrc 3line split true', three.split === true);
eq('splitMixedLrc 3line main keeps JP', three.main[0].text, 'こんにちは世界');
eq('splitMixedLrc 3line romaji attached', three.main[0].romaji, 'ko n ni chi wa se ka i');
eq('splitMixedLrc 3line trans', three.trans[0].text, '你好世界');
eq('splitMixedLrc 3line second romaji', three.main[1].romaji, 'ko re wa u ta de su');
eq('splitMixedLrc 3line main count', three.main.length, 2);

// ---- lib.sanitizeSettings (v2.8.0) ----
const dflt = lib.SETTINGS_DEFAULTS;
const san = lib.sanitizeSettings(
    { lyricSize: '50', theme: 123, posColors: { romaji: 'x' }, shortcuts: { playPause: null }, hack: true },
    dflt
);
eq('sanitize reverts wrong scalar type', san.lyricSize, dflt.lyricSize);
eq('sanitize reverts wrong theme type', san.theme, dflt.theme);
eq('sanitize keeps valid nested value', san.posColors.romaji, 'x');
eq('sanitize reverts null shortcut', san.shortcuts.playPause, dflt.shortcuts.playPause);
ok('sanitize filters unknown keys', !('hack' in san));
const sanOk = lib.sanitizeSettings({ theme: 'dark', volume: 55 }, dflt);
eq('sanitize keeps valid values', sanOk.theme, 'dark');
eq('sanitize keeps valid volume', sanOk.volume, 55);
eq('sanitize defaults remain intact', sanOk.lyricSize, dflt.lyricSize);

console.log(failures === 0 ? 'UTILS TESTS PASSED' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
