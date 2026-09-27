#!/usr/bin/env node
/* LyricEx asset vendor script.
   Downloads every third-party asset the app needs so the project runs fully
   offline (no Google Fonts CDN, no cdnjs). Re-runnable: existing files are
   overwritten. Run from the repo root:

       node scripts/fetch-assets.mjs

   Output layout (matches the relative URLs used by index.html):
       vendor/fonts/<family>.css          @font-face CSS, rewritten to local woff2
       vendor/fonts/woff2/<family>-*.woff2
       vendor/fontawesome/css/all.min.css   (keeps its ../webfonts/ relative URLs)
       vendor/fontawesome/webfonts/*.woff2 / .woff / .ttf / .eot / .svg
       vendor/jszip/jszip.min.js
*/
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VENDOR = path.resolve(__dirname, '..', 'vendor');

const UA = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
};

function get(url, headers = {}) {
    return new Promise((resolve, reject) => {
        https
            .get(url, { headers }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume();
                    return resolve(get(new URL(res.headers.location, url).toString(), headers));
                }
                if (res.statusCode !== 200) {
                    res.resume();
                    return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                }
                const chunks = [];
                res.on('data', (c) => chunks.push(c));
                res.on('end', () => resolve(Buffer.concat(chunks)));
            })
            .on('error', reject);
    });
}

function write(dir, name, buf) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buf);
    console.log('  + ' + path.relative(VENDOR, path.join(dir, name)) + ' (' + buf.length + ' bytes)');
}

async function fetchGoogleFont(family, spec, slug) {
    console.log('Google Font:', family, spec);
    const cssUrl =
        'https://fonts.googleapis.com/css2?family=' +
        encodeURIComponent(family).replace(/%20/g, '+') +
        ':' +
        spec +
        '&display=swap';
    let css = (await get(cssUrl, UA)).toString('utf8');

    const urls = [...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
    const seen = new Set();
    const woff2Dir = path.join(VENDOR, 'fonts', 'woff2');
    for (const u of urls) {
        if (seen.has(u)) continue;
        seen.add(u);
        const base = path.basename(new URL(u).pathname);
        const fname = slug + '-' + base;
        write(woff2Dir, fname, await get(u, UA));
        css = css.split(u).join('woff2/' + fname);
    }
    write(path.join(VENDOR, 'fonts'), slug + '.css', Buffer.from(css, 'utf8'));
    console.log('  fonts: ' + urls.length + ' subsets');
}

async function fetchFontAwesome() {
    console.log('Font Awesome 5.15.4');
    const cssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    const css = (await get(cssUrl)).toString('utf8');
    write(path.join(VENDOR, 'fontawesome', 'css'), 'all.min.css', Buffer.from(css, 'utf8'));

    // all.min.css references ../webfonts/fa-* — mirror the layout exactly so the
    // relative URLs keep working without any rewrite.
    const refs = [...css.matchAll(/url\(\.\.\/webfonts\/([^)]+)\)/g)].map((m) => m[1]);
    const seen = new Set();
    const base = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/';
    for (const r of refs) {
        const clean = r.split('#')[0].split('?')[0];
        if (seen.has(clean)) continue;
        seen.add(clean);
        write(path.join(VENDOR, 'fontawesome', 'webfonts'), clean, await get(base + clean));
    }
    console.log('  webfonts: ' + seen.size + ' files');
}

async function fetchJszip() {
    console.log('JSZip 3.10.1');
    const url = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    write(path.join(VENDOR, 'jszip'), 'jszip.min.js', await get(url));
}

await fetchGoogleFont('Noto Sans SC', 'wght@400;700', 'noto-sans-sc');
await fetchGoogleFont('M PLUS Rounded 1c', 'wght@400;700', 'm-plus-rounded-1c');
await fetchGoogleFont('Courier Prime', 'wght@400;700', 'courier-prime');
await fetchFontAwesome();
await fetchJszip();

console.log('DONE. vendor/ is now self-contained.');
