import { describe, it, expect } from 'vitest';
import { generate, predicate } from '../wholeMultiples';

const SAMPLE_SIZE = 1000;

describe.each([
    { step: 10, min: 10, max: 90 },
    { step: 100, min: 100, max: 900 },
    { step: 1000, min: 1000, max: 9000 },
])('wholeMultiples — suma step=$step', ({ step, min, max }) => {
    const config = { kind: 'whole_multiples', step, min, max, operation: 'suma' };

    it(`generates ${SAMPLE_SIZE} suma calculations within constraints`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('suma');
            expect(a % step).toBe(0);
            expect(b % step).toBe(0);
            expect(a).toBeGreaterThanOrEqual(min);
            expect(a).toBeLessThanOrEqual(max);
            expect(b).toBeGreaterThanOrEqual(min);
            expect(b).toBeLessThanOrEqual(max);
            expect(calc.respuesta).toBe(a + b);
            expect(predicate(calc, config)).toBe(true);
        }
    });
});

describe.each([
    { step: 10, min: 20, max: 90 },
    { step: 100, min: 200, max: 900 },
    { step: 1000, min: 2000, max: 9000 },
])('wholeMultiples — resta step=$step', ({ step, min, max }) => {
    const config = { kind: 'whole_multiples', step, min, max, operation: 'resta' };

    it(`generates ${SAMPLE_SIZE} resta calculations with a >= b`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('resta');
            expect(a % step).toBe(0);
            expect(b % step).toBe(0);
            expect(a).toBeGreaterThanOrEqual(min);
            expect(a).toBeLessThanOrEqual(max);
            expect(b).toBeGreaterThanOrEqual(min);
            expect(b).toBeLessThanOrEqual(max);
            expect(a).toBeGreaterThanOrEqual(b);
            expect(calc.respuesta).toBe(a - b);
            expect(calc.respuesta).toBeGreaterThanOrEqual(0);
            expect(predicate(calc, config)).toBe(true);
        }
    });
});
