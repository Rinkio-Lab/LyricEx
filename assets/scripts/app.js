/* LyricEx v2.0.5 – App Logic */
(function () {
    'use strict';

    var L = window.__lyricexLib;
    var esc = L.esc,
        formatTime = L.formatTime;

    // =========================== DOM REFS ===========================
    const app = document.getElementById('app');
    const viewContent = document.getElementById('viewContent');
    const viewBtns = document.querySelectorAll('[data-view]');
    const themeToggle = document.getElementById('themeToggle');
    const themeIconWrap = document.getElementById('themeIconWrap');
    const themeLabel = document.getElementById('themeLabel');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadFileName = document.getElementById('uploadFileName');
    const sidebarStatus = document.getElementById('sidebarStatus');
    // v2.1.1: mobile shell / cover viewer / song library / player-ext drawer
    const mobileTitle = document.getElementById('mobileTitle');
    const mobileArtist = document.getElementById('mobileArtist');
    const mobileCoverBtn = document.getElementById('mobileCoverBtn');
    const mobileMoreBtn = document.getElementById('mobileMoreBtn');
    const topDrawer = document.getElementById('topDrawer');
    const topThemeBtn = document.getElementById('topThemeBtn');
    const topSettingsBtn = document.getElementById('topSettingsBtn');
    const topAboutBtn = document.getElementById('topAboutBtn');
    const bottomNav = document.getElementById('bottomNav');
    const bottomMoreBtn = document.getElementById('bottomMoreBtn');
    const moreDrawer = document.getElementById('moreDrawer');
    const moreCinemaBtn = document.getElementById('moreCinemaBtn');
    const moreMiniBtn = document.getElementById('moreMiniBtn');
    const moreUploadBtn = document.getElementById('moreUploadBtn');
    const mobileRecentList = document.getElementById('mobileRecentList');
    const mobileQueueList = document.getElementById('mobileQueueList');
    const coverViewer = document.getElementById('coverViewer');
    const coverViewerImg = document.getElementById('coverViewerImg');
    const coverViewerClose = document.getElementById('coverViewerClose');
    const libraryOverlay = document.getElementById('libraryOverlay');
    const libraryList = document.getElementById('libraryList');
    const libraryStatus = document.getElementById('libraryStatus');
    const libraryCloseBtn = document.getElementById('libraryCloseBtn');
    const librarySourcePop = document.getElementById('librarySourcePop');
    const librarySourcePopTitle = document.getElementById('librarySourcePopTitle');
    const librarySourcePopList = document.getElementById('librarySourcePopList');
    const librarySourcePopClose = document.getElementById('librarySourcePopClose');
    const playerExt = document.getElementById('playerExt');
    const playerDrawer = document.getElementById('playerDrawer');
    const playerExtToggle = document.getElementById('playerExtToggle');
    const playerExtBadge = document.getElementById('playerExtBadge');
    const playerCoverBtn = document.getElementById('playerCoverBtn');
    const playBtn = document.getElementById('playBtn');
    const playIconWrap = document.getElementById('playIconWrap');
    const resetBtn = document.getElementById('resetBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressFill = document.getElementById('progressFill');
    const progressThumb = document.getElementById('progressThumb');
    const progressBar = document.getElementById('progressBar');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeSlider = document.getElementById('volumeSlider');
    const muteBtn = document.getElementById('muteBtn');
    const muteIconWrap = document.getElementById('muteIconWrap');
    const speedSelect = document.getElementById('speedSelect');
    const loopBtn = document.getElementById('loopBtn');
    const loopBadge = document.getElementById('loopBadge');
    const abToggleBtn = document.getElementById('abToggleBtn');
    const abBadge = document.getElementById('abBadge');
    const auditionToggleBtn = document.getElementById('auditionToggleBtn');
    const auditionToggleIcon = document.getElementById('auditionToggleIcon');
    const auditionToggleLabel = document.getElementById('auditionToggleLabel'); // v2.0.4
    const abSetA = document.getElementById('abSetA');
    const abSetB = document.getElementById('abSetB');
    const abStatus = document.getElementById('abStatus');
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutOverlay = document.getElementById('aboutOverlay');
    const aboutCloseBtn = document.getElementById('aboutCloseBtn');
    const shortcutList = document.getElementById('shortcutList');
    const watchGuideBtn = document.getElementById('watchGuideBtn');
    // v2.0.0: about sub-nav + in-app changelog
    const aboutSubnav = document.getElementById('aboutSubnav');
    const aboutBody = document.getElementById('aboutBody');
    const changelogBtn = document.getElementById('changelogBtn');
    const changelogOverlay = document.getElementById('changelogOverlay');
    const changelogBody = document.getElementById('changelogBody');
    const changelogCloseBtn = document.getElementById('changelogCloseBtn');
    // v3.2.0: update check button (about footer)
    const checkUpdateBtn = document.getElementById('checkUpdateBtn');

    // v2.0.0: transpose / loop bookmarks / recent + queue
    const transposeDown = document.getElementById('transposeDown');
    const transposeUp = document.getElementById('transposeUp');
    const transposeVal = document.getElementById('transposeVal');
    const marksToggleBtn = document.getElementById('marksToggleBtn');
    const marksBadge = document.getElementById('marksBadge');
    const abSave = document.getElementById('abSave');
    const marksPanel = document.getElementById('marksPanel');
    const marksList = document.getElementById('marksList');
    const recentSection = document.getElementById('recentSection');
    const recentList = document.getElementById('recentList');
    const queueSection = document.getElementById('queueSection');
    const queueList = document.getElementById('queueList');

    // Guide overlay refs
    const guideOverlay = document.getElementById('guideOverlay');
    const guideBody = document.getElementById('guideBody');
    const guideDots = document.getElementById('guideDots');
    const guideCounter = document.getElementById('guideCounter');
    const guidePrevBtn = document.getElementById('guidePrevBtn');
    const guideNextBtn = document.getElementById('guideNextBtn');
    const guideSkipBtn = document.getElementById('guideSkipBtn');

    // Settings refs
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsPanels = document.querySelectorAll('.settings-panel');
    const colorOptions = document.querySelectorAll('.color-option');
    const langList = document.getElementById('langList');
    const langChangeBtn = document.getElementById('langChangeBtn');
    const langDrawer = document.getElementById('langDrawer');
    const langDrawerClose = document.getElementById('langDrawerClose');
    const currentLangLabel = document.getElementById('currentLangLabel');
    const guideGlobeBtn = document.getElementById('guideGlobeBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const settingsExportBtn = document.getElementById('settingsExportBtn');
    const settingsImportBtn = document.getElementById('settingsImportBtn');
    const settingsImportFile = document.getElementById('settingsImportFile');
    const settingsSubnav = document.getElementById('settingsSubnav');
    const settingsBody = document.getElementById('settingsBody');
    const appearanceFonts = document.getElementById('appearanceFonts');
    const appearanceSizes = document.getElementById('appearanceSizes');
    const lyricsControls = document.getElementById('lyricsControls');
    const shortcutControls = document.getElementById('shortcutControls');
    const themeControls = document.getElementById('themeControls');
    const generalControls = document.getElementById('generalControls');
    const sidebarControls = document.getElementById('sidebarControls');

    // Cinema refs
    const cinemaBtn = document.getElementById('cinemaBtn');
    const cinemaOverlay = document.getElementById('cinemaOverlay');
    const cinemaLyrics = document.getElementById('cinemaLyrics');
    const cinemaExitBtn = document.getElementById('cinemaExitBtn');
    const cinemaPlayerSlot = document.getElementById('cinemaPlayerSlot');
    const playerControls = document.getElementById('playerControls');
    const followPill = document.getElementById('followPill');
    const cinemaFollowPill = document.getElementById('cinemaFollowPill');

    // Spectrum refs
    const spectrumRow = document.getElementById('spectrumRow');
    const spectrumCanvas = document.getElementById('spectrumCanvas');

    // Mini mode refs
    const miniBtn = document.getElementById('miniBtn');
    const miniBar = document.getElementById('miniBar');
    const miniDrag = document.getElementById('miniDrag');
    const miniInfo = document.getElementById('miniInfo');
    const miniTitle = document.getElementById('miniTitle');
    const miniLine = document.getElementById('miniLine');
    const miniPlayBtn = document.getElementById('miniPlayBtn');
    const miniPlayIcon = document.getElementById('miniPlayIcon');
    const miniPrevBtn = document.getElementById('miniPrevBtn');
    const miniNextBtn = document.getElementById('miniNextBtn');
    const miniProgress = document.getElementById('miniProgress');
    const miniProgressFill = document.getElementById('miniProgressFill');
    const miniExpandBtn = document.getElementById('miniExpandBtn');

    // v1.7.0: search / share / video export refs
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchCount = document.getElementById('searchCount');
    const shareOverlay = document.getElementById('shareOverlay');
    const sharePreview = document.getElementById('sharePreview');
    const shareTemplate = document.getElementById('shareTemplate');
    const shareAccent = document.getElementById('shareAccent');
    const shareTranslation = document.getElementById('shareTranslation');
    const shareRomaji = document.getElementById('shareRomaji');
    const shareCss = document.getElementById('shareCss');
    // v2.0.0: share template market (JSON import/export)
    const shareTplExportBtn = document.getElementById('shareTplExportBtn');
    const shareTplImportBtn = document.getElementById('shareTplImportBtn');
    const shareTplFile = document.getElementById('shareTplFile');
    const shareCopyBtn = document.getElementById('shareCopyBtn');
    const shareDownloadBtn = document.getElementById('shareDownloadBtn');
    const shareCloseBtn = document.getElementById('shareCloseBtn');
    const shareCardBtn = document.getElementById('shareCardBtn');
    const videoOverlay = document.getElementById('videoOverlay');
    const videoStatus = document.getElementById('videoStatus');
    const videoProgressFill = document.getElementById('videoProgressFill');
    const videoStartBtn = document.getElementById('videoStartBtn');
    const videoCancelBtn = document.getElementById('videoCancelBtn');
    // v2.5.0: explicit DOM ref - browsers expose element-id globals on window,
    // but bare-id references are invisible to static analysis/lint
    const printSheet = document.getElementById('printSheet');

    // =========================== STATE ===========================
    let currentView = 'lyrics';
    let currentTheme = 'light';
    let currentColorTheme = 'default';
    let audio = null;
    let isPlaying = false;
    let animationId = null;
    let isDragging = false;
    let isThumbDragging = false;

    let songData = null;
    let lyrics = [];
    let offset = 0;
    let audioUrl = null;
    let activeLineIndex = -1;
    let loadToken = 0;

    let volume = 80;
    let isMuted = false;
    let loopMode = 'none';
    let abEnabled = false;
    let abPointA = null;
    let abPointB = null;

    // v2.0.0: transpose (semitones), instrumental, loop bookmarks, recent + queue
    let transpose = 0;
    let instrumentalUrl = null;
    let instAudio = null;
    // v2.0.4: the player-bar button switches the MAIN playback track between
    // 'original' (default) and 'instrumental'; the per-line ♪ button then
    // auditions the OTHER track of the current sentence (reference vs practice)
    let mainTrackMode = 'original';
    let loopMarks = [];
    let currentLoopMark = null;
    let pendingAutoplay = false;
    let queue = [];
    let coverUrl = null; // v2.0.0 #22: package cover image (object URL)

    // spectrum (graph state lives in js/modules/audio-graph.js)
    let spectrumColor = '#8a7a6a';

    // UI feature controllers (js/ui/) — instantiated at the bottom with the
    // shared context, after every helper function is declared.
    let editorApi = null,
        workspaceApi = null,
        shareApi = null,
        videoApi = null,
        searchApi = null,
        miniApi = null,
        cinemaApi = null,
        settingsApi = null,
        aboutApi = null,
        exportApi = null;

    // =========================== SETTINGS ===========================
    let settings = L.mergeSettings(null, L.SETTINGS_DEFAULTS);

    const RERENDER_KEYS = ['subLine', 'showFurigana', 'wordKaraoke', 'showRuby'];

    function saveSettings() {
        try {
            localStorage.setItem('lyricex-settings', JSON.stringify(settings));
        } catch (_) {
            /* noop */
        }
    }

    function getSetting(key) {
        const parts = key.split('.');
        let v = settings;
        for (let i = 0; i < parts.length; i++) {
            if (v == null) return undefined;
            v = v[parts[i]];
        }
        return v;
    }

    function setSetting(key, val) {
        const parts = key.split('.');
        let target = settings;
        for (let i = 0; i < parts.length - 1; i++) target = target[parts[i]];
        target[parts[parts.length - 1]] = val;
        saveSettings();
        settingChanged(key);
    }

    function settingChanged(key) {
        applySettings();
        if (key === 'wordKaraoke')
            lyrics.forEach(function (l) {
                delete l._words;
            });
        if (key === 'spectrum' && settings.spectrum) ensureAudioGraph();
        if (key.indexOf('shortcuts.') === 0) {
            renderShortcutList();
            renderShortcutControls();
            return;
        }
        if (RERENDER_KEYS.indexOf(key) !== -1) {
            renderView();
            if (cinemaApi.isOpen()) cinemaApi.renderLyrics();
        }
    }

    function loadSettings() {
        let stored = null;
        try {
            stored = JSON.parse(localStorage.getItem('lyricex-settings') || 'null');
        } catch (_) {
            /* noop */
        }
        settings = L.mergeSettings(stored, L.SETTINGS_DEFAULTS);
        // v1.6.1: lyric font default changed from UI font to a JP-first stack;
        // migrate stored 'default' so the select matches an existing option.
        if (settings.lyricFont === 'default') settings.lyricFont = 'jp';
        // translation font default changed to an SC-first stack; migrate 'default'.
        if (settings.translationFont === 'default') settings.translationFont = 'sc';
        if (!stored) {
            // first run: migrate legacy keys & keep browser-detected locale
            settings.locale = window.__i18n._current;
            try {
                const c = localStorage.getItem('lyricex-color-theme');
                if (c) settings.colorTheme = c;
            } catch (_) {
                /* noop */
            }
        }
        saveSettings();
    }

    function applyFontVar(varName, preset, custom) {
        if (preset === 'default' && !(custom && custom.trim())) {
            app.style.removeProperty(varName);
            return;
        }
        app.style.setProperty(varName, L.fontStack(preset, custom));
    }

    // v1.6.0: custom accent + per-POS colors are applied as inline CSS vars on
    // #app so they layer over (and win over) the stylesheet theme variables.
    function applyCustomAccent() {
        const hex = settings.customAccent || '#8a7a6a';
        if (!L.hexToRgb(hex)) return;
        app.style.setProperty('--accent', hex);
        app.style.setProperty('--accent-hover', L.darken(hex, 0.18));
        app.style.setProperty('--accent-bg', L.hexToRgba(hex, 0.14));
        app.style.setProperty('--progress-fill', hex);
    }

    function clearCustomAccent() {
        ['--accent', '--accent-hover', '--accent-bg', '--progress-fill'].forEach(function (p) {
            app.style.removeProperty(p);
        });
    }

    const POS_COLOR_VARS = {
        romaji: '--pos-romaji',
        hiragana: '--pos-hiragana',
        kanji: '--pos-kanji',
        pos: '--pos-pos',
        meaning: '--pos-meaning'
    };

    function applyPosColors() {
        Object.keys(POS_COLOR_VARS).forEach(function (k) {
            const v = settings.posColors && settings.posColors[k];
            if (v && L.hexToRgb(v)) app.style.setProperty(POS_COLOR_VARS[k], v);
            else app.style.removeProperty(POS_COLOR_VARS[k]);
        });
    }

    function applySettings() {
        currentTheme = settings.theme;
        var resolvedTheme = window.__lyricexUtils.resolveTheme(currentTheme);
        app.setAttribute('data-theme', resolvedTheme);
        if (document.documentElement && document.documentElement.setAttribute) {
            document.documentElement.setAttribute('data-theme', resolvedTheme);
        }
        setThemeIcon(currentTheme);
        updateThemeLabel();
        applyColorTheme();
        applyPosColors();
        applyFontVar('--font', settings.uiFont, settings.uiFontCustom);
        applyFontVar('--font-lyrics', settings.lyricFont, settings.lyricFontCustom);
        applyFontVar('--font-translation', settings.translationFont, settings.translationFontCustom);
        // v1.6.3: motion — scale the shared transition duration by speed and
        // expose an attribute so CSS can freeze everything when animations are off.
        app.setAttribute('data-motion', settings.animations ? 'on' : 'off');
        app.style.setProperty(
            '--transition',
            (settings.animations
                ? { slow: '0.45s', normal: '0.25s', fast: '0.12s' }[settings.animationSpeed] || '0.25s'
                : '0s') + ' ease'
        );
        app.style.setProperty('--lyric-size', settings.lyricSize + 'px');
        app.style.setProperty('--lyric-lh', settings.lyricLineHeight);
        app.style.setProperty('--lyric-weight', settings.lyricWeight === 'bold' ? '700' : '400');
        app.style.setProperty('--translation-size', settings.translationSize + 'px');
        app.style.setProperty('--translation-lh', settings.translationLineHeight);
        // v1.6.0: per-view / per-element font sizes
        app.style.setProperty('--mixed-lyric-size', settings.mixedLyricSize + 'px');
        app.style.setProperty('--cinema-lyric-size', settings.cinemaLyricSize + 'px');
        app.style.setProperty('--study-line-size', settings.studyLineSize + 'px');
        app.style.setProperty('--study-table-size', settings.studyTableSize + 'px');
        app.style.setProperty('--time-tag-size', settings.timeTagSize + 'px');
        app.style.setProperty('--editor-text-size', settings.editorTextSize + 'px');
        app.style.setProperty('--furigana-size', settings.furiganaSize + 'px');
        spectrumRow.classList.toggle('hidden', !settings.spectrum);
        spectrumRow.style.display = settings.spectrum ? 'block' : '';
        volume = settings.volume;
        volumeSlider.value = volume;
        const normSpeed = (function (v) {
            const s = String(v);
            if (s === '1' || s === '1.0') return '1.0';
            if (s === '2' || s === '2.0') return '2.0';
            return ['0.5', '0.75', '1.25', '1.5'].indexOf(s) !== -1 ? s : '1.0';
        })(settings.speed);
        settings.speed = normSpeed;
        speedSelect.value = normSpeed;
        if (audio) {
            audio.volume = isMuted ? 0 : volume / 100;
            audio.playbackRate = parseFloat(speedSelect.value);
        }
        window.__i18n.setDirectionOverride(settings.directionMode || 'auto');
        if (settings.locale !== window.__i18n._current) window.__i18n.setLocale(settings.locale);
        renderShortcutList();
        // NOTE: settings controls are NOT re-rendered here — a re-render would
        // destroy the focused range slider mid-drag. Controls reflect their own
        // changes; re-render happens on open / locale change / reset only.
        // v2.1.1: cinema wallpaper effects + mobile now-playing / nav reflect settings
        applyCinemaEffects();
        updateMobileNow();
        renderBottomNav();
        renderPlayerExt();
        refreshSpectrumColor();
    }

    async function resetSettings() {
        // v2.8.1: native confirm dialog (red OK — destructive action)
        if (!(await window.__lyricexDialog.confirm(t('resetConfirm'), { danger: true }))) return;
        // v2.3.3: interface language and text direction survive a reset — the
        // user picked them on purpose; resetting to zh out of nowhere is worse
        // than keeping a stale value. (lyricex-locale is NOT removed.)
        const keepLocale = settings.locale;
        const keepDirection = settings.directionMode || 'auto';
        try {
            localStorage.removeItem('lyricex-settings');
            localStorage.removeItem('lyricex-color-theme');
        } catch (_) {
            /* noop */
        }
        settings = L.mergeSettings(null, L.SETTINGS_DEFAULTS);
        settings.locale = keepLocale;
        settings.directionMode = keepDirection;
        saveSettings();
        applySettings(); // locale unchanged, other settings re-applied
        lyrics.forEach(function (l) {
            delete l._words;
        });
        settingsApi.renderControls();
        settingsApi.applySidebarVisibility();
        renderShortcutControls();
        renderView();
        if (cinemaApi.isOpen()) cinemaApi.renderLyrics();
    }

    // Help view (v2.9.1): full help-center layout — left chapter nav with
    // scroll auto-highlight, search filter, back-to-top, prev/next pager and
    // up/down keyboard navigation. The help page has its OWN language switch
    // (persisted in 'lyricex-help-locale'); body + chapter titles come from the
    // standalone help-content.js module (add a language there like a locale dict).
    // The UI chrome (search/pager/labels/header) follows the global UI locale.
    let helpObserver = null;
    // v3.2.1: by default the help center follows the global UI language on
    // every open (settings.helpFollowLocale, 设置 → 通用). When the user turns
    // that off (or picks a help language directly, which flips it off), the
    // standalone choice persisted in 'lyricex-help-locale' wins.
    function resolveToHelpLang(loc) {
        const i = window.__i18n;
        const seen = {};
        let cur = loc || (i && i._current) || 'zh';
        for (;;) {
            if (cur === 'zh' || cur === 'ja' || cur === 'en') return cur;
            const next = i && i._resolveFallback ? i._resolveFallback(cur, seen) : null;
            if (!next || next === 'zh') return 'zh';
            cur = next;
        }
    }
    function getHelpLang() {
        if (settings.helpFollowLocale !== false) return resolveToHelpLang();
        const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('lyricex-help-locale')) || '';
        return saved === 'zh' || saved === 'ja' || saved === 'en' ? saved : resolveToHelpLang();
    }
    // body + chapter titles live in help-content.js; fall back to the zh block
    // when a language (or the module itself, e.g. in tests) is missing
    const HELP_BODY = window.__lyricexHelpContent || {};
    function helpBlock(lang) {
        return HELP_BODY[lang] || HELP_BODY.zh || {};
    }
    function renderHelpView() {
        const helpLang = getHelpLang();
        const block = helpBlock(helpLang);
        const titles = block.titles || {};
        const sections = [
            { id: 'help-quick', title: titles.quick || 'Quick start', key: 'quick' },
            { id: 'help-library', title: titles.library || 'Song library', key: 'library' },
            { id: 'help-netease', title: titles.netease || 'NetEase lyrics JSON', key: 'netease' },
            { id: 'help-demo', title: titles.demo || 'Demo', key: 'demo' },
            { id: 'help-faq', title: titles.faq || 'FAQ', key: 'faq' },
            { id: 'help-contribute', title: titles.contribute || 'Contribute', key: 'contribute' },
            { id: 'help-feedback', title: titles.feedback || 'Feedback & Support', key: 'feedback' }
        ];
        const navHtml = sections
            .map(function (sec) {
                return '<li><a href="#' + sec.id + '" data-target="' + sec.id + '">' + sec.title + '</a></li>';
            })
            .join('');
        const langBtns = ['zh', 'ja', 'en']
            .map(function (code) {
                const native = { zh: '简体中文', ja: '日本語', en: 'English' }[code];
                return (
                    '<button type="button" class="help-lang-btn' +
                    (code === helpLang ? ' active' : '') +
                    '" data-help-lang="' +
                    code +
                    '">' +
                    native +
                    '</button>'
                );
            })
            .join('');
        const html =
            '<div class="view-help">' +
            '<aside class="help-nav">' +
            '<div class="help-lang" role="group" aria-label="' +
            t('helpLangLabel') +
            '">' +
            langBtns +
            '</div>' +
            '<div class="help-search">' +
            '<input id="helpSearchInput" type="search" placeholder="' +
            t('helpSearch') +
            '" aria-label="' +
            t('helpSearch') +
            '">' +
            '<i class="fa fa-search" aria-hidden="true"></i>' +
            '</div>' +
            '<div class="help-nav-title">' +
            t('helpContents') +
            '</div>' +
            '<ul class="help-nav-list" id="helpNavList">' +
            navHtml +
            '</ul>' +
            '</aside>' +
            '<div class="help-content" id="helpContent" tabindex="0">' +
            '<header class="help-head"><h2>' +
            t('help') +
            '</h2></header>' +
            '<section class="help-card" id="help-quick"><h3>' +
            sections[0].title +
            '</h3>' +
            (block.quick || '') +
            '</section>' +
            '<section class="help-card" id="help-library"><h3>' +
            sections[1].title +
            '</h3>' +
            (block.library || '') +
            '</section>' +
            '<section class="help-card" id="help-netease"><h3>' +
            sections[2].title +
            '</h3>' +
            (block.netease || '') +
            '</section>' +
            '<section class="help-card" id="help-demo"><h3>' +
            sections[3].title +
            '</h3>' +
            (block.demo || '<img class="help-demo" src="assets/images/demo.gif" alt="LyricEx demo" loading="lazy">') +
            '</section>' +
            '<section class="help-card" id="help-faq"><h3>' +
            sections[4].title +
            '</h3>' +
            (block.faq || '') +
            '</section>' +
            '<section class="help-card" id="help-contribute"><h3>' +
            sections[5].title +
            '</h3>' +
            (block.contribute || '') +
            '</section>' +
            '<section class="help-card" id="help-feedback"><h3>' +
            sections[6].title +
            '</h3>' +
            (block.feedback || '') +
            '</section>' +
            '<p class="help-no-results" id="helpNoResults" hidden>' +
            t('helpNoResults') +
            '</p>' +
            '<button class="help-top" id="helpTopBtn" hidden>' +
            t('helpBackToTop') +
            '</button>' +
            '<nav class="help-pager">' +
            '<button class="help-pager-btn" id="helpPrevBtn">' +
            t('helpPrev') +
            '</button>' +
            '<span class="help-pager-label" id="helpPagerLabel"></span>' +
            '<button class="help-pager-btn" id="helpNextBtn">' +
            t('helpNext') +
            '</button>' +
            '</nav>' +
            '</div>' +
            '</div>';
        viewContent.innerHTML = html;

        // v3.1.0: demo screenshot carousel (arrow/dot navigation)
        document.querySelectorAll('.help-carousel').forEach(function (car) {
            const slides = car.querySelectorAll('.help-carousel-slide');
            const dotsBox = car.querySelector('.help-carousel-dots');
            const btnPrev = car.querySelector('.help-carousel-btn.prev');
            const btnNext = car.querySelector('.help-carousel-btn.next');
            let carIdx = 0;
            function carShow(i) {
                carIdx = (i + slides.length) % slides.length;
                slides.forEach(function (sl, k) {
                    sl.classList.toggle('active', k === carIdx);
                });
                if (dotsBox)
                    dotsBox.querySelectorAll('button').forEach(function (d, k) {
                        d.classList.toggle('active', k === carIdx);
                    });
            }
            if (dotsBox)
                slides.forEach(function (_sl, k) {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.setAttribute('aria-label', String(k + 1));
                    dot.addEventListener('click', function () {
                        carShow(k);
                    });
                    dotsBox.appendChild(dot);
                });
            if (btnPrev)
                btnPrev.addEventListener('click', function () {
                    carShow(carIdx - 1);
                });
            if (btnNext)
                btnNext.addEventListener('click', function () {
                    carShow(carIdx + 1);
                });
            carShow(0);
        });

        // help-page language switch: persist the choice and re-render in place
        document.querySelectorAll('.help-lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                try {
                    localStorage.setItem('lyricex-help-locale', btn.getAttribute('data-help-lang'));
                } catch (_) {
                    /* noop */
                }
                // v3.2.1: picking a help language means "stop following the
                // global locale" — persist that so the choice sticks
                if (settings.helpFollowLocale !== false) {
                    settings.helpFollowLocale = false;
                    saveSettings();
                }
                renderHelpView();
            });
        });

        const content = document.getElementById('helpContent');
        const cards = sections.map(function (sec) {
            return document.getElementById(sec.id);
        });
        const navLinks = sections.map(function (sec) {
            return document.querySelector('.help-nav-list a[data-target="' + sec.id + '"]');
        });
        const search = document.getElementById('helpSearchInput');
        const noRes = document.getElementById('helpNoResults');
        const topBtn = document.getElementById('helpTopBtn');
        const prevBtn = document.getElementById('helpPrevBtn');
        const nextBtn = document.getElementById('helpNextBtn');
        const pagerLabel = document.getElementById('helpPagerLabel');
        // guard: DOM shims (boot-smoke) cannot resolve querySelector — render
        // nothing rather than crash the boot path; real browsers always pass
        if (!content || !search || !navLinks[0] || !pagerLabel) return;
        let visible = sections.map(function (_s, i) {
            return i;
        });

        function setActive(idx) {
            navLinks.forEach(function (a, i) {
                a.classList.toggle('active', i === idx);
            });
            const pos = visible.indexOf(idx);
            pagerLabel.textContent = (pos < 0 ? visible.length : pos + 1) + ' / ' + visible.length;
        }
        function goTo(idx, smooth) {
            if (!cards[idx] || cards[idx].hidden) return;
            setActive(idx);
            if (smooth) content.scrollTo({ top: cards[idx].offsetTop - 14, behavior: 'smooth' });
            else content.scrollTop = cards[idx].offsetTop - 14;
        }
        navLinks.forEach(function (a, i) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                goTo(i, true);
            });
        });
        if (helpObserver) helpObserver.disconnect();
        helpObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        const idx = sections.findIndex(function (sec) {
                            return sec.id === en.target.id;
                        });
                        if (idx >= 0) setActive(idx);
                    }
                });
            },
            { root: content, rootMargin: '-10% 0px -55% 0px' }
        );
        cards.forEach(function (c) {
            helpObserver.observe(c);
        });

        function currentIdx() {
            return sections.findIndex(function (_sec, i) {
                return navLinks[i].classList.contains('active');
            });
        }
        function applyFilter() {
            const q = search.value.trim().toLowerCase();
            visible = [];
            cards.forEach(function (c, i) {
                const hit = !q || c.textContent.toLowerCase().indexOf(q) >= 0;
                c.hidden = !hit;
                navLinks[i].hidden = !hit;
                if (hit) visible.push(i);
            });
            noRes.hidden = visible.length !== 0;
            if (visible.length) setActive(visible.indexOf(currentIdx()) >= 0 ? currentIdx() : visible[0]);
        }
        function step(dir) {
            if (!visible.length) return;
            const cur = visible.indexOf(currentIdx());
            const next = cur < 0 ? 0 : Math.min(visible.length - 1, Math.max(0, cur + dir));
            goTo(visible[next], true);
        }
        search.addEventListener('input', applyFilter);
        search.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                search.value = '';
                applyFilter();
                search.blur();
            }
        });
        content.addEventListener('scroll', function () {
            topBtn.hidden = content.scrollTop < 300;
        });
        topBtn.addEventListener('click', function () {
            content.scrollTo({ top: 0, behavior: 'smooth' });
        });
        prevBtn.addEventListener('click', function () {
            step(-1);
        });
        nextBtn.addEventListener('click', function () {
            step(1);
        });
        content.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                step(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                step(-1);
            }
        });
        setActive(0);
    }

    // =========================== SETTINGS EXPORT / IMPORT (v2.8.0) ===========================
    // Export: download the whole settings object as JSON for backup or moving
    // between browsers. Import: parse → sanitize (whitelist keys + revert wrong
    // value types) → keep the current locale/direction (user picked them on
    // purpose; importing a zh snapshot must not yank an ar user back) → apply.
    function exportSettings() {
        try {
            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            downloadBlob(blob, 'lyricex-settings-' + stamp + '.json');
            return true;
        } catch (_) {
            /* noop */
        }
        return false;
    }

    function importSettingsFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onerror = function () {
            window.__lyricexDialog.alert(t('settingsImportFail'));
        };
        reader.onload = function () {
            let parsed = null;
            try {
                parsed = JSON.parse(String(reader.result));
            } catch (_) {
                /* noop */
            }
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                window.__lyricexDialog.alert(t('settingsImportBad'));
                return;
            }
            const keepLocale = settings.locale;
            const keepDirection = settings.directionMode || 'auto';
            settings = L.sanitizeSettings(parsed, L.SETTINGS_DEFAULTS);
            settings.locale = keepLocale;
            settings.directionMode = keepDirection;
            saveSettings();
            applySettings();
            lyrics.forEach(function (l) {
                delete l._words;
            });
            settingsApi.renderControls();
            settingsApi.applySidebarVisibility();
            renderShortcutControls();
            renderView();
            if (cinemaApi.isOpen()) cinemaApi.renderLyrics();
            window.__lyricexDialog.alert(t('settingsImportOk'));
        };
        reader.readAsText(file);
    }

    // =========================== I18N ===========================
    const t = function (key) {
        return window.__i18n.t(key);
    };

    // Language buttons are generated from the __lyricexLanguages registry
    // (assets/locales/languages.js) so user-maintained languages appear without
    // touching index.html. Click binding lives here, not in settings.js.
    // v2.3.1: language options live in a compact second-level drawer opened
    // from the settings row (currentLangLabel + 更改), so a growing language
    // list no longer occupies the general panel. Rendered from the registry.
    // v2.3.2: every registry language is shown; unloaded ones (not fetched at
    // boot — see the lazy loader) load their fallback chain on demand first.
    function loadLocale(code, done) {
        if (window.__i18n._dicts[code]) {
            if (done) done();
            return;
        }
        const byCode = {};
        (window.__lyricexLanguages || []).forEach(function (l) {
            byCode[l.code] = l;
        });
        const wanted = [];
        const seen = {};
        let node = byCode[code];
        while (node && !seen[node.code]) {
            if (!window.__i18n._dicts[node.code]) wanted.push(node.code);
            seen[node.code] = true;
            node = node.fallback ? byCode[node.fallback] : null;
        }
        if (!window.__i18n._dicts['zh']) wanted.push('zh');
        let idx = 0;
        (function next() {
            if (idx >= wanted.length) {
                if (done) done();
                return;
            }
            const c = wanted[idx++];
            const s = document.createElement('script');
            s.async = false;
            s.src = 'assets/locales/' + c + '.js';
            s.onload = next;
            s.onerror = next; // missing dict file: skip, fallback chain still resolves
            document.head.appendChild(s);
        })();
    }

    function renderLangOptions() {
        if (!langList) return;
        const langs = window.__lyricexLanguages || [];
        langList.innerHTML = '';
        langs.forEach(function (l) {
            const btn = document.createElement('button');
            btn.className = 'lang-option' + (window.__i18n._dicts[l.code] ? '' : ' lang-pending');
            btn.dataset.lang = l.code;
            btn.innerHTML =
                '<span class="lang-native">' +
                (l.native || l.code) +
                '</span><span class="lang-check"><i class="fas fa-check"></i></span>';
            btn.addEventListener('click', function () {
                const code = btn.dataset.lang;
                loadLocale(code, function () {
                    window.__i18n.setLocale(code);
                    closeLangDrawer();
                });
            });
            langList.appendChild(btn);
        });
        updateLangOptions();
    }

    // Highlight the active language option + reflect it in the settings row.
    function updateLangOptions() {
        const cur = window.__i18n._current;
        (langList ? langList.querySelectorAll('.lang-option') : []).forEach(function (opt) {
            opt.classList.toggle('active', opt.dataset.lang === cur);
        });
        if (!currentLangLabel) return;
        const cfg = (window.__lyricexLanguages || []).filter(function (l) {
            return l.code === cur;
        })[0];
        // innerHTML (not textContent) so the globe icon added in v2.4.1 survives
        currentLangLabel.innerHTML = '<i class="fas fa-globe"></i>' + esc(cfg ? cfg.native || cfg.code : cur);
    }

    function openLangDrawer() {
        if (langDrawer) {
            langDrawer.classList.remove('hidden');
            langDrawer.style.display = 'flex';
        }
    }
    function closeLangDrawer() {
        if (langDrawer) langDrawer.classList.add('hidden');
    }

    window.__onLocaleChange = function (locale) {
        if (settings.locale !== locale) {
            settings.locale = locale;
            saveSettings();
        }
        updateLangOptions();
        updateThemeLabel();
        updateTrackToggle(); // v2.0.4: re-localize the track label
        updateSidebarStatus();
        miniApi.updateBar();
        renderShortcutList();
        // v1.6.3: re-render the settings/shortcut controls unconditionally.
        // They carry no data-i18n attributes, so _apply() can't translate them;
        // guarding on the overlay being open left them stale whenever the locale
        // changed while the modal was closed (reset / migration / applySettings).
        settingsApi.renderControls();
        renderShortcutControls();
        renderView();
        if (cinemaApi.isOpen()) cinemaApi.renderLyrics();
        // guide / changelog bodies are rendered imperatively (no data-i18n),
        // so re-localize them here when their overlay happens to be open.
        aboutApi.renderGuideIfOpen();
        aboutApi.renderChangelogIfOpen();
    };

    // =========================== HELPERS ===========================
    function getCurrentTime() {
        return audio ? Math.max(0, audio.currentTime + offset) : 0;
    }

    function setPlayIcon(playing) {
        playIconWrap.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    function setThemeIcon(theme) {
        // v3.2.1: icon mirrors the CURRENT theme (dark → moon, light → sun),
        // matching themeLabel — the old mapping was inverted (dark showed sun)
        const icon = theme === 'dark' ? 'fa-moon' : theme === 'system' ? 'fa-adjust' : 'fa-sun';
        themeIconWrap.innerHTML = '<i class="fas ' + icon + '"></i>';
    }

    function setMuteIcon(muted) {
        muteIconWrap.innerHTML = muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    }

    function updateThemeLabel() {
        themeLabel.textContent = t(
            currentTheme === 'dark' ? 'darkMode' : currentTheme === 'system' ? 'systemTheme' : 'lightMode'
        );
    }

    function updateSidebarStatus() {
        uploadArea.classList.toggle('has-file', !!(songData && lyrics.length));
        if (!songData || !lyrics.length) {
            sidebarStatus.innerHTML = '<span>' + t('waitingUpload') + '</span>';
            return;
        }
        const title = esc(songData.title || t('unknownSong'));
        const artist = esc(songData.artist || '');
        const idx = activeLineIndex >= 0 && activeLineIndex < lyrics.length ? activeLineIndex + 1 : 0;
        let html = '<span class="song-title">' + title + '</span>';
        if (artist) html += '<span class="song-artist">' + artist + '</span>';
        html +=
            '<span style="font-size:11px;color:var(--text-muted);">' +
            (idx ? t('line') + ' ' + idx + '/' + lyrics.length + ' ' + t('row') : lyrics.length + ' ' + t('row')) +
            '</span>';
        if (!audio && !audioUrl) {
            html +=
                '<span class="no-audio-tag"><i class="fas fa-volume-off" style="margin-right:4px;"></i>' +
                t('noAudio') +
                '</span>';
        }
        sidebarStatus.innerHTML = html;
        updateMobileNow();
    }

    // =========================== COLOR THEME ===========================
    function applyColorTheme() {
        currentColorTheme = settings.colorTheme;
        clearCustomAccent();
        if (currentColorTheme === 'custom') applyCustomAccent();
        if (currentColorTheme === 'default' || currentColorTheme === 'custom') {
            app.removeAttribute('data-color-theme');
            if (document.documentElement && document.documentElement.removeAttribute)
                document.documentElement.removeAttribute('data-color-theme');
        } else {
            app.setAttribute('data-color-theme', currentColorTheme);
            if (document.documentElement && document.documentElement.setAttribute) {
                document.documentElement.setAttribute('data-color-theme', currentColorTheme);
            }
        }
        colorOptions.forEach(function (opt) {
            opt.classList.toggle('active', opt.dataset.color === currentColorTheme);
        });
        refreshSpectrumColor();
    }

    // =========================== SHORTCUTS ===========================
    const SHORTCUT_DEFS = [
        ['playPause', 'shortcutPlayPause'],
        ['seekBack', 'shortcutSeekBack'],
        ['seekForward', 'shortcutSeekForward'],
        ['volumeUp', 'shortcutVolumeUp'],
        ['volumeDown', 'shortcutVolumeDown'],
        ['mute', 'shortcutMute'],
        ['cinema', 'shortcutCinema'],
        ['follow', 'shortcutFollow'],
        ['loop', 'shortcutLoop'],
        ['prevLine', 'shortcutPrevLine'],
        ['nextLine', 'shortcutNextLine'],
        ['reset', 'shortcutReset'],
        ['mini', 'shortcutMini']
    ];
    const KEY_LABELS = {
        ' ': 'Space',
        ArrowLeft: '\u2190',
        ArrowRight: '\u2192',
        ArrowUp: '\u2191',
        ArrowDown: '\u2193',
        Escape: 'Esc'
    };

    function keyLabel(key) {
        if (KEY_LABELS[key]) return KEY_LABELS[key];
        if (key && key.length === 1) return key.toUpperCase();
        return key;
    }

    function keyToAction(key) {
        const s = settings.shortcuts;
        for (const id in s) {
            if (L.normalizeKey(s[id]) === key) return id;
        }
        return null;
    }

    function runAction(action) {
        switch (action) {
            case 'playPause':
                togglePlay();
                break;
            case 'seekBack':
                if (audio) audio.currentTime = Math.max(0, audio.currentTime - 5);
                break;
            case 'seekForward':
                if (audio) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
                break;
            case 'volumeUp':
                setVolume(volume + 5);
                break;
            case 'volumeDown':
                setVolume(volume - 5);
                break;
            case 'mute':
                toggleMute();
                break;
            case 'cinema':
                if (cinemaApi.isOpen()) cinemaApi.close();
                else cinemaApi.open();
                break;
            case 'follow':
                enableFollow();
                scrollLyricToActive('instant');
                break;
            case 'loop':
                toggleLoop();
                break;
            case 'prevLine':
                prevLyric();
                break;
            case 'nextLine':
                nextLyric();
                break;
            case 'reset':
                resetPlayback();
                break;
            case 'mini':
                miniApi.toggle();
                break;
        }
    }

    function seekPercent(frac) {
        if (!audio || !audio.duration) return;
        audio.currentTime = audio.duration * frac;
        // v1.6.1: keyboard seek is explicit navigation — resume follow and
        // land the view, same contract as the progress-bar drag release.
        enableFollow();
        setActiveLine(findLyricIndex(getCurrentTime()), 'instant');
        updatePlayState();
    }

    function overlayOpen() {
        return (
            aboutOverlay.classList.contains('open') ||
            settingsOverlay.classList.contains('open') ||
            guideOverlay.classList.contains('open') ||
            shareOverlay.classList.contains('open') ||
            videoOverlay.classList.contains('open') ||
            changelogOverlay.classList.contains('open')
        );
    }

    let shortcutCapture = null;

    function renderShortcutList() {
        let html = '';
        SHORTCUT_DEFS.forEach(function (def) {
            html +=
                '<li><span>' +
                t(def[1]) +
                '</span><span class="key">' +
                keyLabel(getSetting('shortcuts.' + def[0])) +
                '</span></li>';
        });
        html += '<li><span>' + t('shortcutDigits') + '</span><span class="key">0 \u2013 9</span></li>';
        shortcutList.innerHTML = html;
    }

    function renderShortcutControls() {
        shortcutControls.innerHTML = '';
        SHORTCUT_DEFS.forEach(function (def) {
            const row = document.createElement('div');
            row.className = 'setting-row shortcut-row';
            const label = document.createElement('label');
            label.className = 'setting-label';
            label.textContent = t(def[1]);
            const btn = document.createElement('button');
            btn.className = 'keycap';
            btn.dataset.action = def[0];
            btn.textContent = keyLabel(getSetting('shortcuts.' + def[0]));
            btn.addEventListener('click', function () {
                startShortcutCapture(btn);
            });
            row.appendChild(label);
            row.appendChild(btn);
            shortcutControls.appendChild(row);
        });
    }

    function startShortcutCapture(btn) {
        if (shortcutCapture) shortcutCapture.button.classList.remove('capturing');
        shortcutCapture = { action: btn.dataset.action, button: btn };
        btn.classList.add('capturing');
        btn.textContent = t('pressKey');
    }

    function cancelShortcutCapture() {
        if (shortcutCapture) shortcutCapture.button.classList.remove('capturing');
        shortcutCapture = null;
        renderShortcutControls();
    }

    function handleShortcutCapture(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape') {
            cancelShortcutCapture();
            return;
        }
        if (['Shift', 'Control', 'Alt', 'Meta'].indexOf(e.key) !== -1) return; // need a real key
        const key = L.normalizeKey(e.key);
        if (!key) return;
        if (/^[0-9]$/.test(key)) {
            window.__lyricexDialog.alert(t('shortcutDigitsReserved'));
            cancelShortcutCapture();
            return;
        }
        for (let i = 0; i < SHORTCUT_DEFS.length; i++) {
            const id = SHORTCUT_DEFS[i][0];
            if (id !== shortcutCapture.action && L.normalizeKey(getSetting('shortcuts.' + id)) === key) {
                window.__lyricexDialog.alert(t('shortcutConflict'));
                cancelShortcutCapture();
                return;
            }
        }
        setSetting('shortcuts.' + shortcutCapture.action, key);
        cancelShortcutCapture();
    }

    // per-line font discriminator: Chinese lines get data-lang="zh" so CSS can
    // swap the JP-first lyric font for the SC stack (see assets/styles/views.css).
    // v2.0.0: an explicit per-line `lang` (manifest v2) wins over the heuristic.
    function langAttr(line) {
        const lang = line && line.lang;
        if (lang === 'zh' || lang === 'ja' || lang === 'en') return ' data-lang="' + lang + '"';
        return L.isChinese(line && line.text) ? ' data-lang="zh"' : '';
    }

    // =========================== WORD-BY-WORD KARAOKE ===========================
    // v1.6.0: karaoke word spans render ONLY from real per-word timing carried
    // in the package (line.words). Packages without it auto-disable: no more
    // length-weighted hard splits that drift from the vocal.
    function lineWordSpans(line) {
        if (!settings.wordKaraoke || !line || !line.text) return null;
        if (!line._words) line._words = L.wordSpans(line);
        return line._words;
    }

    // ruby segments take precedence over word spans: a line that has both
    // analysis (ruby) and word timing shows ruby; word spans need analysis-free
    // lines (ponytail: combining per-word timing with morpheme-level ruby would
    // need the package to carry the token→morpheme alignment — format v2).
    function rubySegmentsHTML(line) {
        if (!settings.showRuby) return null;
        const segs = L.annotateRuby(line.text, line.analysis);
        if (!segs) return null;
        return segs
            .map(function (s) {
                if (s.type === 'text') return esc(s.text);
                if (s.type === 'furigana')
                    return s.segs
                        .map(function (g) {
                            return g.r ? '<ruby>' + esc(g.t) + '<rt>' + esc(g.r) + '</rt></ruby>' : esc(g.t);
                        })
                        .join('');
                return '<ruby>' + esc(s.text) + '<rt>' + esc(s.reading) + '</rt></ruby>';
            })
            .join('');
    }

    function lineTextHTML(line, _idx) {
        const ruby = rubySegmentsHTML(line);
        if (ruby !== null) return ruby;
        const words = lineWordSpans(line);
        if (!words) return esc(line.text);
        return words
            .map(function (w, i) {
                return '<span class="w" data-w="' + i + '">' + esc(w.text) + '</span>';
            })
            .join(' ');
    }

    // study view header: ruby if available, else plain escaped text
    function lineRubyHTML(line) {
        const ruby = rubySegmentsHTML(line);
        return ruby !== null ? ruby : esc(line.text);
    }

    function romajiFromLine(line) {
        if (line.analysis && line.analysis.length) {
            const r = line.analysis
                .map(function (a) {
                    return a.romaji;
                })
                .filter(Boolean)
                .join(' ');
            if (r) return r;
        }
        // v2.8.3: full-line romaji attached by splitMixedLrc for three-line sheets
        if (line.romaji && typeof line.romaji === 'string') return line.romaji;
        return line.note && typeof line.note === 'string' ? line.note : '';
    }

    function subLineHTML(line) {
        if (settings.subLine === 'off') return '';
        let s;
        if (settings.subLine === 'translation') s = line.translation || '';
        else if (settings.subLine === 'romaji') s = romajiFromLine(line);
        else s = line.translation || romajiFromLine(line); // auto
        if (!s) return '';
        return '<span class="sub-line">' + esc(s) + '</span>';
    }

    function wordIndexAt(line, time) {
        if (!line || !line._words) return -1;
        let idx = -1;
        for (let i = 0; i < line._words.length; i++) {
            if (line._words[i].start <= time) idx = i;
        }
        return idx;
    }

    function updateWordSpans(el, wIdx) {
        if (!el) return;
        el.querySelectorAll('.w').forEach(function (sp, i) {
            sp.classList.toggle('past', i < wIdx);
            sp.classList.toggle('on', i === wIdx);
        });
    }

    function updateTableCells(table, wIdx) {
        if (!table) return;
        table.querySelectorAll('.word-cell').forEach(function (cell) {
            cell.classList.toggle('active', parseInt(cell.dataset.w, 10) === wIdx);
        });
    }

    function updateWordHighlight() {
        if (!settings.wordKaraoke) return;
        const idx = activeLineIndex;
        if (idx < 0 || idx >= lyrics.length) {
            viewContent.querySelectorAll('.w').forEach(function (sp) {
                sp.classList.remove('past', 'on');
            });
            if (cinemaApi.isOpen())
                cinemaApi
                    .container()
                    .querySelectorAll('.w')
                    .forEach(function (sp) {
                        sp.classList.remove('past', 'on');
                    });
            return;
        }
        const wIdx = wordIndexAt(lyrics[idx], getCurrentTime());
        if (currentView === 'mixed') {
            const item = viewContent.querySelector('.lyric-line.active');
            if (item) {
                updateWordSpans(item, wIdx);
                updateTableCells(
                    item.closest('.lyric-item') ? item.closest('.lyric-item').querySelector('.study-table') : null,
                    wIdx
                );
            }
        } else if (currentView === 'study') {
            updateTableCells(viewContent.querySelector('.study-table'), wIdx);
        } else if (currentView === 'editor') {
            updateWordSpans(viewContent.querySelector('.editor-row.active'), wIdx);
        } else {
            updateWordSpans(viewContent.querySelector('.lyric-line.active'), wIdx);
        }
        if (cinemaApi.isOpen()) updateWordSpans(cinemaApi.container().querySelector('.cinema-line.active'), wIdx);
    }

    // =========================== STUDY TABLE ===========================
    function buildStudyTable(line, wIdx) {
        if (!line) return '<div class="no-analysis">' + t('noAnalysisInvalid') + '</div>';
        if (!line.analysis || line.analysis.length === 0)
            return '<div class="no-analysis">' + t('noAnalysisMeta') + '</div>';
        const analysis = line.analysis;
        const labels = [
            { key: 'romaji', label: t('romaji'), cls: 'romaji' },
            { key: 'hiragana', label: t('hiragana'), cls: 'hiragana' },
            { key: 'kanji', label: t('kanji'), cls: 'kanji' },
            { key: 'partOfSpeech', label: t('pos'), cls: 'pos' },
            { key: 'meaning', label: t('meaning'), cls: 'meaning' }
        ];
        let html = '<div class="study-table-wrap"><table class="study-table"><tbody>';
        labels.forEach(function (label) {
            html += '<tr><td class="row-label">' + label.label + '</td>';
            analysis.forEach(function (item, wi) {
                const val = esc(item[label.key] || '\u2014');
                let extra = '';
                if (label.key === 'romaji' && item.note) {
                    extra = '<span class="sub-note">' + esc(item.note) + '</span>';
                }
                html +=
                    '<td class="word-cell ' +
                    label.cls +
                    (wi === wIdx ? ' active' : '') +
                    '" data-w="' +
                    wi +
                    '">' +
                    val +
                    extra +
                    '</td>';
            });
            html += '</tr>';
        });
        const translation = esc(line.translation || '(' + t('noTranslation') + ')');
        html +=
            '<tr class="translation-row"><td class="label">' +
            t('translation') +
            '</td><td colspan="' +
            analysis.length +
            '">' +
            translation;
        if (line.note) {
            html +=
                '<span class="note-text"><i class="fas fa-comment" style="margin-right:4px;"></i>' +
                esc(line.note) +
                '</span>';
        }
        html += '</td></tr></tbody></table></div>';
        return html;
    }

    // =========================== RENDER: EMPTY ===========================
    function renderEmpty() {
        viewContent.innerHTML =
            '<div class="view-empty">' +
            '<span class="icon-big"><i class="fas fa-music"></i></span>' +
            '<div class="title">' +
            t('emptyTitle') +
            '</div>' +
            '<div class="desc">' +
            t('emptyDesc') +
            '<br>' +
            '<span style="font-size:12px;color:var(--text-muted);">' +
            t('emptyHint') +
            '</span></div>' +
            '</div>';
    }

    // =========================== RENDER VIEWS ===========================
    function renderLyricsView() {
        if (!lyrics.length) {
            renderEmpty();
            return;
        }
        let html = '<div class="view-lyrics">';
        lyrics.forEach(function (line, idx) {
            const isActive = idx === activeLineIndex;
            const timeStr = formatTime(line.time);
            const hasAnalysis = line.analysis && line.analysis.length > 0;
            const timeAttr = Number(line.time) || 0; // numeric: package JSON is untrusted
            html +=
                '<div class="lyric-line ' +
                (isActive ? 'active' : '') +
                '" data-index="' +
                idx +
                '" data-time="' +
                timeAttr +
                '"' +
                langAttr(line) +
                '>' +
                '<span class="time-tag">' +
                timeStr +
                '</span>' +
                '<span class="line-body">' +
                '<span class="line-text">' +
                lineTextHTML(line, idx) +
                '</span>' +
                subLineHTML(line) +
                '</span>' +
                (instrumentalUrl
                    ? '<button class="line-inst" data-inst="' +
                      idx +
                      '" title="' +
                      auditionLineTitle() +
                      '"><i class="fas fa-music"></i></button>'
                    : '') +
                (!hasAnalysis ? '<span class="no-analysis-badge"><i class="fas fa-file-alt"></i></span>' : '') +
                '</div>';
        });
        html += '</div>';
        viewContent.innerHTML = html;
        bindScrollInteractions(viewContent.querySelector('.view-lyrics'));
        bindAuditionButtons();
        if (activeLineIndex >= 0) scrollLyricToActive('instant');
    }

    function renderStudyView() {
        if (!lyrics.length) {
            renderEmpty();
            return;
        }
        const prev = viewContent.querySelector('.view-study');
        const top = prev ? prev.scrollTop : 0;
        const idx = activeLineIndex >= 0 && activeLineIndex < lyrics.length ? activeLineIndex : 0;
        const line = lyrics[idx];
        const timeStr = formatTime(line.time);
        lineWordSpans(line); // ensure per-word timings exist for column highlight
        const wIdx = wordIndexAt(line, getCurrentTime());
        let furi = '';
        if (settings.showFurigana && line.analysis && line.analysis.length) {
            const h = line.analysis
                .map(function (a) {
                    return a.hiragana;
                })
                .filter(Boolean)
                .join(' ');
            if (h) furi = '<div class="furigana">' + esc(h) + '</div>';
        }
        let html = '<div class="view-study">';
        html += '<div class="study-header">';
        html +=
            '<div class="line-ref study-line-ref" data-index="' +
            idx +
            '" data-time="' +
            (Number(line.time) || 0) +
            '"' +
            langAttr(line) +
            '>' +
            lineRubyHTML(line) +
            ' <span class="time">\u2014 ' +
            timeStr +
            '</span></div>';
        if (instrumentalUrl)
            html +=
                '<button class="study-inst" data-inst="' +
                idx +
                '" title="' +
                auditionLineTitle() +
                '"><i class="fas fa-music"></i></button>';
        html += furi;
        html += '</div>';
        html += buildStudyTable(line, wIdx);
        html += '</div>';
        viewContent.innerHTML = html;
        bindAuditionButtons();
        const cur = viewContent.querySelector('.view-study');
        if (cur && top > 0) cur.scrollTop = top;
    }

    function renderMixedView() {
        if (!lyrics.length) {
            renderEmpty();
            return;
        }
        let html = '<div class="view-mixed">';
        lyrics.forEach(function (line, idx) {
            const isActive = idx === activeLineIndex;
            const timeStr = formatTime(line.time);
            const wIdx = wordIndexAt(line, getCurrentTime());
            const timeAttr = Number(line.time) || 0; // numeric: package JSON is untrusted
            html += '<div class="lyric-item">';
            html +=
                '<div class="lyric-line ' +
                (isActive ? 'active' : '') +
                '" data-index="' +
                idx +
                '" data-time="' +
                timeAttr +
                '"' +
                langAttr(line) +
                '>' +
                '<span class="time-tag">' +
                timeStr +
                '</span>' +
                '<span class="line-body"><span class="line-text">' +
                lineTextHTML(line, idx) +
                '</span></span>' +
                (instrumentalUrl
                    ? '<button class="line-inst" data-inst="' +
                      idx +
                      '" title="' +
                      auditionLineTitle() +
                      '"><i class="fas fa-music"></i></button>'
                    : '') +
                '</div>';
            // v1.5.0: render every study panel and toggle visibility, so the
            // active line's table follows playback without a full re-render
            html +=
                '<div class="mixed-study' + (isActive ? '' : ' hidden') + '">' + buildStudyTable(line, wIdx) + '</div>';
            html += '</div>';
        });
        html += '</div>';
        viewContent.innerHTML = html;
        bindScrollInteractions(viewContent.querySelector('.view-mixed'));
        bindAuditionButtons();
        if (activeLineIndex >= 0) scrollLyricToActive('instant');
    }

    function renderView() {
        switch (currentView) {
            case 'lyrics':
                renderLyricsView();
                break;
            case 'study':
                renderStudyView();
                break;
            case 'mixed':
                renderMixedView();
                break;
            case 'editor':
                editorApi.render();
                break;
            case 'help':
                renderHelpView();
                break;
            case 'library':
                if (window.__lyricexLibraryUI) window.__lyricexLibraryUI.render();
                break;
            default:
                renderLyricsView();
                break;
        }
        if (cinemaApi.isOpen()) cinemaApi.renderLyrics();
    }

    // =========================== ACTIVE LINE ===========================
    function setActiveLine(idx, behavior) {
        if (idx < 0 || idx >= lyrics.length) {
            if (activeLineIndex !== -1) {
                activeLineIndex = -1;
                clearActiveClasses();
                if (currentView === 'study') renderStudyView();
                updateSidebarStatus();
                miniApi.updateBar();
            }
            return;
        }
        activeLineIndex = idx;
        updateSidebarStatus();
        miniApi.updateBar();

        if (currentView === 'study') {
            renderStudyView(); // v1.5.0: study view must follow playback
        } else {
            viewContent.querySelectorAll('.lyric-line').forEach(function (el, i) {
                el.classList.toggle('active', i === idx);
            });
            if (currentView === 'mixed') {
                viewContent.querySelectorAll('.lyric-item').forEach(function (item, i) {
                    const line = item.querySelector('.lyric-line');
                    if (line) line.classList.toggle('active', i === idx);
                    const study = item.querySelector('.mixed-study');
                    if (study) study.classList.toggle('hidden', i !== idx);
                });
            }
            if (currentView === 'editor') {
                viewContent.querySelectorAll('.editor-row').forEach(function (el, i) {
                    el.classList.toggle('active', i === idx);
                });
            }
        }
        if (cinemaApi.isOpen()) cinemaApi.refreshActive(idx);
        updateWordHighlight();
        scrollLyricToActive(behavior);
    }

    function clearActiveClasses() {
        viewContent.querySelectorAll('.lyric-line').forEach(function (el) {
            el.classList.remove('active');
        });
        viewContent.querySelectorAll('.editor-row').forEach(function (el) {
            el.classList.remove('active');
        });
        if (currentView === 'mixed') {
            viewContent.querySelectorAll('.mixed-study').forEach(function (study) {
                study.classList.add('hidden');
            });
        }
        if (cinemaApi.isOpen()) cinemaApi.clearActive();
    }

    // ===================== AUTO-FOLLOW SCROLL (v1.4.4) =====================
    let followEnabled = true;
    let scrollAnimId = null;

    function getLyricsScrollTarget() {
        if (cinemaApi.isOpen()) return { container: cinemaApi.container(), selector: '.cinema-line.active' };
        if (currentView === 'lyrics') {
            return { container: viewContent.querySelector('.view-lyrics'), selector: '.lyric-line.active' };
        }
        if (currentView === 'mixed') {
            return { container: viewContent.querySelector('.view-mixed'), selector: '.lyric-line.active' };
        }
        if (currentView === 'editor') {
            // v2.8.4: the build workspace is not a lyric view — no follow
            // target, so the follow pill never appears on the Build tab.
            if (editorApi.getTab && editorApi.getTab() === 'build') return null;
            return { container: viewContent.querySelector('.view-editor'), selector: '.editor-row.active' };
        }
        return null;
    }

    function prefersReducedMotion() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (_) {
            return false;
        }
    }

    function cancelScrollAnim() {
        if (scrollAnimId) {
            cancelAnimationFrame(scrollAnimId);
            scrollAnimId = null;
        }
    }

    function scrollLyricToActive(behavior) {
        // v1.6.1: honor the follow contract — manual browsing pauses follow,
        // so programmatic scrolls must respect it too (the drag release path
        // calls enableFollow() first, so it still lands immediately).
        if (behavior === 'none' || !followEnabled) return;
        const ctx = getLyricsScrollTarget();
        if (!ctx || !ctx.container) return;
        const el = ctx.container.querySelector(ctx.selector);
        if (!el) return;
        const relTop = el.offsetTop - ctx.container.offsetTop;
        const target = relTop + el.offsetHeight / 2 - ctx.container.clientHeight / 2;
        animateScrollTo(ctx.container, target, behavior === 'instant' ? 'instant' : 'smooth');
    }

    function animateScrollTo(container, targetTop, behavior) {
        cancelScrollAnim();
        const maxScroll = container.scrollHeight - container.clientHeight;
        targetTop = Math.max(0, Math.min(targetTop, maxScroll));
        if (behavior === 'instant' || prefersReducedMotion() || !settings.animations || maxScroll <= 0) {
            container.scrollTop = targetTop;
            return;
        }
        const start = container.scrollTop;
        const delta = targetTop - start;
        if (Math.abs(delta) < 2) {
            container.scrollTop = targetTop;
            return;
        }
        const duration = Math.min(700, Math.max(200, Math.abs(delta) * 0.35));
        const t0 = performance.now();
        function step(now) {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            container.scrollTop = start + delta * eased;
            scrollAnimId = p < 1 ? requestAnimationFrame(step) : null;
        }
        scrollAnimId = requestAnimationFrame(step);
    }

    function enableFollow() {
        followEnabled = true;
        updateFollowPill();
    }

    function updateFollowPill() {
        if (miniApi.isOn()) {
            followPill.classList.add('hidden');
            cinemaFollowPill.classList.add('hidden');
            return;
        }
        const paused = !followEnabled && !!getLyricsScrollTarget();
        followPill.classList.toggle('hidden', !(paused && !cinemaApi.isOpen()));
        followPill.style.display = paused && !cinemaApi.isOpen() ? 'flex' : '';
        cinemaFollowPill.classList.toggle('hidden', !(paused && cinemaApi.isOpen()));
        cinemaFollowPill.style.display = paused && cinemaApi.isOpen() ? 'flex' : '';
    }

    function bindScrollInteractions(container) {
        if (!container || container.__followBound) return;
        container.__followBound = true;

        function userScrollIntent() {
            cancelScrollAnim();
            if (!followEnabled) return;
            // v2.8.4: scrolling the build workspace must not pause refine follow
            if (currentView === 'editor' && editorApi.getTab && editorApi.getTab() === 'build') return;
            if (container.scrollHeight <= container.clientHeight + 1) return;
            followEnabled = false;
            updateFollowPill();
        }
        container.addEventListener('wheel', userScrollIntent, { passive: true });
        container.addEventListener('touchmove', userScrollIntent, { passive: true });

        container.addEventListener(
            'scroll',
            function () {
                if (followEnabled) return;
                const el = container.querySelector('.lyric-line.active, .cinema-line.active, .editor-row.active');
                if (!el) return;
                const relTop = el.offsetTop - container.offsetTop;
                const activeCenter = relTop + el.offsetHeight / 2;
                const viewCenter = container.scrollTop + container.clientHeight / 2;
                if (Math.abs(activeCenter - viewCenter) <= container.clientHeight * 0.2) {
                    followEnabled = true;
                    updateFollowPill();
                }
            },
            { passive: true }
        );
    }

    // =========================== CLICK HANDLERS ===========================
    viewContent.addEventListener('click', function (e) {
        const line = e.target.closest('.lyric-line, .study-line-ref');
        if (!line) return;
        const idx = parseInt(line.dataset.index);
        const time = parseFloat(line.dataset.time);
        if (isNaN(idx) || isNaN(time)) return;
        enableFollow();
        setActiveLine(idx, 'instant');
        if (audio) {
            audio.currentTime = Math.max(0, time - offset);
            if (!isPlaying) audio.play().catch(function () {});
        } else if (audioUrl) {
            loadAudioFromUrl(audioUrl);
            setTimeout(function () {
                if (audio) {
                    audio.currentTime = Math.max(0, time - offset);
                    setActiveLine(idx, 'instant');
                    audio.play().catch(function () {});
                }
            }, 300);
        }
        // lyrics-only mode (no audio): highlight + scroll is enough
    });

    // =========================== FIND LYRIC ===========================
    function findLyricIndex(time) {
        if (!lyrics || lyrics.length === 0) return -1;
        for (let i = lyrics.length - 1; i >= 0; i--) {
            if (lyrics[i].time <= time) return i;
        }
        return -1;
    }

    // =========================== PLAYBACK SYNC ===========================
    function updatePlayState() {
        if (!audio) return;
        const currentTime = getCurrentTime();
        const duration = audio.duration || 0;
        if (duration > 0) {
            const pct = Math.min(100, (currentTime / duration) * 100);
            progressFill.style.width = pct + '%';
            progressThumb.style.left = pct + '%';
        }
        timeDisplay.textContent = formatTime(currentTime) + ' / ' + formatTime(duration);

        if (abEnabled && abPointA !== null && abPointB !== null && audio.currentTime >= abPointB) {
            audio.currentTime = abPointA;
            if (!isPlaying) audio.play().catch(function () {});
        }

        // v2.0.0 #15: multi-bookmark loop — innermost active mark wins on entry
        if (currentLoopMark) {
            if (currentLoopMark.active && audio.currentTime >= currentLoopMark.end) {
                audio.currentTime = currentLoopMark.start;
            } else if (audio.currentTime < currentLoopMark.start) {
                currentLoopMark = null; // seeked back out of the mark
            }
        } else {
            currentLoopMark = window.__lyricexUtils.activeBookmark(loopMarks, audio.currentTime);
        }

        // v1.7.0: sentence loop — replay the active line while it's current
        if (loopMode === 'line' && lyrics.length > 0) {
            const li = findLyricIndex(currentTime);
            if (li >= 0) {
                const b = window.__lyricexUtils.lineLoopBounds(lyrics, offset, li, audio.duration);
                if (b && audio.currentTime >= b.end) audio.currentTime = b.start;
            }
        }

        const idx = findLyricIndex(currentTime);
        if (idx !== activeLineIndex) {
            // v1.6.1: while the progress bar is being dragged, only the
            // highlight moves — scrolling mid-drag fights the pointer (the
            // release handler re-syncs the view with an instant scroll).
            const behavior =
                isDragging || isThumbDragging ? 'none' : Math.abs(idx - activeLineIndex) > 1 ? 'instant' : 'smooth';
            if (idx >= 0) setActiveLine(idx, behavior);
            else setActiveLine(-1);
        }
        updateWordHighlight();
        miniApi.updateBar();
    }

    function startSyncLoop() {
        if (animationId) cancelAnimationFrame(animationId);

        function loop() {
            if (!isPlaying || !audio) {
                animationId = null;
                return;
            }
            updatePlayState();
            if (settings.spectrum && ensureAudioGraph()) drawSpectrum();
            window.__lyricexAudioGraph.tick(); // v2.0.0: drive the pitch shifter
            animationId = requestAnimationFrame(loop);
        }
        loop();
    }

    // =========================== AUDIO CONTROLS ===========================
    function stopAudio() {
        if (audio) {
            audio.pause();
            audio.src = '';
        }
        audio = null;
        isPlaying = false;
        setPlayIcon(false);
        playBtn.classList.remove('playing');
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function togglePlay() {
        if (!audio) {
            if (audioUrl) {
                loadAudioFromUrl(audioUrl);
                setTimeout(function () {
                    togglePlay();
                }, 300);
            } else {
                window.__lyricexDialog.alert(t('pleaseUpload'));
            }
            return;
        }
        if (isPlaying) audio.pause();
        else {
            if (settings.spectrum) ensureAudioGraph();
            audio.play().catch(function () {});
        }
    }

    function resetPlayback() {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            updatePlayState();
        }
        enableFollow();
        if (lyrics.length > 0) setActiveLine(0, 'instant');
    }

    function prevLyric() {
        if (!lyrics.length || activeLineIndex <= 0) return;
        const idx = activeLineIndex - 1;
        enableFollow();
        setActiveLine(idx, 'instant');
        if (audio) {
            audio.currentTime = Math.max(0, lyrics[idx].time - offset);
            if (!isPlaying) audio.play().catch(function () {});
        }
    }

    function nextLyric() {
        if (!lyrics.length || activeLineIndex >= lyrics.length - 1) return;
        const idx = activeLineIndex + 1;
        enableFollow();
        setActiveLine(idx, 'instant');
        if (audio) {
            audio.currentTime = Math.max(0, lyrics[idx].time - offset);
            if (!isPlaying) audio.play().catch(function () {});
        }
    }

    function loadAudioFromUrl(url) {
        if (audio) {
            audio.pause();
            audio.src = '';
        }
        audio = new Audio(url);
        audio.preload = 'metadata';
        audio.volume = isMuted ? 0 : volume / 100;
        audio.playbackRate = parseFloat(speedSelect.value);
        // v2.0.0 #9: changing speed must NOT change pitch
        audio.preservesPitch = true;
        if (audio.mozPreservesPitch !== undefined) audio.mozPreservesPitch = true;
        if (audio.webkitPreservesPitch !== undefined) audio.webkitPreservesPitch = true;
        // v2.0.0 #14: queue advance auto-plays the next package
        audio.autoplay = pendingAutoplay;
        pendingAutoplay = false;

        audio.addEventListener('loadedmetadata', function () {
            updatePlayState();
            if (lyrics.length > 0 && activeLineIndex < 0) setActiveLine(0, 'instant');
            updateMediaSession();
            // v1.5.0: word windows of the last line depend on duration — drop
            // the cache and re-render so the spans are rebuilt with it known
            lyrics.forEach(function (l) {
                delete l._words;
            });
            renderView();
        });
        audio.addEventListener('play', function () {
            isPlaying = true;
            setPlayIcon(true);
            playBtn.classList.add('playing');
            if (settings.spectrum) ensureAudioGraph();
            startSyncLoop();
        });
        audio.addEventListener('pause', function () {
            isPlaying = false;
            setPlayIcon(false);
            playBtn.classList.remove('playing');
            miniApi.updateBar();
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        });
        audio.addEventListener('ended', function () {
            if (loopMode === 'single') {
                audio.currentTime = 0;
                audio.play().catch(function () {});
                return;
            }
            // v1.7.0: loop the last line when in sentence-loop mode
            if (loopMode === 'line' && lyrics.length > 0) {
                audio.currentTime = Math.max(0, lyrics[lyrics.length - 1].time - offset);
                audio.play().catch(function () {});
                return;
            }
            // v2.0.0 #14: advance to the next queued package
            if (queue.length) {
                advanceQueue();
                return;
            }
            isPlaying = false;
            setPlayIcon(false);
            playBtn.classList.remove('playing');
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            audio.currentTime = 0;
            updatePlayState();
            if (lyrics.length > 0) setActiveLine(0, 'instant');
        });
        audio.addEventListener('error', function () {
            sidebarStatus.innerHTML =
                '<span style="color:#c0392b;"><i class="fas fa-times-circle" style="margin-right:4px;"></i>' +
                t('audioError') +
                '</span>';
        });
    }

    // v2.6.0: workspace build-pane "load to app" — adopt the draft (lyrics,
    // title, optional vocal/instrumental files) as the current package without
    // going through the zip loader. Both editor panes then operate on it.
    function loadWorkspaceDraft(draft) {
        if (!draft || !draft.lines) return;
        lyrics = draft.lines.map(function (l) {
            return Object.assign({}, l);
        });
        if (!songData) songData = {};
        songData.title = draft.title || songData.title || '';
        songData.artist = songData.artist || '';
        songData.album = songData.album || '';
        // replace current audio if the draft carries one; keep playing otherwise
        if (draft.audioFile) {
            if (audio) {
                audio.pause();
                audio.src = '';
            }
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            audioUrl = URL.createObjectURL(draft.audioFile);
            loadAudioFromUrl(audioUrl);
        }
        // optional accompaniment mirrors the editor's instrumental workflow
        if (draft.instrumentalFile) {
            stopInstrumental();
            if (instrumentalUrl) URL.revokeObjectURL(instrumentalUrl);
            instrumentalUrl = URL.createObjectURL(draft.instrumentalFile);
            updateTrackToggle();
        } else if (!draft.instrumentalFile && instrumentalUrl) {
            stopInstrumental();
        }
        mainTrackMode = 'original';
        activeLineIndex = -1;
        editorApi.setDirty(true);
        renderView();
        updateSidebarStatus();
        ctx.updateMiniBar();
    }

    function setVolume(val) {
        volume = Math.max(0, Math.min(100, val));
        volumeSlider.value = volume;
        if (audio && !isMuted) audio.volume = volume / 100;
        if (instAudio) instAudio.volume = isMuted ? 0 : volume / 100; // v2.0.3: audition follows volume
        if (settings.volume !== volume) {
            settings.volume = volume;
            saveSettings();
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        setMuteIcon(isMuted);
        if (audio) audio.volume = isMuted ? 0 : volume / 100;
        if (instAudio) instAudio.volume = isMuted ? 0 : volume / 100; // v2.0.3: audition follows mute
    }

    function setSpeed(val) {
        if (audio) audio.playbackRate = parseFloat(val);
    }

    // v2.0.0 #10: transpose in semitones (-12..+12). Session-only (resets on
    // reload, like A/B points); 0 = bypass.
    function setTranspose(val) {
        transpose = Math.max(-12, Math.min(12, Math.round(Number(val)) || 0));
        transposeVal.textContent = (transpose > 0 ? '+' : '') + transpose;
        const g = window.__lyricexAudioGraph;
        g.setTranspose(transpose);
        // Build the graph (and shifter) if a non-zero transpose is requested,
        // even when the spectrum is off — otherwise the element plays natively
        // and the shift has nothing to route through.
        if (transpose !== 0 && audio) g.ensure(audio);
    }

    // v2.0.0 #13 + v2.0.4: main/sub track switching. instrumentalUrl is owned
    // by the package loader and revoked on reload; instAudio is a transient
    // second element used to audition one line's segment. v2.0.4 promotes the
    // player-bar toggle to the MAIN playback track: the whole song plays 原声
    // or 伴奏, and the per-line ♪ auditions the OTHER track of the sentence.
    function retuneMainAudio(src, resumeAt, wasPlaying) {
        // swap the main <audio> element to another track, keeping position,
        // speed, volume and playing state; seek once the new metadata loads
        audio.pause();
        audio.src = src;
        audio.playbackRate = parseFloat(speedSelect.value);
        audio.volume = isMuted ? 0 : volume / 100;
        const onReady = function () {
            audio.removeEventListener('loadedmetadata', onReady);
            audio.currentTime = resumeAt;
            if (wasPlaying) audio.play().catch(function () {});
        };
        audio.addEventListener('loadedmetadata', onReady);
    }

    function stopInstrumental() {
        if (instAudio) {
            instAudio.pause();
            instAudio = null;
        }
        // if the main player sits on the track being removed (editor remove /
        // change), fall back to the original BEFORE revoking the blob URL
        if (mainTrackMode === 'instrumental' && audioUrl && audio) {
            retuneMainAudio(audioUrl, audio.currentTime, isPlaying);
            mainTrackMode = 'original';
        }
        if (instrumentalUrl) {
            URL.revokeObjectURL(instrumentalUrl);
            instrumentalUrl = null;
        }
        updateTrackToggle();
    }

    // v2.0.4: the per-line ♪ auditions the OTHER track of the current sentence
    // — in 原声 mode the accompaniment (practice), in 伴奏 mode the original
    // (reference), so the button always complements the main playback track.
    function auditionSource() {
        return mainTrackMode === 'original' ? instrumentalUrl : audioUrl;
    }

    function auditionLineTitle() {
        return t(mainTrackMode === 'original' ? 'playInstLine' : 'playOrigLine');
    }

    function toggleLineAudition(idx) {
        const src = auditionSource();
        if (!src || idx < 0 || idx >= lyrics.length) return;
        if (instAudio && instAudio.__lyricexLine === idx) {
            instAudio.pause();
            instAudio = null;
            return;
        }
        if (instAudio) instAudio.pause();
        const b = window.__lyricexUtils.lineLoopBounds(lyrics, offset, idx, audio ? audio.duration : 0);
        if (!b) return;
        // v2.0.5: settings — auto-pause the main playback and snap its
        // progress to the sentence start/end, so resuming continues from
        // the practiced line (pause runs first, then the seek)
        if (audio && settings.auditionAutoPause) audio.pause();
        if (audio && settings.auditionSnap !== 'none')
            audio.currentTime = settings.auditionSnap === 'end' ? b.end : b.start;
        instAudio = new Audio(src);
        instAudio.__lyricexLine = idx;
        instAudio.volume = isMuted ? 0 : volume / 100; // v2.0.3: audition honors volume/mute
        instAudio.currentTime = b.start;
        instAudio.play().catch(function () {});
        (function (el, end) {
            function check() {
                if (el !== instAudio) return;
                if (el.currentTime >= end || el.ended) {
                    el.pause();
                    instAudio = null;
                } else requestAnimationFrame(check);
            }
            requestAnimationFrame(check);
        })(instAudio, b.end);
    }

    // v2.0.4: switch the MAIN playback track between 原声 and 伴奏. Position,
    // speed, volume and the transpose graph ride the same <audio> element, so
    // only the src changes; loops/bookmarks follow since they are time-based.
    function switchMainTrack(mode) {
        if (mode === mainTrackMode) return;
        const src = mode === 'original' ? audioUrl : instrumentalUrl;
        if (!src || !audio) return;
        const wasPlaying = isPlaying;
        const resumeAt = audio.currentTime;
        mainTrackMode = mode;
        if (instAudio) {
            instAudio.pause();
            instAudio = null;
        } // stale-track audition
        retuneMainAudio(src, resumeAt, wasPlaying);
        updateTrackToggle();
        renderView(); // per-line ♪ titles flip to the other track
    }

    function toggleTrackMode() {
        switchMainTrack(mainTrackMode === 'original' ? 'instrumental' : 'original');
    }

    function updateTrackToggle() {
        const has = !!instrumentalUrl;
        auditionToggleBtn.classList.toggle('hidden', !has);
        const orig = mainTrackMode === 'original';
        auditionToggleBtn.classList.toggle('active', !orig); // 伴奏 = engaged special mode
        auditionToggleIcon.className = orig ? 'fas fa-headphones' : 'fas fa-music';
        if (auditionToggleLabel) auditionToggleLabel.textContent = t(orig ? 'trackOriginal' : 'trackInstrumental');
    }

    // v2.0.0 #13: bind per-line audition buttons after a view re-render
    function bindAuditionButtons() {
        viewContent.querySelectorAll('.line-inst, .study-inst').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleLineAudition(parseInt(btn.dataset.inst, 10));
            });
        });
    }

    // v2.0.0 #22: show the package cover as the cinema wallpaper background
    function applyCover() {
        const bg = document.querySelector('.cinema-bg');
        if (!bg) return;
        if (coverUrl) {
            bg.style.backgroundImage = 'url(' + coverUrl + ')';
            bg.style.backgroundSize = 'cover';
            bg.style.backgroundPosition = 'center';
            bg.classList.add('has-cover');
        } else {
            bg.style.backgroundImage = '';
            bg.classList.remove('has-cover');
        }
    }

    // =========================== LOOP & AB ===========================
    function toggleLoop() {
        loopMode = window.__lyricexUtils.nextLoopMode(loopMode);
        loopBtn.classList.toggle('active', loopMode !== 'none');
        loopBadge.classList.toggle('hidden', loopMode === 'none');
        loopBadge.style.display = loopMode === 'none' ? '' : 'block';
        loopBadge.textContent = loopMode === 'single' ? '1' : t('loopLineBadge');
        loopBtn.title = loopMode === 'line' ? t('loopLine') : t('shortcutLoop');
    }

    function toggleAB() {
        abEnabled = !abEnabled;
        abToggleBtn.classList.toggle('active', abEnabled);
        abBadge.classList.toggle('hidden', !abEnabled);
        abBadge.style.display = abEnabled ? 'block' : '';
        if (!abEnabled) {
            abPointA = null;
            abPointB = null;
            updateABDisplay();
        }
    }

    function setABPoint(point) {
        if (!audio) return;
        const time = audio.currentTime;
        if (point === 'A') {
            abPointA = time;
            abSetA.classList.add('set');
        } else {
            abPointB = time;
            abSetB.classList.add('set');
        }
        if (abPointA !== null && abPointB !== null && abPointA >= abPointB) {
            abPointB = null;
            abSetB.classList.remove('set');
        }
        updateABDisplay();
        if (abPointA !== null && abPointB !== null) {
            if (!abEnabled) toggleAB();
        }
    }

    function updateABDisplay() {
        const aStr = abPointA !== null ? formatTime(abPointA) : '\u2013';
        const bStr = abPointB !== null ? formatTime(abPointB) : '\u2013';
        abStatus.textContent = aStr + ' | ' + bStr;
        if (abPointA === null) abSetA.classList.remove('set');
        if (abPointB === null) abSetB.classList.remove('set');
    }

    // v2.0.0 #15: multi-group loop bookmarks (save the current A/B range)
    function saveBookmark() {
        if (abPointA === null || abPointB === null || abPointA >= abPointB) return;
        loopMarks.push({
            id: 'mk' + Date.now(),
            start: abPointA,
            end: abPointB,
            active: true
        });
        abPointA = null;
        abPointB = null;
        abEnabled = false;
        abToggleBtn.classList.remove('active');
        abBadge.classList.add('hidden');
        updateABDisplay();
        renderMarks();
    }

    function toggleMarksPanel() {
        marksPanel.classList.toggle('hidden', !marksPanel.classList.contains('hidden'));
        if (!marksPanel.classList.contains('hidden')) renderMarks();
    }

    function removeMark(id) {
        loopMarks = loopMarks.filter(function (m) {
            return m.id !== id;
        });
        currentLoopMark = null;
        renderMarks();
    }

    function renderMarks() {
        marksBadge.textContent = loopMarks.length;
        marksBadge.classList.toggle('hidden', !loopMarks.length);
        marksBadge.style.display = loopMarks.length ? 'block' : '';
        if (marksPanel.classList.contains('hidden')) return;
        if (!loopMarks.length) {
            marksList.innerHTML = '<div class="marks-empty">' + t('marksEmpty') + '</div>';
            return;
        }
        let html = '';
        loopMarks.forEach(function (m) {
            html +=
                '<div class="mark-row' +
                (m.active ? '' : ' off') +
                '">' +
                '<input type="checkbox" class="mark-active" data-id="' +
                m.id +
                '"' +
                (m.active ? ' checked' : '') +
                '>' +
                '<span class="mark-times">' +
                formatTime(m.start) +
                ' \u2013 ' +
                formatTime(m.end) +
                '</span>' +
                '<button class="mark-del" data-id="' +
                m.id +
                '" title="' +
                t('marksDelete') +
                '"><i class="fas fa-times"></i></button>' +
                '</div>';
        });
        marksList.innerHTML = html;
        marksList.querySelectorAll('.mark-active').forEach(function (box) {
            box.addEventListener('change', function () {
                const m = loopMarks.find(function (x) {
                    return x.id === box.dataset.id;
                });
                if (m) {
                    m.active = box.checked;
                    if (!m.active && currentLoopMark === m) currentLoopMark = null;
                    renderMarks();
                }
            });
        });
        marksList.querySelectorAll('.mark-del').forEach(function (btn) {
            btn.addEventListener('click', function () {
                removeMark(btn.dataset.id);
            });
        });
    }

    // =========================== MEDIA SESSION ===========================
    function updateMediaSession() {
        if (!navigator.mediaSession || !songData) return;
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: songData.title || t('unknownSong'),
                artist: songData.artist || '',
                album: songData.album || ''
            });
        } catch (_) {
            /* MediaMetadata unsupported */
        }
        if (!navigator.mediaSession.setActionHandler) return;
        navigator.mediaSession.setActionHandler('play', function () {
            if (audio) audio.play().catch(function () {});
        });
        navigator.mediaSession.setActionHandler('pause', function () {
            if (audio) audio.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', prevLyric);
        navigator.mediaSession.setActionHandler('nexttrack', nextLyric);
        navigator.mediaSession.setActionHandler('seekbackward', function (details) {
            if (audio) audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 5));
        });
        navigator.mediaSession.setActionHandler('seekforward', function (details) {
            if (audio) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (details.seekOffset || 5));
        });
    }

    // =========================== LOADING: ZIP / LRC ===========================
    function findZipEntry(zip, name) {
        const lower = String(name).toLowerCase();
        for (const n of Object.keys(zip.files)) {
            if (n.toLowerCase() === lower) return zip.files[n];
        }
        return null;
    }

    function showStatusError(msg) {
        sidebarStatus.innerHTML =
            '<span style="color:#c0392b;"><i class="fas fa-times-circle" style="margin-right:4px;"></i>' +
            msg +
            '</span>';
    }

    // v2.9.4: play a library song through the main player (audio blob from IDB)
    function playLibrarySong(entry) {
        if (!entry || !entry.audioBlob) {
            if (window.__lyricexLog)
                window.__lyricexLog.warn('app', 'playLibrarySong without audio', entry && entry.id);
            return;
        }
        try {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                audioUrl = null;
            }
            if (coverUrl) {
                URL.revokeObjectURL(coverUrl);
                coverUrl = null;
            }
            stopInstrumental();
            if (instrumentalUrl) {
                URL.revokeObjectURL(instrumentalUrl);
                instrumentalUrl = null;
            }
            mainTrackMode = 'original';
            songData = {
                title: entry.title || '',
                artist: entry.artist || '',
                album: entry.album || '',
                sourceFormat: entry.sourceFormat || 'library'
            };
            lyrics = entry.lyricLines ? JSON.parse(entry.lyricLines) : [];
            offset = Number(entry.lyricOffset) || 0;
            audioUrl = URL.createObjectURL(entry.audioBlob);
            if (entry.coverBlob) coverUrl = URL.createObjectURL(entry.coverBlob);
            updateTrackToggle();
            uploadFileName.textContent = entry.fileName || '';
            activeLineIndex = -1;
            if (audioUrl) loadAudioFromUrl(audioUrl);
            updateSidebarStatus();
            if (window.__lyricexLibrary && window.__lyricexLibrary.recordPlay)
                window.__lyricexLibrary.recordPlay(entry.id);
            if (lyrics.length) switchView('lyrics');
        } catch (err) {
            if (window.__lyricexLog)
                window.__lyricexLog.error('app', 'playLibrarySong failed', entry && entry.id, err && err.message);
        }
    }

    async function loadZipFile(file) {
        const token = ++loadToken;
        try {
            const zip = await JSZip.loadAsync(file);
            if (token !== loadToken) return;
            let audioEntry = null,
                instrumentalEntry = null,
                coverEntry = null,
                manifestEntry = null,
                legacyJsonEntry = null,
                lrcEntry = null;
            for (const [name, entry] of Object.entries(zip.files)) {
                if (entry.dir) continue;
                const lower = name.toLowerCase();
                if (lower.endsWith('.mp3')) {
                    // v2.0.0 #13: an mp3 named like an off-vocal is the instrumental
                    if (/inst|off.?vocal|karaoke|伴奏|instrumental/i.test(name)) {
                        if (!instrumentalEntry) instrumentalEntry = entry;
                    } else if (!audioEntry) {
                        audioEntry = entry;
                    }
                } else if (/(\.jpg|\.jpeg|\.png|\.webp)$/i.test(name) && !coverEntry) coverEntry = entry;
                else if (lower === 'manifest.json') manifestEntry = entry;
                else if (lower.endsWith('song.json') && !legacyJsonEntry) legacyJsonEntry = entry;
                else if (lower.endsWith('.lrc') && !lrcEntry) lrcEntry = entry;
            }

            let data = null,
                sourceFormat = '';
            if (manifestEntry) {
                // v1.5.0: LyricEx package format (manifest.json)
                const manifest = JSON.parse(await manifestEntry.async('text'));
                if (token !== loadToken) return;
                if (!L.validateManifest(manifest)) throw new Error('manifest invalid');
                const lyricsEntry = findZipEntry(zip, manifest.lyricsFile);
                if (!lyricsEntry) throw new Error('lyrics file missing: ' + manifest.lyricsFile);
                const lyricsData = JSON.parse(await lyricsEntry.async('text'));
                if (token !== loadToken) return;
                data = {
                    title: manifest.title,
                    artist: manifest.artist || '',
                    album: manifest.album || '',
                    lyrics: lyricsData.lyrics || [],
                    config: manifest.config || {}
                };
                if (!audioEntry && manifest.audio) audioEntry = findZipEntry(zip, manifest.audio);
                if (!instrumentalEntry && manifest.instrumental)
                    instrumentalEntry = findZipEntry(zip, manifest.instrumental);
                if (manifest.cover) coverEntry = findZipEntry(zip, manifest.cover) || coverEntry;
                sourceFormat = 'lyricex-package';
            } else if (legacyJsonEntry) {
                // 群友 package format: song.json + mp3
                data = JSON.parse(await legacyJsonEntry.async('text'));
                sourceFormat = 'legacy';
            } else if (lrcEntry) {
                // zip containing a .lrc (+ optional mp3)
                const p = L.parseLRC(await lrcEntry.async('text'));
                data = { title: p.title, artist: p.artist, lyrics: p.lines, config: {} };
                sourceFormat = 'lrc';
            }
            if (token !== loadToken) return;
            if (!data) {
                showStatusError(t('zipMissing'));
                return;
            }

            songData = data;
            songData.sourceFormat = sourceFormat;
            lyrics = data.lyrics || [];
            offset = data.config ? Number(data.config.lyricOffset) || 0 : 0;
            if (!lyrics || lyrics.length === 0) {
                showStatusError(t('noLyrics'));
                return;
            }
            lyrics.forEach(function (l) {
                delete l._words;
            });

            if (audioEntry) {
                const mp3Blob = await audioEntry.async('blob');
                if (token !== loadToken) return;
                if (audioUrl) URL.revokeObjectURL(audioUrl);
                audioUrl = URL.createObjectURL(mp3Blob);
            } else {
                // no audio in this package → replace everything (lyrics-only mode)
                stopAudio();
                audioUrl = null;
            }
            // v2.0.4: a fresh package always starts on the original track
            mainTrackMode = 'original';
            // v2.0.0 #13: optional instrumental (off-vocal) track
            stopInstrumental();
            if (instrumentalEntry) {
                const instBlob = await instrumentalEntry.async('blob');
                if (token !== loadToken) return;
                instrumentalUrl = URL.createObjectURL(instBlob);
            } else {
                instrumentalUrl = null;
            }
            updateTrackToggle(); // v2.0.4: show the toggle only when a second track exists
            // v2.0.0 #22: optional cover image (manifest v2)
            if (coverUrl) {
                URL.revokeObjectURL(coverUrl);
                coverUrl = null;
            }
            if (coverEntry) {
                const coverBlob = await coverEntry.async('blob');
                if (token !== loadToken) return;
                coverUrl = URL.createObjectURL(coverBlob);
            }
            applyCinemaEffects();

            uploadFileName.textContent = file.name;
            activeLineIndex = -1;
            editorApi.setDirty(false);
            enableFollow();
            renderView();
            updateSidebarStatus();
            if (audioUrl) {
                loadAudioFromUrl(audioUrl);
            } else {
                timeDisplay.textContent = '0:00 / 0:00';
                progressFill.style.width = '0%';
                progressThumb.style.left = '0%';
                if (lyrics.length > 0) setActiveLine(0, 'instant');
            }
            saveRecent(file);
        } catch (err) {
            console.error('ZIP parse error:', err);
            showStatusError(t('parseFailed') + ': ' + err.message);
        }
    }

    async function loadLrcFile(file) {
        const token = ++loadToken;
        try {
            const text = await file.text();
            if (token !== loadToken) return;
            const p = L.parseLRC(text);
            if (!p.lines.length) {
                showStatusError(t('lrcInvalid'));
                return;
            }
            songData = {
                title: p.title || file.name.replace(/\.lrc$/i, ''),
                artist: p.artist || '',
                lyrics: p.lines,
                config: {},
                sourceFormat: 'lrc'
            };
            lyrics = p.lines;
            offset = 0;
            lyrics.forEach(function (l) {
                delete l._words;
            });
            uploadFileName.textContent = file.name;
            activeLineIndex = -1;
            editorApi.setDirty(false);
            enableFollow();
            renderView();
            updateSidebarStatus();
            // keep a currently loaded song playing: pairs a corrected .lrc with it
            if (audio) setActiveLine(0, 'instant');
            else {
                timeDisplay.textContent = '0:00 / 0:00';
                setActiveLine(0, 'instant');
            }
            saveRecent(file);
        } catch (err) {
            console.error('LRC parse error:', err);
            showStatusError(t('parseFailed') + ': ' + err.message);
        }
    }

    function handleFile(file) {
        const lower = file.name.toLowerCase();
        if (lower.endsWith('.zip')) loadZipFile(file);
        else if (lower.endsWith('.lrc')) loadLrcFile(file);
        else window.__lyricexDialog.alert(t('pleaseSelectZip'));
    }

    // v2.0.0 #14: multi-file input → load first, queue the rest
    function handleFiles(fileList) {
        const files = Array.prototype.slice.call(fileList || []);
        if (!files.length) {
            window.__lyricexDialog.alert(t('pleaseDropZip'));
            return;
        }
        handleFile(files[0]);
        for (let i = 1; i < files.length; i++) {
            if (/\.(zip|lrc)$/i.test(files[i].name)) queue.push({ name: files[i].name, file: files[i] });
        }
        renderQueue();
    }

    // =========================== RECENT + QUEUE (v2.0.0 #14) ===========================
    function saveRecent(file) {
        try {
            window.__lyricexRecent
                .save(file.name, file)
                .then(renderRecent)
                .catch(function () {});
        } catch (_) {
            /* IndexedDB unavailable */
        }
    }

    function renderRecent() {
        try {
            window.__lyricexRecent
                .list()
                .then(function (all) {
                    const list = window.__lyricexUtils.pruneRecent(all, 10);
                    recentSection.classList.toggle('hidden', !list.length);
                    // v2.1.1: mirror the list into the mobile more-drawer too
                    const targets = [recentList, mobileRecentList].filter(Boolean);
                    targets.forEach(function (el) {
                        el.innerHTML = '';
                    });
                    if (!list.length) return;
                    let html = '';
                    list.forEach(function (e) {
                        html +=
                            '<div class="recent-row">' +
                            '<button class="recent-open" data-name="' +
                            esc(e.name) +
                            '"><i class="fas fa-history"></i> ' +
                            esc(e.name) +
                            '</button>' +
                            '<button class="recent-del" data-name="' +
                            esc(e.name) +
                            '" title="' +
                            t('marksDelete') +
                            '"><i class="fas fa-times"></i></button>' +
                            '</div>';
                    });
                    targets.forEach(function (el) {
                        el.innerHTML = html;
                        el.querySelectorAll('.recent-open').forEach(function (btn) {
                            btn.addEventListener('click', function () {
                                openRecent(btn.dataset.name);
                            });
                        });
                        el.querySelectorAll('.recent-del').forEach(function (btn) {
                            btn.addEventListener('click', function () {
                                window.__lyricexRecent.remove(btn.dataset.name).then(renderRecent);
                            });
                        });
                    });
                })
                .catch(function () {
                    /* noop */
                });
        } catch (_) {
            /* noop */
        }
    }

    function openRecent(name) {
        window.__lyricexRecent
            .get(name)
            .then(function (entry) {
                if (!entry || !entry.blob) return;
                // IndexedDB may return a Blob without a name — rebuild a File.
                const f = new File([entry.blob], entry.name || name, { type: entry.blob.type || '' });
                handleFile(f);
            })
            .catch(function () {
                /* noop */
            });
    }

    function renderQueue() {
        queueSection.classList.toggle('hidden', !queue.length);
        // v2.1.1: mirror the list into the mobile more-drawer too
        const targets = [queueList, mobileQueueList].filter(Boolean);
        targets.forEach(function (el) {
            el.innerHTML = '';
        });
        if (!queue.length) return;
        let html = '';
        queue.forEach(function (q, i) {
            html +=
                '<div class="queue-row">' +
                '<span class="queue-name" title="' +
                esc(q.name) +
                '">' +
                esc(q.name) +
                '</span>' +
                '<button class="queue-del" data-idx="' +
                i +
                '" title="' +
                t('marksDelete') +
                '"><i class="fas fa-times"></i></button>' +
                '</div>';
        });
        targets.forEach(function (el) {
            el.innerHTML = html;
            el.querySelectorAll('.queue-del').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    queue.splice(parseInt(btn.dataset.idx, 10), 1);
                    renderQueue();
                });
            });
        });
    }

    function advanceQueue() {
        if (!queue.length) return false;
        const next = queue.shift();
        pendingAutoplay = true;
        renderQueue();
        handleFile(next.file);
        return true;
    }

    // =========================== v2.1.1: MOBILE SHELL + COVER + LIBRARY ===========================
    // Bottom-nav slots map to the same views as the desktop sidebar; the
    // pinned player extensions move between the bar and the drawer.
    const NAV_META = {
        lyrics: { icon: 'fas fa-file-alt', labelKey: 'lyrics' },
        study: { icon: 'fas fa-graduation-cap', labelKey: 'study' },
        mixed: { icon: 'fas fa-columns', labelKey: 'mixed' },
        editor: { icon: 'fas fa-table', labelKey: 'editor' },
        cinema: { icon: 'fas fa-tv', labelKey: 'cinemaMode' },
        mini: { icon: 'fas fa-window-restore', labelKey: 'miniMode' }
    };

    function renderBottomNav() {
        if (!bottomNav) return;
        const slots = settings.bottomNav || ['lyrics', 'study', 'mixed', 'editor'];
        slots.forEach(function (view, i) {
            const btn = bottomNav.querySelector('[data-slot="' + i + '"]');
            if (!btn) return;
            const meta = NAV_META[view] || NAV_META.lyrics;
            btn.innerHTML = '<i class="' + meta.icon + '"></i><span class="nav-label">' + t(meta.labelKey) + '</span>';
            btn.dataset.view = view;
            btn.classList.toggle('active', view === currentView);
        });
    }

    function renderPlayerExt() {
        if (!playerExt || !playerDrawer) return;
        const pinned = settings.playerExt || [];
        document.querySelectorAll('.ext-item[data-ext]').forEach(function (el) {
            (pinned.indexOf(el.dataset.ext) !== -1 ? playerExt : playerDrawer).appendChild(el);
        });
        const inDrawer = playerDrawer.querySelectorAll('.ext-item[data-ext]').length;
        playerExtToggle.classList.toggle('hidden', !inDrawer);
        if (playerExtBadge) {
            playerExtBadge.classList.toggle('hidden', !inDrawer);
            playerExtBadge.style.display = inDrawer ? 'block' : '';
            playerExtBadge.textContent = inDrawer;
        }
    }

    function toggleDrawer(drawer) {
        if (!drawer) return;
        const wasOpen = !drawer.classList.contains('hidden');
        closeAllDrawers();
        if (!wasOpen) {
            drawer.classList.remove('hidden');
            drawer.style.display = 'flex';
        }
    }

    function closeAllDrawers() {
        [topDrawer, moreDrawer, playerDrawer, langDrawer].forEach(function (d) {
            if (d) d.classList.add('hidden');
        });
        [mobileMoreBtn, bottomMoreBtn, playerExtToggle].forEach(function (b) {
            if (b) b.classList.remove('active');
        });
    }

    function updateMobileNow() {
        if (!mobileTitle) return;
        if (!songData || !lyrics.length) {
            mobileTitle.textContent = t('waitingUpload');
            mobileArtist.textContent = '';
        } else {
            mobileTitle.textContent = songData.title || t('unknownSong');
            mobileArtist.textContent = songData.artist || '';
        }
        if (mobileCoverBtn) mobileCoverBtn.classList.toggle('hidden', !coverUrl);
        if (playerCoverBtn) playerCoverBtn.classList.toggle('hidden', !coverUrl);
    }

    function openCoverViewer() {
        if (!coverUrl || !coverViewer) return;
        coverViewerImg.src = coverUrl;
        coverViewer.classList.add('open');
    }

    function closeCoverViewer() {
        if (coverViewer) coverViewer.classList.remove('open');
    }

    // v2.1.1: cinema wallpaper effect knobs (设置 → 外观 → 影院)
    function applyCinemaEffects() {
        const bg = document.querySelector('.cinema-bg');
        if (!bg) return;
        const s = settings;
        bg.style.filter =
            'blur(' +
            s.cinemaBlur +
            'px) brightness(' +
            s.cinemaBrightness +
            '%) contrast(' +
            s.cinemaContrast +
            '%) saturate(' +
            s.cinemaSaturate +
            '%)';
        bg.style.setProperty('--cinema-darken', (s.cinemaDarken / 100).toFixed(2));
        bg.style.setProperty('--cinema-glass', (s.cinemaGlass / 100).toFixed(2));
        bg.style.setProperty('--cinema-border', s.cinemaBorder + 'px');
        if (s.cinemaUseCover) applyCover();
        else {
            bg.style.backgroundImage = '';
            bg.classList.remove('has-cover');
        }
    }

    // v2.1.1: song library — fetches examples/manifest.json over HTTP (the app
    // never runs from file://, so a relative fetch is safe) and hands each
    // package to the regular handleFile pipeline.
    let libraryCache = null;

    function openLibrary() {
        closeAllDrawers();
        if (!libraryOverlay) return;
        libraryOverlay.classList.add('open');
        if (libraryCache) {
            renderLibrary(libraryCache);
            return;
        }
        libraryStatus.textContent = t('libraryLoad');
        fetch('examples/manifest.json', { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (manifest) {
                libraryCache = manifest;
                renderLibrary(manifest);
            })
            .catch(function () {
                libraryStatus.textContent = t('libraryUnavailable');
                libraryList.innerHTML = '';
            });
    }

    function closeLibrary() {
        if (libraryOverlay) libraryOverlay.classList.remove('open');
        closeSourcePop();
    }

    function renderLibrary(manifest) {
        const songs = (manifest && manifest.songs) || [];
        libraryStatus.textContent = '';
        libraryList.innerHTML = '';
        if (!songs.length) {
            libraryStatus.textContent = t('libraryEmpty');
            return;
        }
        songs.forEach(function (s) {
            const row = document.createElement('div');
            row.className = 'library-item';
            let meta = s.artist ? esc(s.artist) : '';
            if (s.source) meta += (meta ? ' · ' : '') + esc(s.source);
            if (s.copyright) meta += (meta ? ' · ' : '') + esc(s.copyright);
            // v3.0.0: manifest songs[].links[] — optional author/source page
            // links (icon = Font Awesome class); a placeholder "#" is fine
            var links = Array.isArray(s.links) ? s.links : [];
            var linksHTML = links
                .map(function (lk) {
                    var url = lk.url || '#';
                    var label = lk.label || url;
                    var icon = lk.icon || 'fa-globe';
                    return (
                        '<a class="library-item-link" href="' +
                        esc(url) +
                        '" target="_blank" rel="noopener">' +
                        '<i class="fas ' +
                        esc(icon) +
                        '"></i> ' +
                        esc(label) +
                        '</a>'
                    );
                })
                .join('');
            row.innerHTML =
                '<div class="library-item-info"><div class="library-item-title">' +
                esc(s.title || '') +
                '</div>' +
                (meta ? '<div class="library-item-meta">' + meta + '</div>' : '') +
                (linksHTML ? '<div class="library-item-links">' + linksHTML + '</div>' : '') +
                '</div><button class="library-item-btn">' +
                t('librarySource') +
                '</button>';
            row.querySelector('.library-item-btn').addEventListener('click', function () {
                openLibrarySong(s);
            });
            libraryList.appendChild(row);
        });
    }

    function openLibrarySong(song) {
        // v2.9.3: manifest.sources[] may declare >1 loadable source for a song;
        // single-source songs load straight through, multi-source show a chooser
        var sources = Array.isArray(song.sources) ? song.sources : null;
        if (sources && sources.length > 1) {
            renderSourcePop(song, sources);
            return;
        }
        loadLibrarySong(song);
    }

    function renderSourcePop(song, sources) {
        if (!librarySourcePop || !librarySourcePopList) return;
        librarySourcePopTitle.textContent = t('librarySourceTitle');
        librarySourcePopList.innerHTML = '';
        sources.forEach(function (src) {
            var file = src.file || song.file || '';
            if (!file) return;
            var label = src.label || file.split('/').pop() || t('librarySource');
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'library-source-btn';
            btn.innerHTML =
                '<span class="library-source-label">' +
                esc(label) +
                '</span>' +
                (src.file ? '<span class="library-source-file">' + esc(src.file.split('/').pop()) + '</span>' : '');
            btn.addEventListener('click', function () {
                closeSourcePop();
                loadLibrarySong(song, file);
            });
            librarySourcePopList.appendChild(btn);
        });
        librarySourcePop.hidden = false;
    }

    function closeSourcePop() {
        if (librarySourcePop) librarySourcePop.hidden = true;
    }

    function loadLibrarySong(song, fileOverride) {
        var file = fileOverride || (song && song.file) || '';
        if (!file) return;
        libraryStatus.textContent = t('libraryLoad');
        fetch(file, { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.blob();
            })
            .then(function (blob) {
                const f = new File([blob], file.split('/').pop() || 'song.lxp.zip', { type: 'application/zip' });
                closeLibrary();
                handleFile(f);
            })
            .catch(function () {
                libraryStatus.textContent = t('libraryUnavailable');
            });
    }

    function bindMobileEvents() {
        if (mobileMoreBtn)
            mobileMoreBtn.addEventListener('click', function () {
                toggleDrawer(topDrawer);
            });
        if (bottomMoreBtn)
            bottomMoreBtn.addEventListener('click', function () {
                toggleDrawer(moreDrawer);
            });
        if (langChangeBtn) langChangeBtn.addEventListener('click', openLangDrawer);
        if (guideGlobeBtn) guideGlobeBtn.addEventListener('click', openLangDrawer);
        if (langDrawerClose) langDrawerClose.addEventListener('click', closeLangDrawer);
        if (langDrawer)
            langDrawer.addEventListener('click', function (e) {
                if (e.target === langDrawer) closeLangDrawer();
            });
        if (playerExtToggle)
            playerExtToggle.addEventListener('click', function () {
                toggleDrawer(playerDrawer);
            });
        if (topThemeBtn)
            topThemeBtn.addEventListener('click', function () {
                toggleTheme();
                closeAllDrawers();
            });
        if (topSettingsBtn)
            topSettingsBtn.addEventListener('click', function () {
                closeAllDrawers();
                settingsApi.open();
            });
        if (topAboutBtn)
            topAboutBtn.addEventListener('click', function () {
                closeAllDrawers();
                aboutApi.open();
            });
        if (moreCinemaBtn)
            moreCinemaBtn.addEventListener('click', function () {
                closeAllDrawers();
                cinemaApi.open();
            });
        if (moreMiniBtn)
            moreMiniBtn.addEventListener('click', function () {
                closeAllDrawers();
                miniApi.toggle();
            });
        if (moreUploadBtn)
            moreUploadBtn.addEventListener('click', function () {
                closeAllDrawers();
                fileInput.click();
            });
        // v2.9.4: library entries moved to the standalone library view (data-view)
        if (bottomNav)
            bottomNav.addEventListener('click', function (e) {
                const btn = e.target.closest('.bottom-nav-slot');
                if (!btn || !btn.dataset.view) return;
                closeAllDrawers();
                switchView(btn.dataset.view);
                renderBottomNav();
            });
        if (mobileCoverBtn) mobileCoverBtn.addEventListener('click', openCoverViewer);
        if (playerCoverBtn) playerCoverBtn.addEventListener('click', openCoverViewer);
        if (coverViewerClose) coverViewerClose.addEventListener('click', closeCoverViewer);
        if (coverViewer)
            coverViewer.addEventListener('click', function (e) {
                if (e.target === coverViewer) closeCoverViewer();
            });
        if (libraryCloseBtn) libraryCloseBtn.addEventListener('click', closeLibrary);
        if (librarySourcePopClose) librarySourcePopClose.addEventListener('click', closeSourcePop);
        if (librarySourcePop)
            librarySourcePop.addEventListener('click', function (e) {
                if (e.target === librarySourcePop) closeSourcePop();
            });
        if (libraryOverlay)
            libraryOverlay.addEventListener('click', function (e) {
                if (e.target === libraryOverlay) closeLibrary();
            });
        document.addEventListener('click', function (e) {
            if (
                topDrawer &&
                !topDrawer.classList.contains('hidden') &&
                !topDrawer.contains(e.target) &&
                !(mobileMoreBtn && mobileMoreBtn.contains(e.target))
            )
                topDrawer.classList.add('hidden');
            if (
                moreDrawer &&
                !moreDrawer.classList.contains('hidden') &&
                !moreDrawer.contains(e.target) &&
                !(bottomMoreBtn && bottomMoreBtn.contains(e.target))
            )
                moreDrawer.classList.add('hidden');
            if (
                langDrawer &&
                !langDrawer.classList.contains('hidden') &&
                !langDrawer.contains(e.target) &&
                !(langChangeBtn && langChangeBtn.contains(e.target)) &&
                !(guideGlobeBtn && guideGlobeBtn.contains(e.target))
            )
                langDrawer.classList.add('hidden');
            if (
                playerDrawer &&
                !playerDrawer.classList.contains('hidden') &&
                !playerDrawer.contains(e.target) &&
                !(playerExtToggle && playerExtToggle.contains(e.target))
            )
                playerDrawer.classList.add('hidden');
        });
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (coverViewer && coverViewer.classList.contains('open')) {
                closeCoverViewer();
                return;
            }
            if (libraryOverlay && libraryOverlay.classList.contains('open')) {
                closeLibrary();
                return;
            }
            closeAllDrawers();
        });
        renderBottomNav();
        renderPlayerExt();
        updateMobileNow();
    }

    function safePackageName() {
        const base = ((songData && songData.title) || 'lyrics').replace(/[\\/:*?"<>|]/g, '_').trim();
        return (base || 'lyrics').slice(0, 80);
    }

    function downloadBlob(blob, name) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 5000);
    }

    async function exportPackageZip() {
        if (!lyrics.length) return;
        try {
            const zip = new JSZip();
            const baked = lyrics.map(function (l) {
                const c = Object.assign({}, l);
                c.time = Math.round((l.time - offset) * 1000) / 1000; // bake offset in
                return c;
            });
            const manifest = {
                format: 'lyricex-package',
                version: 2,
                title: (songData && songData.title) || t('unknownSong'),
                artist: (songData && songData.artist) || '',
                album: (songData && songData.album) || '',
                audio: audioUrl ? 'assets/audio.mp3' : null,
                instrumental: instrumentalUrl ? 'assets/instrumental.mp3' : null,
                cover: coverUrl ? 'assets/cover.jpg' : null,
                lyricsFile: 'lyrics.json',
                config: { lyricOffset: 0 },
                convertedFrom: (songData && songData.sourceFormat) || null
            };
            zip.file('manifest.json', JSON.stringify(manifest, null, 2));
            zip.file('lyrics.json', JSON.stringify({ lyrics: baked }, null, 2));
            if (audioUrl) {
                const resp = await fetch(audioUrl);
                if (!resp.ok) throw new Error('audio fetch failed');
                zip.file('assets/audio.mp3', await resp.blob());
            }
            if (instrumentalUrl) zip.file('assets/instrumental.mp3', await (await fetch(instrumentalUrl)).blob());
            if (coverUrl) zip.file('assets/cover.jpg', await (await fetch(coverUrl)).blob());
            const out = await zip.generateAsync({ type: 'blob' });
            downloadBlob(out, safePackageName() + '.lxp.zip');
            editorApi.setDirty(false);
            if (currentView === 'editor') editorApi.render();
        } catch (err) {
            console.error('export failed:', err);
            window.__lyricexDialog.alert(t('exportFailed') + ': ' + err.message);
        }
    }

    function exportLrc() {
        if (!lyrics.length) return;
        const lines = [];
        lines.push('[ti:' + ((songData && songData.title) || '') + ']');
        if (songData && songData.artist) lines.push('[ar:' + songData.artist + ']');
        lyrics.forEach(function (l) {
            const t = Math.max(0, l.time - offset);
            const m = Math.floor(t / 60);
            const s = (t % 60).toFixed(2);
            lines.push('[' + String(m).padStart(2, '0') + ':' + String(s).padStart(5, '0') + ']' + l.text);
        });
        downloadBlob(new Blob([lines.join('\n')], { type: 'text/plain' }), safePackageName() + '.lrc');
    }

    // =========================== SUBTITLE EXPORT (v1.7.0) ===========================
    function exportSrt() {
        if (!lyrics.length) return;
        const srt = window.__lyricexUtils.buildSrt(lyrics, offset, { includeTranslation: true, endPad: 3 });
        downloadBlob(new Blob([srt], { type: 'text/plain;charset=utf-8' }), safePackageName() + '.srt');
    }

    function exportAss() {
        if (!lyrics.length) return;
        const ass = window.__lyricexUtils.buildAss(lyrics, offset, { includeTranslation: true });
        downloadBlob(new Blob([ass], { type: 'text/plain;charset=utf-8' }), safePackageName() + '.ass');
    }

    // =========================== v2.0.0: PRINT / NOTES / POSTER ===========================
    function studyNotesLabels() {
        return {
            translation: t('translation'),
            romaji: t('romaji'),
            note: t('editorNote'),
            hiragana: t('hiragana'),
            kanji: t('kanji'),
            partOfSpeech: t('pos'),
            meaning: t('meaning')
        };
    }

    function exportNotes(format) {
        if (!lyrics.length) return;
        const doc = window.__lyricexUtils.buildStudyNotes(lyrics, {
            title: (songData && songData.title) || '',
            artist: (songData && songData.artist) || '',
            format: format,
            labels: studyNotesLabels()
        });
        const ext = format === 'html' ? 'html' : 'md';
        const type = format === 'html' ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8';
        downloadBlob(new Blob([doc], { type: type }), safePackageName() + '-notes.' + ext);
    }

    function printStudySheet() {
        if (!lyrics.length) return;
        let html =
            '<div class="print-sheet">' +
            '<h1>' +
            esc((songData && songData.title) || t('unknownSong')) +
            (songData && songData.artist ? ' · ' + esc(songData.artist) : '') +
            '</h1>';
        lyrics.forEach(function (line) {
            html +=
                '<section class="print-line"><h2>' +
                esc(line.text || '') +
                '</h2>' +
                (line.translation ? '<p class="pt">' + esc(line.translation) + '</p>' : '') +
                (line.analysis && line.analysis.length ? buildStudyTable(line, -1) : '') +
                '</section>';
        });
        html += '</div>';
        printSheet.innerHTML = html;
        window.print();
    }

    function exportPoster() {
        if (!lyrics.length || activeLineIndex < 0) return;
        const line = lyrics[activeLineIndex];
        const opts = {
            title: songData ? songData.title : '',
            artist: songData ? songData.artist : '',
            lyricHtml: shareApi.cardLyricHtml(),
            lyricText: line.text || '',
            translation: line.translation || '',
            romaji: shareApi.cardRomaji(),
            accent: settings.customAccent || '#8a7a6a',
            template: 'gradient',
            showTranslation: !!line.translation,
            showRomaji: true
        };
        window.__lyricexUtils
            .renderPoster(opts)
            .then(function (canvas) {
                window.__lyricexUtils
                    .canvasToPngBlob(canvas)
                    .then(function (blob) {
                        downloadBlob(blob, safePackageName() + '-poster.png');
                    })
                    .catch(function () {});
            })
            .catch(function (e) {
                console.error('poster render failed', e);
            });
    }

    // =========================== SPECTRUM (v1.5.0) ===========================
    function refreshSpectrumColor() {
        try {
            spectrumColor = getComputedStyle(app).getPropertyValue('--accent').trim() || '#8a7a6a';
        } catch (_) {
            /* keep last */
        }
    }

    function ensureAudioGraph() {
        if (!audio) return false;
        return window.__lyricexAudioGraph.startSpectrum(audio);
    }

    function drawSpectrum() {
        const analyser = window.__lyricexAudioGraph.getAnalyser();
        const spectrumData = window.__lyricexAudioGraph.getData();
        if (!analyser || !spectrumData) return;
        const canvas = spectrumCanvas;
        const w = canvas.clientWidth,
            h = canvas.clientHeight;
        if (!w || !h) return;
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
        }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        analyser.getByteFrequencyData(spectrumData);
        const bars = 40;
        const step = Math.max(1, Math.floor(spectrumData.length / bars));
        const gap = 2;
        const bw = (w - gap * (bars - 1)) / bars;
        ctx.fillStyle = spectrumColor;
        for (let i = 0; i < bars; i++) {
            const v = spectrumData[i * step] / 255;
            const bh = Math.max(2, v * h);
            ctx.fillRect(i * (bw + gap), h - bh, bw, bh);
        }
    }

    // =========================== VIEW SWITCH ===========================
    function switchView(view) {
        currentView = view;
        viewBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        enableFollow(); // before renderView so the fresh view re-syncs to the active line
        renderView();
        // v1.6.3: gentle fade-in on explicit view switches only (not the study
        // view's per-line re-render); restart by dropping and re-adding the class.
        if (settings.animations) {
            viewContent.classList.remove('view-anim');
            void viewContent.offsetWidth; // reflow → restart the CSS animation
            viewContent.classList.add('view-anim');
        }
    }

    // =========================== THEME ===========================
    function toggleTheme() {
        setSetting('theme', window.__lyricexUtils.nextTheme(currentTheme));
    }

    // =========================== PROGRESS BAR ===========================
    function setupProgressBar() {
        progressBar.addEventListener('mousedown', function (e) {
            if (!audio) return;
            isDragging = true;
            seekFromEvent(e);
        });
        document.addEventListener('mousemove', function (e) {
            if (isDragging && audio) seekFromEvent(e);
            if (isThumbDragging && audio) seekFromEvent(e);
        });
        document.addEventListener('mouseup', endProgressDrag);
        progressBar.addEventListener(
            'touchstart',
            function (e) {
                if (!audio) return;
                isDragging = true;
                seekFromTouch(e);
            },
            { passive: true }
        );
        document.addEventListener(
            'touchmove',
            function (e) {
                if (isDragging && audio) seekFromTouch(e);
                if (isThumbDragging && audio) seekFromTouch(e);
            },
            { passive: true }
        );
        document.addEventListener('touchend', endProgressDrag, { passive: true });
        progressThumb.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            if (!audio) return;
            isThumbDragging = true;
            seekFromEvent(e);
        });
        progressThumb.addEventListener(
            'touchstart',
            function (e) {
                e.stopPropagation();
                if (!audio) return;
                isThumbDragging = true;
                seekFromTouch(e);
            },
            { passive: true }
        );
    }

    function seekFromEvent(e) {
        const rect = progressBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (audio && audio.duration) {
            audio.currentTime = x * audio.duration;
            const idx = findLyricIndex(getCurrentTime());
            if (idx !== activeLineIndex) setActiveLine(idx, 'none');
        }
    }

    function seekFromTouch(e) {
        const touch = e.touches[0];
        if (!touch) return;
        const rect = progressBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        if (audio && audio.duration) {
            audio.currentTime = x * audio.duration;
            const idx = findLyricIndex(getCurrentTime());
            if (idx !== activeLineIndex) setActiveLine(idx, 'none');
        }
    }

    // v1.6.1: dragging the progress bar is explicit navigation — on release,
    // resume follow and land the view on the final position. Previously the
    // release only ran updatePlayState(), which no-ops because the highlight
    // was already moved during the drag, so the lyrics never re-synced (and
    // could stay stale until the next line boundary — "follow broke again").
    function endProgressDrag() {
        if (!isDragging && !isThumbDragging) return;
        isDragging = false;
        isThumbDragging = false;
        enableFollow();
        setActiveLine(findLyricIndex(getCurrentTime()), 'instant');
        updatePlayState();
    }

    // =========================== KEYBOARD ===========================
    function handleKeydown(e) {
        if (shortcutCapture) {
            handleShortcutCapture(e);
            return;
        }
        if (searchApi.isOpen()) {
            if (e.key === 'Escape') {
                e.preventDefault();
                searchApi.close();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                searchApi.select(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                searchApi.select(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                searchApi.jump();
            }
            return;
        }
        if (overlayOpen()) {
            if (e.key === 'Escape') {
                aboutApi.close();
                settingsApi.close();
                aboutApi.closeGuide();
                shareApi.close();
                videoApi.close();
                aboutApi.closeChangelog();
            }
            return;
        }
        if (cinemaApi.isOpen() && e.key === 'Escape') {
            e.preventDefault();
            cinemaApi.close();
            return;
        }
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable))
            return;
        // v1.7.0: '/' or Ctrl/Cmd+F opens lyrics search
        if (e.key === '/' || ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'f')) {
            e.preventDefault();
            searchApi.open();
            return;
        }
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            seekPercent(e.key === '0' ? 1 : parseInt(e.key, 10) / 10);
            return;
        }
        const action = keyToAction(L.normalizeKey(e.key));
        if (!action) return;
        e.preventDefault();
        runAction(action);
    }

    // =========================== INIT ===========================
    function init() {
        window.__i18n.init();
        // v2.4.0: boot the locale chain BEFORE rendering. Dict scripts load
        // asynchronously, so a synchronous init applied i18n to an empty
        // dictionary and first entry showed placeholder text. setLocale()
        // re-applies static [data-i18n] and, via __onLocaleChange, all
        // dynamically rendered UI once the chain is ready.
        loadLocale(window.__i18n._current, function () {
            window.__i18n.setLocale(window.__i18n._current);
            boot();
        });
    }

    function boot() {
        // v1.6.4: eagerly fetch the vendored webfonts (400 + 700 only — the two
        // weights the app renders). Local @font-face CSS already loads them;
        // document.fonts.load() just forces the fetch so text doesn't swap in.
        if (document.fonts && document.fonts.load) {
            [
                '400 16px "Noto Sans SC"',
                '700 16px "Noto Sans SC"',
                '400 16px "M PLUS Rounded 1c"',
                '700 16px "M PLUS Rounded 1c"',
                '400 16px "Courier Prime"',
                '700 16px "Courier Prime"'
            ].forEach(function (f) {
                document.fonts.load(f).catch(function () {
                    /* offline → fallbacks */
                });
            });
        }

        loadSettings();
        applySettings();
        renderLangOptions();

        // v1.6.0: default home view (validated; falls back to lyrics)
        const dv = ['lyrics', 'study', 'mixed'].indexOf(settings.defaultView) !== -1 ? settings.defaultView : 'lyrics';
        switchView(dv);
        setupProgressBar();
        renderShortcutList();
        settingsApi.renderControls();
        settingsApi.applySidebarVisibility();
        renderShortcutControls();
        editorApi.bind({
            exportPackage: exportPackageZip,
            exportLrc: exportLrc,
            exportSrt: exportSrt,
            exportAss: exportAss,
            openVideo: videoApi.open,
            printStudy: printStudySheet,
            exportNotes: exportNotes,
            exportPoster: exportPoster,
            // v3.3.0: unified export dialog owns every format
            openExport: function () {
                exportApi.open();
            }
        });
        workspaceApi.bind();
        sidebarStatus.innerHTML = '<span>' + t('waitingUpload') + '</span>';
        uploadFileName.textContent = t('notLoaded');
        timeDisplay.textContent = '0:00 / 0:00';
        setPlayIcon(false);
        setMuteIcon(false);

        viewBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchView(this.dataset.view);
            });
        });
        themeToggle.addEventListener('click', toggleTheme);
        uploadArea.addEventListener('click', function () {
            fileInput.click();
        });
        uploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent)';
            uploadArea.style.background = 'var(--bg-hover)';
        });
        uploadArea.addEventListener('dragleave', function () {
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
        });
        uploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
            handleFiles(e.dataTransfer.files);
        });
        fileInput.addEventListener('change', function (e) {
            handleFiles(e.target.files);
            if (!/\.(zip|lrc)$/i.test(e.target.value)) e.target.value = '';
        });

        // v2.0.0: transpose / bookmarks
        transposeDown.addEventListener('click', function () {
            setTranspose(transpose - 1);
        });
        transposeUp.addEventListener('click', function () {
            setTranspose(transpose + 1);
        });
        marksToggleBtn.addEventListener('click', toggleMarksPanel);
        abSave.addEventListener('click', saveBookmark);
        marksPanel.addEventListener('click', function (e) {
            if (e.target === marksPanel) toggleMarksPanel();
        });
        renderRecent();
        renderQueue();

        playBtn.addEventListener('click', togglePlay);
        resetBtn.addEventListener('click', resetPlayback);
        prevBtn.addEventListener('click', prevLyric);
        nextBtn.addEventListener('click', nextLyric);

        volumeSlider.addEventListener('input', function () {
            setVolume(parseInt(this.value));
        });
        muteBtn.addEventListener('click', toggleMute);
        speedSelect.addEventListener('change', function () {
            settings.speed = parseFloat(this.value);
            saveSettings();
            setSpeed(this.value);
        });
        loopBtn.addEventListener('click', toggleLoop);
        abToggleBtn.addEventListener('click', toggleAB);
        auditionToggleBtn.addEventListener('click', toggleTrackMode);
        abSetA.addEventListener('click', function () {
            setABPoint('A');
        });
        abSetB.addEventListener('click', function () {
            setABPoint('B');
        });

        followPill.addEventListener('click', function () {
            enableFollow();
            scrollLyricToActive('instant');
        });
        cinemaFollowPill.addEventListener('click', function () {
            enableFollow();
            scrollLyricToActive('instant');
        });

        // UI feature controllers bind their own controls (js/ui/).
        searchApi.bind();
        settingsApi.bind();
        aboutApi.bind();
        miniApi.bind();
        cinemaApi.bind();
        shareApi.bind();
        videoApi.bind();
        exportApi.bind();

        document.addEventListener('keydown', handleKeydown);

        // v1.7.0: follow OS dark/light changes while theme === 'system'
        try {
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
                    if (currentTheme === 'system') applySettings();
                });
            }
        } catch (_) {
            /* noop */
        }

        window.__i18n._apply();

        // v1.6.4: first visit → show the onboarding guide once; afterwards it
        // only opens via 关于 → 观看指引.
        let guideSeen = false;
        try {
            guideSeen = localStorage.getItem('lyricex-guide-seen') === '1';
        } catch (_) {
            /* noop */
        }
        if (!guideSeen) aboutApi.openGuide();

        if (navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('play', function () {
                if (audio) audio.play().catch(function () {});
            });
            navigator.mediaSession.setActionHandler('pause', function () {
                if (audio) audio.pause();
            });
            navigator.mediaSession.setActionHandler('previoustrack', prevLyric);
            navigator.mediaSession.setActionHandler('nexttrack', nextLyric);
        }

        // expose API
        window.__lyricex = {
            loadZip: loadZipFile,
            loadLrc: loadLrcFile,
            playLibrarySong: playLibrarySong,
            openLibrary: openLibrary,
            closeLibrary: closeLibrary,
            loadFile: handleFile,
            switchView: switchView,
            toggleTheme: toggleTheme,
            openCinema: cinemaApi.open,
            closeCinema: cinemaApi.close,
            toggleMini: miniApi.toggle,
            exportPackage: exportPackageZip,
            exportLrc: exportLrc,
            setSetting: setSetting,
            getSettings: function () {
                return settings;
            },
            audio: function () {
                return audio;
            },
            data: function () {
                return songData;
            },
            setActiveLine: setActiveLine,
            togglePlay: togglePlay,
            prevLyric: prevLyric,
            nextLyric: nextLyric,
            scrollToActive: scrollLyricToActive,
            enableFollow: enableFollow,
            followOn: function () {
                return followEnabled;
            },
            exportSrt: exportSrt,
            exportAss: exportAss,
            openSearch: searchApi.open,
            openShare: shareApi.open,
            startVideoExport: videoApi.start,
            // v2.0.0
            setTranspose: setTranspose,
            getTranspose: function () {
                return transpose;
            },
            saveBookmark: saveBookmark,
            getLoopMarks: function () {
                return loopMarks;
            },
            hasInstrumental: function () {
                return !!instrumentalUrl;
            },
            // v2.0.4
            getTrackMode: function () {
                return mainTrackMode;
            },
            toggleTrackMode: toggleTrackMode,
            hasCover: function () {
                return !!coverUrl;
            },
            getQueue: function () {
                return queue;
            },
            advanceQueue: advanceQueue,
            exportNotes: exportNotes,
            exportPoster: exportPoster,
            printStudySheet: printStudySheet
        };
    }

    // v2.8.1: build-tab blank guard — a missing/failed workspace module used to
    // render a BLANK build pane on incomplete deployments; show a hint instead.
    function renderWorkspaceMissing() {
        const pane = viewContent.querySelector('[data-editor-pane="build"]');
        if (!pane) return;
        pane.innerHTML = '<div class="ws-empty-hint"><i class="fas fa-tools"></i> ' + t('wsModuleMissing') + '</div>';
    }

    // =========================== UI MODULE WIRING ===========================
    // The feature controllers in js/ui/ cannot see this IIFE's closure, so ctx
    // hands them the shared state (as getters, so a package reload that
    // reassigns lyrics/songData/audio stays fresh) plus the helpers and DOM
    // refs they call into. Cross-module couplings (mini↔cinema, settings↔about)
    // are late-bound functions so each module keeps its own state without
    // importing its sibling.
    const ctx = {
        t: t,
        L: L,
        esc: esc,
        get settings() {
            return settings;
        },
        get lyrics() {
            return lyrics;
        },
        get songData() {
            return songData;
        },
        get audio() {
            return audio;
        },
        get audioUrl() {
            return audioUrl;
        },
        get offset() {
            return offset;
        },
        set offset(v) {
            offset = v;
        },
        get activeLineIndex() {
            return activeLineIndex;
        },
        set activeLineIndex(v) {
            activeLineIndex = v;
        },
        get currentView() {
            return currentView;
        },
        get coverUrl() {
            return coverUrl;
        },
        set coverUrl(v) {
            coverUrl = v;
        },
        get instrumentalUrl() {
            return instrumentalUrl;
        },
        set instrumentalUrl(v) {
            instrumentalUrl = v;
            updateTrackToggle();
        },
        stopInstrumental: stopInstrumental,
        get isPlaying() {
            return isPlaying;
        },
        app: app,
        viewContent: viewContent,
        fileInput: fileInput,
        renderEmpty: renderEmpty,
        langAttr: langAttr,
        lineTextHTML: lineTextHTML,
        lineRubyHTML: lineRubyHTML,
        subLineHTML: subLineHTML,
        romajiFromLine: romajiFromLine,
        findLyricIndex: findLyricIndex,
        getCurrentTime: getCurrentTime,
        enableFollow: enableFollow,
        setActiveLine: setActiveLine,
        togglePlay: togglePlay,
        prevLyric: prevLyric,
        nextLyric: nextLyric,
        updatePlayState: updatePlayState,
        updateSidebarStatus: updateSidebarStatus,
        updateMiniBar: function () {
            miniApi.updateBar();
        },
        updateWordHighlight: updateWordHighlight,
        renderView: renderView,
        scrollLyricToActive: scrollLyricToActive,
        updateFollowPill: updateFollowPill,
        bindScrollInteractions: bindScrollInteractions,
        downloadBlob: downloadBlob,
        safePackageName: safePackageName,
        handleFile: handleFile,
        loadAudioFromUrl: loadAudioFromUrl,
        renderShortcutControls: renderShortcutControls,
        resetSettings: resetSettings,
        exportSettings: exportSettings,
        importSettingsFile: importSettingsFile,
        getSetting: getSetting,
        setSetting: setSetting,
        saveSettings: saveSettings,
        applySettings: applySettings,
        applyPosColors: applyPosColors,
        // late-bound cross-module couplings (resolved after the factories below)
        closeAbout: function () {
            aboutApi && aboutApi.close();
        },
        closeSettings: function () {
            settingsApi && settingsApi.close();
        },
        isCinemaOpen: function () {
            return cinemaApi && cinemaApi.isOpen();
        },
        closeCinema: function () {
            cinemaApi && cinemaApi.close();
        },
        isMiniOn: function () {
            return miniApi && miniApi.isOn();
        },
        exitMini: function () {
            miniApi && miniApi.exit();
        },
        // v2.6.0: workspace build-pane render hook (editor renders the tab,
        // workspace fills the pane — late-bound so neither imports the other)
        renderWorkspaceTab: function () {
            if (!workspaceApi) {
                renderWorkspaceMissing();
                return;
            }
            try {
                workspaceApi.render();
            } catch (e) {
                console.error('workspace render failed', e);
                renderWorkspaceMissing();
            }
        },
        // v2.6.0: load the workspace draft into the app (shared state, both
        // panes see it; used by the build pane's load-to-app action)
        loadWorkspaceDraft: loadWorkspaceDraft,
        // share / video export DOM refs
        shareCardBtn: shareCardBtn,
        shareOverlay: shareOverlay,
        sharePreview: sharePreview,
        shareTemplate: shareTemplate,
        shareAccent: shareAccent,
        shareTranslation: shareTranslation,
        shareRomaji: shareRomaji,
        shareCss: shareCss,
        shareTplExportBtn: shareTplExportBtn,
        shareTplImportBtn: shareTplImportBtn,
        shareTplFile: shareTplFile,
        shareCopyBtn: shareCopyBtn,
        shareDownloadBtn: shareDownloadBtn,
        shareCloseBtn: shareCloseBtn,
        videoOverlay: videoOverlay,
        videoStatus: videoStatus,
        videoProgressFill: videoProgressFill,
        videoStartBtn: videoStartBtn,
        videoCancelBtn: videoCancelBtn,
        // search / mini / cinema / about / settings DOM refs
        searchOverlay: searchOverlay,
        searchInput: searchInput,
        searchResults: searchResults,
        searchCount: searchCount,
        miniBtn: miniBtn,
        miniBar: miniBar,
        miniDrag: miniDrag,
        miniInfo: miniInfo,
        miniTitle: miniTitle,
        miniLine: miniLine,
        miniPlayBtn: miniPlayBtn,
        miniPlayIcon: miniPlayIcon,
        miniPrevBtn: miniPrevBtn,
        miniNextBtn: miniNextBtn,
        miniProgress: miniProgress,
        miniProgressFill: miniProgressFill,
        miniExpandBtn: miniExpandBtn,
        cinemaBtn: cinemaBtn,
        cinemaOverlay: cinemaOverlay,
        cinemaLyrics: cinemaLyrics,
        cinemaExitBtn: cinemaExitBtn,
        cinemaPlayerSlot: cinemaPlayerSlot,
        playerControls: playerControls,
        aboutBtn: aboutBtn,
        aboutOverlay: aboutOverlay,
        aboutCloseBtn: aboutCloseBtn,
        aboutSubnav: aboutSubnav,
        aboutBody: aboutBody,
        changelogBtn: changelogBtn,
        changelogOverlay: changelogOverlay,
        changelogBody: changelogBody,
        changelogCloseBtn: changelogCloseBtn,
        checkUpdateBtn: checkUpdateBtn,
        guideOverlay: guideOverlay,
        guideBody: guideBody,
        guideDots: guideDots,
        guideCounter: guideCounter,
        guidePrevBtn: guidePrevBtn,
        guideNextBtn: guideNextBtn,
        guideSkipBtn: guideSkipBtn,
        watchGuideBtn: watchGuideBtn,
        settingsBtn: settingsBtn,
        settingsOverlay: settingsOverlay,
        settingsCloseBtn: settingsCloseBtn,
        settingsTabs: settingsTabs,
        settingsPanels: settingsPanels,
        colorOptions: colorOptions,
        langList: langList,
        resetSettingsBtn: resetSettingsBtn,
        settingsExportBtn: settingsExportBtn,
        settingsImportBtn: settingsImportBtn,
        settingsImportFile: settingsImportFile,
        settingsSubnav: settingsSubnav,
        settingsBody: settingsBody,
        appearanceFonts: appearanceFonts,
        appearanceSizes: appearanceSizes,
        appearanceCinema: document.getElementById('appearanceCinema'),
        appearanceLayout: document.getElementById('appearanceLayout'),
        lyricsControls: lyricsControls,
        shortcutControls: shortcutControls,
        themeControls: themeControls,
        generalControls: generalControls,
        sidebarControls: sidebarControls,
        // v2.1.1: mobile shell / cover / library render hooks
        renderBottomNav: renderBottomNav,
        renderPlayerExt: renderPlayerExt,
        updateMobileNow: updateMobileNow,
        openCoverViewer: openCoverViewer,
        closeCoverViewer: closeCoverViewer,
        openLibrary: openLibrary,
        closeLibrary: closeLibrary
    };
    videoApi = window.__lyricexVideoExport(ctx);
    shareApi = window.__lyricexShare(ctx);
    editorApi = window.__lyricexEditor(ctx);
    // v3.3.0: unified export dialog — actions injected so this controller never
    // imports app-level export code (same pattern as editor's bind(actions)).
    exportApi = window.__lyricexExportDialog({
        t: t,
        get lyrics() {
            return lyrics;
        },
        get offset() {
            return offset;
        },
        get songData() {
            return songData;
        },
        downloadBlob: downloadBlob,
        safePackageName: safePackageName,
        actions: {
            exportPackage: exportPackageZip,
            exportLrc: exportLrc,
            exportSrt: exportSrt,
            exportAss: exportAss,
            openVideo: videoApi.open,
            exportPoster: exportPoster,
            exportNotes: exportNotes,
            printStudy: printStudySheet
        }
    });
    workspaceApi = window.__lyricexWorkspace(ctx);
    searchApi = window.__lyricexSearch(ctx);
    miniApi = window.__lyricexMini(ctx);
    cinemaApi = window.__lyricexCinema(ctx);
    settingsApi = window.__lyricexSettings(ctx);
    aboutApi = window.__lyricexAbout(ctx);
    if (window.__lyricexUpdatesInit) window.__lyricexUpdatesInit(ctx);

    // v3.2.1: the sidebar logo opens 关于 (role=button, keyboard accessible)
    const sidebarBrand = document.getElementById('sidebarBrand');
    if (sidebarBrand) {
        sidebarBrand.addEventListener('click', function () {
            aboutApi.open();
        });
        sidebarBrand.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                aboutApi.open();
            }
        });
    }

    bindMobileEvents();
    init();
})();
