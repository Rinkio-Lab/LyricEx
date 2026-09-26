/* LyricEx README screenshots – Playwright script.
   Boots the app over HTTP, loads an example package, captures each view.
   Usage: node scripts/readme-shots.mjs  (needs `npx playwright install chromium` once) */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'assets', 'images', 'shots');
const PORT = 8091;
const BASE = `http://127.0.0.1:${PORT}`;

const server = spawn(process.execPath, [join(ROOT, 'scripts', 'serve.mjs'), String(PORT)], { stdio: 'ignore' });

async function main() {
    // wait for the server
    await new Promise((res) => setTimeout(res, 800));
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.addInitScript(() => {
        try { localStorage.setItem('lyricex-guide-seen', '1'); } catch (_) { /* noop */ }
    });
    await page.goto(`${BASE}/index.html`);
    await page.waitForFunction(() => window.__lyricex !== undefined, null, { timeout: 15000 });

    // load an example package via the file input
    const pkg = join(ROOT, 'examples', 'MyGO!!!!! - エガクミライ-lyrics-package.zip');
    await page.setInputFiles('#fileInput', pkg);
    await page.waitForSelector('.view-lyrics .lyric-line', { timeout: 15000 });

    // give fonts/render a beat, then shoot each view
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(OUT, 'lyrics.png') });

    for (const v of ['study', 'mixed', 'editor']) {
        await page.click(`.sidebar-btn[data-view="${v}"]`);
        await page.waitForTimeout(500);
        const name = v === 'study' ? 'study.png' : v === 'mixed' ? 'mixed.png' : 'editor.png';
        await page.screenshot({ path: join(OUT, name) });
    }
    // build (pack-workspace) tab — the v2.6.0 workspace
    await page.click('[data-editor-tab="build"]');
    await page.waitForTimeout(500);
    // the build pane is long — bring its top into the viewport before shooting
    await page.evaluate(() => {
        const pane = document.querySelector('[data-editor-pane="build"]');
        if (pane) pane.scrollIntoView({ block: 'start' });
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUT, 'build.png') });

    await browser.close();
    server.kill();
    console.log('SHOTS OK →', OUT);
}

main().catch((e) => { console.error(e); server.kill(); process.exit(1); });
