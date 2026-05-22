import { formatNumber } from '../utils';

export const generate = (config) => {
    const { min, max } = config;
    if (max < min) throw new Error('identicalNumbers: rango inválido');
    const a = min + Math.floor(Math.random() * (max - min + 1));
    return {
        pregunta: `${formatNumber(a)} + ${formatNumber(a)} =`,
        respuesta: 2 * a,
        meta: { operandA: a, operandB: a, operation: 'suma', kind: 'identical_numbers' },
    };
};

export const predicate = (calc, config) => {
    const { min, max } = config;
    const { operandA: a, operandB: b, operation } = calc.meta;
    if (operation !== 'suma') return false;
    if (a !== b) return false;
    return a >= min && a <= max;
};
