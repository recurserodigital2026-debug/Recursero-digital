import { formatNumber } from '../utils';
import { hasExactDigits } from './predicates';

const minForDigits = (d) => 10 ** (d - 1);
const maxForDigits = (d) => 10 ** d - 1;

const pickInRange = (min, max) =>
    min + Math.floor(Math.random() * (max - min + 1));

export const generate = (config) => {
    const { digitCount, operation } = config;
    if (![2, 3, 4].includes(digitCount)) {
        throw new Error(`freeForm: digitCount inválido (${digitCount})`);
    }
    const lo = minForDigits(digitCount);
    const hi = maxForDigits(digitCount);
    if (operation === 'suma') {
        const a = pickInRange(lo, hi);
        const b = pickInRange(lo, hi);
        return {
            pregunta: `${formatNumber(a)} + ${formatNumber(b)} =`,
            respuesta: a + b,
            meta: { operandA: a, operandB: b, operation: 'suma', kind: 'free_form' },
        };
    }
    if (operation === 'resta') {
        let a = pickInRange(lo, hi);
        let b = pickInRange(lo, hi);
        if (a < b) [a, b] = [b, a];
        return {
            pregunta: `${formatNumber(a)} - ${formatNumber(b)} =`,
            respuesta: a - b,
            meta: { operandA: a, operandB: b, operation: 'resta', kind: 'free_form' },
        };
    }
    throw new Error(`freeForm: operación inválida (${operation})`);
};

export const predicate = (calc, config) => {
    const { digitCount, operation } = config;
    const { operandA: a, operandB: b, operation: op } = calc.meta;
    if (op !== operation) return false;
    if (!hasExactDigits(a, digitCount) || !hasExactDigits(b, digitCount)) return false;
    if (op === 'resta' && a < b) return false;
    return true;
};
