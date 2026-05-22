#!/usr/bin/env node
// Verify that the API serves the expected suma level configs for JuegoCalculos.
// Generator-side correctness is already covered by the Vitest suite
// (frontend/.../JuegoCalculos/{utils.test.js, generators/__tests__/*}); this script
// only asserts the running DB matches what migration 1779321600000 declares.
//
// Usage:
//   API_BASE_URL=http://localhost:3000/api node scripts/verify-suma-levels.mjs
//   (optional) VERIFY_TOKEN=<jwt>  — passed as Authorization: Bearer if set.
//
// Exits 0 on full success, 1 on any mismatch.

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Expected configs by backend level — mirror migration 1779408000000 (merge).
const EXPECTED = {
    1: { kind: 'no_carry_sum', params: { digitCount: 2 } },
    2: { kind: 'whole_multiples', params: { step: 10, min: 10, max: 90 } },
    3: { kind: 'free_form', params: { digitCount: 2 } },
    10: { kind: 'identical_numbers', params: { min: 10, max: 99 } },
    11: { kind: 'sum_to_target', params: { targets: [100, 1000, 10000] } },
};

const PAD = [13, 22, 60];
const fmtRow = (cells) => cells.map((c, i) => String(c).padEnd(PAD[i] || 18)).join(' ');

const fetchLevels = async () => {
    const url = `${API_BASE_URL}/games/game-calculos/levels?onlyActive=true`;
    const headers = VERIFY_TOKEN ? { Authorization: `Bearer ${VERIFY_TOKEN}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
    const body = await res.json();
    if (!Array.isArray(body.levels)) {
        throw new Error(`Unexpected payload shape: ${JSON.stringify(body).slice(0, 200)}`);
    }
    return body.levels;
};

const checkParams = (got, expected) => {
    for (const [k, v] of Object.entries(expected)) {
        const gotVal = got[k];
        const equal = Array.isArray(v) || (v && typeof v === 'object')
            ? JSON.stringify(gotVal) === JSON.stringify(v)
            : gotVal === v;
        if (!equal) return `param ${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(gotVal)}`;
    }
    return null;
};

const main = async () => {
    console.log(`→ GET ${API_BASE_URL}/games/game-calculos/levels?onlyActive=true`);
    const levels = await fetchLevels();
    const sumaLevels = levels.filter((l) => l.config?.operation === 'suma');

    console.log('');
    console.log(fmtRow(['backend lvl', 'kind', 'status']));
    console.log(fmtRow(['-----------', '----', '------']));

    let failures = 0;
    const seen = new Set();

    for (const [lvlStr, exp] of Object.entries(EXPECTED)) {
        const lvl = Number(lvlStr);
        const row = levels.find((l) => l.level === lvl);
        seen.add(lvl);

        if (!row) {
            console.log(fmtRow([lvl, '—', 'MISSING ROW']));
            failures += 1;
            continue;
        }
        if (row.config?.kind !== exp.kind) {
            console.log(fmtRow([lvl, row.config?.kind ?? '∅', `expected kind=${exp.kind}`]));
            failures += 1;
            continue;
        }
        const paramErr = checkParams(row.config, exp.params);
        if (paramErr) {
            console.log(fmtRow([lvl, exp.kind, paramErr]));
            failures += 1;
            continue;
        }
        console.log(fmtRow([lvl, exp.kind, 'ok']));
    }

    const extra = sumaLevels.filter((l) => !seen.has(l.level));
    if (extra.length) {
        console.log('');
        console.log(`! Unexpected extra suma level rows: ${extra.map((l) => l.level).join(', ')}`);
        failures += extra.length;
    }

    console.log('');
    if (failures === 0) {
        console.log('✓ All 5 suma levels verified.');
        process.exit(0);
    } else {
        console.log(`✗ ${failures} failure(s).`);
        process.exit(1);
    }
};

main().catch((err) => {
    console.error('verify-suma-levels failed:', err);
    process.exit(1);
});
