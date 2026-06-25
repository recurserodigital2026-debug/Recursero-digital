import { randInt, pick, dividesExact } from './divisionPredicates';

// Eje 6 — División por 10, 100 y 1000 (cociente entero exacto por ítem).
const VALID_DIVISORS = [10, 100, 1000];

export const generate = (config) => {
    const divisors = config.divisors ?? VALID_DIVISORS;
    const itemsPerExercise = config.itemsPerExercise ?? 3;

    const items = [];
    for (let i = 0; i < itemsPerExercise; i += 1) {
        const divisor = pick(divisors);
        const cociente = randInt(1, 99);
        const dividendo = cociente * divisor;
        items.push({ texto: `${dividendo} ÷ ${divisor} =`, respuesta: cociente, dividendo, divisor });
    }

    return {
        pregunta: 'Completá las divisiones:',
        items,
        inputMode: 'multi_blank',
        meta: { operation: 'division', kind: 'division_by_powers_of_ten' },
    };
};

export const predicate = (calc, config) => {
    const divisors = config.divisors ?? VALID_DIVISORS;
    if (!Array.isArray(calc.items) || calc.items.length === 0) return false;
    return calc.items.every(
        (it) =>
            divisors.includes(it.divisor) &&
            VALID_DIVISORS.includes(it.divisor) &&
            dividesExact(it.dividendo, it.divisor) &&
            it.respuesta === it.dividendo / it.divisor
    );
};
