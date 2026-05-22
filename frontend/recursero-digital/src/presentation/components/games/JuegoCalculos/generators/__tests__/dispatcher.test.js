import { describe, it, expect, vi } from 'vitest';
import { dispatch } from '../index';

const CONFIGS = [
    { kind: 'sum_to_target', target: 100, operation: 'suma' },
    { kind: 'sum_to_target', target: 1000, operation: 'suma' },
    { kind: 'sum_to_target', target: 10000, operation: 'suma' },
    { kind: 'whole_multiples', step: 10, min: 10, max: 90, operation: 'suma' },
    { kind: 'identical_numbers', min: 10, max: 99, operation: 'suma' },
    { kind: 'no_carry_sum', digitCount: 2, operation: 'suma' },
    { kind: 'free_form', digitCount: 2, operation: 'suma' },
];

describe('dispatcher — happy path', () => {
    it.each(CONFIGS)('returns a calculation that satisfies the level $kind', (config) => {
        const calc = dispatch(config);
        expect(calc).toHaveProperty('pregunta');
        expect(calc).toHaveProperty('respuesta');
        expect(calc.meta.kind).toBe(config.kind);
    });
});

describe('dispatcher — unknown kind', () => {
    it('throws a Spanish error', () => {
        expect(() => dispatch({ kind: 'wat' })).toThrow(/Tipo de nivel desconocido/);
    });

    it('throws on null/non-object config', () => {
        expect(() => dispatch(null)).toThrow(/config inválido/);
        expect(() => dispatch('foo')).toThrow(/config inválido/);
    });
});

describe('dispatcher — predicate gate (T020a)', () => {
    it('throws when generate produces a config that cannot satisfy its predicate', () => {
        // sumToTarget.generate(target: 42) throws because 42 ∉ VALID_TARGETS.
        // This exercises the dispatcher's generator-error propagation path.
        expect(() =>
            dispatch({ kind: 'sum_to_target', target: 42, operation: 'suma' })
        ).toThrow();
    });

    it('throws "No se pudo generar" after exhausting retries on a broken predicate', async () => {
        vi.resetModules();
        vi.doMock('../freeForm', () => ({
            generate: () => ({
                pregunta: 'broken',
                respuesta: 0,
                meta: { operandA: 0, operandB: 0, operation: 'suma', kind: 'free_form' },
            }),
            predicate: () => false,
        }));
        const { dispatch: dispatchMocked } = await import('../index');
        expect(() =>
            dispatchMocked({ kind: 'free_form', digitCount: 2, operation: 'suma' })
        ).toThrow(/No se pudo generar/);
        vi.doUnmock('../freeForm');
        vi.resetModules();
    });
});

// Re-export `vi` so eslint doesn't flag the import even though we don't use it
// in this file — left in place for upcoming generator-injection tests.
void vi;
