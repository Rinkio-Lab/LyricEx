/* i18n parity check – node tests/i18n-check.mjs */
globalThis.window = globalThis;
await import('../assets/locales/index.js');
await import('../assets/locales/languages.js');
await import('../assets/locales/zh.js');
await import('../assets/locales/ja.js');
await import('../assets/locales/en.js');
// pull EVERY registry language's dict file so user-maintained languages are
// audited in full (boot now loads only the current chain; tests need all).
for (const lang of window.__lyricexLanguages) {
    if (lang.code === 'zh' || lang.code === 'ja' || lang.code === 'en') continue;
    try { await import('../assets/locales/' + lang.code + '.js'); }
    catch (_) { /* entry without a dict file */ }
}
const fs = await import('fs');
const path = await import('path');

const d = window.__i18n._dicts;
const keys = new Set([...Object.keys(d.zh), ...Object.keys(d.ja), ...Object.keys(d.en)]);
let bad = 0;
for (const k of keys) {
    for (const loc of ['zh', 'ja', 'en']) {
        if (d[loc][k] === undefined) { console.log('MISSING', loc, k); bad++; }
    }
}
console.log(bad === 0 ? 'I18N KEYS COMPLETE (' + keys.size + ' keys)' : bad + ' MISSING');

// walk every .js under assets/scripts/ so keys used by new utils/modules are checked too
function walk(dir) {
    const out = [];
    for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        if (fs.statSync(p).isDirectory()) out.push(...walk(p));
        else if (name.endsWith('.js')) out.push(p);
    }
    return out;
}
const jsSources = walk('assets/scripts').map((f) => fs.readFileSync(f, 'utf8'));

const html = fs.readFileSync('index.html', 'utf8');
const used = new Set();
for (const m of html.matchAll(/data-i18n(?:-title|-placeholder)?="([a-zA-Z0-9]+)"/g)) used.add(m[1]);
for (const src of jsSources) {
    for (const m of src.matchAll(/\bt\('([a-zA-Z0-9]+)'\)/g)) used.add(m[1]);
}
let miss = 0;
for (const k of used) if (!d.zh[k]) { console.log('UNUSED-KEY-MISSING', k); miss++; }
console.log(miss === 0 ? 'ALL USED KEYS EXIST (' + used.size + ' used)' : miss + ' MISSING');

// id contract: every getElementById('x') across assets/scripts/ (static ones) exists in
// index.html. Dynamic ids created inside renderEditorView / renderHelpView are excluded.
const ids = new Set();
for (const src of jsSources) {
    for (const m of src.matchAll(/getElementById\('([^']+)'\)/g)) ids.add(m[1]);
}
const dynamic = new Set(['editorOffsetRange', 'editorOffsetValue', 'exportPackageBtn', 'exportLrcBtn',
    'exportSrtBtn', 'exportAssBtn', 'exportVideoBtn', 'editorSeekStartBtn', 'metaTitle', 'metaArtist',
    'metaAlbum', 'editorAddLineBtn', 'editorReloadBtn', 'printStudyBtn', 'exportNotesBtn',
    'exportNotesHtmlBtn', 'posterBtn', 'importWordsBtn', 'importWordsFile',
    'editorCoverBtn', 'editorCoverRemoveBtn', 'editorCoverFile', 'editorCoverThumb',
    'editorInstBtn', 'editorInstRemoveBtn', 'editorInstFile', 'editorInstThumb',
    'helpContent', 'helpSearchInput', 'helpNoResults', 'helpTopBtn',
    'helpPrevBtn', 'helpNextBtn', 'helpPagerLabel', 'helpContribute']);
let idMiss = 0;
for (const id of ids) {
    if (dynamic.has(id)) continue;
    if (!html.includes('id="' + id + '"')) { console.log('ID MISSING IN HTML', id); idMiss++; }
}
console.log(idMiss === 0 ? 'ALL STATIC IDS EXIST (' + ids.size + ' refs)' : idMiss + ' ID MISSING');

// ---- fallback chain (config-driven) ----
// Simulate with FICTIONAL codes (xx/yy) so the real user-maintained dicts
// (ko/fr/…) stay intact for the key-alignment audit below.
const i18n = window.__i18n;
i18n.registerConfig([...window.__lyricexLanguages,
    { code: 'xx', native: 'X', maintainedBy: 'user', fallback: 'en' },
    { code: 'yy', native: 'Y', maintainedBy: 'user', fallback: 'xx' }]);
i18n.register('xx', { about: 'xx-about', developer: '' });
i18n.register('yy', {});
let fbad = 0;
function feq(name, got, want) {
    if (got !== want) { console.log('FALLBACK-FAIL', name, 'got', JSON.stringify(got), 'want', JSON.stringify(want)); fbad++; }
    else console.log('ok fallback ' + name);
}
i18n._current = 'xx';
// xx has the key -> xx value ('' is a valid filled value, not a miss)
feq('own key', i18n.t('about'), 'xx-about');
// xx missing -> xx.fallback=en -> en has 'view'
feq('one hop', i18n.t('view'), d.en['view']);
i18n._current = 'yy';
// yy empty -> xx -> en (two hops)
feq('two hops to en', i18n.t('view'), d.en['view']);
// yy empty -> xx has 'about' (chain stops at xx)
feq('two hops to xx', i18n.t('about'), 'xx-about');
// missing everywhere (yy->xx->en->zh->key) -> raw key
feq('key itself', i18n.t('__no_such_key_xyz__'), '__no_such_key_xyz__');
// cycle guard: xx<->yy loop must not hang, resolves to key
i18n.registerConfig([...window.__lyricexLanguages,
    { code: 'xx', native: 'X', maintainedBy: 'user', fallback: 'yy' },
    { code: 'yy', native: 'Y', maintainedBy: 'user', fallback: 'xx' }]);
feq('cycle guard', i18n.t('__no_such_key_xyz__'), '__no_such_key_xyz__');
i18n._current = 'zh';
console.log(fbad === 0 ? 'FALLBACK CHAIN OK' : fbad + ' FALLBACK FAIL');
// ---- user-maintained languages: keys must be a subset of zh (no extras);
// missing keys are allowed (fallback fills them), values may be ''. ----
let ubad = 0;
window.__lyricexLanguages.forEach(function (l) {
    if (l.code === 'zh') return;
    const dict = i18n._dicts[l.code] || {};
    const extra = Object.keys(dict).filter(function (k) { return d.zh[k] === undefined; });
    if (extra.length) { console.log('USER-LANG-EXTRA', l.code, extra.slice(0, 3)); ubad++; }
});
console.log(ubad === 0 ? 'USER LANGS KEY-ALIGNED' : ubad + ' USER-LANG EXTRA');

// ---- RTL dir + BCP 47 detection (needs a minimal document/navigator shim) ----
globalThis.document = {
    documentElement: { lang: '', dir: '' },
    querySelectorAll: function () { return []; },
    querySelector: function () { return null; },
    getAttribute: function () { return null; },
};
const origNav = globalThis.navigator;
Object.defineProperty(globalThis, 'navigator', { value: { language: 'pt-BR' }, configurable: true });
feq('bcp47 detect pt-BR -> pt-br', i18n._detect(), 'pt-br');
Object.defineProperty(globalThis, 'navigator', { value: { language: 'en-US' }, configurable: true });
feq('bcp47 detect en-US -> en', i18n._detect(), 'en');
i18n.setLocale('ar');
feq('rtl dir for ar', document.documentElement.dir, 'rtl');
feq('html lang for ar', document.documentElement.lang, 'ar');
i18n.setLocale('en');
feq('ltr dir for en', document.documentElement.dir, 'ltr');
// v2.3.1: direction override — force RTL on an LTR language and vice versa
i18n.setDirectionOverride('rtl');
feq('override rtl on en', document.documentElement.dir, 'rtl');
i18n.setDirectionOverride('ltr');
i18n.setLocale('ar');
feq('override ltr on ar', document.documentElement.dir, 'ltr');
i18n.setDirectionOverride('auto');
i18n.setLocale('en');
feq('auto en back to ltr', document.documentElement.dir, 'ltr');
Object.defineProperty(globalThis, 'navigator', { value: origNav, configurable: true });

process.exit(bad + miss + idMiss + fbad + ubad === 0 ? 0 : 1);
