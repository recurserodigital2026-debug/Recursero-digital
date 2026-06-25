import { randInt, dividesExact } from './divisionPredicates';

// Eje 4 — Tabla pitagórica: dividir directamente (dividendo ÷ divisor = cociente, exacto).
export const generate = (config) => {
    const maxDivisor = config.maxDivisor ?? 10;
    const maxQuotient = config.maxQuotient ?? 10;
    const divisor = randInt(1, maxDivisor);
    const cociente = randInt(1, maxQuotient);
    const dividendo = divisor * cociente;
    return {
        pregunta: `${dividendo} ÷ ${divisor} =`,
        respuesta: cociente,
        inputMode: 'single',
        meta: { dividendo, divisor, cociente, operation: 'division', kind: 'division_facts' },
    };
};

export const predicate = (calc, config) => {
    const maxDivisor = config.maxDivisor ?? 10;
    const maxQuotient = config.maxQuotient ?? 10;
    const { dividendo, divisor, cociente } = calc.meta;
    if (divisor < 1 || divisor > maxDivisor) return false;
    if (cociente < 1 || cociente > maxQuotient) return false;
    if (!dividesExact(dividendo, divisor)) return false;
    return dividendo / divisor === cociente;
};
