/* eslint-disable camelcase */

// Constraint-driven suma levels for JuegoCalculos.
// See specs/001-addition-subtraction-levels/data-model.md for the `config.kind` shape.
// Resta levels are updated in a follow-up migration when US3 lands.

exports.shorthands = undefined;

// Snapshot of prior configs (captured 2026-05-17) — used by `down` to restore exactly.
const PRIOR = {
  'level-calculos-suma-1': {
    operation: 'suma',
    icon: '➕',
    color: 'from-green-400 to-emerald-500',
    kind: 'round_operands',
    min: 10,
    max: 50,
    minResult: 20,
    maxResult: 100,
    step: 1,
  },
  'level-calculos-suma-2': {
    operation: 'suma',
    icon: '➕',
    color: 'from-blue-400 to-indigo-500',
    kind: 'round_operands',
    min: 100,
    max: 600,
    minResult: 200,
    maxResult: 1200,
    step: 1,
  },
  'level-calculos-suma-3': {
    operation: 'suma',
    icon: '➕',
    color: 'from-purple-400 to-pink-500',
    kind: 'round_operands',
    min: 1000,
    max: 5000,
    minResult: 2000,
    maxResult: 10000,
    step: 1,
  },
  'level-calculos-suma-4': {
    operation: 'suma',
    icon: '➕',
    color: 'from-yellow-400 to-orange-500',
    kind: 'doubles',
    min: 10,
    max: 5000,
    step: 10,
    maxResult: 10000,
  },
  'level-calculos-suma-5': {
    operation: 'suma',
    icon: '➕',
    color: 'from-pink-400 to-rose-500',
    kind: 'sum_to_round',
    step: 10,
    minResult: 100,
    maxResult: 10000,
    roundTargets: [100, 1000, 10000],
  },
};

const NEW_CONFIGS = {
  'level-calculos-suma-1': {
    operation: 'suma',
    icon: '➕',
    color: 'from-green-400 to-emerald-500',
    kind: 'no_carry_sum',
    digitCount: 2,
  },
  'level-calculos-suma-2': {
    operation: 'suma',
    icon: '➕',
    color: 'from-blue-400 to-indigo-500',
    kind: 'whole_multiples',
    step: 10,
    min: 10,
    max: 90,
  },
  'level-calculos-suma-3': {
    operation: 'suma',
    icon: '➕',
    color: 'from-purple-400 to-pink-500',
    kind: 'free_form',
    digitCount: 2,
  },
  'level-calculos-suma-4': {
    operation: 'suma',
    icon: '➕',
    color: 'from-yellow-400 to-orange-500',
    kind: 'identical_numbers',
    min: 10,
    max: 99,
  },
  'level-calculos-suma-5': {
    operation: 'suma',
    icon: '➕',
    color: 'from-pink-400 to-rose-500',
    kind: 'sum_to_target',
    target: 100,
  },
};

const RENAMES = {
  'level-calculos-suma-1': {
    name: 'Nivel 1 - Sumas sin dificultad',
    description: 'Sumas de dos cifras sin acarreo',
    difficulty: 'Fácil',
  },
  'level-calculos-suma-2': {
    name: 'Nivel 2 - Sumas con enteros',
    description: 'Sumas con números enteros (decenas)',
    difficulty: 'Fácil',
  },
  'level-calculos-suma-3': {
    name: 'Nivel 3 - Sumas con números diferentes',
    description: 'Sumas libres con números de dos cifras',
    difficulty: 'Intermedio',
  },
  'level-calculos-suma-4': {
    name: 'Nivel 4 - Sumas de números iguales',
    description: 'Sumas dobles: ambos operandos iguales',
    difficulty: 'Intermedio',
  },
  'level-calculos-suma-5': {
    name: 'Nivel 5 - Sumas que dan 100',
    description: 'Complementos a 100',
    difficulty: 'Intermedio',
  },
};

const PRIOR_RENAMES = {
  'level-calculos-suma-1': {
    name: 'Nivel 1',
    description: 'Sumas básicas',
    difficulty: 'Fácil',
  },
  'level-calculos-suma-2': {
    name: 'Nivel 2',
    description: 'Sumas intermedias',
    difficulty: 'Intermedio',
  },
  'level-calculos-suma-3': {
    name: 'Nivel 3',
    description: 'Sumas avanzadas',
    difficulty: 'Avanzado',
  },
  'level-calculos-suma-4': {
    name: 'Nivel 4 - Sumas Dobles',
    description: '¡Suma de números iguales!',
    difficulty: 'Intermedio',
  },
  'level-calculos-suma-5': {
    name: 'Nivel 5 - Sumas Complementarias',
    description: '¡Sumas que dan 100, 1.000 o 10.000!',
    difficulty: 'Avanzado',
  },
};

exports.up = (pgm) => {
  for (const id of Object.keys(NEW_CONFIGS)) {
    const cfg = JSON.stringify(NEW_CONFIGS[id]);
    const meta = RENAMES[id];
    pgm.sql(`
      UPDATE games_levels
      SET config = '${cfg}'::jsonb,
          name = '${meta.name.replace(/'/g, "''")}',
          description = '${meta.description.replace(/'/g, "''")}',
          difficulty = '${meta.difficulty}'
      WHERE id = '${id}';
    `);
  }

  // Split the sum-to-target family: L5 stays at target=100; insert L6 (target=1000)
  // and L7 (target=10000) as new rows so each target is independently selectable
  // (FR-001).
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
      '${JSON.stringify({
        operation: 'suma',
        icon: '➕',
        color: 'from-pink-400 to-rose-500',
        kind: 'sum_to_target',
        target: 1000,
      })}'::jsonb,
      true
    )
    ON CONFLICT (id) DO UPDATE
      SET config = EXCLUDED.config,
          name = EXCLUDED.name,
          description = EXCLUDED.description;
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
      '${JSON.stringify({
        operation: 'suma',
        icon: '➕',
        color: 'from-pink-400 to-rose-500',
        kind: 'sum_to_target',
        target: 10000,
      })}'::jsonb,
      true
    )
    ON CONFLICT (id) DO UPDATE
      SET config = EXCLUDED.config,
          name = EXCLUDED.name,
          description = EXCLUDED.description;
  `);
};

exports.down = (pgm) => {
  // Remove inserted rows first.
  pgm.sql(`DELETE FROM games_levels WHERE id IN ('level-calculos-suma-6', 'level-calculos-suma-7');`);

  // Restore prior configs and names verbatim.
  for (const id of Object.keys(PRIOR)) {
    const cfg = JSON.stringify(PRIOR[id]);
    const meta = PRIOR_RENAMES[id];
    pgm.sql(`
      UPDATE games_levels
      SET config = '${cfg}'::jsonb,
          name = '${meta.name.replace(/'/g, "''")}',
          description = '${meta.description.replace(/'/g, "''")}',
          difficulty = '${meta.difficulty}'
      WHERE id = '${id}';
    `);
  }
};
