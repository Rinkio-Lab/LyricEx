/* LyricEx v3.4.1 – fetch NetEase lyrics: search → lyric API → per-word merge.
   Reusable toolchain (AGENTS.md §4.5): keeps the "NetEase search → pull
   lyrics → process into per-word timings" flow as a first-class script.

   Usage:
     node scripts/fetch-netease-lyrics.mjs "歌名 歌手" [options]

   Options:
     --limit N        search result count (default 5)
     --pick N         pick the N-th search result, 1-based (default 1)
     --id <id>        skip search, use this song id directly
     --out <dir>      save the raw lyric JSON as <dir>/netease-<id>.json
     --merge <lyrics.json>
                      merge per-word timings into an existing LyricEx pack
                      lyrics file; writes lyrics.words.json next to it
                      (never touches the input)
     --verify <lyrics.json>
                      compare NetEase lrc/tlyric text against an existing pack
                      lyrics file; reports line-level differences only
     --selftest       run YRC/merge unit assertions, then exit

   Exit code 0 on success, 1 on any failure. Node >= 18 (native fetch).

   Data source: https://music.163.com/api/song/lyric (requires UA + Referer,
   see docs/netease-lyrics-guide.md). Search: /api/cloudsearch/pc.
   Lyric parsing reuses the app's own lib.parseLRC / parseYrcLines /
   parseNeteaseLyrics so formats stay in lockstep with the app.
*/
globalThis.window = globalThis;
await import('../assets/scripts/lib.js');
await import('../assets/scripts/utils/wordtiming.js');
await import('../assets/scripts/utils/netease.js');

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const u = globalThis.__lyricexUtils;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120';
const REFERER = 'https://music.163.com/';
const TIMEOUT_MS = 8000;

function parseArgs(argv) {
    const opts = { limit: 5, pick: 1 };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--limit') opts.limit = Number(argv[++i]);
        else if (a === '--pick') opts.pick = Number(argv[++i]);
        else if (a === '--id') opts.id = Number(argv[++i]);
        else if (a === '--out') opts.out = argv[++i];
        else if (a === '--merge') opts.merge = resolve(argv[++i]);
        else if (a === '--verify') opts.verify = resolve(argv[++i]);
        else if (a === '--selftest') opts.selftest = true;
        else opts.query = (opts.query ? opts.query + ' ' : '') + a;
    }
    return opts;
}

async function fetchJson(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': UA, Referer: REFERER },
            signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

function searchUrl(query, limit) {
    return (
        'https://music.163.com/api/cloudsearch/pc?s=' +
        encodeURIComponent(query) +
        '&type=1&limit=' +
        limit
    );
}

function lyricUrl(id) {
    return `https://music.163.com/api/song/lyric?id=${id}&lv=-1&kv=-1&tv=-1`;
}

function pickSong(data, pick) {
    const songs = data && data.result && Array.isArray(data.result.songs)
        ? data.result.songs
        : [];
    if (!songs.length) throw new Error(`no search results for: ${data.query || ''}`);
    const i = pick - 1;
    if (i < 0 || i >= songs.length) throw new Error(`--pick ${pick} out of range (1..${songs.length})`);
    const s = songs[i];
    const artist = Array.isArray(s.ar) && s.ar[0] ? s.ar[0].name : (s.artists && s.artists[0] ? s.artists[0].name : '');
    return { id: s.id, name: s.name, artist };
}

function saveRaw(outDir, id, data) {
    const dir = resolve(outDir);
    mkdirSync(dir, { recursive: true });
    const p = join(dir, `netease-${id}.json`);
    writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return p;
}

function normalizeText(s) {
    return String(s || '')
        .replace(/[（）()「」『』【】“”".,，。、:：!！?？\s]/g, '')
        .toLowerCase();
}

function loadPackLyrics(path) {
    const raw = readFileSync(path, 'utf8');
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.lyrics)) throw new Error(`${path}: missing .lyrics array`);
    return data.lyrics;
}

// Merge per-word timings from NetEase into a pack lyrics file (by line time,
// tight tolerance like the app). Writes <name>.words.json beside the input.
function mergeIntoPack(packPath, neLines) {
    const lyrics = loadPackLyrics(packPath);
    const withWords = new Set(neLines.filter((l) => l.words && l.words.length).map((l) => l.time));
    let merged = 0;
    lyrics.forEach((line) => {
        if (withWords.has(line.time)) {
            const src = neLines.find((l) => l.time === line.time);
            if (src && src.words.length) {
                line.words = src.words.map((w) => ({ text: w.text, start: w.start, end: w.end }));
                merged++;
            }
        }
    });
    const out = join(dirname(packPath), packPath.replace(/(\.json)?$/, '') + '.words.json');
    writeFileSync(out, JSON.stringify({ lyrics }, null, 2), 'utf8');
    console.log(`merged words into ${merged}/${lyrics.length} lines -> ${out}`);
    return merged;
}

// Report text differences between NetEase lrc/tlyric and a pack lyrics file.
// Line times match with tolerance (pack rounds to 2 decimals vs NetEase's 3).
function verifyPack(packPath, neLines) {
    const lyrics = loadPackLyrics(packPath);
    const TOL = 0.11;
    let diffText = 0;
    let diffTrans = 0;
    let matched = 0;
    for (const line of lyrics) {
        let ne = null;
        for (const cand of neLines) {
            if (Math.abs(cand.time - line.time) <= TOL) {
                ne = cand;
                break;
            }
        }
        if (!ne) continue;
        matched++;
        if (normalizeText(line.text) !== normalizeText(ne.text)) {
            diffText++;
            console.log(`text@${line.time}: pack=[${line.text}] netease=[${ne.text}]`);
        }
        if (line.translation && ne.translation && normalizeText(line.translation) !== normalizeText(ne.translation)) {
            diffTrans++;
            console.log(`tran@${line.time}: pack=[${line.translation}] netease=[${ne.translation}]`);
        }
    }
    console.log(
        `verify: matched ${matched}/${lyrics.length} lines by time; text diffs ${diffText}, translation diffs ${diffTrans}`
    );
    return diffText + diffTrans;
}

// ---- selftest: the pieces the script depends on must not rot silently ----
function selftest() {
    let failures = 0;
    const eq = (name, got, want) => {
        const g = JSON.stringify(got);
        const w = JSON.stringify(want);
        if (g !== w) {
            failures++;
            console.error(`FAIL ${name}: got ${g} want ${w}`);
        } else console.log(`ok ${name}`);
    };
    const yrc = u.parseYrcLines('[1000,500](1000,200,0)こ(1200,300,0)ん\n[2000,400](2000,100,0)に\n');
    eq('yrc line count', yrc.length, 2);
    eq('yrc clean text', yrc[0].text, 'こん');
    eq('yrc word count', yrc[0].words.length, 2);
    // parseYrcLines converts ms -> s; word.start/end are seconds.
    eq('yrc word times', yrc[0].words[0].start === 1 && yrc[0].words[1].end === 1.5, true);
    const lines = [
        { time: 1, text: 'こんにちは' },
        { time: 2, text: 'hello' },
    ];
    u.mergeWordTimings(lines, [{ time: 1, text: 'こんにちは', words: [{ text: 'こ', start: 1, end: 1.5 }] }], 0.1);
    eq('merge attaches words', lines[0].words.length, 1);
    eq('merge skips unmatched', lines[1].words === undefined, true);
    const parsed = u.parseNeteaseLyrics({
        lrc: { lyric: '[00:01.00]こんにちは\n[00:03.00]hello\n' },
        tlyric: { lyric: '[00:01.00]你好世界\n' },
        klyric: { lyric: '[1000,1000](1000,300,0)こ(1300,400,0)ん(1700,300,0)に(2000,300,0)ちは\n' },
    });
    eq('netease parse lines', parsed.lines.length, 2);
    eq('netease translation', parsed.lines[0].translation, '你好世界');
    eq('netease klyric words', parsed.lines[0].words.length, 4);
    return failures === 0;
}

const opts = parseArgs(process.argv.slice(2));

if (opts.selftest) {
    process.exit(selftest() ? 0 : 1);
}

if (!opts.query && !opts.id) {
    console.error(
        'usage: node scripts/fetch-netease-lyrics.mjs "歌名 歌手" [--limit N] [--pick N] [--id <id>] [--out dir] [--merge lyrics.json] [--verify lyrics.json] [--selftest]'
    );
    process.exit(1);
}

try {
    let song;
    if (opts.id) {
        song = { id: opts.id, name: `id ${opts.id}`, artist: '' };
    } else {
        const sres = await fetchJson(searchUrl(opts.query, opts.limit));
        song = pickSong(sres, opts.pick);
        console.log(`search: #${opts.pick} -> ${song.id} | ${song.name} | ${song.artist}`);
    }

    const lyr = await fetchJson(lyricUrl(song.id));
    if (lyr.code !== 200) throw new Error(`lyric API code ${lyr.code}`);
    const hasLrc = lyr.lrc && typeof lyr.lrc.lyric === 'string' && lyr.lrc.lyric.trim();
    if (!hasLrc) throw new Error('song has no lrc lyrics on NetEase');

    const parsed = u.parseNeteaseLyrics(lyr);
    const lines = parsed.lines;
    const wordLines = lines.filter((l) => l.words && l.words.length).length;
    console.log(
        `lyrics: ${lines.length} lines, ${lines.filter((l) => l.translation).length} with translation, ` +
            `${wordLines} with per-word timings`
    );
    if (!wordLines) {
        console.warn('WARN: no klyric/yrc word timings available for this song on NetEase');
    }

    if (opts.out) {
        const p = saveRaw(opts.out, song.id, lyr);
        console.log(`saved raw JSON -> ${p}`);
    }
    if (opts.merge) {
        if (!wordLines) {
            console.error('--merge requested but there are no per-word timings to merge; nothing written');
            process.exit(1);
        }
        mergeIntoPack(opts.merge, lines);
    }
    if (opts.verify) {
        const diffs = verifyPack(opts.verify, lines);
        console.log(diffs === 0 ? 'verify: pack lyrics consistent with NetEase (matched lines)' : `verify: ${diffs} differences (pack text is authoritative)`);
    }
    process.exit(0);
} catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
}
