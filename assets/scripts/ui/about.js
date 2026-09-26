/* LyricEx v2.0.1 – about / changelog / first-visit guide controllers.
   Groups the three "info overlays": the 关于 page (with its vertical sub-nav),
   the in-app changelog, and the one-time onboarding guide. They share nothing
   but live together because they are all static info surfaces owned by the
   关于 button. Owns guideStep.
   Data flow: app.js instantiates the factory and calls bind() once; openAbout()
   closes settings via ctx.closeSettings() (wired post-creation, mutually with
   js/ui/settings.js). renderGuideIfOpen()/renderChangelogIfOpen() are called by
   app.js's locale-change hook so an open overlay re-localizes.
   Test entry: boot-smoke.mjs (closeGuide is exercised via the first-visit guide). */
(function (root) {
    'use strict';

    root.__lyricexAbout = function (ctx) {
        var t = ctx.t, esc = ctx.esc;
        var aboutBtn = ctx.aboutBtn, aboutOverlay = ctx.aboutOverlay, aboutCloseBtn = ctx.aboutCloseBtn,
            aboutSubnav = ctx.aboutSubnav, aboutBody = ctx.aboutBody,
            changelogBtn = ctx.changelogBtn, changelogOverlay = ctx.changelogOverlay,
            changelogBody = ctx.changelogBody, changelogCloseBtn = ctx.changelogCloseBtn,
            guideOverlay = ctx.guideOverlay, guideBody = ctx.guideBody, guideDots = ctx.guideDots,
            guideCounter = ctx.guideCounter, guidePrevBtn = ctx.guidePrevBtn,
            guideNextBtn = ctx.guideNextBtn, guideSkipBtn = ctx.guideSkipBtn, watchGuideBtn = ctx.watchGuideBtn;

        function openAbout() {
            ctx.closeSettings();
            aboutOverlay.classList.add('open');
            buildAboutSubnav();
        }
        function closeAbout() { aboutOverlay.classList.remove('open'); }

        // Vertical sub-nav for the about page — same interaction as the settings
        // appearance sub-nav: clicking scrolls to the section, scrolling highlights
        // the current section. Reuses the .settings-subnav styles.
        function buildAboutSubnav() {
            const sections = aboutBody ? aboutBody.querySelectorAll('.about-section') : [];
            aboutSubnav.innerHTML = '';
            aboutSubnav.classList.toggle('hidden', sections.length < 2);
            sections.forEach(function (sec) {
                const btn = document.createElement('button');
                btn.className = 'settings-subnav-item';
                btn.textContent = t(sec.dataset.nav || '');
                btn.addEventListener('click', function () {
                    const top = sec.getBoundingClientRect().top -
                        aboutBody.getBoundingClientRect().top +
                        aboutBody.scrollTop - 8;
                    aboutBody.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
                });
                aboutSubnav.appendChild(btn);
            });
            updateAboutSubnavActive();
        }

        function updateAboutSubnavActive() {
            const sections = aboutBody ? aboutBody.querySelectorAll('.about-section') : [];
            const items = aboutSubnav.querySelectorAll('.settings-subnav-item');
            if (!sections.length || !items.length) return;
            const bodyTop = aboutBody.getBoundingClientRect().top;
            let activeIdx = 0;
            for (let i = 0; i < sections.length; i++) {
                if (sections[i].getBoundingClientRect().top - bodyTop <= 96) activeIdx = i;
            }
            items.forEach(function (it, i) { it.classList.toggle('active', i === activeIdx); });
        }

        const CHANGELOG_TYPE_LABELS = {
            added: 'clAdded', changed: 'clChanged', fixed: 'clFixed',
            test: 'clTest', removed: 'clRemoved', breaking: 'clBreaking'
        };

        function renderChangelog() {
            const entries = window.__lyricexChangelog || [];
            let html = '';
            entries.forEach(function (entry) {
                html += '<div class="cl-entry">' +
                    '<div class="cl-head"><span class="cl-version">' + esc(entry.version || '') + '</span>' +
                    '<span class="cl-date">' + esc(entry.date || '') + '</span></div>' +
                    '<ul class="cl-list">';
                (entry.changes || []).forEach(function (c) {
                    const key = CHANGELOG_TYPE_LABELS[c.type] || 'clChanged';
                    html += '<li class="cl-item"><span class="cl-tag ' + esc(c.type || 'changed') + '">' +
                        t(key) + '</span><span class="cl-text">' + esc(c.text || '') + '</span></li>';
                });
                html += '</ul></div>';
            });
            changelogBody.innerHTML = html || ('<div class="cl-empty">' + t('changelogEmpty') + '</div>');
        }

        function openChangelog() {
            renderChangelog();
            changelogOverlay.classList.add('open');
        }
        function closeChangelog() { changelogOverlay.classList.remove('open'); }

        // Shown once on the first load; reopenable anytime from 关于 → 观看指引.
        // Each step is a (icon, title key, desc key) triple rendered with the live
        // locale, so switching language re-localizes an open guide too.
        const GUIDE_STEPS = [
            { icon: 'fa-file-import', titleKey: 'guide1Title', descKey: 'guide1Desc' },
            { icon: 'fa-th-large', titleKey: 'guide2Title', descKey: 'guide2Desc' },
            { icon: 'fa-tv', titleKey: 'guide3Title', descKey: 'guide3Desc' },
            { icon: 'fa-keyboard', titleKey: 'guide4Title', descKey: 'guide4Desc' },
            { icon: 'fa-palette', titleKey: 'guide5Title', descKey: 'guide5Desc' },
            { icon: 'fa-share-alt', titleKey: 'guide6Title', descKey: 'guide6Desc' }
        ];
        let guideStep = 0;

        function renderGuideStep() {
            const s = GUIDE_STEPS[guideStep];
            guideBody.innerHTML =
                '<div class="guide-icon"><i class="fas ' + s.icon + '"></i></div>' +
                '<div class="guide-step-title">' + esc(t(s.titleKey)) + '</div>' +
                '<div class="guide-step-desc">' + esc(t(s.descKey)) + '</div>';
            guideDots.innerHTML = GUIDE_STEPS.map(function (_, i) {
                return '<span class="dot' + (i === guideStep ? ' active' : '') + '"></span>';
            }).join('');
            guideCounter.textContent = (guideStep + 1) + ' / ' + GUIDE_STEPS.length;
            guidePrevBtn.style.display = guideStep === 0 ? 'none' : '';
            guideNextBtn.textContent = guideStep === GUIDE_STEPS.length - 1 ? t('guideDone') : t('guideNext');
        }

        function openGuide() {
            guideStep = 0;
            renderGuideStep();
            guideOverlay.classList.add('open');
        }
        function closeGuide() {
            guideOverlay.classList.remove('open');
            try { localStorage.setItem('lyricex-guide-seen', '1'); } catch (_) { /* noop */ }
        }
        function nextGuide() {
            if (guideStep < GUIDE_STEPS.length - 1) { guideStep++; renderGuideStep(); }
            else closeGuide();
        }
        function prevGuide() {
            if (guideStep > 0) { guideStep--; renderGuideStep(); }
        }

        function bind() {
            aboutBtn.addEventListener('click', openAbout);
            aboutCloseBtn.addEventListener('click', closeAbout);
            aboutOverlay.addEventListener('click', function (e) {
                if (e.target === aboutOverlay) closeAbout();
            });
            aboutBody.addEventListener('scroll', updateAboutSubnavActive, { passive: true });
            changelogBtn.addEventListener('click', openChangelog);
            changelogCloseBtn.addEventListener('click', closeChangelog);
            changelogOverlay.addEventListener('click', function (e) {
                if (e.target === changelogOverlay) closeChangelog();
            });
            watchGuideBtn.addEventListener('click', openGuide);
            guidePrevBtn.addEventListener('click', prevGuide);
            guideNextBtn.addEventListener('click', nextGuide);
            guideSkipBtn.addEventListener('click', closeGuide);
            guideOverlay.addEventListener('click', function (e) {
                if (e.target === guideOverlay) closeGuide();
            });
        }

        return {
            open: openAbout,
            close: closeAbout,
            openGuide: openGuide,
            closeGuide: closeGuide,
            openChangelog: openChangelog,
            closeChangelog: closeChangelog,
            renderGuideIfOpen: function () { if (guideOverlay.classList.contains('open')) renderGuideStep(); },
            renderChangelogIfOpen: function () { if (changelogOverlay.classList.contains('open')) renderChangelog(); },
            bind: bind
        };
    };
})(typeof window !== 'undefined' ? window : globalThis);
