/* LyricEx Playwright config — real-browser smoke suite (tests/e2e).
   webServer is the zero-dep scripts/serve.mjs so CI has no Python dependency. */
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'tests/e2e',
    timeout: 60_000,
    fullyParallel: false,
    workers: 1, // localStorage per-browser-context; serial is simpler than isolation hacks
    retries: 0,
    reporter: [['list']],
    use: {
        baseURL: 'http://127.0.0.1:8090',
        headless: true,
        locale: 'zh-CN', // deterministic bootstrap: locale-boot.js picks the browser language
        // CI stability: GitHub Actions Linux runners have a small /dev/shm
        // (64 MB default); Chromium crashes the FIRST page under load with
        // "Protocol error … session closed" unless it uses a tmpfs shm instead.
        launchOptions: { args: ['--disable-dev-shm-usage'] }
    },
    webServer: {
        command: 'node scripts/serve.mjs 8090',
        url: 'http://127.0.0.1:8090/index.html',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000
    }
});
