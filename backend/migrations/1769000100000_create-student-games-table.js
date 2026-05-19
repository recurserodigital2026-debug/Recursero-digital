/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('student_games', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
    },
    student_id: {
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

  pgm.createConstraint('student_games', 'student_games_student_game_unique', 'UNIQUE (student_id, game_id)');
  pgm.createIndex('student_games', 'student_id');
};

exports.down = (pgm) => {
  pgm.dropTable('student_games');
};
