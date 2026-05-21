import { describe, it, expect } from 'vitest';
import * as freeForm from '../freeForm';
import * as noBorrowSubtraction from '../noBorrowSubtraction';
import * as noCarryAddition from '../noCarryAddition';
import * as identicalNumbers from '../identicalNumbers';
import * as wholeMultiples from '../wholeMultiples';
import * as sumToTarget from '../sumToTarget';

describe('validation — generate throws on invalid config', () => {
    it('freeForm rejects digitCount outside {2,3,4}', () => {
        expect(() => freeForm.generate({ digitCount: 1, operation: 'suma' })).toThrow(/digitCount inválido/);
        expect(() => freeForm.generate({ digitCount: 5, operation: 'suma' })).toThrow(/digitCount inválido/);
    });

    it('freeForm rejects unknown operation', () => {
        expect(() => freeForm.generate({ digitCount: 2, operation: 'multi' })).toThrow(/operación inválida/);
    });

    it('noBorrowSubtraction rejects digitCount outside {2,3,4}', () => {
        expect(() => noBorrowSubtraction.generate({ digitCount: 1 })).toThrow(/digitCount inválido/);
        expect(() => noBorrowSubtraction.generate({ digitCount: 5 })).toThrow(/digitCount inválido/);
    });

    it('noCarryAddition rejects digitCount outside {2,3,4}', () => {
        expect(() => noCarryAddition.generate({ digitCount: 1 })).toThrow(/digitCount inválido/);
    });

    it('identicalNumbers rejects max < min', () => {
        expect(() => identicalNumbers.generate({ min: 100, max: 10 })).toThrow(/rango inválido/);
    });

    it('wholeMultiples rejects unknown operation', () => {
        expect(() => wholeMultiples.generate({ step: 10, min: 10, max: 90, operation: 'multi' })).toThrow(/operación inválida/);
    });

    it('sumToTarget rejects unsupported target', () => {
        expect(() => sumToTarget.generate({ target: 42, operation: 'suma' })).toThrow(/target inválido/);
    });

    it('sumToTarget rejects empty targets array', () => {
        expect(() => sumToTarget.generate({ targets: [], operation: 'suma' })).toThrow(/targets vacío/);
    });

    it('sumToTarget rejects invalid value inside targets array', () => {
        expect(() => sumToTarget.generate({ targets: [100, 42], operation: 'suma' })).toThrow(/target inválido en targets/);
    });
});

describe('validation — predicate returns false on mismatched calc', () => {
    it('freeForm predicate rejects wrong operation', () => {
        const calc = { meta: { operandA: 10, operandB: 10, operation: 'multi' } };
        expect(freeForm.predicate(calc, { digitCount: 2, operation: 'suma' })).toBe(false);
    });

    it('freeForm predicate rejects wrong digitCount', () => {
        const calc = { meta: { operandA: 5, operandB: 5, operation: 'suma' } };
        expect(freeForm.predicate(calc, { digitCount: 2, operation: 'suma' })).toBe(false);
    });

    it('freeForm predicate rejects resta with a < b', () => {
        const calc = { meta: { operandA: 10, operandB: 99, operation: 'resta' } };
        expect(freeForm.predicate(calc, { digitCount: 2, operation: 'resta' })).toBe(false);
    });

    it('noBorrowSubtraction predicate rejects wrong operation', () => {
        const calc = { meta: { operandA: 50, operandB: 30, operation: 'suma' } };
        expect(noBorrowSubtraction.predicate(calc, { digitCount: 2 })).toBe(false);
    });

    it('noCarryAddition predicate rejects wrong operation', () => {
        const calc = { meta: { operandA: 12, operandB: 23, operation: 'resta' } };
        expect(noCarryAddition.predicate(calc, { digitCount: 2 })).toBe(false);
    });

    it('identicalNumbers predicate rejects unequal operands', () => {
        const calc = { meta: { operandA: 10, operandB: 11, operation: 'suma' } };
        expect(identicalNumbers.predicate(calc, { min: 10, max: 99 })).toBe(false);
    });

    it('identicalNumbers predicate rejects wrong operation', () => {
        const calc = { meta: { operandA: 10, operandB: 10, operation: 'resta' } };
        expect(identicalNumbers.predicate(calc, { min: 10, max: 99 })).toBe(false);
    });

    it('wholeMultiples predicate rejects non-multiple operands', () => {
        const calc = { meta: { operandA: 13, operandB: 20, operation: 'suma' } };
        expect(wholeMultiples.predicate(calc, { step: 10, min: 10, max: 90, operation: 'suma' })).toBe(false);
    });

    it('wholeMultiples predicate rejects out-of-range operands', () => {
        const calc = { meta: { operandA: 1000, operandB: 20, operation: 'suma' } };
        expect(wholeMultiples.predicate(calc, { step: 10, min: 10, max: 90, operation: 'suma' })).toBe(false);
    });

    it('sumToTarget predicate rejects calc whose respuesta is not in VALID_TARGETS', () => {
        const calc = { respuesta: 200, meta: { operandA: 50, operandB: 150, operation: 'suma' } };
        expect(sumToTarget.predicate(calc, { target: 100, operation: 'suma' })).toBe(false);
    });

    it('sumToTarget predicate rejects calc whose target diverges from config.target', () => {
        // respuesta is a valid target (1000) but config requests 100 → hits the else-if branch.
        const calc = { respuesta: 1000, meta: { operandA: 300, operandB: 700, operation: 'suma' } };
        expect(sumToTarget.predicate(calc, { target: 100, operation: 'suma' })).toBe(false);
    });

    it('sumToTarget predicate rejects calc whose target is not in config.targets array', () => {
        const calc = { respuesta: 10000, meta: { operandA: 3000, operandB: 7000, operation: 'suma' } };
        expect(sumToTarget.predicate(calc, { targets: [100, 1000], operation: 'suma' })).toBe(false);
    });

    it('sumToTarget predicate rejects calc whose operands do not sum to target', () => {
        const calc = { respuesta: 100, meta: { operandA: 40, operandB: 70, operation: 'suma' } };
        expect(sumToTarget.predicate(calc, { target: 100, operation: 'suma' })).toBe(false);
    });
});
