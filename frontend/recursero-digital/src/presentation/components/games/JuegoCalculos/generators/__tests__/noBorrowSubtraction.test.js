import { describe, it, expect } from 'vitest';
import { generate, predicate } from '../noBorrowSubtraction';
import { hasExactDigits, noBorrowOnSub } from '../predicates';

const SAMPLE_SIZE = 1000;

describe('noBorrowSubtraction — resta digitCount=2', () => {
    const config = { kind: 'no_borrow_sub', digitCount: 2, operation: 'resta' };

    it(`generates ${SAMPLE_SIZE} two-digit no-borrow subtractions`, () => {
        for (let i = 0; i < SAMPLE_SIZE; i += 1) {
            const calc = generate(config);
            const { operandA: a, operandB: b, operation } = calc.meta;
            expect(operation).toBe('resta');
            expect(hasExactDigits(a, 2)).toBe(true);
            expect(hasExactDigits(b, 2)).toBe(true);
            expect(noBorrowOnSub(a, b)).toBe(true);
            expect(a - b).toBeGreaterThanOrEqual(0);
            expect(calc.respuesta).toBe(a - b);
            expect(predicate(calc, config)).toBe(true);
        }
    });
});

describe.each([{ digitCount: 3 }, { digitCount: 4 }])(
    'noBorrowSubtraction — digitCount=$digitCount',
    ({ digitCount }) => {
        const config = { kind: 'no_borrow_sub', digitCount, operation: 'resta' };

        it(`generates ${SAMPLE_SIZE} ${digitCount}-digit no-borrow subtractions`, () => {
            for (let i = 0; i < SAMPLE_SIZE; i += 1) {
                const calc = generate(config);
                const { operandA: a, operandB: b, operation } = calc.meta;
                expect(operation).toBe('resta');
                expect(hasExactDigits(a, digitCount)).toBe(true);
                expect(hasExactDigits(b, digitCount)).toBe(true);
                expect(noBorrowOnSub(a, b)).toBe(true);
                expect(a - b).toBeGreaterThanOrEqual(0);
                expect(calc.respuesta).toBe(a - b);
                expect(predicate(calc, config)).toBe(true);
            }
        });
    }
);
