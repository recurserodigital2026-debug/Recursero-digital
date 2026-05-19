import { describe, it, expect } from 'vitest';
import {
    digitsOf,
    digitAt,
    hasExactDigits,
    noCarryOnSum,
    noBorrowOnSub,
} from '../predicates';

describe('digitsOf', () => {
    it('returns 1 for zero', () => {
        expect(digitsOf(0)).toBe(1);
    });
    it('returns the correct digit count for positive integers', () => {
        expect(digitsOf(7)).toBe(1);
        expect(digitsOf(10)).toBe(2);
        expect(digitsOf(99)).toBe(2);
        expect(digitsOf(100)).toBe(3);
        expect(digitsOf(9999)).toBe(4);
    });
});

describe('digitAt', () => {
    it('extracts the units digit', () => {
        expect(digitAt(327, 0)).toBe(7);
    });
    it('extracts the tens digit', () => {
        expect(digitAt(327, 1)).toBe(2);
    });
    it('extracts the hundreds digit', () => {
        expect(digitAt(327, 2)).toBe(3);
    });
    it('returns 0 for positions beyond the number', () => {
        expect(digitAt(7, 1)).toBe(0);
        expect(digitAt(7, 5)).toBe(0);
    });
});

describe('hasExactDigits', () => {
    it('accepts numbers with the exact digit count', () => {
        expect(hasExactDigits(50, 2)).toBe(true);
        expect(hasExactDigits(999, 3)).toBe(true);
    });
    it('rejects numbers with too few or too many digits', () => {
        expect(hasExactDigits(5, 2)).toBe(false);
        expect(hasExactDigits(100, 2)).toBe(false);
    });
    it('rejects negatives and non-integers', () => {
        expect(hasExactDigits(-10, 2)).toBe(false);
        expect(hasExactDigits(10.5, 2)).toBe(false);
    });
});

describe('noCarryOnSum', () => {
    it('accepts pairs with no carry at any position', () => {
        expect(noCarryOnSum(27, 42)).toBe(true);   // 7+2=9, 2+4=6
        expect(noCarryOnSum(125, 234)).toBe(true);  // 5+4=9, 2+3=5, 1+2=3
    });
    it('rejects pairs with a carry at any position', () => {
        expect(noCarryOnSum(27, 24)).toBe(false);  // 7+4=11 carries
        expect(noCarryOnSum(55, 55)).toBe(false);  // 5+5=10 carries
        expect(noCarryOnSum(190, 120)).toBe(false); // 9+2=11 carries at tens
    });
    it('handles mixed-digit-count inputs', () => {
        expect(noCarryOnSum(5, 23)).toBe(true);    // 5+3=8, 0+2=2
        expect(noCarryOnSum(7, 23)).toBe(false);   // 7+3=10 carries
    });
});

describe('noBorrowOnSub', () => {
    it('accepts pairs with no borrow at any position', () => {
        expect(noBorrowOnSub(37, 25)).toBe(true);   // 7>=5, 3>=2
        expect(noBorrowOnSub(987, 123)).toBe(true);
    });
    it('rejects pairs requiring a borrow at any position', () => {
        expect(noBorrowOnSub(35, 27)).toBe(false);  // 5<7 borrows
        expect(noBorrowOnSub(523, 178)).toBe(false); // 2<7 borrows at tens
    });
    it('rejects negative results outright', () => {
        expect(noBorrowOnSub(10, 50)).toBe(false);
    });
    it('handles mixed-digit-count inputs', () => {
        expect(noBorrowOnSub(95, 4)).toBe(true);
        expect(noBorrowOnSub(95, 8)).toBe(false);   // 5<8 at units
    });
});
