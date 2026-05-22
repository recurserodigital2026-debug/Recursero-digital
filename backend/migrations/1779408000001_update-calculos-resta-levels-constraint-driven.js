/* eslint-disable camelcase */

// Constraint-driven resta levels for JuegoCalculos (US3 / Phase 4).
// See specs/001-addition-subtraction-levels/data-model.md for the `config.kind` shape.
// Suma levels were updated by migration 1779321600000.

exports.shorthands = undefined;

// Snapshot of prior configs (composed from 1768127100000_seed-games-levels.js +
// 1768135000000_update-calculos-levels-config.js + 1768140000000_add-step-to-calculos-levels.js).
const PRIOR = {
  'level-calculos-resta-1': {
    operation: 'resta',
    icon: '➖',
    color: 'from-red-400 to-pink-500',
    min: 20,
    max: 100,
    minResult: 10,
    maxResult: 50,
    step: 10,
  },
  'level-calculos-resta-2': {
    operation: 'resta',
    icon: '➖',
    color: 'from-blue-400 to-indigo-500',
    min: 200,
    max: 800,
    minResult: 100,
    maxResult: 500,
    step: 100,
  },
  'level-calculos-resta-3': {
    operation: 'resta',
    icon: '➖',
    color: 'from-purple-400 to-pink-500',
    min: 2000,
    max: 7000,
    minResult: 1000,
    maxResult: 5000,
    step: 1000,
  },
};

const NEW_CONFIGS = {
  'level-calculos-resta-1': {
    operation: 'resta',
    icon: '➖',
    color: 'from-red-400 to-pink-500',
    kind: 'no_borrow_sub',
    digitCount: 2,
  },
  'level-calculos-resta-2': {
    operation: 'resta',
    icon: '➖',
    color: 'from-blue-400 to-indigo-500',
    kind: 'whole_multiples',
    step: 10,
    min: 20,
    max: 90,
  },
  'level-calculos-resta-3': {
    operation: 'resta',
    icon: '➖',
    color: 'from-purple-400 to-pink-500',
    kind: 'free_form',
    digitCount: 2,
  },
};

const RENAMES = {
  'level-calculos-resta-1': {
    name: 'Nivel 1 - Restas sin dificultad',
    description: 'Restas de dos cifras sin pedir prestado',
    difficulty: 'Fácil',
  },
  'level-calculos-resta-2': {
    name: 'Nivel 2 - Restas con enteros',
    description: 'Restas con números enteros (decenas)',
    difficulty: 'Fácil',
  },
  'level-calculos-resta-3': {
    name: 'Nivel 3 - Restas con números diferentes',
    description: 'Restas libres con números de dos cifras',
    difficulty: 'Intermedio',
  },
};

const PRIOR_RENAMES = {
  'level-calculos-resta-1': {
    name: 'Nivel 1 - Restas',
    description: '¡Principiante! Operaciones simples',
    difficulty: 'Fácil',
  },
  'level-calculos-resta-2': {
    name: 'Nivel 2 - Restas',
    description: '¡Intermedio! Un poco más difícil',
    difficulty: 'Intermedio',
  },
  'level-calculos-resta-3': {
    name: 'Nivel 3 - Restas',
    description: '¡Experto! El desafío máximo',
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
};

exports.down = (pgm) => {
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
