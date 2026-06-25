import { generateWithRetry } from "../../../../utils/generateWithRetry";
import { dispatch as dispatchCalculation } from "./generators";

export const formatNumber = (num) => {
    return num.toLocaleString('es-ES');
};


const KNOWN_KINDS = new Set([
    'sum_to_target',
    'sum_to_round',
    'doubles',
    'whole_multiples',
    'identical_numbers',
    'no_carry_sum',
    'no_borrow_sub',
    'free_form',
]);

const generateSumOrSubtractQuestion = (config) => {
    if (!config || !KNOWN_KINDS.has(config.kind)) {
        throw new Error(
            `Configuración de nivel inválida: kind='${config?.kind}'. Esperado uno de ${[...KNOWN_KINDS].join(', ')}.`
        );
    }
    return dispatchCalculation(config);
};

const DIVISION_KINDS = new Set([
    'division_repeated_subtraction',
    'division_word_remainder',
    'division_facts',
    'division_with_remainder',
    'division_by_powers_of_ten',
    'division_scaling',
    'division_estimation',
]);

const generateDivisionQuestion = (config) => {
    if (!config || !DIVISION_KINDS.has(config.kind)) {
        throw new Error(
            `Configuración de nivel inválida: kind='${config?.kind}'. Esperado un tipo de división (${[...DIVISION_KINDS].join(', ')}).`
        );
    }
    return dispatchCalculation(config);
};

const generateMultiplyQuestion = (config, withUnknown = false) => {
   const nivel = Number(config.nivel);

    if (nivel === 1) {
        const tablas = [2, 3, 4, 5, 6, 7, 8, 9];
        const factor1 = tablas[Math.floor(Math.random() * tablas.length)];
        const factor2 = tablas[Math.floor(Math.random() * tablas.length)];
        const respuesta = factor1 * factor2;

        if(withUnknown) {
            return{
                pregunta: `${formatNumber(factor1)} x ___? = ${formatNumber(respuesta)}`,
                respuesta: factor2
            };
        }
        return {
            pregunta: `${formatNumber(factor1)} x ${formatNumber(factor2)} =`,
            respuesta,
            soporteVisual: {
                factor1: factor1,
                factor2: factor2
            }
        };
    }

    if(nivel === 2) {
        const factor1 = Math.floor(Math.random() * 10) + 1;
        const opciones = [10, 100, 1000];
        const factor2 = opciones[Math.floor(Math.random() * opciones.length)];
        const respuesta = factor1 * factor2;

        if(withUnknown) {
            return {
                pregunta: `${formatNumber(factor1)} x ___? = ${formatNumber(respuesta)}`,
                respuesta: factor2
            };
        }
        return {
            pregunta: `${formatNumber(factor1)} x ${formatNumber(factor2)} =`,
            respuesta
        };
    }
    
    if(nivel === 3) {
        const NRO_REDONDOS = [20, 30, 40, 50, 60, 70, 80, 90, 200, 300, 400, 500, 600, 700, 800, 900];
        const factor1 = Math.floor(Math.random() * 5) + 1;
        const factor2 = NRO_REDONDOS[Math.floor(Math.random() * NRO_REDONDOS.length)];
        const respuesta = factor1 * factor2;

        if(withUnknown) {
            return {
                pregunta: `${formatNumber(factor1)} x ___? = ${formatNumber(respuesta)}`,
                respuesta: factor2
            };
        }
        return {
            pregunta: `${formatNumber(factor1)} x ${formatNumber(factor2)} =`,
            respuesta
        };
    }
};

export const operationConfig = {
    suma: {
        name: 'Sumas',
        icon: '➕',
        color: 'from-green-400 to-emerald-500',
        textColor: 'text-green-600'
    },
    resta: {
        name: 'Restas', 
        icon: '➖',
        color: 'from-red-400 to-pink-500',
        textColor: 'text-red-600'
    },
    multiplicacion: {
        name: 'Multiplicación',
        icon: '✖️',
        color: 'from-blue-400 to-indigo-500',
        textColor: 'text-blue-600'
    },
    division: {
        name: 'División',
        icon: '➗',
        color: 'from-cyan-400 to-blue-500',
        textColor: 'text-cyan-600'
    }
};


export const levelConfig = [
    {
        name: 'Nivel 1',
        description: '¡Principiante! Operaciones simples',
        color: 'from-green-400 to-emerald-500',
        textColor: 'text-green-600',
        number: 1
    },
    {
        name: 'Nivel 2',
        description: '¡Intermedio! Un poco más difícil',
        color: 'from-blue-400 to-indigo-500',
        textColor: 'text-blue-600',
        number: 2
    },
    {
        name: 'Nivel 3',
        description: '¡Experto! El desafío máximo',
        color: 'from-purple-400 to-pink-500',
        textColor: 'text-purple-600',
        number: 3
    },
    {
        name: 'Nivel 4',
        description: 'Sumas de números iguales',
        color: 'from-yellow-400 to-orange-500',
        textColor: 'text-orange-600',
        number: 4
    },
    {
        name: 'Nivel 5',
        description: 'Sumas que dan 100, 1.000 o 10.000',
        color: 'from-pink-400 to-rose-500',
        textColor: 'text-rose-600',
        number: 5
    },
    {
        name: 'Nivel 6',
        description: 'Nivel 6',
        color: 'from-cyan-400 to-blue-500',
        textColor: 'text-cyan-600',
        number: 6
    },
    {
        name: 'Nivel 7',
        description: 'Nivel 7',
        color: 'from-teal-400 to-emerald-500',
        textColor: 'text-teal-600',
        number: 7
    },
    {
        name: 'Nivel 8',
        description: 'Nivel 8',
        color: 'from-fuchsia-400 to-purple-500',
        textColor: 'text-fuchsia-600',
        number: 8
    }
];

// Suma has extra levels (L4–L5) that live at backend levels 10–11 to avoid
// disturbing the existing 1-9 mapping used by resta and multiplicación.
// L5 rotates target per question across {100, 1.000, 10.000} (migration
// 1779408000000), so there is no L6/L7 in the frontend.
const SUMA_EXTRA_BACKEND_LEVELS = { 4: 10, 5: 11 };
// División ocupa los niveles backend 12–19 (offset 11), sin colisionar con
// suma (1–3, 10–11), resta (4–6) ni multiplicación (7–9). Ver FR-011.
const OPERATION_OFFSET = { suma: 0, resta: 3, multiplicacion: 6, division: 11 };

export const getBackendLevel = (operation, localLevel) => {
    if (operation === 'suma' && SUMA_EXTRA_BACKEND_LEVELS[localLevel]) {
        return SUMA_EXTRA_BACKEND_LEVELS[localLevel];
    }
    return localLevel + OPERATION_OFFSET[operation];
};

export const getOperationForDbLevel = (dbLevel) => {
    for (const op of Object.keys(operationConfig)) {
        if (getLocalLevelForOperation(dbLevel, op) !== null) return op;
    }
    return null;
};

export const getLocalLevelForOperation = (assignedDbLevel, operation) => {
    if (operation === 'suma') {
        if (assignedDbLevel >= 1 && assignedDbLevel <= 3) return assignedDbLevel;
        if (assignedDbLevel === 10) return 4;
        if (assignedDbLevel === 11) return 5;
    }
    if (operation === 'resta') {
        if (assignedDbLevel >= 4 && assignedDbLevel <= 6) return assignedDbLevel - 3;
        if (assignedDbLevel >= 1 && assignedDbLevel <= 3) return assignedDbLevel;
    }
    if (operation === 'multiplicacion') {
        if (assignedDbLevel >= 7 && assignedDbLevel <= 9) return assignedDbLevel - 6;
        if (assignedDbLevel >= 1 && assignedDbLevel <= 3) return assignedDbLevel;
    }
    if (operation === 'division') {
        if (assignedDbLevel >= 12 && assignedDbLevel <= 18) return assignedDbLevel - 11;
    }
    return null;
};

export const getLevelCountForOperation = (operation) => {
    if (operation === 'suma') return 5;
    if (operation === 'division') return 7;
    return 3;
};

// Per-operation, per-level pedagogical description. Single source of truth used
// by LevelSelectScreen for both the level card and the tips block. Keep entries
// aligned with getLevelCountForOperation and with the backend migrations under
// specs/001-addition-subtraction-levels/.
export const levelDescriptions = {
    suma: {
        1: 'Sumas fáciles de dos cifras',
        2: 'Sumas con decenas exactas: 10, 20, 30… 90',
        3: 'Sumas libres de dos cifras',
        4: 'Sumas de números iguales: ambos operandos son el mismo número',
        5: 'Sumas que dan 100, 1.000 o 10.000',
    },
    resta: {
        1: 'Restas fáciles de dos cifras',
        2: 'Restas con números redondos: 20, 30, 40… hasta 90',
        3: 'Restas de dos cifras con un poco más de desafío',
    },
    multiplicacion: {
        1: 'Tablas básicas. Recuerda las multiplicaciones fundamentales',
        2: 'Por 10, 100, 1000. ¡Solo agrega ceros!',
        3: 'Encuentra el factor. Divide el resultado por el número conocido',
    },
    division: {
        1: 'Reparto con resta sucesiva: contá cuántos grupos se forman',
        2: '¿Alcanza justo o falta? Cociente y resto en problemas',
        3: 'Dividir directamente con la tabla pitagórica',
        4: 'Divisiones con resto distinto de cero',
        5: 'Dividir por 10, 100 y 1.000',
        6: 'Usá cálculos conocidos para resolver nuevos',
        7: 'Cálculo aproximado: estimá el resultado',
    },
};

export const getLevelDescription = (operation, levelNumber) =>
    levelDescriptions[operation]?.[levelNumber] ?? '';


export const getTotalActivities = (levelConfig) => {
    return levelConfig?.activitiesCount || 5;
};

// Config de respaldo por si el backend no devuelve la configuración del nivel.
const FALLBACK_CONFIGS = {
    suma: {
        1: { kind: 'no_carry_sum', digitCount: 2 },
        2: { kind: 'whole_multiples', step: 10, min: 10, max: 90 },
        3: { kind: 'free_form', digitCount: 2 },
        4: { kind: 'identical_numbers', min: 10, max: 99 },
        5: { kind: 'sum_to_target', targets: [100, 1000, 10000] },
    },
    resta: {
        1: { kind: 'no_borrow_sub', digitCount: 2 },
        2: { kind: 'whole_multiples', step: 10, min: 10, max: 90 },
        3: { kind: 'free_form', digitCount: 2 },
    },
    division: {
        1: { kind: 'division_repeated_subtraction', groupSizes: [3, 4, 5, 6], maxGroups: 12 },
        2: { kind: 'division_word_remainder', divisorRange: [3, 6], dividendMax: 60, allowExact: true },
        3: { kind: 'division_facts', maxDivisor: 10, maxQuotient: 10 },
        4: { kind: 'division_with_remainder', divisorRange: [2, 9], dividendMax: 99 },
        5: { kind: 'division_by_powers_of_ten', divisors: [10, 100, 1000], itemsPerExercise: 3 },
        6: { kind: 'division_scaling', baseFacts: [[10, 5, 2], [40, 4, 10]], scales: [10, 100], derivations: ['scale', 'decompose'], maxAddendMultiple: 2 },
        7: { kind: 'division_estimation', shapes: ['threshold', 'nearest'], dividendMax: 320, divisorMax: 30 },
    },
};

export const getQuestionsForLevel = (operation, levelNumber, levelConfig) => {
    let config;
    let activitiesCount;

    if (levelConfig?.config) {
        config = levelConfig.config;
        activitiesCount = levelConfig.activitiesCount || 5;
    } else {
        config = FALLBACK_CONFIGS[operation]?.[levelNumber];
        activitiesCount = 5;
        if (!config) {
            console.warn('[getQuestionsForLevel] sin config ni fallback para', operation, levelNumber);
            return [];
        }
    }
    const questions = [];
    
        switch (operation) {
            case 'suma':
            case 'resta': {
                const configWithOp = { ...config, operation };
                const seen = new Set();
                for (let i = 0; i < activitiesCount; i++) {
                    const q = generateWithRetry(
                        () => generateSumOrSubtractQuestion(configWithOp),
                        (c) => !seen.has(c.pregunta)
                    );
                    seen.add(q.pregunta);
                    questions.push(q);
                }
                break;
            }
            case 'division': {
                const configWithOp = { ...config, operation: 'division' };
                const seen = new Set();
                const sig = (q) =>
                    `${q.pregunta}|${JSON.stringify(q.items ?? q.respuestas ?? q.opciones ?? q.respuesta ?? '')}`;
                for (let i = 0; i < activitiesCount; i++) {
                    const q = generateWithRetry(
                        () => generateDivisionQuestion(configWithOp),
                        (c) => !seen.has(sig(c))
                    );
                    seen.add(sig(q));
                    questions.push(q);
                }
                break;
            }
            case 'multiplicacion': {
                const indices = [0, 1, 2, 3, 4];
                const unknownIndices = indices
                .sort(() => Math.random() - 0.5)
                .slice(0, 2);

                const seen = new Set();

                for (let i = 0; i < activitiesCount; i++) {
                    const withUnknown = unknownIndices.includes(i);

                    const question = generateWithRetry(
                        () => generateMultiplyQuestion({ ...config, nivel: parseInt(levelNumber) }, withUnknown),
                        (candidate) => !seen.has(candidate.pregunta) && (parseInt(levelNumber) !== 3 || candidate.respuesta <= 1000)
                    );
                    seen.add(question.pregunta);
                    questions.push(question);
                }
                break;
            }
            default: 
                console.warn(`Operación desconocida: ${operation}`);
                return [];
        }
        return questions;
};

export const validateAnswer = (userAnswer, correctAnswer) => {
    return parseInt(userAnswer) === correctAnswer;
};

// Generalized answer check by inputMode. suma/resta/multiplicación questions have no
// inputMode → 'single' scalar path (identical to validateAnswer). División questions
// carry an inputMode and (for multi-part) are correct only when ALL parts match (FR-005).
const toInt = (v) => parseInt(v, 10);

export const checkAnswer = (question, answer) => {
    const mode = question?.inputMode || 'single';
    switch (mode) {
        case 'single':
        case 'repeated_subtraction':
            return toInt(answer) === question.respuesta;
        case 'quotient_remainder':
            return (
                toInt(answer?.cociente) === question.respuestas.cociente &&
                toInt(answer?.resto) === question.respuestas.resto
            );
        case 'multi_blank':
            return (
                Array.isArray(answer) &&
                answer.length === question.items.length &&
                question.items.every((it, i) => toInt(answer[i]) === it.respuesta)
            );
        case 'multiple_choice':
            return answer === question.respuestaCorrecta;
        default:
            return false;
    }
};

export const getOperationName = (operation) => {
    return operationConfig[operation]?.name || operation;
};

export const getLevelName = (level) => {
    const levelNumber = level.replace('nivel', '');
    return `Nivel ${levelNumber}`;
};

export const getLevelNumber = (level) => {
    const levelNumber = level.replace('nivel', '');
    return levelNumber;
};

export const calculateScore = (level, attempts = 1) => {
    const levelNumber = parseInt(level.replace('nivel', ''));
    const baseScore = Math.min(50 * levelNumber, 150);
    const penalty = (attempts - 1) * 10;
    return Math.max(10, baseScore - penalty);
};


export const getRandomEncouragement = () => {
    const messages = [
        '¡Excelente! 🎉',
        '¡Muy bien! ⭐',
        '¡Perfecto! 👏',
        '¡Genial! 🚀',
        '¡Fantástico! 🌟',
        '¡Correcto! ✨',
        '¡Increíble! 🎯'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

export const getRandomMotivation = () => {
    const messages = [
        '¡Sigue intentando! 💪',
        '¡Casi lo tienes! 🎯',
        '¡No te rindas! 🌟',
        '¡Inténtalo de nuevo! 🚀',
        '¡Tú puedes! ⭐',
        '¡Piensa un poco más! 🤔',
        '¡Revisa el cálculo! 📝'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

export const getNextLevel = (currentLevel, operation) => {
    const n = parseInt(String(currentLevel).replace('nivel', ''), 10);
    if (!n) return null;
    const max = operation ? getLevelCountForOperation(operation) : 3;
    return n < max ? `nivel${n + 1}` : null;
};

export const isLastLevel = (level, operation) => {
    const n = parseInt(String(level).replace('nivel', ''), 10);
    const max = operation ? getLevelCountForOperation(operation) : 3;
    return n >= max;
};