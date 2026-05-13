import { generateWithRetry } from "../../../../utils/generateWithRetry";

export const formatNumber = (num) => {
    return num.toLocaleString('es-ES');
};

const generateSumQuestion = (config) => {
    const { min = 10, max = 50, minResult = 20, maxResult = 100 } = config;
    
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const respuesta = num1 + num2;
    
    if (respuesta < minResult || respuesta > maxResult) {
        const targetResult = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
        const adjustedNum1 = Math.floor(Math.random() * (targetResult - min + 1)) + min;
        const adjustedNum2 = targetResult - adjustedNum1;
        
        if (adjustedNum2 >= min && adjustedNum2 <= max) {
            return {
                pregunta: `${formatNumber(adjustedNum1)} + ${formatNumber(adjustedNum2)} =`,
                respuesta: targetResult
            };
        }
    }
    
    return {
        pregunta: `${formatNumber(num1)} + ${formatNumber(num2)} =`,
        respuesta: respuesta
    };
};

const generateSubtractQuestion = (config) => {
    const { min = 20, max = 100, minResult = 10, maxResult = 50 } = config;
    
    // Para resta, el minuendo debe ser mayor que el sustraendo
    // Asegurar que el resultado esté en el rango esperado y que ambos números sean positivos
    
    // Primero, asegurar que el targetResult pueda caber en el rango
    // El targetResult máximo posible es max - min (diferencia entre max y min)
    const maxPossibleResult = max - min;
    const adjustedMaxResult = Math.min(maxResult, maxPossibleResult);
    const adjustedMinResult = Math.min(minResult, adjustedMaxResult);
    
    // Generar el resultado objetivo dentro del rango ajustado
    const targetResult = Math.floor(Math.random() * (adjustedMaxResult - adjustedMinResult + 1)) + adjustedMinResult;
    
    // Calcular el rango válido para el sustraendo
    // El minuendo = sustraendo + targetResult debe estar entre min y max
    // Por lo tanto: min <= sustraendo + targetResult <= max
    // Esto implica: sustraendo <= (max - targetResult) y sustraendo >= min
    const maxSustraendo = max - targetResult;
    const minSustraendo = min;
    
    // Validar que haya un rango válido
    if (maxSustraendo < minSustraendo) {
        // Si no hay espacio, usar el rango completo y ajustar el resultado
        const sustraendo = Math.floor(Math.random() * (max - min + 1)) + min;
        const minuendo = Math.min(max, sustraendo + Math.min(targetResult, max - sustraendo));
        const finalResult = minuendo - sustraendo;
        
        return {
            pregunta: `${formatNumber(minuendo)} − ${formatNumber(sustraendo)} =`,
            respuesta: finalResult
        };
    }
    
    // Generar sustraendo dentro del rango válido
    const sustraendo = Math.floor(Math.random() * (maxSustraendo - minSustraendo + 1)) + minSustraendo;
    const minuendo = sustraendo + targetResult;
    
    // Validación final: asegurar que ambos números estén en el rango y sean positivos
    if (minuendo > max || minuendo < min || sustraendo < min || sustraendo > max || sustraendo <= 0 || minuendo <= 0) {
        // Ajustar usando límites seguros
        const safeMinuendo = Math.min(max, Math.max(min, minuendo));
        const safeSustraendo = Math.max(min, Math.min(max, safeMinuendo - targetResult));
        
        // Asegurar que el sustraendo sea positivo y menor que el minuendo
        if (safeSustraendo > 0 && safeSustraendo < safeMinuendo) {
            const finalResult = safeMinuendo - safeSustraendo;
            return {
                pregunta: `${formatNumber(safeMinuendo)} − ${formatNumber(safeSustraendo)} =`,
                respuesta: finalResult
            };
        }
    }
    
    // Asegurar que ambos números sean positivos
    if (sustraendo <= 0 || minuendo <= 0 || sustraendo >= minuendo) {
        // Regenerar con valores seguros
        const safeSustraendo = Math.max(1, Math.floor(Math.random() * (max - min + 1)) + min);
        const safeMinuendo = Math.min(max, safeSustraendo + Math.min(targetResult, max - safeSustraendo));
        const safeResult = safeMinuendo - safeSustraendo;
        
        return {
            pregunta: `${formatNumber(safeMinuendo)} − ${formatNumber(safeSustraendo)} =`,
            respuesta: safeResult
        };
    }
    
    return {
        pregunta: `${formatNumber(minuendo)} − ${formatNumber(sustraendo)} =`,
        respuesta: targetResult
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
    }
];


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
                for(let i = 0; i < activitiesCount; i++) {
                    questions.push(generateSumQuestion(config));
                }
                break;
            }
            case 'resta': {
                for(let i = 0; i < activitiesCount; i++) {
                    questions.push(generateSubtractQuestion(config));
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
    const baseScore = 50 * levelNumber;
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

export const getNextLevel = (currentLevel) => {
    switch(currentLevel) {
        case 'nivel1': return 'nivel2';
        case 'nivel2': return 'nivel3';
        case 'nivel3': return null;
        default: return null;
    }
};

export const isLastLevel = (level) => {
    return level === 'nivel3';
};