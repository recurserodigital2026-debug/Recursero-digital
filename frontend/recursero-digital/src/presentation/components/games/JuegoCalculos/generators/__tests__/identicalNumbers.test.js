import { describe, it, expect } from 'vitest';
import { generate, predicate } from '../identicalNumbers';

const SAMPLE_SIZE = 1000;

describe('identicalNumbers', () => {
    const config = { kind: 'identical_numbers', min: 10, max: 99, operation: 'suma' };

    it(`generates ${SAMPLE_SIZE} identical-operand sums within range`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('suma');
            expect(a).toBe(b);
            expect(a).toBeGreaterThanOrEqual(10);
            expect(a).toBeLessThanOrEqual(99);
            expect(calc.respuesta).toBe(2 * a);
            expect(predicate(calc, config)).toBe(true);
        }
    });

    it('honors a wider range', () => {
        const wideConfig = { kind: 'identical_numbers', min: 100, max: 999, operation: 'suma' };
        for (let i = 0; i < 200; i += 1) {
            const calc = generate(wideConfig);
            expect(calc.meta.operandA).toBeGreaterThanOrEqual(100);
            expect(calc.meta.operandA).toBeLessThanOrEqual(999);
        }
    });
});
