import { describe, it, expect } from 'vitest';
import { getQuestionsForLevel } from './utils';

const sumaConfigs = {
    1: { config: { min: 10, max: 50, minResult: 20, maxResult: 100, step: 10 }, activitiesCount: 5 },
    2: { config: { min: 100, max: 600, minResult: 200, maxResult: 1200, step: 100 }, activitiesCount: 5 },
    3: { config: { min: 1000, max: 5000, minResult: 2000, maxResult: 10000, step: 1000 }, activitiesCount: 5 },
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

describe('JuegoCalculos suma', () => {
    for (const [level, levelConfig] of Object.entries(sumaConfigs)) {
        const { min, max, minResult, maxResult, step } = levelConfig.config;

        it(`L${level}: operands stay in [${min}, ${max}], result in [${minResult}, ${maxResult}], multiples of ${step} (200 sessions)`, () => {
            for (let i = 0; i < 200; i++) {
                const questions = getQuestionsForLevel('suma', level, levelConfig);
                expect(questions).toHaveLength(5);
                for (const q of questions) {
                    const { a, b } = parseSumQuestion(q.pregunta);
                    expect(a, q.pregunta).toBeGreaterThanOrEqual(min);
                    expect(a, q.pregunta).toBeLessThanOrEqual(max);
                    expect(b, q.pregunta).toBeGreaterThanOrEqual(min);
                    expect(b, q.pregunta).toBeLessThanOrEqual(max);
                    expect(a % step, q.pregunta).toBe(0);
                    expect(b % step, q.pregunta).toBe(0);
                    expect(q.respuesta).toBe(a + b);
                    expect(q.respuesta).toBeGreaterThanOrEqual(minResult);
                    expect(q.respuesta).toBeLessThanOrEqual(maxResult);
                }
            }
        });

        it(`L${level}: 5 questions in a session are unique`, () => {
            for (let i = 0; i < 100; i++) {
                const questions = getQuestionsForLevel('suma', level, levelConfig);
                const preguntas = questions.map(q => q.pregunta);
                expect(new Set(preguntas).size, `dup in: ${preguntas.join(' | ')}`).toBe(preguntas.length);
            }
        });
    }
});

describe('JuegoCalculos resta', () => {
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
