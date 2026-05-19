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
    if (operation !== 'suma') {
        // resta branch is added in US3 (T029); fail loudly if reached today.
        throw new Error('freeForm: operación "resta" se implementa en US3');
    }
    const lo = minForDigits(digitCount);
    const hi = maxForDigits(digitCount);
    const a = pickInRange(lo, hi);
    const b = pickInRange(lo, hi);
    return {
        pregunta: `${formatNumber(a)} + ${formatNumber(b)} =`,
        respuesta: a + b,
        meta: { operandA: a, operandB: b, operation: 'suma', kind: 'free_form' },
    };
};

export const predicate = (calc, config) => {
    const { digitCount, operation } = config;
    const { operandA: a, operandB: b, operation: op } = calc.meta;
    if (op !== operation) return false;
    if (!hasExactDigits(a, digitCount) || !hasExactDigits(b, digitCount)) return false;
    if (op === 'resta' && a < b) return false;
    return true;
};
