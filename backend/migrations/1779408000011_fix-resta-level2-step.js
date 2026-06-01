exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE games_levels
    SET config = config || '{"step": 10}'::jsonb
    WHERE id = 'level-calculos-resta-2';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE games_levels
    SET config = config || '{"step": 100}'::jsonb
    WHERE id = 'level-calculos-resta-2';
  `);
};
