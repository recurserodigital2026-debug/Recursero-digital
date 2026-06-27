import { randInt, isValidDivision } from './divisionPredicates';

// Eje 5 — Tabla pitagórica con resto ≠ 0 (25 ÷ 4 = __ y sobra __).
export const generate = (config) => {
    const [dMin, dMax] = config.divisorRange ?? [2, 9];
    const dividendMax = config.dividendMax ?? 99;

    const divisor = randInt(Math.max(2, dMin), dMax);
    const resto = randInt(1, divisor - 1); // estrictamente > 0
    const maxCociente = Math.max(1, Math.floor((dividendMax - resto) / divisor));
    const cociente = randInt(1, maxCociente);
    const dividendo = divisor * cociente + resto;

    return {
        pregunta: `${dividendo} ÷ ${divisor}`,
        respuestas: { cociente, resto },
        inputMode: 'quotient_remainder',
        meta: { dividendo, divisor, cociente, resto, operation: 'division', kind: 'division_with_remainder' },
    };
};

export const predicate = (calc, config) => {
    const [dMin, dMax] = config.divisorRange ?? [2, 9];
    const dividendMax = config.dividendMax ?? 99;
    const { dividendo, divisor, cociente, resto } = calc.meta;
    if (divisor < Math.max(2, dMin) || divisor > dMax) return false;
    if (resto <= 0) return false; // eje 5 exige resto > 0
    if (dividendo > dividendMax) return false;
    return isValidDivision(dividendo, divisor, cociente, resto);
};
