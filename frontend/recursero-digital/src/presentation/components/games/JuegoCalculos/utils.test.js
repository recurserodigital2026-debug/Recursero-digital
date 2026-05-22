import { describe, it, expect } from 'vitest';
import { getQuestionsForLevel } from './utils';
import { digitsOf, noCarryOnSum } from './generators/predicates';

// Suma configs mirror migration 1779321600000_update-calculos-suma-levels-constraint-driven.js
// — keep them in sync so this file acts as the integration check for the dispatcher.
const sumaLevelConfigs = {
    1: {
        config: { operation: 'suma', kind: 'no_carry_sum', digitCount: 2 },
        activitiesCount: 5,
    },
    2: {
        config: { operation: 'suma', kind: 'whole_multiples', step: 10, min: 10, max: 90 },
        activitiesCount: 5,
    },
    3: {
        config: { operation: 'suma', kind: 'free_form', digitCount: 2 },
        activitiesCount: 5,
    },
    4: {
        config: { operation: 'suma', kind: 'identical_numbers', min: 10, max: 99 },
        activitiesCount: 5,
    },
    5: {
        config: { operation: 'suma', kind: 'sum_to_target', targets: [100, 1000, 10000] },
        activitiesCount: 5,
    },
};

const restaConfigs = {
    1: { config: { min: 20, max: 100, minResult: 10, maxResult: 50, step: 10 }, activitiesCount: 5 },
    2: { config: { min: 200, max: 800, minResult: 100, maxResult: 500, step: 100 }, activitiesCount: 5 },
    3: { config: { min: 2000, max: 7000, minResult: 1000, maxResult: 5000, step: 1000 }, activitiesCount: 5 },
};

// Localized number string back to int, since formatNumber uses 'es-ES' (e.g. "1.000" for 1000).
const parseEsNumber = (s) => parseInt(s.replace(/\./g, ''), 10);

const parseSumQuestion = (pregunta) => {
    const m = pregunta.match(/^([\d.]+)\s*\+\s*([\d.]+)\s*=$/);
    expect(m, `unexpected suma format: ${pregunta}`).not.toBeNull();
    return { a: parseEsNumber(m[1]), b: parseEsNumber(m[2]) };
};

const parseSubQuestion = (pregunta) => {
    const m = pregunta.match(/^([\d.]+)\s*−\s*([\d.]+)\s*=$/);
    expect(m, `unexpected resta format: ${pregunta}`).not.toBeNull();
    return { minuendo: parseEsNumber(m[1]), sustraendo: parseEsNumber(m[2]) };
};

const runSessions = (level, n = 200) => {
    const sessions = [];
    for (let i = 0; i < n; i += 1) {
        const questions = getQuestionsForLevel('suma', level, sumaLevelConfigs[level]);
        expect(questions, `L${level} session ${i}`).toHaveLength(5);
        sessions.push(questions);
    }
    return sessions;
};

const expectUniqueSession = (level) => {
    for (let i = 0; i < 100; i += 1) {
        const questions = getQuestionsForLevel('suma', level, sumaLevelConfigs[level]);
        const preguntas = questions.map((q) => q.pregunta);
        expect(new Set(preguntas).size, `L${level} dup in: ${preguntas.join(' | ')}`).toBe(preguntas.length);
    }
};

describe('JuegoCalculos suma', () => {
    describe('L1 no_carry_sum (digitCount 2)', () => {
        it('both operands are 2-digit and every column-sum ≤ 9 (200 sessions)', () => {
            for (const session of runSessions(1)) {
                for (const q of session) {
                    const { a, b } = parseSumQuestion(q.pregunta);
                    expect(digitsOf(a), q.pregunta).toBe(2);
                    expect(digitsOf(b), q.pregunta).toBe(2);
                    expect(noCarryOnSum(a, b), q.pregunta).toBe(true);
                    expect(q.respuesta).toBe(a + b);
                }
            }
        });
        it('5 questions in a session are unique', () => expectUniqueSession(1));
    });

    describe('L2 whole_multiples (step 10, [10, 90])', () => {
        it('both operands % 10 === 0 and in [10, 90] (200 sessions)', () => {
            for (const session of runSessions(2)) {
                for (const q of session) {
                    const { a, b } = parseSumQuestion(q.pregunta);
                    expect(a % 10, q.pregunta).toBe(0);
                    expect(b % 10, q.pregunta).toBe(0);
                    expect(a, q.pregunta).toBeGreaterThanOrEqual(10);
                    expect(a, q.pregunta).toBeLessThanOrEqual(90);
                    expect(b, q.pregunta).toBeGreaterThanOrEqual(10);
                    expect(b, q.pregunta).toBeLessThanOrEqual(90);
                    expect(q.respuesta).toBe(a + b);
                }
            }
        });
        it('5 questions in a session are unique', () => expectUniqueSession(2));
    });

    describe('L3 free_form (digitCount 2)', () => {
        it('both operands ∈ [10, 99] (200 sessions)', () => {
            for (const session of runSessions(3)) {
                for (const q of session) {
                    const { a, b } = parseSumQuestion(q.pregunta);
                    expect(a, q.pregunta).toBeGreaterThanOrEqual(10);
                    expect(a, q.pregunta).toBeLessThanOrEqual(99);
                    expect(b, q.pregunta).toBeGreaterThanOrEqual(10);
                    expect(b, q.pregunta).toBeLessThanOrEqual(99);
                    expect(q.respuesta).toBe(a + b);
                }
            }
        });
        it('5 questions in a session are unique', () => expectUniqueSession(3));
    });

    describe('L4 identical_numbers ([10, 99])', () => {
        it('a === b, a ∈ [10, 99], respuesta = 2a (200 sessions)', () => {
            for (const session of runSessions(4)) {
                for (const q of session) {
                    const { a, b } = parseSumQuestion(q.pregunta);
                    expect(a, q.pregunta).toBe(b);
                    expect(a, q.pregunta).toBeGreaterThanOrEqual(10);
                    expect(a, q.pregunta).toBeLessThanOrEqual(99);
                    expect(q.respuesta).toBe(2 * a);
                }
            }
        });
        it('5 questions in a session are unique', () => expectUniqueSession(4));
    });

    describe('L5 sum_to_target (mixed targets [100, 1000, 10000])', () => {
        const VALID = new Set([100, 1000, 10000]);
        it('respuesta ∈ {100, 1000, 10000}; operands honour the picked target (200 sessions)', () => {
            const targetsSeen = new Set();
            for (const session of runSessions(5)) {
                for (const q of session) {
                    const { a, b } = parseSumQuestion(q.pregunta);
                    expect(VALID.has(q.respuesta), q.pregunta).toBe(true);
                    expect(a + b, q.pregunta).toBe(q.respuesta);
                    const step = q.respuesta / 10;
                    expect(a, q.pregunta).toBeGreaterThan(0);
                    expect(b, q.pregunta).toBeGreaterThan(0);
                    expect(a, q.pregunta).not.toBe(q.respuesta);
                    expect(b, q.pregunta).not.toBe(q.respuesta);
                    expect(a % step, q.pregunta).toBe(0);
                    expect(b % step, q.pregunta).toBe(0);
                    targetsSeen.add(q.respuesta);
                }
            }
            // Sanity: across 200 × 5 = 1.000 picks we should see each of the three targets.
            expect(targetsSeen).toEqual(new Set([100, 1000, 10000]));
        });
        it('5 questions in a session are unique', () => expectUniqueSession(5));
    });
});

// Resta integration tests are skipped: the constraint-driven generators for resta
// (no_borrow_sub + resta branches of whole_multiples / free_form) land in US3.
// See stubs at generators/wholeMultiples.js:13 and generators/freeForm.js:16.
describe.skip('JuegoCalculos resta (pending US3)', () => {
    for (const [level, levelConfig] of Object.entries(restaConfigs)) {
        const { min, max, minResult, maxResult, step } = levelConfig.config;

        it(`L${level}: operands stay in [${min}, ${max}], result in [${minResult}, ${maxResult}], multiples of ${step}, no negatives (200 sessions)`, () => {
            for (let i = 0; i < 200; i++) {
                const questions = getQuestionsForLevel('resta', level, levelConfig);
                expect(questions).toHaveLength(5);
                for (const q of questions) {
                    const { minuendo, sustraendo } = parseSubQuestion(q.pregunta);
                    expect(minuendo, q.pregunta).toBeGreaterThanOrEqual(min);
                    expect(minuendo, q.pregunta).toBeLessThanOrEqual(max);
                    expect(sustraendo, q.pregunta).toBeGreaterThanOrEqual(min);
                    expect(sustraendo, q.pregunta).toBeLessThanOrEqual(max);
                    expect(minuendo, q.pregunta).toBeGreaterThan(sustraendo);
                    expect(minuendo % step, q.pregunta).toBe(0);
                    expect(sustraendo % step, q.pregunta).toBe(0);
                    expect(q.respuesta % step, q.pregunta).toBe(0);
                    expect(q.respuesta).toBe(minuendo - sustraendo);
                    expect(q.respuesta).toBeGreaterThanOrEqual(minResult);
                    expect(q.respuesta).toBeLessThanOrEqual(maxResult);
                }
            }
        });

        it(`L${level}: 5 questions in a session are unique`, () => {
            for (let i = 0; i < 100; i++) {
                const questions = getQuestionsForLevel('resta', level, levelConfig);
                const preguntas = questions.map(q => q.pregunta);
                expect(new Set(preguntas).size, `dup in: ${preguntas.join(' | ')}`).toBe(preguntas.length);
            }
        });
    }
});

const mulLevelConfig = { config: {}, activitiesCount: 5 };

const NRO_REDONDOS_L3 = [20, 30, 40, 50, 60, 70, 80, 90, 200, 300, 400, 500, 600, 700, 800, 900];

const isClosedMul = (pregunta) => /^[\d.]+\s*x\s*[\d.]+\s*=$/.test(pregunta);
const isUnknownMul = (pregunta) => /^[\d.]+\s*x\s*___\?\s*=\s*[\d.]+$/.test(pregunta);

const parseClosedMul = (pregunta) => {
    const m = pregunta.match(/^([\d.]+)\s*x\s*([\d.]+)\s*=$/);
    expect(m, `unexpected mul format: ${pregunta}`).not.toBeNull();
    return { factor1: parseEsNumber(m[1]), factor2: parseEsNumber(m[2]) };
};

const parseUnknownMul = (pregunta) => {
    const m = pregunta.match(/^([\d.]+)\s*x\s*___\?\s*=\s*([\d.]+)$/);
    expect(m, `unexpected unknown-mul format: ${pregunta}`).not.toBeNull();
    return { factor1: parseEsNumber(m[1]), shown: parseEsNumber(m[2]) };
};

describe('JuegoCalculos multiplicacion', () => {
    it('L1: factors are tables 2-9, respuesta = factor1 * factor2 (200 sessions)', () => {
        for (let i = 0; i < 200; i++) {
            const questions = getQuestionsForLevel('multiplicacion', 1, mulLevelConfig);
            expect(questions).toHaveLength(5);
            for (const q of questions) {
                if (isClosedMul(q.pregunta)) {
                    const { factor1, factor2 } = parseClosedMul(q.pregunta);
                    expect(factor1, q.pregunta).toBeGreaterThanOrEqual(2);
                    expect(factor1, q.pregunta).toBeLessThanOrEqual(9);
                    expect(factor2, q.pregunta).toBeGreaterThanOrEqual(2);
                    expect(factor2, q.pregunta).toBeLessThanOrEqual(9);
                    expect(q.respuesta).toBe(factor1 * factor2);
                } else {
                    const { factor1, shown } = parseUnknownMul(q.pregunta);
                    expect(factor1).toBeGreaterThanOrEqual(2);
                    expect(factor1).toBeLessThanOrEqual(9);
                    expect(q.respuesta, q.pregunta).toBeGreaterThanOrEqual(2);
                    expect(q.respuesta, q.pregunta).toBeLessThanOrEqual(9);
                    expect(shown).toBe(factor1 * q.respuesta);
                }
            }
        }
    });

    it('L2: factor1 in [1,10], factor2 in {10, 100, 1000} (200 sessions)', () => {
        for (let i = 0; i < 200; i++) {
            const questions = getQuestionsForLevel('multiplicacion', 2, mulLevelConfig);
            expect(questions).toHaveLength(5);
            for (const q of questions) {
                if (isClosedMul(q.pregunta)) {
                    const { factor1, factor2 } = parseClosedMul(q.pregunta);
                    expect(factor1, q.pregunta).toBeGreaterThanOrEqual(1);
                    expect(factor1, q.pregunta).toBeLessThanOrEqual(10);
                    expect([10, 100, 1000], q.pregunta).toContain(factor2);
                    expect(q.respuesta).toBe(factor1 * factor2);
                } else {
                    const { factor1, shown } = parseUnknownMul(q.pregunta);
                    expect(factor1).toBeGreaterThanOrEqual(1);
                    expect(factor1).toBeLessThanOrEqual(10);
                    expect([10, 100, 1000]).toContain(q.respuesta);
                    expect(shown).toBe(factor1 * q.respuesta);
                }
            }
        }
    });

    it('L3: factor1 in [1,5], factor2 in NRO_REDONDOS, closed-form product ≤ 1000 (200 sessions)', () => {
        for (let i = 0; i < 200; i++) {
            const questions = getQuestionsForLevel('multiplicacion', 3, mulLevelConfig);
            expect(questions).toHaveLength(5);
            for (const q of questions) {
                if (isClosedMul(q.pregunta)) {
                    const { factor1, factor2 } = parseClosedMul(q.pregunta);
                    expect(factor1, q.pregunta).toBeGreaterThanOrEqual(1);
                    expect(factor1, q.pregunta).toBeLessThanOrEqual(5);
                    expect(NRO_REDONDOS_L3, q.pregunta).toContain(factor2);
                    expect(q.respuesta).toBe(factor1 * factor2);
                    // L3 validator caps closed-form product at 1000.
                    expect(q.respuesta, q.pregunta).toBeLessThanOrEqual(1000);
                } else {
                    const { factor1, shown } = parseUnknownMul(q.pregunta);
                    expect(factor1).toBeGreaterThanOrEqual(1);
                    expect(factor1).toBeLessThanOrEqual(5);
                    expect(NRO_REDONDOS_L3, q.pregunta).toContain(q.respuesta);
                    expect(shown).toBe(factor1 * q.respuesta);
                }
            }
        }
    });

    for (const level of [1, 2, 3]) {
        it(`L${level}: exactly 2 of 5 questions are unknown-factor variants`, () => {
            for (let i = 0; i < 100; i++) {
                const questions = getQuestionsForLevel('multiplicacion', level, mulLevelConfig);
                const unknowns = questions.filter(q => isUnknownMul(q.pregunta)).length;
                const closed = questions.filter(q => isClosedMul(q.pregunta)).length;
                expect(unknowns, `session: ${questions.map(q => q.pregunta).join(' | ')}`).toBe(2);
                expect(closed).toBe(3);
            }
        });

        it(`L${level}: 5 questions in a session are unique`, () => {
            for (let i = 0; i < 100; i++) {
                const questions = getQuestionsForLevel('multiplicacion', level, mulLevelConfig);
                const preguntas = questions.map(q => q.pregunta);
                expect(new Set(preguntas).size, `dup in: ${preguntas.join(' | ')}`).toBe(preguntas.length);
            }
        });
    }
});
