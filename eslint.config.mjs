/* LyricEx ESLint 9 flat config.
   Runtime scripts are browser IIFE (sourceType 'script'); tests/build scripts
   are ESM under Node. vendor/ is third-party (lint-skipped). Rules stay
   conservative: recommended + safety net, no style pedantry — the project's
   FORMAT.md is the style contract, not a linter rule set. */
import js from '@eslint/js';
import globals from 'globals';

/** globals shared by the browser app scripts (IIFE modules attach to window) */
const appGlobals = {
    ...globals.browser,
    __lyricexLib: 'readonly',
    __lyricexSettings: 'readonly',
    __lyricexI18n: 'readonly',
    __i18n: 'readonly',
    __lyricexLanguages: 'readonly',
    __lyricexChangelog: 'readonly',
    __onLocaleChange: 'readonly',
    JSZip: 'readonly' // vendor/jszip attaches a global
};

const safetyRules = {
    ...js.configs.recommended.rules,
    eqeqeq: ['error', 'smart'], // allow the `== null` nullish idiom
    'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_' // `catch (_) { /* noop */ }` idiom
    }]
};

export default [
    { ignores: ['vendor/**', 'node_modules/**', 'examples/**', 'coverage/**', 'test-results/**', 'playwright-report/**'] },
    {
        files: ['assets/scripts/**/*.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: appGlobals },
        rules: safetyRules
    },
    {
        files: ['tests/**/*.mjs', 'scripts/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.node, ...appGlobals } // DOM-shim suites reference browser globals
        },
        rules: safetyRules
    },
    {
        files: ['eslint.config.mjs', 'playwright.config.mjs'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } },
        rules: safetyRules
    }
];
