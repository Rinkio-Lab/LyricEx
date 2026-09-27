/* LyricEx release-flow diagram renderer (trilingual) — keeps the README
   "Before you commit / push" chart in sync with the doc steps (README.md /
   README.zh-CN.md / README.ja.md). Introduced at v2.8.4; trilingual at v2.9.1.
   Usage:  node scripts/render-release-flow.mjs
   Output: assets/images/shots/release-flow-en.png (README.md)
           assets/images/shots/release-flow-zh.png (README.zh-CN.md)
           assets/images/shots/release-flow-ja.png (README.ja.md)
   Deps:   Playwright Chromium — set PLAYWRIGHT_BROWSERS_PATH if not default:
           $env:PLAYWRIGHT_BROWSERS_PATH='E:\Projects\LyricEx\.pw-browsers'
   Rule:   any change to the commit/push steps MUST re-render the diagrams and
           commit the PNGs together with the doc edits (AGENTS.md §4.5). */
import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'assets', 'images', 'shots');

// 7 numbered steps per language — must mirror the README "Before you commit /
// push" lists. First line = command (monospace), second = note.
const LANGS = {
    en: {
        file: 'release-flow-en.png',
        steps: [
            ['npm run lint', '0 errors'],
            ['node tests/run-tests.mjs', 'full self-check, ALL PASS'],
            ['npm run e2e', 'Playwright real-browser + axe a11y'],
            ['npm run release-check', 'CACHE ↔ CHANGELOG lockstep + size report'],
            ['bump version anchors', 'sw CACHE / package / index footer / changelogs'],
            ['git safety sweep', 'no *.keystore / secrets; status clean'],
            ['commit → push → deploy → refresh ×2 → test', 'then release']
        ],
        allGreen: 'All green?',
        allSub: 'lint / tests / e2e / check',
        yes: 'YES',
        no: 'NO',
        release: 'Release',
        releaseSub: 'vX.Y.Z'
    },
    zh: {
        file: 'release-flow-zh.png',
        steps: [
            ['npm run lint', '0 错误'],
            ['node tests/run-tests.mjs', '全量自检通过'],
            ['npm run e2e', 'Playwright 真实浏览器 + axe 无障碍'],
            ['npm run release-check', 'CACHE 与 CHANGELOG 锁步 + 体积报告'],
            ['同步版本锚点', 'sw CACHE / package / index 页脚 / 双 changelog'],
            ['git 安全核对', '无 *.keystore / 密钥；status 干净'],
            ['commit → push → 部署 → 刷新两次 → 实测', '然后发布']
        ],
        allGreen: '全部通过？',
        allSub: 'lint / tests / e2e / check',
        yes: '是',
        no: '否',
        release: '发布',
        releaseSub: 'vX.Y.Z'
    },
    ja: {
        file: 'release-flow-ja.png',
        steps: [
            ['npm run lint', 'エラー 0'],
            ['node tests/run-tests.mjs', '全チェック PASS'],
            ['npm run e2e', 'Playwright 実ブラウザ + axe a11y'],
            ['npm run release-check', 'CACHE ↔ CHANGELOG 整合 + サイズ報告'],
            ['バージョン同期', 'sw CACHE / package / index / changelogs'],
            ['git 安全確認', '*.keystore / 秘密情報なし; status クリーン'],
            ['commit → push → デプロイ → 再読込 ×2 → 検証', 'そしてリリース']
        ],
        allGreen: '全て合格？',
        allSub: 'lint / tests / e2e / check',
        yes: 'はい',
        no: 'いいえ',
        release: 'リリース',
        releaseSub: 'vX.Y.Z'
    }
};

const STEP_W = 400,
    STEP_H = 54,
    X = 60,
    CX = X + STEP_W / 2;
const ys = [40, 110, 180, 250, 320, 390, 460]; // 7 rows (bottom of #7 = 514)
const DIAMOND = { cx: CX, cy: 590, hw: 92, hh: 45 };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildSvg(lang) {
    const stepBoxes = lang.steps
        .map(([cmd, note], i) => {
            const y = ys[i],
                n = i + 1;
            return [
                `<g>`,
                `<rect x="${X}" y="${y}" width="${STEP_W}" height="${STEP_H}" rx="6" fill="#fff" stroke="#d8d0c8" stroke-width="1.4"/>`,
                `<circle cx="${X + 22}" cy="${y + STEP_H / 2}" r="12" fill="#8a7a6a"/>`,
                `<text x="${X + 22}" y="${y + STEP_H / 2 + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">${n}</text>`,
                `<text x="${X + 44}" y="${y + 22}" font-size="13" font-weight="600" fill="#3a3530" font-family="'Cascadia Mono','JetBrains Mono',Consolas,monospace">${esc(cmd)}</text>`,
                `<text x="${X + 44}" y="${y + 40}" font-size="11" fill="#8b837a">${esc(note)}</text>`,
                `</g>`
            ].join('');
        })
        .join('');
    const stepArrows = ys
        .slice(0, -1)
        .map(
            (y, i) =>
                `<line x1="${CX}" y1="${y + STEP_H}" x2="${CX}" y2="${ys[i + 1]}" stroke="#b8b0a8" stroke-width="1.4" marker-end="url(#arr)"/>`
        )
        .join('');
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="700" font-family="'Segoe UI','Noto Sans SC',sans-serif">`,
        `<defs>`,
        `<marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#b8b0a8"/></marker>`,
        `<marker id="arrNo" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#c0392b"/></marker>`,
        `<marker id="arrYes" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#2e7d32"/></marker>`,
        `</defs>`,
        `<rect width="640" height="700" fill="#faf7f2"/>`,
        stepBoxes,
        stepArrows,
        `<line x1="${CX}" y1="514" x2="${CX}" y2="545" stroke="#b8b0a8" stroke-width="1.4" marker-end="url(#arr)"/>`,
        `<polygon points="${DIAMOND.cx},${DIAMOND.cy - DIAMOND.hh} ${DIAMOND.cx + DIAMOND.hw},${DIAMOND.cy} ${DIAMOND.cx},${DIAMOND.cy + DIAMOND.hh} ${DIAMOND.cx - DIAMOND.hw},${DIAMOND.cy}" fill="#fff" stroke="#2e7d32" stroke-width="1.6"/>`,
        `<text x="${DIAMOND.cx}" y="${DIAMOND.cy - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="#2e7d32">${esc(lang.allGreen)}</text>`,
        `<text x="${DIAMOND.cx}" y="${DIAMOND.cy + 10}" text-anchor="middle" font-size="10" fill="#6a625c">${esc(lang.allSub)}</text>`,
        `<path d="M${DIAMOND.cx - DIAMOND.hw},${DIAMOND.cy} L22,${DIAMOND.cy} L22,67 L60,67" fill="none" stroke="#c0392b" stroke-width="1.4" stroke-dasharray="5,4" marker-end="url(#arrNo)"/>`,
        `<text x="${DIAMOND.cx - DIAMOND.hw - 22}" y="${DIAMOND.cy + 16}" text-anchor="end" font-size="11" font-weight="700" fill="#c0392b">${esc(lang.no)}</text>`,
        `<line x1="${DIAMOND.cx + DIAMOND.hw}" y1="${DIAMOND.cy}" x2="478" y2="${DIAMOND.cy}" stroke="#2e7d32" stroke-width="1.4" marker-end="url(#arrYes)"/>`,
        `<text x="${DIAMOND.cx + DIAMOND.hw + 14}" y="${DIAMOND.cy - 8}" font-size="11" font-weight="700" fill="#2e7d32">${esc(lang.yes)}</text>`,
        `<rect x="478" y="560" width="146" height="60" rx="6" fill="#2e7d32"/>`,
        `<text x="551" y="584" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${esc(lang.release)}</text>`,
        `<text x="551" y="604" text-anchor="middle" font-size="12" fill="#e8f5e9">${esc(lang.releaseSub)}</text>`,
        `</svg>`
    ].join('\n');
}

await mkdir(outDir, { recursive: true });
await rm(join(outDir, 'release-flow.png'), { force: true }); // legacy single-language asset
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 700 }, deviceScaleFactor: 2 });
for (const lang of Object.values(LANGS)) {
    await page.setContent('<html><head><style>body{margin:0}</style></head><body>' + buildSvg(lang) + '</body></html>');
    const p = join(outDir, lang.file);
    await page.locator('svg').screenshot({ path: p });
    console.log('wrote ' + p);
}
await browser.close();
