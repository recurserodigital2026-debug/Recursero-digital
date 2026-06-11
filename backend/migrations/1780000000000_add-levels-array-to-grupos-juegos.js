/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('grupos_juegos', {
    levels: {
      type: 'integer[]',
      notNull: true,
      default: pgm.func("'{}'"),
    },
  });
  // Migrate existing single-level rows to the new array column
  pgm.sql('UPDATE grupos_juegos SET levels = ARRAY[level]');
};

exports.down = (pgm) => {
  pgm.dropColumn('grupos_juegos', 'levels');
};
