/* eslint-disable camelcase *
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
    INSERT INTO games_levels (id, game_id, level, name, description, difficulty, activities_count, config, is_active)
    VALUES (
      'level-calculos-suma-4',
      'game-calculos',
      10,
      'Nivel 4 - Sumas de números iguales',
      'Sumas dobles: ambos operandos iguales',
      'Intermedio',
      5,
      '${JSON.stringify(L4_CONFIG)}'::jsonb,
      true
    )
    ON CONFLICT (id) DO UPDATE
      SET config      = EXCLUDED.config,
          name        = EXCLUDED.name,
          description = EXCLUDED.description,
          difficulty  = EXCLUDED.difficulty;
  `);

  pgm.sql(`
    INSERT INTO games_levels (id, game_id, level, name, description, difficulty, activities_count, config, is_active)
    VALUES (
      'level-calculos-suma-5',
      'game-calculos',
      11,
      'Nivel 5 - Sumas que dan 100, 1.000 o 10.000',
      'Complementos a 100, 1.000 o 10.000',
      'Intermedio',
      5,
      '${JSON.stringify(L5_CONFIG)}'::jsonb,
      true
    )
    ON CONFLICT (id) DO UPDATE
      SET config      = EXCLUDED.config,
          name        = EXCLUDED.name,
          description = EXCLUDED.description,
          difficulty  = EXCLUDED.difficulty;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM games_levels WHERE id IN ('level-calculos-suma-4', 'level-calculos-suma-5');`);
};
