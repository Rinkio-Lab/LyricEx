/* LyricEx release self-check — run before every publish:  node scripts/release-check.mjs
   Verifies the SW cache name is bumped past the newest CHANGELOG entry (the
   "users never see the new build" root cause), runs the full self-check, and
   prints a resource-size report so a release can't silently balloon. */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
let failures = 0;
const ok = (cond, msg) => {
    console.log((cond ? 'ok ' : 'FAIL ') + msg);
    if (!cond) failures++;
};

/** 'v2.4.2' → [2,4,2]; compare [major,minor,patch] numerically */
function parseVersion(v) {
    const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(v));
    return m ? m.slice(1, 4).map(Number) : null;
}
function cmpVersion(a, b) {
    for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    return 0;
}

// ---- 1. SW cache name vs CHANGELOG head -----------------------------------
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
// allow pre-release suffixes (v3.0.0-alpha) — parse compares [major,minor,patch] only
const cacheMatch = /CACHE\s*=\s*'lyricex-(v[\d.]+(?:-[a-z0-9]+)?)'/.exec(sw);
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
const headMatch = /^##\s+(v[\d.]+(?:-[a-z0-9]+)?)/m.exec(changelog);

ok(!!cacheMatch, 'sw.js CACHE name found');
ok(!!headMatch, 'CHANGELOG head version found');
if (cacheMatch && headMatch) {
    const cacheV = parseVersion(cacheMatch[1]);
    const headV = parseVersion(headMatch[1]);
    ok(!!cacheV && !!headV, 'versions parse');
    if (cacheV && headV) {
        const c = cmpVersion(cacheV, headV);
        ok(
            c >= 0,
            `sw CACHE ${cacheMatch[1]} >= CHANGELOG ${headMatch[1]} (cache must be bumped past the newest entry)`
        );
        ok(c === 0, `sw CACHE ${cacheMatch[1]} === CHANGELOG ${headMatch[1]} (keep them in lockstep)`);
    }
}

// ---- 2. full self-check (5 suites) -----------------------------------------
try {
    execFileSync(process.execPath, [join(root, 'tests', 'run-tests.mjs')], { stdio: 'inherit', cwd: root });
    console.log('ok full self-check (run-tests.mjs)');
} catch (_) {
    failures++;
    console.log('FAIL full self-check');
}

// ---- 3. resource size report ------------------------------------------------
async function walk(dir, acc = []) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) await walk(p, acc);
        else acc.push(p);
    }
    return acc;
}
const all = await walk(root);
const isProd = (p) =>
    !p.includes('node_modules') &&
    !p.includes('\\tests\\') &&
    !p.includes('/tests/') &&
    !p.includes('\\.github\\') &&
    !p.includes('/.github/') &&
    !p.includes('\\scripts\\') &&
    !p.includes('/scripts/');
const ext = (p) => extname(p).toLowerCase();
const bytes = (p) => Buffer.byteLength(readFileSync(p));
const sum = (arr) => arr.reduce((n, p) => n + bytes(p), 0);
const gz = (arr) => arr.reduce((n, p) => n + gzipSync(readFileSync(p)).length, 0);

const js = all.filter((p) => isProd(p) && ext(p) === '.js');
const css = all.filter((p) => isProd(p) && ext(p) === '.css');
const html = all.filter((p) => isProd(p) && ext(p) === '.html');
const woff2 = all.filter((p) => isProd(p) && ext(p) === '.woff2');
const core = [...html, ...js, ...css];

console.log('\n── resource size report (runtime payload only) ──');
console.log(`  JS/CSS/HTML files : ${js.length + css.length + html.length}`);
console.log(`  woff2 font slices  : ${woff2.length}  (${(sum(woff2) / 1048576).toFixed(2)} MiB, already compressed)`);
console.log(`  JS total          : ${(sum(js) / 1024).toFixed(1)} KiB  → gzip ${(gz(js) / 1024).toFixed(1)} KiB`);
console.log(`  CSS total         : ${(sum(css) / 1024).toFixed(1)} KiB  → gzip ${(gz(css) / 1024).toFixed(1)} KiB`);
console.log(`  HTML              : ${(sum(html) / 1024).toFixed(1)} KiB  → gzip ${(gz(html) / 1024).toFixed(1)} KiB`);
console.log(`  core gzip payload : ${(gz(core) / 1024).toFixed(1)} KiB  (index + app css/js, excl. fonts)`);
console.log('──────────────────────────────────────────────────');

process.exit(failures === 0 ? 0 : 1);
