/* LyricEx v2.9.4 library metadata self-check – node tests/library-test.mjs
   Pure-function tests only (metadata.js); IndexedDB/zip/DOM paths are covered
   by the e2e suite. */
globalThis.window = globalThis;
await import('../assets/scripts/library/metadata.js');

const m = globalThis.__lyricexMetadata;
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

// ---- norm ----
eq('norm trims and lowercases', m.norm('  MiXed  '), 'mixed');
eq('norm null-safe', m.norm(null), '');

// ---- decodeText ----
eq('decode latin1 (enc 0)', m.decodeText(Uint8Array.from([0, 0x43, 0x61, 0x66, 0xe9]), 0), 'Café');
eq('decode utf-8 (enc 3)', m.decodeText(new TextEncoder().encode([3].map(c => String.fromCharCode(c)).join('') + 'テスト'), 0), 'テスト');
ok('decode empty', m.decodeText(Uint8Array.from([0]), 0) === '');

// ---- parseId3 (hand-built v2.3 tag) ----
function syncSafe(n) {
    return [(n >> 21) & 0x7f, (n >> 14) & 0x7f, (n >> 7) & 0x7f, n & 0x7f];
}
function buildTag(frames) {
    // frames: [[id, payloadBytes]]
    let body = [];
    for (const [id, payload] of frames) {
        const size = payload.length;
        body = body.concat([id.charCodeAt(0), id.charCodeAt(1), id.charCodeAt(2), id.charCodeAt(3),
            (size >>> 24) & 0xff, (size >>> 16) & 0xff, (size >>> 8) & 0xff, size & 0xff, 0, 0], payload);
    }
    const head = [0x49, 0x44, 0x33, 3, 0, 0].concat(syncSafe(body.length));
    return Uint8Array.from(head.concat(body));
}
const t = buildTag([
    ['TIT2', [3].concat(Array.from(new TextEncoder().encode('Lemon')))],
    ['TPE1', [0, 0x59, 0x6f, 0x6e, 0x65, 0x7a, 0x75, 0x20, 0x4b, 0x65, 0x6e, 0x73, 0x68, 0x69]], // latin1 "Yonezu Kenshi"
    ['TLEN', [3].concat(Array.from(new TextEncoder().encode('240000')))],
    ['APIC', [0].concat(Array.from(new TextEncoder().encode('image/jpeg')), [0, 3, 0, 0xff, 0xd8, 0xff])],
]);
const parsed = m.parseId3(t);
eq('id3 title', parsed.title, 'Lemon');
eq('id3 artist', parsed.artist, 'Yonezu Kenshi');
eq('id3 durationMs', parsed.durationMs, 240000);
ok('id3 cover extracted', parsed.cover && parsed.cover.type === 'image/jpeg' && parsed.cover.data.length === 3);
eq('id3 rejects non-tag', m.parseId3(Uint8Array.from([1, 2, 3, 4, 5])), {});

// ---- estimateMp3Duration (CBR first frame at offset 0) ----
const mp3 = new Uint8Array(1000000);
mp3.set([0xff, 0xfb, 0x90, 0x64], 0); // MPEG1 LayerIII 128kbps 44100Hz
const est = m.estimateMp3Duration(mp3);
ok('mp3 duration ≈ 62.5s', Math.abs(est - 62.5) < 0.5);
eq('mp3 duration rejects junk', m.estimateMp3Duration(Uint8Array.from([1, 2, 3, 4])), null);

// ---- dedupe keys ----
eq('fileKey case-insensitive path', m.fileKey('A/B.MP3', 100), m.fileKey('a/b.mp3', 100));
ok('fileKey differs by size', m.fileKey('a.mp3', 100) !== m.fileKey('a.mp3', 101));
eq('songKey trims title', m.songKey('  Lemon ', '米津玄師'), m.songKey('Lemon', '米津玄師'));

// ---- search / filter ----
const song = { title: 'Lemon', artist: '米津玄師', album: 'Lemon', genre: 'J-Pop', year: '2018',
    tags: ['jpop', 'ost'], lyricsText: 'あの日の悲しみ' };
ok('query hits lyrics', m.matchesQuery(song, '悲しみ'));
ok('query hits tag', m.matchesQuery(song, 'ost'));
ok('query empty matches all', m.matchesQuery(song, ''));
ok('query miss', !m.matchesQuery(song, 'xyz'));
ok('filter artist exact', m.matchesFilter(song, { artist: '米津玄師' }));
ok('filter artist miss', !m.matchesFilter(song, { artist: '米津' }));
ok('filter tag', m.matchesFilter(song, { tag: 'jpop' }));
ok('filter tag miss', !m.matchesFilter(song, { tag: 'anime' }));
ok('filter favorite true', m.matchesFilter({ ...song, favorite: true }, { favorite: true }));
ok('filter favorite blocks', !m.matchesFilter(song, { favorite: true }));
ok('filter year', m.matchesFilter(song, { year: '2018' }));

// ---- sort ----
const a = { title: 'A', duration: 300, playCount: 1, addedAt: 1 };
const b = { title: 'B', duration: 120, playCount: 9, addedAt: 2 };
ok('sort duration asc', m.compareSongs(a, b, 'duration', 1) > 0);
ok('sort duration desc', m.compareSongs(b, a, 'duration', -1) > 0);
ok('sort plays desc', m.compareSongs(a, b, 'playCount', -1) > 0);
ok('sort title asc', m.compareSongs(a, b, 'title', 1) < 0);

// ---- facets ----
const fs = m.facets([song, { ...song, artist: '米津玄師', tags: ['jpop'] }, { title: 'X', artist: '某人', album: 'Z' }]);
eq('facet artists deduped', fs.artists, ['米津玄師', '某人']);
eq('facet tags deduped', fs.tags, ['jpop', 'ost']);
eq('facet years', fs.years, ['2018']);

console.log(failures === 0 ? 'ALL LIBRARY TESTS PASSED' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
