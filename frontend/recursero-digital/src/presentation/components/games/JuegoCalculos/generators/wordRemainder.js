import { randInt, pick, isValidDivision } from './divisionPredicates';

// Eje 2 — ¿Alcanza justo o falta? Problemas con contexto (cociente + resto).
// Banco curado de contextos en español; los números se completan por ejercicio.
// Mezcla casos exactos ("alcanza justo", resto 0) y con sobrante ("falta", resto > 0).
const CONTEXTOS = [
    (D, d) => `Hay ${D} caramelos para repartir en partes iguales entre ${d} chicos. ¿Cuántos le tocan a cada uno y cuántos sobran?`,
    (D, d) => `Martina tiene ${D} figuritas y arma sobres de ${d} figuritas. ¿Cuántos sobres completos arma y cuántas figuritas quedan?`,
    (D, d) => `Se colocan ${D} flores en floreros de ${d} flores cada uno. ¿Cuántos floreros se llenan y cuántas flores quedan?`,
    (D, d) => `Hay ${D} libros para acomodar en estantes de ${d}. ¿Cuántos estantes se llenan y cuántos libros quedan?`,
    (D, d) => `Un kiosco vende ${D} chupetines en paquetes de ${d}. ¿Cuántos paquetes arma y cuántos chupetines quedan?`,
];

export const generate = (config) => {
    const [dMin, dMax] = config.divisorRange ?? [3, 6];
    const dividendMax = config.dividendMax ?? 60;
    const allowExact = config.allowExact ?? true;

    const divisor = randInt(dMin, dMax);
    const resto = allowExact ? randInt(0, divisor - 1) : randInt(1, divisor - 1);
    const maxCociente = Math.max(1, Math.floor((dividendMax - resto) / divisor));
    const cociente = randInt(1, maxCociente);
    const dividendo = divisor * cociente + resto;
    const contexto = pick(CONTEXTOS);

    return {
        pregunta: contexto(dividendo, divisor),
        respuestas: { cociente, resto },
        inputMode: 'quotient_remainder',
        meta: { dividendo, divisor, cociente, resto, operation: 'division', kind: 'division_word_remainder' },
    };
};

export const predicate = (calc, config) => {
    const [dMin, dMax] = config.divisorRange ?? [3, 6];
    const dividendMax = config.dividendMax ?? 60;
    const { dividendo, divisor, cociente, resto } = calc.meta;
    if (divisor < dMin || divisor > dMax) return false;
    if (dividendo > dividendMax) return false;
    return isValidDivision(dividendo, divisor, cociente, resto);
};
