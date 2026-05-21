import { describe, it, expect } from 'vitest';
import { generate, predicate } from '../noCarryAddition';
import { hasExactDigits, noCarryOnSum } from '../predicates';

const SAMPLE_SIZE = 1000;

describe('noCarryAddition — digitCount=2', () => {
    const config = { kind: 'no_carry_sum', digitCount: 2, operation: 'suma' };

    it(`generates ${SAMPLE_SIZE} two-digit sums with no carry`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('suma');
            expect(hasExactDigits(a, 2)).toBe(true);
            expect(hasExactDigits(b, 2)).toBe(true);
            expect(noCarryOnSum(a, b)).toBe(true);
            expect(calc.respuesta).toBe(a + b);
            expect(predicate(calc, config)).toBe(true);
        }
    });
});

describe.each([{ digitCount: 3 }, { digitCount: 4 }])(
    'noCarryAddition — digitCount=$digitCount',
    ({ digitCount }) => {
        const config = { kind: 'no_carry_sum', digitCount, operation: 'suma' };

        it(`generates ${SAMPLE_SIZE} ${digitCount}-digit sums with no carry`, () => {
            for (let i = 0; i < SAMPLE_SIZE; i += 1) {
                const calc = generate(config);
                const { operandA: a, operandB: b, operation } = calc.meta;
                expect(operation).toBe('suma');
                expect(hasExactDigits(a, digitCount)).toBe(true);
                expect(hasExactDigits(b, digitCount)).toBe(true);
                expect(noCarryOnSum(a, b)).toBe(true);
                expect(calc.respuesta).toBe(a + b);
                expect(predicate(calc, config)).toBe(true);
            }
        });
    }
);
