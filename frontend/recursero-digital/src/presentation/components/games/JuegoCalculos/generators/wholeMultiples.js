import { formatNumber } from '../utils';

const pickMultiple = (min, max, step) => {
    const firstK = Math.ceil(min / step);
    const lastK = Math.floor(max / step);
    if (lastK < firstK) throw new Error('wholeMultiples: rango inválido');
    return step * (firstK + Math.floor(Math.random() * (lastK - firstK + 1)));
};

export const generate = (config) => {
    const { step, min, max, operation } = config;
    if (operation === 'suma') {
        const a = pickMultiple(min, max, step);
        const b = pickMultiple(min, max, step);
        return {
            pregunta: `${formatNumber(a)} + ${formatNumber(b)} =`,
            respuesta: a + b,
            meta: { operandA: a, operandB: b, operation: 'suma', kind: 'whole_multiples' },
        };
    }
    if (operation === 'resta') {
        const b = pickMultiple(min, max, step);
        const a = pickMultiple(b, max, step);
        return {
            pregunta: `${formatNumber(a)} - ${formatNumber(b)} =`,
            respuesta: a - b,
            meta: { operandA: a, operandB: b, operation: 'resta', kind: 'whole_multiples' },
        };
    }
    throw new Error(`wholeMultiples: operación inválida (${operation})`);
};

export const predicate = (calc, config) => {
    const { step, min, max, operation } = config;
    const { operandA: a, operandB: b, operation: op } = calc.meta;
    if (op !== operation) return false;
    if (a % step !== 0 || b % step !== 0) return false;
    if (a < min || a > max || b < min || b > max) return false;
    if (op === 'resta' && a < b) return false;
    return true;
};
