import { randInt, pick, dividesExact } from './divisionPredicates';

// Eje 1 — Reparto / partición con resta sucesiva (tachá de a N). Respuesta = nº de grupos.
const CONTEXTOS = [
    (total, grupo) => `Hay ${total} caramelos. Se reparten de a ${grupo}. Tachá de a ${grupo} hasta que no quede ninguno. ¿Cuántos grupos formaste?`,
    (total, grupo) => `Martina tiene ${total} figuritas y arma sobres de ${grupo}. Restá ${grupo} sucesivamente. ¿Cuántos sobres puede armar?`,
    (total, grupo) => `Un kiosco tiene ${total} chupetines y los vende en paquetes de ${grupo}. ¿Cuántos paquetes obtiene?`,
    (total, grupo) => `Hay ${total} libros para acomodar en estantes de ${grupo}. ¿Cuántos estantes completos se llenan?`,
];

export const generate = (config) => {
    const groupSizes = config.groupSizes ?? [3, 4, 5, 6];
    const maxGroups = config.maxGroups ?? 12;

    const grupo = pick(groupSizes);
    const grupos = randInt(2, maxGroups);
    const total = grupo * grupos;
    const contexto = pick(CONTEXTOS);

    return {
        pregunta: contexto(total, grupo),
        respuesta: grupos,
        inputMode: 'repeated_subtraction',
        soporteVisual: { total, grupo },
        meta: { total, grupo, grupos, operation: 'division', kind: 'division_repeated_subtraction' },
    };
};

export const predicate = (calc, config) => {
    const groupSizes = config.groupSizes ?? [3, 4, 5, 6];
    const maxGroups = config.maxGroups ?? 12;
    const { total, grupo, grupos } = calc.meta;
    if (!groupSizes.includes(grupo)) return false;
    if (grupos > maxGroups || grupos < 1) return false;
    if (!dividesExact(total, grupo)) return false;
    return total / grupo === grupos && calc.respuesta === grupos;
};
