/* LyricEx real-browser smoke suite (Playwright + Chromium).
   Covers what the DOM-shim suites cannot: real HTTP boot, zip upload through
   the actual file input, view switching, zh/ja/ar locale switching with RTL
   direction, modal focus trapping, axe-core a11y scan, and a clean console. */
import { test, expect } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

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
async function openApp(page, url = '/') {
    await page.addInitScript(() => {
        try { localStorage.setItem('lyricex-guide-seen', '1'); } catch (_) { /* noop */ }
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

test('uploads an example package and renders lyrics + views', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    await page.setInputFiles('#fileInput',
        join(ROOT, 'examples', 'MyGO!!!!! - エガクミライ-lyrics-package.zip'));
    // lyrics view renders lines once the zip is parsed
    await expect(page.locator('.view-lyrics .lyric-line').first()).toBeVisible();
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

test('axe-core scan finds no critical or serious violations', async ({ page }) => {
    const errors = watchErrors(page);
    await openApp(page);
    // same-origin <script src> (CSP script-src 'self' blocks inline injection)
    await page.addScriptTag({ url: '/node_modules/axe-core/axe.min.js' });
    const results = await page.evaluate(() => window.axe.run(document, { resultTypes: ['violations'] }));
    const severe = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(severe.map((v) => v.id + ': ' + v.help)).toEqual([]);
    expect(errors).toEqual([]);
});
