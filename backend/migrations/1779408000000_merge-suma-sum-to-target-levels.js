/* eslint-disable camelcase */

// Merge the three single-target sum_to_target suma levels (L5/L6/L7) into a single
// L5 whose target is picked per question from {100, 1000, 10000}.
// Prior state lives in migration 1779321600000.

exports.shorthands = undefined;

const NEW_L5_CONFIG = {
  operation: 'suma',
  icon: '➕',
  color: 'from-pink-400 to-rose-500',
  kind: 'sum_to_target',
  targets: [100, 1000, 10000],
};

const NEW_L5_META = {
  name: 'Nivel 5 - Sumas que dan 100, 1.000 o 10.000',
  description: 'Complementos a 100, 1.000 o 10.000',
  difficulty: 'Intermedio',
};

const PRIOR_L5_CONFIG = {
  operation: 'suma',
  icon: '➕',
  color: 'from-pink-400 to-rose-500',
  kind: 'sum_to_target',
  target: 100,
};

const PRIOR_L5_META = {
  name: 'Nivel 5 - Sumas que dan 100',
  description: 'Complementos a 100',
  difficulty: 'Intermedio',
};

const PRIOR_L6_CONFIG = {
  operation: 'suma',
  icon: '➕',
  color: 'from-pink-400 to-rose-500',
  kind: 'sum_to_target',
  target: 1000,
};

const PRIOR_L7_CONFIG = {
  operation: 'suma',
  icon: '➕',
  color: 'from-pink-400 to-rose-500',
  kind: 'sum_to_target',
  target: 10000,
};

exports.up = (pgm) => {
  pgm.sql('BEGIN;');

  pgm.sql(`
    UPDATE games_levels
    SET config = '${JSON.stringify(NEW_L5_CONFIG)}'::jsonb,
        name = '${NEW_L5_META.name.replace(/'/g, "''")}',
        description = '${NEW_L5_META.description.replace(/'/g, "''")}',
        difficulty = '${NEW_L5_META.difficulty}'
    WHERE id = 'level-calculos-suma-5';
  `);

  pgm.sql(`
    DELETE FROM games_levels
    WHERE id IN ('level-calculos-suma-6', 'level-calculos-suma-7');
  `);

  pgm.sql('COMMIT;');
};

exports.down = (pgm) => {
  pgm.sql('BEGIN;');

  pgm.sql(`
    UPDATE games_levels
    SET config = '${JSON.stringify(PRIOR_L5_CONFIG)}'::jsonb,
        name = '${PRIOR_L5_META.name.replace(/'/g, "''")}',
        description = '${PRIOR_L5_META.description.replace(/'/g, "''")}',
        difficulty = '${PRIOR_L5_META.difficulty}'
    WHERE id = 'level-calculos-suma-5';
  `);

  pgm.sql(`
    INSERT INTO games_levels (id, game_id, level, name, description, difficulty, activities_count, config, is_active)
    VALUES (
      'level-calculos-suma-6',
      'game-calculos',
      12,
      'Nivel 6 - Sumas que dan 1.000',
      'Complementos a 1.000',
      'Avanzado',
      5,
      '${JSON.stringify(PRIOR_L6_CONFIG)}'::jsonb,
      true
    );
  `);

  pgm.sql(`
    INSERT INTO games_levels (id, game_id, level, name, description, difficulty, activities_count, config, is_active)
    VALUES (
      'level-calculos-suma-7',
      'game-calculos',
      13,
      'Nivel 7 - Sumas que dan 10.000',
      'Complementos a 10.000',
      'Avanzado',
      5,
      '${JSON.stringify(PRIOR_L7_CONFIG)}'::jsonb,
      true
    );
  `);

  pgm.sql('COMMIT;');
};
