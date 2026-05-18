import { generateWithRetry } from "../../../../utils/generateWithRetry";

export const formatNumber = (num) => {
    return num.toLocaleString('es-ES');
};

const pickMultiple = (lo, hi, step) => {
    const firstK = Math.ceil(lo / step);
    const lastK = Math.floor(hi / step);
    return step * (firstK + Math.floor(Math.random() * (lastK - firstK + 1)));
};

const generateRoundOperandsSum = (config) => {
    const { min = 10, max = 50, minResult = 20, maxResult = 100, step = 1 } = config;

    const num1 = pickMultiple(min, max, step);
    const num2 = pickMultiple(Math.max(min, minResult - num1), Math.min(max, maxResult - num1), step);

    return {
        pregunta: `${formatNumber(num1)} + ${formatNumber(num2)} =`,
        respuesta: num1 + num2
    };
};

const generateDoublesSum = (config) => {
    const { min = 10, max = 50, maxResult = 100, step = 1 } = config;
    const upper = Math.min(max, Math.floor(maxResult / 2));
    const a = pickMultiple(min, upper, step);
    return {
        pregunta: `${formatNumber(a)} + ${formatNumber(a)} =`,
        respuesta: 2 * a
    };
};

const DEFAULT_ROUND_TARGETS = [100, 1000, 10000];

const generateSumToRoundResult = (config) => {
    const { step = 1, minResult = 0, maxResult = Infinity, roundTargets = DEFAULT_ROUND_TARGETS } = config;
    const candidates = roundTargets.filter((t) => t >= minResult && t <= maxResult);
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const a = pickMultiple(step, target - step, step);
    return {
        pregunta: `${formatNumber(a)} + ${formatNumber(target - a)} =`,
        respuesta: target
    };
};

const SUM_GENERATORS = {
    round_operands: generateRoundOperandsSum,
    doubles: generateDoublesSum,
    sum_to_round: generateSumToRoundResult,
};

const generateSumQuestion = (config) => {
    const gen = SUM_GENERATORS[config.kind] || generateRoundOperandsSum;
    return gen(config);
};

const generateSubtractQuestion = (config) => {
    const { min = 20, max = 100, minResult = 10, maxResult = 50, step = 1 } = config;

    const result = pickMultiple(minResult, maxResult, step);
    const sustraendo = pickMultiple(min, max - result, step);
    const minuendo = sustraendo + result;

    return {
        pregunta: `${formatNumber(minuendo)} − ${formatNumber(sustraendo)} =`,
        respuesta: result
    };
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
            respuesta
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
        description: 'Sumas dobles: números iguales',
        color: 'from-yellow-400 to-orange-500',
        textColor: 'text-orange-600',
        number: 4
    },
    {
        name: 'Nivel 5',
        description: 'Sumas complementarias: 100, 1.000, 10.000',
        color: 'from-pink-400 to-rose-500',
        textColor: 'text-rose-600',
        number: 5
    }
];

// Suma has extra levels (L4, L5) that live at backend levels 10 and 11 to avoid
// disturbing the existing 1-9 mapping used by resta and multiplicación.
const SUMA_EXTRA_BACKEND_LEVELS = { 4: 10, 5: 11 };
const OPERATION_OFFSET = { suma: 0, resta: 3, multiplicacion: 6 };

export const getBackendLevel = (operation, localLevel) => {
    if (operation === 'suma' && SUMA_EXTRA_BACKEND_LEVELS[localLevel]) {
        return SUMA_EXTRA_BACKEND_LEVELS[localLevel];
    }
    return localLevel + OPERATION_OFFSET[operation];
};

export const getLevelCountForOperation = (operation) => (operation === 'suma' ? 5 : 3);


export const getTotalActivities = (levelConfig) => {
    return levelConfig?.activitiesCount || 5;
};

export const getQuestionsForLevel = (operation, levelNumber, levelConfig) => {
    if (!levelConfig || !levelConfig.config) {
        console.warn('No se encontró configuración del nivel, usando valores por defecto');
        return [];
    }
    
    const config = levelConfig.config;
    const activitiesCount = levelConfig.activitiesCount || 5;
    const questions = [];
    
        switch (operation) {
            case 'suma': {
                const seen = new Set();
                for (let i = 0; i < activitiesCount; i++) {
                    const q = generateWithRetry(
                        () => generateSumQuestion(config),
                        (c) => !seen.has(c.pregunta)
                    );
                    seen.add(q.pregunta);
                    questions.push(q);
                }
                break;
            }
            case 'resta': {
                const seen = new Set();
                for (let i = 0; i < activitiesCount; i++) {
                    const q = generateWithRetry(
                        () => generateSubtractQuestion(config),
                        (c) => !seen.has(c.pregunta)
                    );
                    seen.add(q.pregunta);
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