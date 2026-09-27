/* LyricEx v3.2.0 – update-check unit tests (pure logic: version parse/compare,
   CHANGELOG head parse). Network paths are exercised in e2e with a mocked API. */
globalThis.window = globalThis;
await import('../assets/scripts/updates.js');
const U = globalThis.__lyricexUpdates;
let failures = 0;
function eq(name, got, want) {
    const g = JSON.stringify(got), w = JSON.stringify(want);
    if (g !== w) { failures++; console.error(`FAIL ${name}: got ${g} want ${w}`); }
    else console.log(`ok ${name}`);
}
function ok(name, cond) {
    if (!cond) { failures++; console.error(`FAIL ${name}`); }
    else console.log(`ok ${name}`);
}

eq('parse v-prefixed', U.parseVersion('v3.1.0'), [3, 1, 0]);
eq('parse bare', U.parseVersion('3.2.0'), [3, 2, 0]);
eq('parse junk null', U.parseVersion('latest'), null);
eq('parse empty null', U.parseVersion(''), null);
ok('compare newer', U.compareVersions([3, 2, 0], [3, 1, 0]) > 0);
ok('compare older', U.compareVersions([3, 1, 0], [3, 2, 0]) < 0);
ok('compare equal', U.compareVersions([3, 1, 0], [3, 1, 0]) === 0);
ok('compare patch', U.compareVersions([3, 1, 1], [3, 1, 0]) > 0);
eq('changelog head', U.parseChangelogVersion('## v9.9.9（2026-09-27 · 测试）\n\n### Added\n- x'), 'v9.9.9');
eq('changelog bare head', U.parseChangelogVersion('## 3.0.0 (2026-09-27)'), '3.0.0');
ok('changelog no match null', U.parseChangelogVersion('# Changelog\n\nnothing here') === null);

console.log(failures === 0 ? 'ALL UPDATES TESTS PASSED' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
