/* LyricEx v2.0.1 – settings UI controller.
   Owns the "设置" overlay: the schema-driven control renderer, the appearance
   sub-nav, the sidebar-visibility controls, the theme custom controls (accent /
   per-POS colors / presets), and the modal's tab/color/language bindings.
   NOTE: the settings STATE and its effect functions (loadSettings / applySettings
   / setSetting / resetSettings…) stay in app.js — they are core infrastructure
   read by every module, not a view. This module only renders controls and calls
   those functions through ctx.
   Data flow: app.js instantiates the factory and calls bind() once; openSettings()
   closes about via ctx.closeAbout() (wired post-creation, mutually with
   js/ui/about.js). renderControls()/applySidebarVisibility() are called from
   app.js on locale change / reset / init.
   Test entry: boot-smoke.mjs (renderSettingControls is run during init). */
(function (root) {
    'use strict';

    root.__lyricexSettings = function (ctx) {
        var t = ctx.t;
        var settingsBtn = ctx.settingsBtn, settingsOverlay = ctx.settingsOverlay, settingsCloseBtn = ctx.settingsCloseBtn,
            settingsTabs = ctx.settingsTabs, settingsPanels = ctx.settingsPanels, colorOptions = ctx.colorOptions,
            resetSettingsBtn = ctx.resetSettingsBtn,
            settingsSubnav = ctx.settingsSubnav, settingsBody = ctx.settingsBody,
            appearanceFonts = ctx.appearanceFonts, appearanceSizes = ctx.appearanceSizes,
            appearanceCinema = ctx.appearanceCinema, appearanceLayout = ctx.appearanceLayout,
            lyricsControls = ctx.lyricsControls,
            themeControls = ctx.themeControls, generalControls = ctx.generalControls,
            sidebarControls = ctx.sidebarControls;

        // v1.6.1: appearance rows are grouped into sections ('fonts' / 'sizes') so
        // the appearance panel can carry a vertical sub-nav (see index.html).
        const SETTING_DEFS = [
            { group: 'appearance', section: 'fonts', key: 'lyricFont', type: 'select', labelKey: 'lyricFont',
                options: [['jp', 'fontJp'], ['inherit', 'fontInherit'], ['sans', 'fontSans'], ['serif', 'fontSerif'], ['mono', 'fontMono']] },
            { group: 'appearance', section: 'fonts', key: 'lyricFontCustom', type: 'text', labelKey: 'fontCustom', placeholderKey: 'fontCustomPlaceholder' },
            { group: 'appearance', section: 'fonts', key: 'translationFont', type: 'select', labelKey: 'translationFont',
                options: [['sc', 'fontSc'], ['inherit', 'fontInherit'], ['sans', 'fontSans'], ['serif', 'fontSerif'], ['mono', 'fontMono']] },
            { group: 'appearance', section: 'fonts', key: 'translationFontCustom', type: 'text', labelKey: 'fontCustom', placeholderKey: 'fontCustomPlaceholder' },
            { group: 'appearance', section: 'fonts', key: 'uiFont', type: 'select', labelKey: 'uiFont',
                options: [['default', 'fontDefault'], ['sans', 'fontSans'], ['serif', 'fontSerif'], ['mono', 'fontMono']] },
            { group: 'appearance', section: 'fonts', key: 'uiFontCustom', type: 'text', labelKey: 'fontCustom', placeholderKey: 'fontCustomPlaceholder' },
            { group: 'appearance', section: 'fonts', key: 'lyricWeight', type: 'select', labelKey: 'lyricWeight',
                options: [['regular', 'weightRegular'], ['bold', 'weightBold']] },
            { group: 'appearance', section: 'sizes', key: 'lyricSize', type: 'range', min: 14, max: 40, step: 1, unit: ' px', labelKey: 'lyricSize' },
            { group: 'appearance', section: 'sizes', key: 'lyricLineHeight', type: 'range', min: 1.2, max: 3, step: 0.1, unit: '', labelKey: 'lyricLineHeight' },
            { group: 'appearance', section: 'sizes', key: 'translationSize', type: 'range', min: 10, max: 24, step: 1, unit: ' px', labelKey: 'translationSize' },
            { group: 'appearance', section: 'sizes', key: 'translationLineHeight', type: 'range', min: 1, max: 2.5, step: 0.1, unit: '', labelKey: 'translationLineHeight' },
            // v1.6.0: per-view / per-element sizes
            { group: 'appearance', section: 'sizes', key: 'mixedLyricSize', type: 'range', min: 14, max: 36, step: 1, unit: ' px', labelKey: 'mixedLyricSize' },
            { group: 'appearance', section: 'sizes', key: 'cinemaLyricSize', type: 'range', min: 18, max: 60, step: 1, unit: ' px', labelKey: 'cinemaLyricSize' },
            { group: 'appearance', section: 'sizes', key: 'studyLineSize', type: 'range', min: 14, max: 40, step: 1, unit: ' px', labelKey: 'studyLineSize' },
            { group: 'appearance', section: 'sizes', key: 'studyTableSize', type: 'range', min: 11, max: 22, step: 1, unit: ' px', labelKey: 'studyTableSize' },
            { group: 'appearance', section: 'sizes', key: 'timeTagSize', type: 'range', min: 9, max: 18, step: 1, unit: ' px', labelKey: 'timeTagSize' },
            { group: 'appearance', section: 'sizes', key: 'editorTextSize', type: 'range', min: 11, max: 24, step: 1, unit: ' px', labelKey: 'editorTextSize' },
            { group: 'appearance', section: 'sizes', key: 'furiganaSize', type: 'range', min: 10, max: 24, step: 1, unit: ' px', labelKey: 'furiganaSize' },
            { group: 'lyrics', key: 'subLine', type: 'select', labelKey: 'subLine',
                options: [['auto', 'subLineAuto'], ['translation', 'subLineTranslation'], ['romaji', 'subLineRomaji'], ['off', 'subLineOff']] },
            { group: 'lyrics', key: 'showFurigana', type: 'toggle', labelKey: 'furigana' },
            { group: 'lyrics', key: 'showRuby', type: 'toggle', labelKey: 'showRuby' },
            { group: 'lyrics', key: 'wordKaraoke', type: 'toggle', labelKey: 'wordKaraoke' },
            { group: 'lyrics', key: 'spectrum', type: 'toggle', labelKey: 'spectrum' },
            { group: 'general', key: 'defaultView', type: 'select', labelKey: 'defaultView',
                options: [['lyrics', 'lyrics'], ['study', 'study'], ['mixed', 'mixed']] },
            { group: 'general', key: 'animations', type: 'toggle', labelKey: 'animations' },
            { group: 'general', key: 'animationSpeed', type: 'select', labelKey: 'animationSpeed',
                options: [['slow', 'animSpeedSlow'], ['normal', 'animSpeedNormal'], ['fast', 'animSpeedFast']] },
            // v2.0.5: per-line audition behavior (pause + progress snap)
            { group: 'general', key: 'auditionAutoPause', type: 'toggle', labelKey: 'auditionAutoPause' },
            // v2.3.1: text-direction override (easter-egg / power feature)
            { group: 'general', key: 'directionMode', type: 'select', labelKey: 'directionMode',
                options: [['auto', 'directionAuto'], ['rtl', 'directionRtl'], ['ltr', 'directionLtr']] },
            { group: 'general', key: 'auditionSnap', type: 'select', labelKey: 'auditionSnap',
                options: [['none', 'snapNone'], ['start', 'snapStart'], ['end', 'snapEnd']] },
            // v2.1.1: cinema backdrop effects (外观 → 影院)
            { group: 'appearance', section: 'cinema', key: 'cinemaUseCover', type: 'toggle', labelKey: 'cinemaUseCover' },
            { group: 'appearance', section: 'cinema', key: 'cinemaBlur', type: 'range', min: 0, max: 40, step: 1, unit: ' px', labelKey: 'cinemaBlur' },
            { group: 'appearance', section: 'cinema', key: 'cinemaBrightness', type: 'range', min: 40, max: 160, step: 5, unit: ' %', labelKey: 'cinemaBrightness' },
            { group: 'appearance', section: 'cinema', key: 'cinemaContrast', type: 'range', min: 40, max: 160, step: 5, unit: ' %', labelKey: 'cinemaContrast' },
            { group: 'appearance', section: 'cinema', key: 'cinemaSaturate', type: 'range', min: 0, max: 200, step: 5, unit: ' %', labelKey: 'cinemaSaturate' },
            { group: 'appearance', section: 'cinema', key: 'cinemaDarken', type: 'range', min: 0, max: 80, step: 5, unit: ' %', labelKey: 'cinemaDarken' },
            { group: 'appearance', section: 'cinema', key: 'cinemaBorder', type: 'range', min: 0, max: 12, step: 1, unit: ' px', labelKey: 'cinemaBorder' },
            { group: 'appearance', section: 'cinema', key: 'cinemaGlass', type: 'range', min: 0, max: 100, step: 5, unit: ' %', labelKey: 'cinemaGlass' }
        ];

        // Each sidebar entry (except Settings, which is always shown) can be hidden
        // from 设置 → 通用. [item-id, i18n-key]; order matches the sidebar groups.
        const SIDEBAR_ITEMS = [
            ['lyrics', 'lyrics'], ['study', 'study'], ['mixed', 'mixed'], ['editor', 'editor'],
            ['cinema', 'cinemaMode'], ['mini', 'miniMode'],
            ['theme', 'darkMode'], ['about', 'about']
        ];

        // v2.4.1: leading FA icon per setting row so options are scannable at a
        // glance. Keyed by setting key / sidebar id / player-extension id.
        const SETTING_ICONS = {
            lyricFont: 'fa-font', lyricFontCustom: 'fa-font', lyricWeight: 'fa-bold',
            translationFont: 'fa-language', translationFontCustom: 'fa-language',
            uiFont: 'fa-desktop', uiFontCustom: 'fa-desktop',
            lyricSize: 'fa-text-height', lyricLineHeight: 'fa-text-height',
            translationSize: 'fa-text-height', translationLineHeight: 'fa-text-height',
            mixedLyricSize: 'fa-text-height', cinemaLyricSize: 'fa-text-height',
            studyLineSize: 'fa-text-height', studyTableSize: 'fa-text-height',
            timeTagSize: 'fa-text-height', editorTextSize: 'fa-text-height',
            furiganaSize: 'fa-text-height',
            subLine: 'fa-align-left', showFurigana: 'fa-italic', showRuby: 'fa-language',
            wordKaraoke: 'fa-music', spectrum: 'fa-wave-square',
            defaultView: 'fa-th-large', animations: 'fa-magic',
            animationSpeed: 'fa-tachometer-alt', auditionAutoPause: 'fa-pause-circle',
            directionMode: 'fa-arrows-alt-h', auditionSnap: 'fa-crosshairs',
            cinemaUseCover: 'fa-image', cinemaBlur: 'fa-tint',
            cinemaBrightness: 'fa-sun', cinemaContrast: 'fa-adjust',
            cinemaSaturate: 'fa-palette', cinemaDarken: 'fa-moon',
            cinemaBorder: 'fa-border-none', cinemaGlass: 'fa-window-restore'
        };
        const SIDEBAR_ICONS = {
            lyrics: 'fa-music', study: 'fa-book', mixed: 'fa-layer-group', editor: 'fa-edit',
            cinema: 'fa-tv', mini: 'fa-window-minimize', theme: 'fa-moon', about: 'fa-info-circle'
        };
        const EXT_ICONS = {
            vol: 'fa-volume-up', speed: 'fa-tachometer-alt', transpose: 'fa-sliders-h',
            ab: 'fa-redo-alt', marks: 'fa-bookmark', share: 'fa-share-alt'
        };
        function labelWithIcon(icon, text) {
            const label = document.createElement('label');
            label.className = 'setting-label';
            if (icon) {
                const ic = document.createElement('i');
                ic.className = 'fas ' + icon;
                label.appendChild(ic);
            }
            label.appendChild(document.createTextNode(text));
            return label;
        }

        function applySidebarVisibility() {
            SIDEBAR_ITEMS.forEach(function (item) {
                const btn = document.querySelector('[data-sidebar-item="' + item[0] + '"]');
                if (btn) btn.style.display = ctx.settings.sidebar[item[0]] ? '' : 'none';
            });
            // collapse a section (label included) once every button in it is hidden
            document.querySelectorAll('.sidebar-section').forEach(function (sec) {
                const btns = sec.querySelectorAll('.sidebar-btn');
                if (!btns.length) return;
                let anyVisible = false;
                btns.forEach(function (b) { if (b.style.display !== 'none') anyVisible = true; });
                sec.style.display = anyVisible ? '' : 'none';
            });
        }

        function renderSidebarControls() {
            sidebarControls.innerHTML = '';
            const h = document.createElement('h4');
            h.textContent = t('sidebarVisibility');
            sidebarControls.appendChild(h);
            SIDEBAR_ITEMS.forEach(function (item) {
                const row = document.createElement('div');
                row.className = 'setting-row';
                row.appendChild(labelWithIcon(SIDEBAR_ICONS[item[0]], t(item[1])));
                const box = document.createElement('input');
                box.type = 'checkbox';
                // v2.5.0: label is a sibling, not a wrapper — bind via aria-label
                box.setAttribute('aria-label', t(item[1]));
                box.checked = !!ctx.settings.sidebar[item[0]];
                box.addEventListener('change', function () {
                    ctx.settings.sidebar[item[0]] = box.checked;
                    ctx.saveSettings();
                    applySidebarVisibility();
                });
                row.appendChild(box);
                sidebarControls.appendChild(row);
            });
        }

        function renderSettingControls() {
            appearanceFonts.innerHTML = '';
            appearanceSizes.innerHTML = '';
            lyricsControls.innerHTML = '';
            generalControls.innerHTML = '';
            SETTING_DEFS.forEach(function (def) {
                const host = def.group === 'appearance'
                    ? (def.section === 'fonts' ? appearanceFonts : def.section === 'sizes' ? appearanceSizes : appearanceCinema)
                    : (def.group === 'general' ? generalControls : lyricsControls);
                const row = document.createElement('div');
                row.className = 'setting-row';
                row.appendChild(labelWithIcon(SETTING_ICONS[def.key], t(def.labelKey)));
                const val = ctx.getSetting(def.key);
                if (def.type === 'select') {
                    const sel = document.createElement('select');
                    def.options.forEach(function (opt) {
                        const o = document.createElement('option');
                        o.value = opt[0];
                        o.textContent = t(opt[1]);
                        sel.appendChild(o);
                    });
                    sel.value = String(val);
                    sel.setAttribute('aria-label', t(def.labelKey));
                    sel.addEventListener('change', function () { ctx.setSetting(def.key, sel.value); });
                    row.appendChild(sel);
                } else if (def.type === 'text') {
                    const inp = document.createElement('input');
                    inp.type = 'text';
                    inp.value = val || '';
                    inp.placeholder = t(def.placeholderKey || '');
                    inp.setAttribute('aria-label', t(def.labelKey));
                    inp.addEventListener('change', function () { ctx.setSetting(def.key, inp.value.trim()); });
                    row.appendChild(inp);
                } else if (def.type === 'range') {
                    const inp = document.createElement('input');
                    inp.type = 'range';
                    inp.min = def.min;
                    inp.max = def.max;
                    inp.step = def.step;
                    inp.value = val;
                    inp.setAttribute('aria-label', t(def.labelKey));
                    const out = document.createElement('span');
                    out.className = 'setting-value';
                    out.textContent = val + (def.unit || '');
                    inp.addEventListener('input', function () {
                        out.textContent = inp.value + (def.unit || '');
                        ctx.setSetting(def.key, parseFloat(inp.value));
                    });
                    row.appendChild(inp);
                    row.appendChild(out);
                } else if (def.type === 'toggle') {
                    const box = document.createElement('input');
                    box.type = 'checkbox';
                    box.setAttribute('aria-label', t(def.labelKey));
                    box.checked = !!val;
                    box.addEventListener('change', function () { ctx.setSetting(def.key, box.checked); });
                    row.appendChild(box);
                }
                host.appendChild(row);
            });
            renderThemeControls();
            renderSidebarControls();
            renderLayoutControls();
            buildSettingsSubnav();
        }

        // v2.1.1: 外观 → 布局 — bottom-nav pin slots + pinned player extensions.
        // These are array-valued settings, so they render here (not via
        // SETTING_DEFS which is scalar-only) and write back to the arrays.
        const NAV_SLOT_OPTS = [
            ['lyrics', 'lyrics'], ['study', 'study'], ['mixed', 'mixed'],
            ['editor', 'editor'], ['cinema', 'cinemaMode'], ['mini', 'miniMode']
        ];
        const EXT_OPTS = [
            ['vol', 'volumeLabel'], ['speed', 'speed'], ['transpose', 'transpose'],
            ['ab', 'abLoop'], ['marks', 'loopMarks'], ['share', 'shareCard']
        ];
        function renderLayoutControls() {
            appearanceLayout.innerHTML = '';
            const navHint = document.createElement('p');
            navHint.className = 'settings-desc';
            navHint.textContent = t('bottomNavHint');
            appearanceLayout.appendChild(navHint);
            const nav = ctx.settings.bottomNav || [];
            for (let i = 0; i < 4; i++) {
                const row = document.createElement('div');
                row.className = 'setting-row';
                row.appendChild(labelWithIcon('fa-th-large', t('bottomNavSlot' + (i + 1))));
                const sel = document.createElement('select');
                NAV_SLOT_OPTS.forEach(function (o) {
                    const opt = document.createElement('option');
                    opt.value = o[0];
                    opt.textContent = t(o[1]);
                    sel.appendChild(opt);
                });
                sel.value = nav[i] || 'lyrics';
                sel.setAttribute('aria-label', t('bottomNavSlot' + (i + 1)));
                const slotIdx = i;
                sel.addEventListener('change', function () {
                    const cur = (ctx.settings.bottomNav || []).slice();
                    cur[slotIdx] = sel.value;
                    ctx.settings.bottomNav = cur;
                    ctx.saveSettings();
                    if (ctx.renderBottomNav) ctx.renderBottomNav();
                });
                row.appendChild(sel);
                appearanceLayout.appendChild(row);
            }
            const extHint = document.createElement('p');
            extHint.className = 'settings-desc';
            extHint.textContent = t('playerExtHint');
            appearanceLayout.appendChild(extHint);
            const pinned = ctx.settings.playerExt || [];
            EXT_OPTS.forEach(function (o) {
                const row = document.createElement('div');
                row.className = 'setting-row';
                row.appendChild(labelWithIcon(EXT_ICONS[o[0]], t(o[1])));
                const box = document.createElement('input');
                box.type = 'checkbox';
                box.setAttribute('aria-label', t(o[1]));
                box.checked = pinned.indexOf(o[0]) !== -1;
                box.addEventListener('change', function () {
                    const cur = (ctx.settings.playerExt || []).slice();
                    const at = cur.indexOf(o[0]);
                    if (box.checked && at === -1) cur.push(o[0]);
                    if (!box.checked && at !== -1) cur.splice(at, 1);
                    ctx.settings.playerExt = cur;
                    ctx.saveSettings();
                    if (ctx.renderPlayerExt) ctx.renderPlayerExt();
                });
                row.appendChild(box);
                appearanceLayout.appendChild(row);
            });
        }

        // Vertical "tabs inside a tab": each settings panel may declare multiple
        // .settings-section blocks; the sub-nav lists them on the left and scrolls
        // the (still fully scrollable) body to the picked section. Panels with
        // fewer than two sections show no nav.
        function buildSettingsSubnav() {
            const panel = document.querySelector('.settings-panel.active');
            const sections = panel ? panel.querySelectorAll('.settings-section') : [];
            settingsSubnav.innerHTML = '';
            settingsSubnav.classList.toggle('hidden', sections.length < 2);
            sections.forEach(function (sec) {
                const btn = document.createElement('button');
                btn.className = 'settings-subnav-item';
                btn.textContent = t(sec.dataset.nav || '');
                btn.addEventListener('click', function () {
                    const top = sec.getBoundingClientRect().top -
                        settingsBody.getBoundingClientRect().top +
                        settingsBody.scrollTop - 8;
                    settingsBody.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
                });
                settingsSubnav.appendChild(btn);
            });
            updateSubnavActive();
        }

        function updateSubnavActive() {
            const panel = document.querySelector('.settings-panel.active');
            const sections = panel ? panel.querySelectorAll('.settings-section') : [];
            const items = settingsSubnav.querySelectorAll('.settings-subnav-item');
            if (!sections.length || !items.length) return;
            const bodyTop = settingsBody.getBoundingClientRect().top;
            let activeIdx = 0;
            for (let i = 0; i < sections.length; i++) {
                if (sections[i].getBoundingClientRect().top - bodyTop <= 96) activeIdx = i;
            }
            items.forEach(function (it, i) { it.classList.toggle('active', i === activeIdx); });
        }

        function loadThemePresets() {
            try { return JSON.parse(localStorage.getItem('lyricex-theme-presets') || '{}'); } catch (_) { return {}; }
        }
        function saveThemePresets(p) {
            try { localStorage.setItem('lyricex-theme-presets', JSON.stringify(p)); } catch (_) { /* noop */ }
        }
        function captureThemePreset() {
            return {
                colorTheme: ctx.settings.colorTheme,
                customAccent: ctx.settings.customAccent,
                posColors: JSON.parse(JSON.stringify(ctx.settings.posColors))
            };
        }
        function applyThemePreset(name) {
            const presets = loadThemePresets();
            const p = presets[name];
            if (!p) return;
            ctx.settings.colorTheme = p.colorTheme || 'default';
            ctx.settings.customAccent = p.customAccent || '#8a7a6a';
            if (p.posColors) ctx.settings.posColors = JSON.parse(JSON.stringify(p.posColors));
            ctx.saveSettings();
            ctx.applySettings();
        }

        function colorRow(icon, labelText, value, onInput, onClear) {
            const row = document.createElement('div');
            row.className = 'theme-control-row';
            const label = labelWithIcon(icon, labelText);
            const picker = document.createElement('input');
            picker.type = 'color';
            picker.value = value || '#000000';
            picker.setAttribute('aria-label', labelText);
            picker.addEventListener('input', function () { onInput(picker.value); });
            const clearBtn = document.createElement('button');
            clearBtn.className = 'mini-btn';
            clearBtn.textContent = t('accentReset');
            clearBtn.addEventListener('click', function () { onClear(); renderThemeControls(); });
            // v2.5.0: the label was created but never mounted (v2.4.1 icon refactor
            // dropped the append) — theme color rows showed pickers with no label
            row.appendChild(label);
            row.appendChild(picker);
            row.appendChild(clearBtn);
            return row;
        }

        function renderThemeControls() {
            themeControls.innerHTML = '';

            // custom accent
            themeControls.appendChild(colorRow(
                'fa-palette', t('customAccent'), ctx.settings.customAccent,
                function (v) {
                    ctx.settings.colorTheme = 'custom';
                    ctx.settings.customAccent = v;
                    ctx.saveSettings();
                    ctx.applySettings();
                },
                function () { ctx.setSetting('colorTheme', 'default'); }
            ));

            // per-POS colors
            const posDefs = [
                ['romaji', 'posColorRomaji'], ['hiragana', 'posColorHiragana'],
                ['kanji', 'posColorKanji'], ['pos', 'posColorPos'], ['meaning', 'posColorMeaning']
            ];
            const posHeader = document.createElement('h4');
            posHeader.textContent = t('posColors');
            themeControls.appendChild(posHeader);
            posDefs.forEach(function (def) {
                const key = def[0];
                themeControls.appendChild(colorRow(
                    'fa-tint', t(def[1]), ctx.settings.posColors[key] || '#888888',
                    function (v) {
                        ctx.settings.posColors[key] = v;
                        ctx.saveSettings();
                        ctx.applyPosColors();
                    },
                    function () {
                        ctx.settings.posColors[key] = '';
                        ctx.saveSettings();
                        ctx.applyPosColors();
                    }
                ));
            });

            // theme presets (config groups)
            const presets = loadThemePresets();
            const names = Object.keys(presets);
            const header = document.createElement('h4');
            header.textContent = t('themePresets');
            themeControls.appendChild(header);

            const presetBox = document.createElement('div');
            presetBox.className = 'theme-preset-row';
            const line1 = document.createElement('div');
            line1.className = 'preset-row-line';
            const line2 = document.createElement('div');
            line2.className = 'preset-row-line';

            const sel = document.createElement('select');
            sel.setAttribute('aria-label', t('themePresets'));
            if (!names.length) {
                const o = document.createElement('option');
                o.value = '';
                o.textContent = t('noPresets');
                sel.appendChild(o);
            }
            names.forEach(function (n) {
                const o = document.createElement('option');
                o.value = n;
                o.textContent = n;
                sel.appendChild(o);
            });
            const delBtn = document.createElement('button');
            delBtn.className = 'preset-btn preset-del-btn';
            delBtn.textContent = t('deletePreset');
            delBtn.disabled = !sel.value;
            sel.addEventListener('change', function () {
                delBtn.disabled = !sel.value;
                if (sel.value) applyThemePreset(sel.value);
            });
            delBtn.addEventListener('click', function () {
                if (!sel.value) return;
                const presetsNow = loadThemePresets();
                delete presetsNow[sel.value];
                saveThemePresets(presetsNow);
                renderThemeControls();
            });
            line1.appendChild(sel);
            line1.appendChild(delBtn);

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = t('presetNamePlaceholder');
            nameInput.setAttribute('aria-label', t('presetNamePlaceholder'));
            const saveBtn = document.createElement('button');
            saveBtn.className = 'preset-btn preset-save-btn';
            saveBtn.textContent = t('savePreset');
            saveBtn.addEventListener('click', function () {
                const name = nameInput.value.trim();
                if (!name) { alert(t('presetNameRequired')); return; }
                const presetsNow = loadThemePresets();
                presetsNow[name] = captureThemePreset();
                saveThemePresets(presetsNow);
                renderThemeControls();
            });
            line2.appendChild(nameInput);
            line2.appendChild(saveBtn);

            presetBox.appendChild(line1);
            presetBox.appendChild(line2);
            themeControls.appendChild(presetBox);
        }

        function openSettings() {
            ctx.closeAbout();
            settingsOverlay.classList.add('open');
            renderSettingControls();
            ctx.renderShortcutControls();
            switchSettingsTab('general'); // v1.6.1: general is the first screen
        }
        function closeSettings() { settingsOverlay.classList.remove('open'); }

        function switchSettingsTab(tabName) {
            settingsTabs.forEach(function (tab) {
                tab.classList.toggle('active', tab.dataset.tab === tabName);
            });
            settingsPanels.forEach(function (panel) {
                panel.classList.toggle('active', panel.dataset.panel === tabName);
            });
            settingsBody.scrollTop = 0; // fresh panel starts at its top
            buildSettingsSubnav();
        }

        function bind() {
            settingsBtn.addEventListener('click', openSettings);
            settingsCloseBtn.addEventListener('click', closeSettings);
            settingsOverlay.addEventListener('click', function (e) {
                if (e.target === settingsOverlay) closeSettings();
            });
            resetSettingsBtn.addEventListener('click', function () { ctx.resetSettings(); });
            settingsBody.addEventListener('scroll', updateSubnavActive, { passive: true });
            settingsTabs.forEach(function (tab) {
                tab.addEventListener('click', function () {
                    switchSettingsTab(this.dataset.tab);
                });
            });
            colorOptions.forEach(function (opt) {
                opt.addEventListener('click', function () {
                    ctx.setSetting('colorTheme', opt.dataset.color);
                });
            });
            // Language drawer + row are rendered and bound by app.js
            // (renderLangOptions / langChangeBtn); nothing to bind here.
        }

        return {
            open: openSettings,
            close: closeSettings,
            renderControls: renderSettingControls,
            applySidebarVisibility: applySidebarVisibility,
            renderSidebarControls: renderSidebarControls,
            renderThemeControls: renderThemeControls,
            switchTab: switchSettingsTab,
            bind: bind
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
