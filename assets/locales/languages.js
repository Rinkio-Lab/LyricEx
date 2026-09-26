/* LyricEx language registry — the single place to add / configure languages.
   The UI language buttons, locale detection and the i18n fallback chain are all
   driven by this list (see assets/locales/index.js).

   Entry shape: { code, native, maintainedBy, fallback, rtl? }
   - code        : BCP 47 language tag, ALL-LOWERCASE (pt-br, not pt-BR); must
                   equal the dict file name assets/locales/<code>.js and the
                   register() key inside it. Browser detection matches the full
                   tag then falls back to shorter prefixes (pt-BR → pt-br → pt).
   - native      : the language's name in its own script (shown on the button).
   - maintainedBy: 'ai'   → zh/ja/en are AI-maintained: whenever a new i18n key
                           is added, ALL THREE are updated in the same change.
                   'user' → your own languages: the AI only scaffolds the dict
                           file (keys with '' values), YOU fill in the strings.
   - fallback    : locale to fall back to when this language is missing a key.
                   The chain is followed recursively (A→B→…), always ending at
                   zh (the terminal fallback), then the raw key itself.
                   null on zh means "terminal".
   - rtl         : optional; set true for right-to-left scripts (ar, he, fa…).
                   Drives <html dir="rtl">; layouts that need mirroring beyond
                   the browser default are handled in layout.css [dir="rtl"].

   ADDING A NEW USER LANGUAGE (e.g. Korean 'ko') — NO index.html edits:
     1. Add one entry below: { code: 'ko', native: '한국어', maintainedBy: 'user',
        fallback: 'en' } (fallback e.g. 'en' → auto-falls through to zh).
     2. Create assets/locales/ko.js by copying the SHAPE of zh.js (keys only,
        values ''), fill in your translations. index.html's locale auto-loader
        picks up the file automatically because the file name equals the code.
     3. Re-run: node tests/i18n-check.mjs (keys parity + fallback tests).
   DO NOT touch zh.js/ja.js/en.js values by hand — the AI keeps them in sync. */
window.__lyricexLanguages = [
    { code: 'zh', native: '简体中文', maintainedBy: 'ai', fallback: null },
    { code: 'ja', native: '日本語', maintainedBy: 'ai', fallback: 'zh' },
    { code: 'en', native: 'English', maintainedBy: 'ai', fallback: 'zh' },
    // ── user-maintained languages go below (fill values yourself) ──────────
    { code: 'ko', native: '한국어', maintainedBy: 'user', fallback: 'en' },
    { code: 'fr', native: 'Français', maintainedBy: 'user', fallback: 'en' },
    { code: 'es', native: 'Español', maintainedBy: 'user', fallback: 'en' },
    { code: 'de', native: 'Deutsch', maintainedBy: 'user', fallback: 'en' },
    { code: 'pt-br', native: 'Português (Brasil)', maintainedBy: 'user', fallback: 'en' },
    { code: 'ru', native: 'Русский', maintainedBy: 'user', fallback: 'en' },
    { code: 'ar', native: 'العربية', maintainedBy: 'user', fallback: 'en', rtl: true },
];
