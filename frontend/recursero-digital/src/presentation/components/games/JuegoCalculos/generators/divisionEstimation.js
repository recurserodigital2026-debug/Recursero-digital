import { randInt, pick } from './divisionPredicates';

// Eje 8 — Cálculo aproximado. Dos formatos del PDF:
//   - threshold: "menor / igual a / mayor que 10"
//   - nearest:   "está más cerca de X / Y / Z"
const NEAREST_TARGETS = [5, 10, 20];

const buildThreshold = (dividendMax, divisorMax) => {
    const divisor = randInt(2, divisorMax);
    const dividendo = randInt(divisor, dividendMax);
    const ref = 10 * divisor;
    const valor = dividendo < ref ? 'lt' : dividendo === ref ? 'eq' : 'gt';
    return {
        pregunta: `${dividendo} ÷ ${divisor} es:`,
        opciones: [
            { texto: 'Menor que 10', valor: 'lt' },
            { texto: 'Igual a 10', valor: 'eq' },
            { texto: 'Mayor que 10', valor: 'gt' },
        ],
        respuestaCorrecta: valor,
        inputMode: 'multiple_choice',
        meta: { shape: 'threshold', dividendo, divisor, operation: 'division', kind: 'division_estimation' },
    };
};

const buildNearest = (dividendMax, divisorMax) => {
    const divisor = randInt(2, divisorMax);
    const dividendo = randInt(divisor, dividendMax);
    const q = dividendo / divisor;
    const dist = NEAREST_TARGETS.map((t) => Math.abs(q - t));
    const min = Math.min(...dist);
    const nearestIdx = dist.indexOf(min);
    return {
        pregunta: `${dividendo} ÷ ${divisor} está más cerca de:`,
        opciones: NEAREST_TARGETS.map((t) => ({ texto: String(t), valor: t })),
        respuestaCorrecta: NEAREST_TARGETS[nearestIdx],
        inputMode: 'multiple_choice',
        meta: { shape: 'nearest', dividendo, divisor, q, operation: 'division', kind: 'division_estimation' },
    };
};

export const generate = (config) => {
    const shapes = config.shapes ?? ['threshold', 'nearest'];
    const dividendMax = config.dividendMax ?? 320;
    const divisorMax = config.divisorMax ?? 30;
    const shape = pick(shapes);
    return shape === 'nearest'
        ? buildNearest(dividendMax, divisorMax)
        : buildThreshold(dividendMax, divisorMax);
};

export const predicate = (calc) => {
    const correct = calc.opciones.filter((o) => o.valor === calc.respuestaCorrecta);
    if (correct.length !== 1) return false;

    if (calc.meta.shape === 'threshold') {
        const { dividendo, divisor } = calc.meta;
        const ref = 10 * divisor;
        const expected = dividendo < ref ? 'lt' : dividendo === ref ? 'eq' : 'gt';
        return calc.respuestaCorrecta === expected;
    }
    // nearest: el objetivo correcto debe ser único (sin empates).
    const q = calc.meta.dividendo / calc.meta.divisor;
    const dist = NEAREST_TARGETS.map((t) => Math.abs(q - t));
    const min = Math.min(...dist);
    const winners = dist.filter((d) => d === min);
    if (winners.length !== 1) return false;
    return calc.respuestaCorrecta === NEAREST_TARGETS[dist.indexOf(min)];
};
