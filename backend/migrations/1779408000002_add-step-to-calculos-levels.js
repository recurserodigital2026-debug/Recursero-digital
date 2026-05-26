/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`UPDATE games_levels SET config = config || '{"step": 10}'::jsonb WHERE id = 'level-calculos-suma-1';`);
  pgm.sql(`UPDATE games_levels SET config = config || '{"step": 100}'::jsonb WHERE id = 'level-calculos-suma-2';`);
  pgm.sql(`UPDATE games_levels SET config = config || '{"step": 1000}'::jsonb WHERE id = 'level-calculos-suma-3';`);
  pgm.sql(`UPDATE games_levels SET config = config || '{"step": 10}'::jsonb WHERE id = 'level-calculos-resta-1';`);
  pgm.sql(`UPDATE games_levels SET config = config || '{"step": 100}'::jsonb WHERE id = 'level-calculos-resta-2';`);
  pgm.sql(`UPDATE games_levels SET config = config || '{"step": 1000}'::jsonb WHERE id = 'level-calculos-resta-3';`);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE games_levels
    SET config = config - 'step'
    WHERE id IN (
      'level-calculos-suma-1', 'level-calculos-suma-2', 'level-calculos-suma-3',
      'level-calculos-resta-1', 'level-calculos-resta-2', 'level-calculos-resta-3'
    );
  `);
};
