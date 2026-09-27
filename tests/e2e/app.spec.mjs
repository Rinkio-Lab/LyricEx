/* LyricEx real-browser smoke suite (Playwright + Chromium).
   Covers what the DOM-shim suites cannot: real HTTP boot, zip upload through
   the actual file input, view switching, zh/ja/ar locale switching with RTL
   direction, modal focus trapping, axe-core a11y scan, and a clean console. */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const PKG_VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

/** collect page errors + console errors; assert clean at test end */
function watchErrors(page) {
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => {
        if (m.type() === 'error') errors.push('console.error: ' + m.text());
    });
    return errors;
}

/** boot the app with a clean context; pre-mark the first-visit guide as seen
    so the onboarding modal never intercepts clicks in smoke tests */
// e2e targets UI behaviour, not caching: page.route cannot intercept fetches
// issued from the service-worker scope, so SW caching would make manifest stubs
// unreliable. Disable the SW for every test. Also stub the v3.2.0+ update check:
// a real GitHub request on a restricted network returns 403, and Chromium logs
// that as console.error, which trips the clean-console assertions below.
test.beforeEach(async ({ page }) => {
    await page.route('**/sw.js', (route) => route.abort());
    await page.route('https://api.github.com/**', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ tag_name: 'v' + PKG_VERSION, body: '' })
        })
    );
    await page.route('https://raw.githubusercontent.com/**', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'text/plain; charset=utf-8',
            body: '# Changelog\n\n## v' + PKG_VERSION + '（2026-01-01 · e2e stub）\n'
        })
    );
});

async function openApp(page, url = '/') {
    await page.addInitScript(() => {
        try {
            localStorage.setItem('lyricex-guide-seen', '1');
        } catch (_) {
            /* noop */
        }
        // page.route cannot intercept fetches issued from the service-worker
        // scope, which would make manifest stubs unreliable — neuter SW here.
        try {
            if (navigator.serviceWorker) navigator.serviceWorker.register = () => Promise.resolve(undefined);
        } catch (_) {
            /* noop */
        }
    });
    await page.goto(url);
    // deterministic assertions: wait until boot has run (theme applied etc.)
    await page.waitForFunction(() => window.__lyricex !== undefined, null, { timeout: 15000 });
}

/** open settings → language row → language drawer, pick the given locale,
    then close the settings modal again so the next pickLocale starts clean */
async function pickLocale(page, code) {
    await page.click('#settingsBtn');
    await page.click('#langChangeBtn');
    const drawer = page.locator('#langDrawer');
    await drawer.waitFor({ state: 'visible' });
    await drawer.locator('.lang-option[data-lang="' + code + '"]').click();
    // drawer closes itself; wait until the html lang attr flips
    await page.waitForFunction((c) => document.documentElement.lang === c, code);
    await page.click('#settingsCloseBtn');
    // overlays hide via opacity (not display), so assert the open class
    await expect(page.locator('#settingsOverlay')).not.toHaveClass(/open/);
}

test('boots to the empty state without JS errors', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await expect(page.locator('#viewContent .view-empty')).toBeVisible();
    await expect(page.locator('#uploadArea')).toBeVisible();
    await expect(page.locator('#fileInput')).toBeAttached();
    expect(page.locator('#app')).toHaveAttribute('data-theme', 'light');
    expect(errors).toEqual([]);
});

test('workspace build tab: alternating JP/CN LRC auto-splits (v2.7.0)', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    // open the editor view via the sidebar
    await page.click('.sidebar-btn[data-view="editor"]');
    await expect(page.locator('.view-editor').first()).toBeVisible();
    // refine tab is active by default
    await expect(page.locator('[data-editor-tab="refine"]')).toHaveClass(/active/);
    await page.click('[data-editor-tab="build"]');
    await expect(page.locator('[data-editor-pane="build"]')).toBeVisible();
    // v2.8.1 regression: the build pane must live INSIDE .view-editor — a stray
    // extra `</div>` used to append it OUTSIDE, where the overflow-clipped
    // container cut it off entirely (blank Build tab). Playwright's visibility
    // check is bounding-box-only, so it never caught the clipped pane.
    await expect(page.locator('.view-editor [data-editor-pane="build"]')).toHaveCount(1);
    await expect(page.locator('[data-editor-pane="build"] .ws-wrap')).toBeVisible();
    // paste an alternating NetEase-inline LRC into the main box only
    const alt =
        '[00:08.55](ready set and find out[00:09.83]\n' +
        '[00:09.83]ready set and find out[00:10.85]\n' +
        '[00:08.55](准备好 亲自去确认[00:09.83]\n' +
        '[00:09.83]准备好 亲自去确认[00:10.85]';
    await page.fill('[data-ws-lrc="main"]', alt);
    await page.click('[data-ws-parse]');
    // parse: 2 original lines (translations back-filled into the trans box)
    await expect(page.locator('[data-ws-status]')).toContainText('已解析 2 行');
    const transVal = await page.inputValue('[data-ws-lrc="trans"]');
    expect(transVal).toContain('准备好');
    expect(transVal).not.toContain('ready set');
    // upload entry exists alongside paste
    await expect(page.locator('[data-ws-upload="main"]')).toBeVisible();
    await expect(page.locator('[data-ws-upload="trans"]')).toBeVisible();
    // v2.8.3: live AI-prompt preview renders after parsing
    await expect(page.locator('[data-ws-prompt-preview]')).toBeVisible();
    await expect(page.locator('[data-ws-prompt-preview]')).toContainText('# 角色');
    // v2.9.2: one-click clear on the lyric textareas + an AI clear button
    await page.fill('[data-ws-lrc="main"]', 'x');
    await page.click('[data-ws-clear-lrc="main"]');
    await expect(page.locator('[data-ws-lrc="main"]')).toHaveValue('');
    await expect(page.locator('[data-ws-clear-lrc="trans"]')).toBeVisible();
    await expect(page.locator('[data-ws-clear-ai]')).toBeVisible();
    expect(errors).toEqual([]);
});

test('settings export/import controls exist and export downloads JSON (v2.8.0)', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await page.click('#settingsBtn');
    await expect(page.locator('#settingsOverlay')).toBeVisible();
    // controls present in the footer
    await expect(page.locator('#settingsExportBtn')).toBeVisible();
    await expect(page.locator('#settingsImportBtn')).toBeVisible();
    await expect(page.locator('#settingsImportFile')).toBeAttached();
    // export triggers a JSON download
    const dl = page.waitForEvent('download');
    await page.click('#settingsExportBtn');
    const download = await dl;
    expect(download.suggestedFilename()).toMatch(/^lyricex-settings-\d{8}\.json$/);
    await page.click('#settingsCloseBtn');
    await expect(page.locator('#settingsOverlay')).not.toHaveClass(/open/);
    expect(errors).toEqual([]);
});

test('uploads an example package and renders lyrics + views', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await page.setInputFiles('#fileInput', join(ROOT, 'examples', 'MyGO!!!!! - エガクミライ-lyrics-package.zip'));
    // lyrics view renders lines once the zip is parsed
    await expect(page.locator('.view-lyrics .lyric-line').first()).toBeVisible({ timeout: 10000 });
    const lineCount = await page.locator('.view-lyrics .lyric-line').count();
    expect(lineCount).toBeGreaterThan(3);

    // study view: per-word table appears
    await page.click('.sidebar-btn[data-view="study"]');
    await expect(page.locator('.view-study').first()).toBeVisible();

    // editor view boots without crashing
    await page.click('.sidebar-btn[data-view="editor"]');
    await expect(page.locator('.view-editor').first()).toBeVisible();
    expect(errors).toEqual([]);
});

test('switches locale zh → ja → zh and back cleanly', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    await expect(page.locator('#uploadFileName')).toContainText('未加载');

    await pickLocale(page, 'ja');
    await page.waitForFunction(() => document.documentElement.lang === 'ja');
    // a dynamic label flips (upload placeholder is re-rendered on locale change)
    await expect(page.locator('#uploadFileName')).toContainText('未読込');

    await pickLocale(page, 'zh');
    await expect(page.locator('#uploadFileName')).toContainText('未加载');
    expect(errors).toEqual([]);
});

test('ar switches dir to rtl and mirrors the chrome', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await pickLocale(page, 'ar');
    await page.waitForFunction(() => document.documentElement.dir === 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    // RTL content rule: lyric/study content is forced back to ltr (views.css)
    const sidebarDir = await page.locator('#sidebar').evaluate((el) => getComputedStyle(el).direction);
    expect(sidebarDir).toBe('rtl');
    expect(errors).toEqual([]);
});

test('modal focus trap keeps Tab inside the settings dialog', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await page.click('#settingsBtn');
    await expect(page.locator('#settingsOverlay')).toBeVisible();
    // Tab-walk several times: focus must never leave the dialog (focus-trap.js)
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
    const inDialog = await page.evaluate(() => {
        const dlg = document.getElementById('settingsOverlay');
        return dlg.contains(document.activeElement);
    });
    expect(inDialog).toBe(true);
    expect(errors).toEqual([]);
});

test('file:// direct-open still boots under the strict CSP meta', async ({ browser }) => {
    const page = await browser.newPage();
    const errors = watchErrors(page);
    // pathToFileURL derives the file:// URL from ROOT at runtime, so the path
    // stays correct on every platform (CI runs Linux, dev machines run Windows)
    await openApp(page, pathToFileURL(join(ROOT, 'index.html')).href);
    // CSP meta must NOT break the double-click workflow (Chrome treats file:
    // as same-origin for 'self'); boot must expose the app API
    await page.waitForFunction(() => window.__lyricex !== undefined, null, { timeout: 15000 });
    await expect(page.locator('#viewContent .view-empty')).toBeVisible();
    expect(errors).toEqual([]);
});

test('share card + poster render without canvas taint (v2.8.1)', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await page.setInputFiles('#fileInput', join(ROOT, 'examples', 'MyGO!!!!! - エガクミライ-lyrics-package.zip'));
    await expect(page.locator('.view-lyrics .lyric-line').first()).toBeVisible({ timeout: 10000 });

    // share card: the button may be folded into the ⋯ drawer
    const shareBtn = page.locator('#shareCardBtn');
    if (!(await shareBtn.isVisible())) {
        await page.click('#playerExtToggle');
        await expect(shareBtn).toBeVisible();
    }
    await shareBtn.click();
    await expect(page.locator('#shareOverlay')).toHaveClass(/open/);
    // preview must be a rendered PNG — the SVG <foreignObject> path can resolve
    // with a TAINTED canvas (Chrome); the taint probe must fall back to the 2D
    // renderer or toDataURL throws SecurityError and the preview stays blank
    await page.waitForFunction(
        () => {
            const src = document.getElementById('sharePreview').getAttribute('src') || '';
            return src.startsWith('data:image/png');
        },
        null,
        { timeout: 10000 }
    );
    await page.click('#shareCloseBtn');

    // 竖屏海报 download from the editor view
    await page.click('.sidebar-btn[data-view="editor"]');
    await expect(page.locator('#posterBtn')).toBeVisible();
    const dl = page.waitForEvent('download');
    await page.click('#posterBtn');
    expect((await dl).suggestedFilename()).toMatch(/-poster\.png$/);
    expect(errors).toEqual([]);
});

test('about: check update finds a newer release and offers the release page (v3.2.0)', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    // override the openApp 404 stub with a fake newer release (route order:
    // unroute removes the earlier handler, then our mock matches)
    await page.unroute('**/api.github.com/**');
    await page.route('**/api.github.com/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tag_name: 'v9.9.9' }) })
    );
    await page.click('#aboutBtn');
    await expect(page.locator('#aboutOverlay')).toBeVisible();
    await expect(page.locator('#checkUpdateBtn')).toBeVisible();
    await page.click('#checkUpdateBtn');
    const msg = page.locator('#dialogOverlay.open .dialog-message');
    await expect(msg).toContainText('v9.9.9');
    // confirming offers the release page (headless may or may not open a popup)
    const popupPromise = page.waitForEvent('popup', { timeout: 3000 }).catch(() => null);
    await page.click('#dialogOverlay.open .dialog-primary');
    const popup = await popupPromise;
    if (popup) await popup.close();
    expect(errors).toEqual([]);
});

test('axe-core scan finds no critical or serious violations', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    // scan the stable state, not a mid-render one: webfonts fully loaded and
    // the 0.25s theme transition finished (CI font/CPU timing made this flaky)
    await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => setTimeout(resolve, 400));
    });
    // same-origin <script src> (CSP script-src 'self' blocks inline injection)
    await page.addScriptTag({ url: '/node_modules/axe-core/axe.min.js' });
    const results = await page.evaluate(() => window.axe.run(document, { resultTypes: ['violations'] }));
    const severe = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(severe.map((v) => v.id + ': ' + v.help)).toEqual([]);
    expect(errors).toEqual([]);
});

test('help center: nav, search, and body follows the locale fallback chain (v2.9.1)', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await page.click('#helpBtn');
    await expect(page.locator('.view-help')).toBeVisible();
    // 7 chapters since v3.0.0 (Song library added after Quick start)
    await expect(page.locator('#helpNavList a')).toHaveCount(7);
    await expect(page.locator('.help-nav-list a[data-target="help-library"]')).toBeVisible();
    await expect(page.locator('#help-library')).toContainText('添加文件夹');
    await expect(page.locator('#helpSearchInput')).toBeVisible();
    // the content pane is the real scroll container (sidebar/other views scroll themselves)
    const overflowY = await page.evaluate(() => getComputedStyle(document.getElementById('helpContent')).overflowY);
    expect(overflowY).toBe('auto');

    // nav click highlights the chapter and scrolls the pane
    await page.click('.help-nav-list a[data-target="help-faq"]');
    await expect(page.locator('.help-nav-list a[data-target="help-faq"]')).toHaveClass(/active/);
    const faqTarget = await page.evaluate(() => document.getElementById('help-faq').offsetTop - 14);
    await expect
        .poll(() => page.evaluate(() => Math.round(document.getElementById('helpContent').scrollTop)), {
            timeout: 5000
        })
        .toBeGreaterThanOrEqual(faqTarget - 2);

    // search filters both cards and the nav list; Esc restores
    // 'song/lyric' matches only the netease chapter — quick's body also
    // mentions 网易云, so it must NOT be used as the exclusive needle
    await page.fill('#helpSearchInput', 'song/lyric');
    await expect(page.locator('#help-netease')).toBeVisible();
    await expect(page.locator('#help-quick')).toBeHidden();
    await expect(page.locator('.help-nav-list a[data-target="help-quick"]')).toBeHidden();
    await page.press('#helpSearchInput', 'Escape');
    await expect(page.locator('#help-quick')).toBeVisible();
    await expect(page.locator('.help-nav-list a[data-target="help-quick"]')).toBeVisible();

    // body language: ja directly; pt-br falls back to en (NOT zh) per the
    // i18n fallback chain — re-enter the view after each locale change
    await pickLocale(page, 'ja');
    await page.click('.sidebar-btn[data-view="lyrics"]');
    await page.click('#helpBtn');
    await expect(page.locator('#help-faq')).toContainText('ビルドタブ');
    await pickLocale(page, 'pt-br');
    await page.click('.sidebar-btn[data-view="lyrics"]');
    await page.click('#helpBtn');
    await expect(page.locator('#help-faq')).toContainText('Build tab blank?');

    // help-page OWN language switch: ja body while the global UI stays pt-br
    await page.click('.help-lang-btn[data-help-lang="ja"]');
    await expect(page.locator('#help-faq')).toContainText('ビルドタブ');
    // chapter titles switch too (they live in help-content.js)
    await expect(page.locator('.help-nav-list a[data-target="help-faq"]')).toContainText('よくある質問');
    // the global UI locale is NOT touched by the help-page switch
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('pt-br');
    // the choice persists across view switches
    await page.click('.sidebar-btn[data-view="lyrics"]');
    await page.click('#helpBtn');
    await expect(page.locator('#help-faq')).toContainText('ビルドタブ');
    expect(errors).toEqual([]);
});

test('song library: Open button label + multi-source chooser (v2.9.3)', async ({ page }) => {
    const errors = watchErrors(page);
    // stub a multi-source manifest before boot (real manifest is single-source)
    await page.route('**/examples/manifest.json', (route) =>
        route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({
                songs: [
                    {
                        title: '多源示例歌',
                        artist: 'Demo',
                        source: '示例源',
                        file: 'examples/a.zip',
                        sources: [
                            { label: '源 A', file: 'examples/a.zip' },
                            { label: '源 B', file: 'examples/b.zip' }
                        ]
                    }
                ]
            })
        })
    );
    await openApp(page);
    // v2.9.4: the sidebar button now opens the standalone library view; the
    // sample-pack modal lives inside that view behind the "示例包" button
    await page.click('#librarySideBtn');
    await page.click('#libSamplesBtn');
    // button carries action semantics ("打开"), not the old "来源" label
    await expect(page.locator('.library-item-btn').first()).toHaveText('打开');
    // a multi-source song opens the chooser instead of loading straight through
    await page.click('.library-item-btn');
    await expect(page.locator('#librarySourcePop')).toBeVisible();
    await expect(page.locator('#librarySourcePopTitle')).toHaveText('选择来源');
    await expect(page.locator('#librarySourcePop .library-source-btn')).toHaveCount(2);
    await page.click('#librarySourcePopClose');
    await expect(page.locator('#librarySourcePop')).toBeHidden();
    expect(errors).toEqual([]);
});

test('library view: folder import, rows, search, detail, play (v2.9.4)', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await page.click('#librarySideBtn');
    await expect(page.locator('.library-view')).toBeVisible();
    await expect(page.locator('.library-body')).toContainText('曲库为空');
    // webkitdirectory input accepts a directory path
    await page.setInputFiles('#libDirInput', 'tests/e2e/fixtures/library');
    await page.waitForSelector('.lib-row');
    // the import-finished dialog (if any) closes itself after the progress row
    await page
        .locator('#dialogOverlay .dialog-primary')
        .first()
        .click()
        .catch(() => {});
    await expect(page.locator('.lib-row')).toHaveCount(2);
    await expect(page.locator('.lib-row').filter({ hasText: '测试歌曲' })).toContainText('测试歌手');
    await expect(page.locator('.lib-row').filter({ hasText: '裸音源' })).toContainText('ID3歌手');
    // search hits lyric body text
    await page.fill('#libSearchInput', 'こんにちは');
    await expect(page.locator('.lib-row')).toHaveCount(1);
    await page.fill('#libSearchInput', '');
    // detail + back
    await page.locator('.lib-row').filter({ hasText: '测试歌曲' }).locator('[data-action="detail"]').click();
    await expect(page.locator('.lib-detail-title')).toHaveText('测试歌曲');
    await page.click('[data-action="detail-back"]');
    await expect(page.locator('.lib-row')).toHaveCount(2);
    // play the pack song -> lyrics view renders its lines
    await page.locator('.lib-row').filter({ hasText: '测试歌曲' }).locator('[data-action="play"]').click();
    await expect(page.locator('#viewContent .view-lyrics')).toBeVisible();
    await expect(page.locator('#viewContent')).toContainText('こんにちは');
    expect(errors).toEqual([]);
});
