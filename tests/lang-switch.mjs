/* Reproduction: sidebar + settings items after language switch.
   Builds a faithful-enough DOM from the real index.html static structure. */
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

// ---- minimal element ----
let nextId = 0;
class El {
    constructor(tag) {
        this.tagName = (tag || 'div').toUpperCase();
        this.id = '';
        this._children = [];
        this.attributes = {};
        this._classes = new Set();
        this.classList = {
            add: (c) => this._classes.add(c),
            remove: (c) => this._classes.delete(c),
            toggle: (c, force) => {
                if (force === undefined) {
                    if (this._classes.has(c)) {
                        this._classes.delete(c);
                        return false;
                    }
                    this._classes.add(c);
                    return true;
                }
                if (force) this._classes.add(c);
                else this._classes.delete(c);
                return !!force;
            },
            contains: (c) => this._classes.has(c)
        };
        this.dataset = {};
        this.style = { _display: '', setProperty() {}, removeProperty() {} };
        this._text = '';
        this.title = '';
        this.value = '';
        this.placeholder = '';
        this.checked = false;
        this.handlers = {};
        this._elid = ++nextId;
    }
    get children() {
        return this._children;
    }
    set innerHTML(v) {
        this._children = [];
        this._text = v == null ? '' : String(v);
    }
    get innerHTML() {
        if (this._children.length) return this._children.map((c) => c.outerHTML || '').join('');
        return this._text;
    }
    set textContent(v) {
        this._children = [];
        this._text = v == null ? '' : String(v);
    }
    get textContent() {
        if (this._children.length) return this._children.map((c) => c.textContent).join('');
        return this._text;
    }
    appendChild(c) {
        this._children.push(c);
        return c;
    }
    addEventListener(t, fn) {
        (this.handlers[t] = this.handlers[t] || []).push(fn);
    }
    removeEventListener() {}
    setAttribute(k, v) {
        this.attributes[k] = String(v);
        if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(v);
    }
    getAttribute(k) {
        return this.attributes[k] !== undefined ? this.attributes[k] : null;
    }
    removeAttribute(k) {
        delete this.attributes[k];
    }
    querySelector(sel) {
        return querySel(this, sel);
    }
    querySelectorAll(sel) {
        return querySelAll(this, sel);
    }
    click() {
        (this.handlers.click || []).forEach((fn) => fn.call(this, {}));
    }
    remove() {}
    getBoundingClientRect() {
        return { top: 0, left: 0, width: 100, height: 10 };
    }
    scrollTo() {}
    scrollTop = 0;
    setPointerCapture() {}
    closest() {
        return null;
    }
}

function matches(el, sel) {
    if (!el || el.nodeType === 3) return false; // text nodes match nothing
    if (sel.startsWith('#')) return el.id === sel.slice(1);
    if (sel.startsWith('.')) return el.classList.contains(sel.slice(1));
    if (sel.startsWith('[')) {
        const m = sel.match(/^\[([a-zA-Z0-9-]+)(?:="([^"]*)")?\]$/);
        if (!m) return false;
        const attr = m[1];
        const val = m[2];
        const a = attr.startsWith('data-')
            ? el.dataset[attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())]
            : el.attributes[attr];
        if (val !== undefined) return String(a) === val;
        return a !== undefined && a !== null;
    }
    if (/^[a-z]+$/i.test(sel)) return el.tagName === sel.toUpperCase();
    return false;
}
function querySelAll(root, sel) {
    const out = [];
    (function walk(n) {
        for (const c of n._children) {
            if (matches(c, sel)) out.push(c);
            walk(c);
        }
    })(root);
    return out;
}
function querySel(root, sel) {
    const all = querySelAll(root, sel);
    return all[0] || null;
}

// ---- build DOM tree by parsing index.html body ----
const root = new El('html');
const body = new El('body');
root._children.push(body);
const byId = new Map();

// Parse only elements with ids and structural tags we care about.
// We use a tiny tag parser.
const voidTags = new Set(['input', 'br', 'hr', 'img', 'link', 'meta']);
// Track open tags with a stack for nesting.
const openStack = [];
function attrsFrom(str) {
    const a = {};
    const cl = [];
    const attrRe = /([a-zA-Z0-9-]+)(?:="([^"]*)")?/g;
    let am;
    while ((am = attrRe.exec(str))) {
        a[am[1]] = am[2] !== undefined ? am[2] : '';
        if (am[1] === 'class') cl.push(...(am[2] || '').split(/\s+/).filter(Boolean));
    }
    return { a, cl };
}

let htmlBody = html.slice(html.indexOf('<body'));
// extract body inner
htmlBody = htmlBody.replace(/^[^>]*>/, '').replace(/<\/body>[\s\S]*$/, '');
const tokenRe = /<([a-zA-Z0-9-]+)([^>]*)>|<\/([a-zA-Z0-9-]+)>|([^<]+)/g;
let cur = body;
let tok;
while ((tok = tokenRe.exec(htmlBody))) {
    if (tok[1]) {
        // open
        const tag = tok[1].toLowerCase();
        const { a, cl } = attrsFrom(tok[2] || '');
        const el = new El(tag);
        el.attributes = a;
        for (const c of cl) el.classList.add(c);
        if (a.id) {
            el.id = a.id;
            byId.set(a.id, el);
        }
        if (a['data-i18n']) el.dataset.i18n = a['data-i18n'];
        if (a['data-i18n-title']) el.dataset.i18nTitle = a['data-i18n-title'];
        if (a['data-i18n-placeholder']) el.dataset.i18nPlaceholder = a['data-i18n-placeholder'];
        if (a['data-view']) el.dataset.view = a['data-view'];
        if (a['data-sidebar-item']) el.dataset.sidebarItem = a['data-sidebar-item'];
        if (a['data-lang']) el.dataset.lang = a['data-lang'];
        if (a.class) {
            for (const c of cl) el.classList.add(c);
        }
        if (a['data-tab']) el.dataset.tab = a['data-tab'];
        if (a['data-panel']) el.dataset.panel = a['data-panel'];
        if (a['data-color']) el.dataset.color = a['data-color'];
        if (a['data-nav']) el.dataset.nav = a['data-nav'];
        if (a.title) el.title = a.title;
        if (a.value) el.value = a.value;
        cur.appendChild(el);
        if (!voidTags.has(tag)) {
            openStack.push(cur);
            cur = el;
        }
    } else if (tok[3]) {
        // close
        const tag = tok[3].toLowerCase();
        if (voidTags.has(tag)) continue;
        if (openStack.length) cur = openStack.pop();
    } else if (tok[4]) {
        // text
        const txt = tok[4];
        if (txt.trim()) {
            cur._text += txt;
        }
    }
}

// ---- shim globals ----
globalThis.window = globalThis;
globalThis.document = {
    getElementById: (id) => byId.get(id) || null,
    querySelectorAll: (sel) => querySelAll(body, sel),
    querySelector: (sel) => querySel(body, sel),
    createElement: (tag) => new El(tag),
    createTextNode: (text) => ({ nodeType: 3, textContent: String(text), _children: [] }),
    addEventListener() {},
    documentElement: root,
    body
};
Object.defineProperty(globalThis, 'navigator', {
    value: { language: 'zh-CN', mediaSession: undefined },
    configurable: true
});
globalThis.localStorage = {
    _m: {},
    getItem(k) {
        return this._m[k] || null;
    },
    setItem(k, v) {
        this._m[k] = String(v);
    },
    removeItem(k) {
        delete this._m[k];
    }
};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
globalThis.performance = { now: () => 0 };
globalThis.matchMedia = () => ({ matches: false });
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
globalThis.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
globalThis.alert = () => {};
globalThis.confirm = () => true;
globalThis.Audio = class {
    constructor() {
        this.currentTime = 0;
        this.volume = 1;
        this.playbackRate = 1;
        this.duration = 0;
        this.src = '';
    }
    addEventListener() {}
    play() {
        return Promise.resolve();
    }
    pause() {}
};
globalThis.JSZip = { loadAsync: async () => ({ files: {} }) };

await import('../assets/locales/index.js');
await import('../assets/locales/languages.js');
await import('../assets/locales/zh.js');
await import('../assets/locales/ja.js');
await import('../assets/locales/en.js');
await import('../assets/scripts/lib.js');
await import('../assets/scripts/changelog.js');
await import('../assets/scripts/utils/theme.js');
await import('../assets/scripts/utils/loop.js');
await import('../assets/scripts/utils/search.js');
await import('../assets/scripts/utils/subtitles.js');
await import('../assets/scripts/utils/canvas.js');
await import('../assets/scripts/utils/share-card.js');
await import('../assets/scripts/utils/netease.js');
await import('../assets/scripts/utils/ai-import.js');
await import('../assets/scripts/utils/ai-prompt.js');
await import('../assets/scripts/utils/lyric-package.js');
await import('../assets/scripts/modules/audio-graph.js');
await import('../assets/scripts/modules/video.js');
await import('../assets/scripts/ui/video-export.js');
await import('../assets/scripts/ui/share.js');
await import('../assets/scripts/ui/editor.js');
await import('../assets/scripts/ui/workspace.js');
await import('../assets/scripts/ui/search.js');
await import('../assets/scripts/ui/mini.js');
await import('../assets/scripts/ui/cinema.js');
await import('../assets/scripts/ui/about.js');
await import('../assets/scripts/ui/settings.js');
await import('../assets/scripts/app.js');

const i18n = window.__i18n;

function dump(label) {
    console.log('==== ' + label + ' ====');
    // static data-i18n elements (sidebar labels, tab labels, section headers, lang options)
    const statics = {};
    querySelAll(body, '[data-i18n]').forEach((el) => {
        const k = el.dataset.i18n;
        if (el._children.length === 0 && !statics[k]) statics[k] = el.textContent;
    });
    const keys = [
        'view',
        'modes',
        'system',
        'lyrics',
        'study',
        'mixed',
        'editor',
        'darkMode',
        'about',
        'settings',
        'general',
        'appearance',
        'lyricsTab',
        'shortcutsTab',
        'interfaceLang',
        'sidebarVisibility',
        'chinese',
        'japanese',
        'english'
    ];
    const out = {};
    keys.forEach((k) => {
        if (statics[k] !== undefined) out[k] = statics[k];
    });
    console.log('static i18n:', JSON.stringify(out));
    // dynamic settings controls
    for (const id of [
        'generalControls',
        'sidebarControls',
        'lyricsControls',
        'appearanceFonts',
        'appearanceCinema',
        'shortcutControls'
    ]) {
        const el = byId.get(id);
        console.log(
            id +
                ': children=' +
                (el ? el._children.length : 'null') +
                ' text=' +
                JSON.stringify(el ? el.textContent.slice(0, 100) : '')
        );
    }
}

console.log('INITIAL (zh)');
dump('zh');

// simulate the REAL flow: open settings, then switch language
byId.get('settingsOverlay').classList.add('open');

i18n.setLocale('ja');
dump('ja (settings open)');

i18n.setLocale('zh');
dump('zh (back, settings open)');

// ---- regression check: locale switch while settings CLOSED must still
// re-render the dynamic settings/sidebar controls (they have no data-i18n). ----
let failures = 0;
function check(name, cond) {
    if (!cond) {
        failures++;
        console.error('FAIL ' + name);
    } else console.log('ok ' + name);
}

i18n.setLocale('zh');
// v3.0.0 regression: the cinema section must be CLEARED on re-render, not
// appended — locale switches must not multiply the backdrop rows
check('cinema rows stable across locale switches', byId.get('appearanceCinema')._children.length <= 8);
byId.get('settingsOverlay').classList.remove('open');
i18n.setLocale('en');
check('general controls re-render when closed (en)', byId.get('generalControls').textContent.includes('Default view'));
check('sidebar controls re-render when closed (en)', byId.get('sidebarControls').textContent.includes('Sidebar items'));
check(
    'shortcut controls re-render when closed (en)',
    byId.get('shortcutControls').textContent.includes('Play / Pause')
);
i18n.setLocale('zh');
check('controls switch back to zh', byId.get('generalControls').textContent.includes('默认首页'));

// ---- v1.6.4: the reported items — sidebar "编辑"/"模式" labels, the "快捷键"
// tab, the editor view toolbar, and the shortcut keycaps — must all survive a
// full zh→ja→zh round-trip (including while the modal is closed). ----
const viewHtml = () => byId.get('viewContent').innerHTML;
const staticText = (key) => {
    const el = querySelAll(body, '[data-i18n]').find((e) => e.dataset.i18n === key && e._children.length === 0);
    return el ? el.textContent : '';
};
await window.__lyricex.loadLrc({ name: 't.lrc', text: async () => '[ti:T]\n[00:01.00]hello\n' });
window.__lyricex.switchView('editor');

i18n.setLocale('zh');
check('editor toolbar zh', viewHtml().includes('添加一行'));
check('sidebar editor label zh', staticText('editor') === '编辑');
check('sidebar modes label zh', staticText('modes') === '模式');
check('settings shortcuts tab zh', staticText('shortcutsTab') === '快捷键');

i18n.setLocale('ja');
check('editor toolbar ja', viewHtml().includes('行を追加'));
check('sidebar editor label ja', staticText('editor') === 'エディター');
check('settings shortcuts tab ja', staticText('shortcutsTab') === 'ショートカット');

i18n.setLocale('zh');
check('editor toolbar back zh', viewHtml().includes('添加一行'));
check('sidebar editor label back zh', staticText('editor') === '编辑');
check('sidebar modes label back zh', staticText('modes') === '模式');
check('settings shortcuts tab back zh', staticText('shortcutsTab') === '快捷键');
check('shortcut keycaps back zh', byId.get('shortcutControls').textContent.includes('播放 / 暂停'));

// ---- v1.6.5: ja↔en round-trip must not get stuck in Japanese ----
i18n.setLocale('en');
check('en reached from zh (sidebar editor)', staticText('editor') === 'Editor');
i18n.setLocale('ja');
check('ja reached from en (sidebar editor)', staticText('editor') === 'エディター');
check('ja reached from en (shortcut controls)', byId.get('shortcutControls').textContent.includes('再生 / 一時停止'));
i18n.setLocale('en');
check('en reached from ja (sidebar editor)', staticText('editor') === 'Editor');
check('en reached from ja (settings shortcuts tab)', staticText('shortcutsTab') === 'Shortcuts');
check('en reached from ja (general controls)', byId.get('generalControls').textContent.includes('Default view'));
check('en reached from ja (shortcut controls)', byId.get('shortcutControls').textContent.includes('Play / Pause'));
i18n.setLocale('ja');
check('ja reached back from en (sidebar editor)', staticText('editor') === 'エディター');
check(
    'ja reached back from en (shortcut controls)',
    byId.get('shortcutControls').textContent.includes('再生 / 一時停止')
);

console.log(failures === 0 ? 'LANG-SWITCH REGRESSION PASSED' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
