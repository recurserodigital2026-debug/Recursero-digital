/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('grupos', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    course_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('grupos', 'course_id');

  pgm.createTable('grupos_juegos', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    group_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    game_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    level: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    is_enabled: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createConstraint('grupos_juegos', 'grupos_juegos_group_game_unique', 'UNIQUE (group_id, game_id)');

  pgm.addColumn('students', {
    group_id: {
      type: 'varchar(255)',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('students', 'group_id');
  pgm.dropTable('grupos_juegos');
  pgm.dropTable('grupos');
};
