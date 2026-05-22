import { describe, it, expect } from 'vitest';
import { generate, predicate } from '../freeForm';
import { hasExactDigits } from '../predicates';

const SAMPLE_SIZE = 1000;

describe('freeForm — suma digitCount=2', () => {
    const config = { kind: 'free_form', digitCount: 2, operation: 'suma' };

    it(`generates ${SAMPLE_SIZE} two-digit free-form sums`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('suma');
            expect(hasExactDigits(a, 2)).toBe(true);
            expect(hasExactDigits(b, 2)).toBe(true);
            expect(calc.respuesta).toBe(a + b);
            expect(predicate(calc, config)).toBe(true);
        }
    });
});

describe('freeForm — resta digitCount=2', () => {
    const config = { kind: 'free_form', digitCount: 2, operation: 'resta' };

    it(`generates ${SAMPLE_SIZE} two-digit free-form restas with a >= b`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('resta');
            expect(hasExactDigits(a, 2)).toBe(true);
            expect(hasExactDigits(b, 2)).toBe(true);
            expect(a).toBeGreaterThanOrEqual(b);
            expect(calc.respuesta).toBe(a - b);
            expect(calc.respuesta).toBeGreaterThanOrEqual(0);
            expect(predicate(calc, config)).toBe(true);
        }
    });
});

describe.each([
    { digitCount: 3, operation: 'suma' },
    { digitCount: 3, operation: 'resta' },
    { digitCount: 4, operation: 'suma' },
    { digitCount: 4, operation: 'resta' },
])('freeForm — $operation digitCount=$digitCount', ({ digitCount, operation }) => {
    const config = { kind: 'free_form', digitCount, operation };

    it(`generates ${SAMPLE_SIZE} ${digitCount}-digit ${operation} samples`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation: op } = calc.meta;
            expect(op).toBe(operation);
            expect(hasExactDigits(a, digitCount)).toBe(true);
            expect(hasExactDigits(b, digitCount)).toBe(true);
            if (operation === 'suma') {
                expect(calc.respuesta).toBe(a + b);
            } else {
                expect(a).toBeGreaterThanOrEqual(b);
                expect(calc.respuesta).toBe(a - b);
                expect(calc.respuesta).toBeGreaterThanOrEqual(0);
            }
            expect(predicate(calc, config)).toBe(true);
        }
    });
});
