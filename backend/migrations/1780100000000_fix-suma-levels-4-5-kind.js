
exports.shorthands = undefined;

const L4_CONFIG = {
  operation: 'suma',
  icon: '➕',
  color: 'from-yellow-400 to-orange-500',
  kind: 'identical_numbers',
  min: 10,
  max: 99,
};

const L5_CONFIG = {
  operation: 'suma',
  icon: '➕',
  color: 'from-pink-400 to-rose-500',
  kind: 'sum_to_target',
  targets: [100, 1000, 10000],
};

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE games_levels
    SET config      = '${JSON.stringify(L4_CONFIG)}'::jsonb,
        name        = 'Nivel 4 - Sumas de números iguales',
        description = 'Sumas dobles: ambos operandos iguales',
        difficulty  = 'Intermedio'
    WHERE id = 'level-calculos-suma-4';
  `);

  pgm.sql(`
    UPDATE games_levels
    SET config      = '${JSON.stringify(L5_CONFIG)}'::jsonb,
        name        = 'Nivel 5 - Sumas que dan 100, 1.000 o 10.000',
        description = 'Complementos a 100, 1.000 o 10.000',
        difficulty  = 'Intermedio'
    WHERE id = 'level-calculos-suma-5';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE games_levels
    SET config      = '{"operation":"suma","icon":"➕","color":"from-yellow-400 to-orange-500","kind":"doubles","min":10,"max":5000,"step":10,"maxResult":10000}'::jsonb,
        name        = 'Nivel 4 - Sumas Dobles',
        description = '¡Suma de números iguales!',
        difficulty  = 'Intermedio'
    WHERE id = 'level-calculos-suma-4';
  `);

  pgm.sql(`
    UPDATE games_levels
    SET config      = '{"operation":"suma","icon":"➕","color":"from-pink-400 to-rose-500","kind":"sum_to_round","step":10,"minResult":100,"maxResult":10000,"roundTargets":[100,1000,10000]}'::jsonb,
        name        = 'Nivel 5 - Sumas Complementarias',
        description = '¡Sumas que dan 100, 1.000 o 10.000!',
        difficulty  = 'Avanzado'
    WHERE id = 'level-calculos-suma-5';
  `);
};
