import * as sumToTarget from './sumToTarget';
import * as wholeMultiples from './wholeMultiples';
import * as identicalNumbers from './identicalNumbers';
import * as noCarryAddition from './noCarryAddition';
import * as noBorrowSubtraction from './noBorrowSubtraction';
import * as freeForm from './freeForm';
import * as divisionFacts from './divisionFacts';
import * as wordRemainder from './wordRemainder';
import * as divisionWithRemainder from './divisionWithRemainder';
import * as divisionByPowersOfTen from './divisionByPowersOfTen';
import * as divisionScaling from './divisionScaling';
import * as repeatedSubtraction from './repeatedSubtraction';
import * as divisionEstimation from './divisionEstimation';

// sum_to_round usa roundTargets en lugar de targets — adaptamos al generador sumToTarget
const sumToRoundAdapter = {
    generate: (config) => sumToTarget.generate({ ...config, targets: config.roundTargets || config.targets }),
    predicate: (calc, config) => sumToTarget.predicate(calc, { ...config, targets: config.roundTargets || config.targets }),
};

const doublesAdapter = {
    generate: (config) => identicalNumbers.generate({ ...config, min: config.min ?? 10, max: config.max ?? 99 }),
    predicate: (calc, config) => identicalNumbers.predicate(calc, { ...config, min: config.min ?? 10, max: config.max ?? 99 }),
};

const GENERATORS = {
    sum_to_target: sumToTarget,
    sum_to_round: sumToRoundAdapter,
    doubles: doublesAdapter,
    whole_multiples: wholeMultiples,
    identical_numbers: identicalNumbers,
    no_carry_sum: noCarryAddition,
    no_borrow_sub: noBorrowSubtraction,
    free_form: freeForm,
    // División (por ejes)
    division_facts: divisionFacts,
    division_word_remainder: wordRemainder,
    division_with_remainder: divisionWithRemainder,
    division_by_powers_of_ten: divisionByPowersOfTen,
    division_scaling: divisionScaling,
    division_repeated_subtraction: repeatedSubtraction,
    division_estimation: divisionEstimation,
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
