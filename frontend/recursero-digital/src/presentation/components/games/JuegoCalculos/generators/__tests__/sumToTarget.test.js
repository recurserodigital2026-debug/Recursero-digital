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

describe('sumToTarget — invalid input', () => {
    it('throws on an unsupported target', () => {
        expect(() =>
            generate({ kind: 'sum_to_target', target: 250, operation: 'suma' })
        ).toThrow(/target inválido/);
    });
});
