import { StudentGameRepository, StudentGameAssignment } from '../core/infrastructure/StudentGameRepository';
import { DatabaseConnection } from './DatabaseConnection';
import { Game } from '../core/models/Game';

export class PostgreSQLStudentGameRepository implements StudentGameRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async findByStudentId(studentId: string): Promise<StudentGameAssignment[]> {
    const result = await this.db.query(
      `SELECT sg.id, sg.student_id, sg.game_id, sg.level, sg.is_enabled,
              g.id as g_id, g.name as g_name, g.description as g_description,
              g.image_url as g_image_url, g.route as g_route,
              g.difficulty_level as g_difficulty_level, g.is_active as g_is_active,
              g.created_at as g_created_at, g.updated_at as g_updated_at
       FROM student_games sg
       JOIN games g ON sg.game_id = g.id
       WHERE sg.student_id = $1
       ORDER BY sg.created_at ASC`,
      [studentId]
    );
    return result.rows.map(this.mapRow);
  }

  async findByStudentAndGame(studentId: string, gameId: string): Promise<StudentGameAssignment | null> {
    const result = await this.db.query(
      `SELECT sg.id, sg.student_id, sg.game_id, sg.level, sg.is_enabled,
              g.id as g_id, g.name as g_name, g.description as g_description,
              g.image_url as g_image_url, g.route as g_route,
              g.difficulty_level as g_difficulty_level, g.is_active as g_is_active,
              g.created_at as g_created_at, g.updated_at as g_updated_at
       FROM student_games sg
       JOIN games g ON sg.game_id = g.id
       WHERE sg.student_id = $1 AND sg.game_id = $2`,
      [studentId, gameId]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async assign(id: string, studentId: string, gameId: string, level: number): Promise<void> {
    await this.db.query(
      `INSERT INTO student_games (id, student_id, game_id, level, is_enabled)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (student_id, game_id)
       DO UPDATE SET level = $4, is_enabled = true, updated_at = CURRENT_TIMESTAMP`,
      [id, studentId, gameId, level]
    );
  }

  async remove(studentId: string, gameId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM student_games WHERE student_id = $1 AND game_id = $2`,
      [studentId, gameId]
    );
  }

  async update(studentId: string, gameId: string, level: number, isEnabled: boolean): Promise<void> {
    await this.db.query(
      `UPDATE student_games
       SET level = $3, is_enabled = $4, updated_at = CURRENT_TIMESTAMP
       WHERE student_id = $1 AND game_id = $2`,
      [studentId, gameId, level, isEnabled]
    );
  }

  async hasAssignments(studentId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT 1 FROM student_games WHERE student_id = $1 LIMIT 1`,
      [studentId]
    );
    return result.rows.length > 0;
  }

  private mapRow(row: any): StudentGameAssignment {
    return {
      id: row.id,
      studentId: row.student_id,
      gameId: row.game_id,
      level: row.level,
      isEnabled: row.is_enabled,
      game: new Game(
        row.g_id,
        row.g_name,
        row.g_description,
        row.g_image_url,
        row.g_route,
        row.g_difficulty_level,
        row.g_is_active,
        row.g_created_at,
        row.g_updated_at
      )
    };
  }
}
