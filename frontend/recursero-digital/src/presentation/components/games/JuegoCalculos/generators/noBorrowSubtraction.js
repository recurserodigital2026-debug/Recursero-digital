import { formatNumber } from '../utils';
import { digitsOf, noBorrowOnSub, hasExactDigits } from './predicates';

const pickPair = (digitCount) => {
    let a = 0;
    let b = 0;
    for (let i = 0; i < digitCount; i += 1) {
        const isLeading = i === digitCount - 1;
        // Pick da first; then db ∈ [dbMin, da] so the per-column rule da >= db holds.
        // Leading position forces da >= 1 AND db >= 1 so each operand truly has
        // `digitCount` digits.
        const daMin = isLeading ? 1 : 0;
        const da = daMin + Math.floor(Math.random() * (9 - daMin + 1));
        const dbMin = isLeading ? 1 : 0;
        if (da < dbMin) {
            // Impossible at leading position when da === 0 (already prevented) — guard
            // kept for clarity; just retry this position.
            i -= 1;
            continue;
        }
        const db = dbMin + Math.floor(Math.random() * (da - dbMin + 1));
        a += da * 10 ** i;
        b += db * 10 ** i;
    }
    return [a, b];
};

export const generate = (config) => {
    const { digitCount } = config;
    if (![2, 3, 4].includes(digitCount)) {
        throw new Error(`noBorrowSubtraction: digitCount inválido (${digitCount})`);
    }
    const [a, b] = pickPair(digitCount);
    return {
        pregunta: `${formatNumber(a)} - ${formatNumber(b)} =`,
        respuesta: a - b,
        meta: { operandA: a, operandB: b, operation: 'resta', kind: 'no_borrow_sub' },
    };
};

export const predicate = (calc, config) => {
    const { digitCount } = config;
    const { operandA: a, operandB: b, operation } = calc.meta;
    if (operation !== 'resta') return false;
    if (!hasExactDigits(a, digitCount) || !hasExactDigits(b, digitCount)) return false;
    if (digitsOf(a) !== digitCount || digitsOf(b) !== digitCount) return false;
    return noBorrowOnSub(a, b);
};
