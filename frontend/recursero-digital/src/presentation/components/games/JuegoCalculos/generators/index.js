import * as sumToTarget from './sumToTarget';
import * as wholeMultiples from './wholeMultiples';
import * as identicalNumbers from './identicalNumbers';
import * as noCarryAddition from './noCarryAddition';
import * as freeForm from './freeForm';
// Subtraction generators (no_borrow_sub, resta branches of whole_multiples/freeForm)
// are added in US3 (T027–T030).

const GENERATORS = {
    sum_to_target: sumToTarget,
    whole_multiples: wholeMultiples,
    identical_numbers: identicalNumbers,
    no_carry_sum: noCarryAddition,
    free_form: freeForm,
};

const MAX_PREDICATE_RETRIES = 10;

export const dispatch = (config) => {
    if (!config || typeof config !== 'object') {
        throw new Error('config inválido: se esperaba un objeto');
    }
    const { kind } = config;
    const gen = GENERATORS[kind];
    if (!gen) {
        throw new Error(`Tipo de nivel desconocido: '${kind}'. No se puede generar el cálculo.`);
    }

    // T020a — runtime predicate verification (honors FR-002).
    for (let attempt = 0; attempt < MAX_PREDICATE_RETRIES; attempt += 1) {
        const calc = gen.generate(config);
        if (gen.predicate(calc, config)) return calc;
    }
    throw new Error(
        `No se pudo generar un cálculo válido para el nivel '${kind}' tras ${MAX_PREDICATE_RETRIES} intentos.`
    );
};
