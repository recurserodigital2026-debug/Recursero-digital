/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO games_levels (id, game_id, level, name, description, difficulty, activities_count, config, is_active)
    VALUES (
      'level-calculos-suma-4',
      'game-calculos',
      10,
      'Nivel 4 - Sumas Dobles',
      '¡Suma de números iguales!',
      'Intermedio',
      5,
      '{"operation": "suma", "icon": "➕", "color": "from-yellow-400 to-orange-500", "kind": "doubles", "min": 10, "max": 5000, "step": 10, "maxResult": 10000}'::jsonb,
      true
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  pgm.sql(`
    INSERT INTO games_levels (id, game_id, level, name, description, difficulty, activities_count, config, is_active)
    VALUES (
      'level-calculos-suma-5',
      'game-calculos',
      11,
      'Nivel 5 - Sumas Complementarias',
      '¡Sumas que dan 100, 1.000 o 10.000!',
      'Avanzado',
      5,
      '{"operation": "suma", "icon": "➕", "color": "from-pink-400 to-rose-500", "kind": "sum_to_round", "step": 10, "minResult": 100, "maxResult": 10000, "roundTargets": [100, 1000, 10000]}'::jsonb,
      true
    )
    ON CONFLICT (id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM games_levels WHERE id IN ('level-calculos-suma-4', 'level-calculos-suma-5');`);
};
