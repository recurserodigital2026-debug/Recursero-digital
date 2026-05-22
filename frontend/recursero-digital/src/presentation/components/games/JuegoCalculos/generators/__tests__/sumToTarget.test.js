import { describe, it, expect } from 'vitest';
import { generate, predicate } from '../sumToTarget';

const SAMPLE_SIZE = 1000;

describe.each([100, 1000, 10000])('sumToTarget — target=%i', (target) => {
    const config = { kind: 'sum_to_target', target, operation: 'suma' };
    const step = target / 10;

    it(`generates ${SAMPLE_SIZE} calculations satisfying every constraint`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('suma');
            expect(a + b).toBe(target);
            expect(a).toBeGreaterThan(0);
            expect(b).toBeGreaterThan(0);
            expect(a).toBeLessThan(target);
            expect(b).toBeLessThan(target);
            expect(a % step).toBe(0);
            expect(b % step).toBe(0);
            expect(calc.respuesta).toBe(target);
            expect(predicate(calc, config)).toBe(true);
        }
    });
});

describe('sumToTarget — targets array', () => {
    const config = { kind: 'sum_to_target', targets: [100, 1000, 10000], operation: 'suma' };

    it(`generates ${SAMPLE_SIZE} calculations covering every target and satisfying the predicate`, () => {
        const seen = new Set();
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('suma');
            expect([100, 1000, 10000]).toContain(calc.respuesta);
            const step = calc.respuesta / 10;
            expect(a + b).toBe(calc.respuesta);
            expect(a).toBeGreaterThan(0);
            expect(b).toBeGreaterThan(0);
            expect(a).toBeLessThan(calc.respuesta);
            expect(b).toBeLessThan(calc.respuesta);
            expect(a % step).toBe(0);
            expect(b % step).toBe(0);
            expect(predicate(calc, config)).toBe(true);
            seen.add(calc.respuesta);
        }
        expect(seen).toEqual(new Set([100, 1000, 10000]));
    });
});

describe('sumToTarget — invalid input', () => {
    it('throws on an unsupported single target', () => {
        expect(() =>
            generate({ kind: 'sum_to_target', target: 250, operation: 'suma' })
        ).toThrow(/target inválido/);
    });
    it('throws on an empty targets array', () => {
        expect(() =>
            generate({ kind: 'sum_to_target', targets: [], operation: 'suma' })
        ).toThrow(/targets vacío/);
    });
    it('throws when targets contains an unsupported value', () => {
        expect(() =>
            generate({ kind: 'sum_to_target', targets: [100, 250], operation: 'suma' })
        ).toThrow(/target inválido en targets/);
    });
});
