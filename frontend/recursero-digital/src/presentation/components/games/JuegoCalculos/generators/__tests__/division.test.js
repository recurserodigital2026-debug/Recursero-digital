import { describe, it, expect } from 'vitest';
import { dispatch } from '../index';

// ≥1,000-sample constraint coverage per eje (Constitution III / spec SC-002).
// Each eje's describe block is filled as its generator lands (US1–US4).
const SAMPLE_SIZE = 1000;

// Generates SAMPLE_SIZE exercises through the real dispatch (predicate-verified)
// and runs `assert(calc)` on each. dispatch already throws if a predicate fails.
const forEachSample = (config, assert) => {
    for (let i = 0; i < SAMPLE_SIZE; i += 1) {
        const calc = dispatch(config);
        assert(calc);
    }
};

// ---------------------------------------------------------------------------
// División directa (tabla pitagórica) — division_facts
// ---------------------------------------------------------------------------
describe('division_facts', () => {
    const config = { operation: 'division', kind: 'division_facts', maxDivisor: 10, maxQuotient: 10 };
    it(`generates ${SAMPLE_SIZE} exact division facts`, () => {
        forEachSample(config, (calc) => {
            const { dividendo, divisor, cociente } = calc.meta;
            expect(divisor).toBeGreaterThanOrEqual(1);
            expect(divisor).toBeLessThanOrEqual(10);
            expect(cociente).toBeGreaterThanOrEqual(1);
            expect(cociente).toBeLessThanOrEqual(10);
            expect(dividendo % divisor).toBe(0);
            expect(dividendo / divisor).toBe(cociente);
            expect(calc.inputMode).toBe('single');
            expect(calc.respuesta).toBe(cociente);
        });
    });
});

// ---------------------------------------------------------------------------
// US2 — eje 2 (¿alcanza justo o falta?) & eje 5 (resto ≠ 0)
// ---------------------------------------------------------------------------
describe('eje 2 — division_word_remainder', () => {
    const config = {
        operation: 'division', kind: 'division_word_remainder',
        divisorRange: [3, 6], dividendMax: 60, allowExact: true,
    };
    it(`generates ${SAMPLE_SIZE} word problems with valid quotient+remainder and a mix of exact/leftover`, () => {
        let exact = 0;
        let leftover = 0;
        forEachSample(config, (calc) => {
            const { dividendo, divisor, cociente, resto } = calc.meta;
            expect(divisor).toBeGreaterThanOrEqual(3);
            expect(divisor).toBeLessThanOrEqual(6);
            expect(dividendo).toBeLessThanOrEqual(60);
            expect(resto).toBeGreaterThanOrEqual(0);
            expect(resto).toBeLessThan(divisor);
            expect(dividendo).toBe(divisor * cociente + resto);
            expect(calc.inputMode).toBe('quotient_remainder');
            if (resto === 0) exact += 1; else leftover += 1;
        });
        expect(exact).toBeGreaterThan(0);
        expect(leftover).toBeGreaterThan(0);
    });
});

describe('eje 5 — division_with_remainder', () => {
    const config = {
        operation: 'division', kind: 'division_with_remainder',
        divisorRange: [2, 9], dividendMax: 99,
    };
    it(`generates ${SAMPLE_SIZE} exercises with remainder strictly > 0`, () => {
        forEachSample(config, (calc) => {
            const { dividendo, divisor, cociente, resto } = calc.meta;
            expect(divisor).toBeGreaterThanOrEqual(2);
            expect(divisor).toBeLessThanOrEqual(9);
            expect(resto).toBeGreaterThan(0);
            expect(resto).toBeLessThan(divisor);
            expect(dividendo).toBe(divisor * cociente + resto);
            expect(calc.inputMode).toBe('quotient_remainder');
        });
    });
});

// ---------------------------------------------------------------------------
// US3 — eje 6 (÷ 10/100/1000) & eje 7 (cálculos conocidos → nuevos)
// ---------------------------------------------------------------------------
describe('eje 6 — division_by_powers_of_ten', () => {
    const config = {
        operation: 'division', kind: 'division_by_powers_of_ten',
        divisors: [10, 100, 1000], itemsPerExercise: 3,
    };
    it(`generates ${SAMPLE_SIZE} exercises with exact power-of-ten quotients`, () => {
        forEachSample(config, (calc) => {
            expect(calc.inputMode).toBe('multi_blank');
            expect(calc.items).toHaveLength(3);
            calc.items.forEach((it) => {
                expect([10, 100, 1000]).toContain(it.divisor);
                expect(it.dividendo % it.divisor).toBe(0);
                expect(it.respuesta).toBe(it.dividendo / it.divisor);
            });
        });
    });
});

describe('eje 7 — division_scaling', () => {
    const config = {
        operation: 'division', kind: 'division_scaling',
        baseFacts: [[10, 5, 2], [40, 4, 10]], scales: [10, 100],
        derivations: ['scale', 'decompose'], maxAddendMultiple: 2,
    };
    it(`generates ${SAMPLE_SIZE} exercises whose blanks derive from the base fact`, () => {
        forEachSample(config, (calc) => {
            expect(calc.inputMode).toBe('multi_blank');
            const [a, b, c] = calc.meta.baseFact;
            expect(a / b).toBe(c);
            calc.items.forEach((it) => {
                expect(it.dividendo % b).toBe(0);
                expect(it.respuesta).toBe(it.dividendo / b);
            });
        });
    });
});

// ---------------------------------------------------------------------------
// US4 — eje 1 (resta sucesiva) & eje 8 (cálculo aproximado)
// ---------------------------------------------------------------------------
describe('eje 1 — division_repeated_subtraction', () => {
    const config = {
        operation: 'division', kind: 'division_repeated_subtraction',
        groupSizes: [3, 4, 5, 6], maxGroups: 12,
    };
    it(`generates ${SAMPLE_SIZE} exact reparto exercises (answer = #groups)`, () => {
        forEachSample(config, (calc) => {
            const { total, grupo, grupos } = calc.meta;
            expect([3, 4, 5, 6]).toContain(grupo);
            expect(total % grupo).toBe(0);
            expect(total / grupo).toBe(grupos);
            expect(grupos).toBeLessThanOrEqual(12);
            expect(calc.inputMode).toBe('repeated_subtraction');
            expect(calc.respuesta).toBe(grupos);
        });
    });
});

describe('eje 8 — division_estimation', () => {
    const config = {
        operation: 'division', kind: 'division_estimation',
        shapes: ['threshold', 'nearest'], dividendMax: 320, divisorMax: 30,
    };
    it(`generates ${SAMPLE_SIZE} estimation exercises with exactly one correct option`, () => {
        const shapesSeen = new Set();
        forEachSample(config, (calc) => {
            expect(calc.inputMode).toBe('multiple_choice');
            expect(calc.opciones.length).toBeGreaterThanOrEqual(2);
            const correct = calc.opciones.filter((o) => o.valor === calc.respuestaCorrecta);
            expect(correct).toHaveLength(1);
            shapesSeen.add(calc.meta.shape);
        });
        expect(shapesSeen).toEqual(new Set(['threshold', 'nearest']));
    });
});
