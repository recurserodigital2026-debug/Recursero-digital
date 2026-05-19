import { formatNumber } from '../utils';
import { digitsOf, noCarryOnSum, hasExactDigits } from './predicates';

const pickPair = (digitCount) => {
    let a = 0;
    let b = 0;
    for (let i = 0; i < digitCount; i += 1) {
        const isLeading = i === digitCount - 1;
        // Pick da, then db ≤ 9 - da. For the leading position both digits MUST be ≥ 1
        // so the operand truly has `digitCount` digits.
        const daMin = isLeading ? 1 : 0;
        const da = daMin + Math.floor(Math.random() * (9 - daMin + 1));
        const dbMin = isLeading ? 1 : 0;
        const dbMax = 9 - da;
        if (dbMax < dbMin) {
            // Impossible at leading position when da === 9: retry the leading digit.
            i -= 1;
            continue;
        }
        const db = dbMin + Math.floor(Math.random() * (dbMax - dbMin + 1));
        a += da * 10 ** i;
        b += db * 10 ** i;
    }
    return [a, b];
};

export const generate = (config) => {
    const { digitCount } = config;
    if (![2, 3, 4].includes(digitCount)) {
        throw new Error(`noCarryAddition: digitCount inválido (${digitCount})`);
    }
    const [a, b] = pickPair(digitCount);
    return {
        pregunta: `${formatNumber(a)} + ${formatNumber(b)} =`,
        respuesta: a + b,
        meta: { operandA: a, operandB: b, operation: 'suma', kind: 'no_carry_sum' },
    };
};

export const predicate = (calc, config) => {
    const { digitCount } = config;
    const { operandA: a, operandB: b, operation } = calc.meta;
    if (operation !== 'suma') return false;
    if (!hasExactDigits(a, digitCount) || !hasExactDigits(b, digitCount)) return false;
    if (digitsOf(a) !== digitCount || digitsOf(b) !== digitCount) return false;
    return noCarryOnSum(a, b);
};
