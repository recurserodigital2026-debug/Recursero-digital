import { randInt, pick, dividesExact } from './divisionPredicates';

// Eje 7 — Cálculos conocidos para resolver cálculos nuevos.
// Dado un hecho base a ÷ b = c, cada blanco se deriva por:
//   - scale:     (a·s) ÷ b = c·s
//   - decompose: (a + k·b) ÷ b = c + k   (p. ej. 40÷4=10 → 44÷4=11)
export const generate = (config) => {
    const baseFacts = config.baseFacts ?? [[10, 5, 2], [40, 4, 10]];
    const scales = config.scales ?? [10, 100];
    const derivations = config.derivations ?? ['scale', 'decompose'];
    const maxAddendMultiple = config.maxAddendMultiple ?? 2;
    const itemsPerExercise = config.itemsPerExercise ?? 2;

    const [a, b, c] = pick(baseFacts);
    const items = [];
    for (let i = 0; i < itemsPerExercise; i += 1) {
        const derivation = pick(derivations);
        let dividendo;
        let respuesta;
        if (derivation === 'decompose') {
            const k = randInt(1, maxAddendMultiple);
            dividendo = a + k * b;
            respuesta = c + k;
        } else {
            const s = pick(scales);
            dividendo = a * s;
            respuesta = c * s;
        }
        items.push({ texto: `${dividendo} ÷ ${b} =`, respuesta, dividendo, divisor: b, derivation });
    }

    return {
        pregunta: `Si sabés que ${a} ÷ ${b} = ${c}, completá:`,
        items,
        soporteVisual: { datoBase: `${a} ÷ ${b} = ${c}` },
        inputMode: 'multi_blank',
        meta: { baseFact: [a, b, c], operation: 'division', kind: 'division_scaling' },
    };
};

export const predicate = (calc) => {
    const [a, b, c] = calc.meta.baseFact;
    if (b === 0 || a / b !== c) return false;
    if (!Array.isArray(calc.items) || calc.items.length === 0) return false;
    return calc.items.every(
        (it) =>
            it.divisor === b &&
            dividesExact(it.dividendo, b) &&
            it.respuesta === it.dividendo / b
    );
};
