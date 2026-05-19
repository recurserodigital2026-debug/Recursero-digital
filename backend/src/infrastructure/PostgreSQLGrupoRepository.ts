import { GrupoRepository } from '../core/infrastructure/GrupoRepository';
import { Grupo, GrupoJuego } from '../core/models/Grupo';
import { Student } from '../core/models/Student';
import { User, UserRole } from '../core/models/User';
import { Game } from '../core/models/Game';
import { DatabaseConnection } from './DatabaseConnection';

export class PostgreSQLGrupoRepository implements GrupoRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async create(id: string, name: string, courseId: string): Promise<void> {
    await this.db.query(
      `INSERT INTO grupos (id, name, course_id) VALUES ($1, $2, $3)`,
      [id, name, courseId]
    );
  }

  async findById(id: string): Promise<Grupo | null> {
    const result = await this.db.query(
      `SELECT g.*,
        (SELECT COUNT(*) FROM students s WHERE s.group_id = g.id)::int AS student_count,
        (SELECT COUNT(*) FROM grupos_juegos gj WHERE gj.group_id = g.id)::int AS game_count
       FROM grupos g WHERE g.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return this.mapRow(result.rows[0]);
  }

  async findByCourseId(courseId: string): Promise<Grupo[]> {
    const result = await this.db.query(
      `SELECT g.*,
        (SELECT COUNT(*) FROM students s WHERE s.group_id = g.id)::int AS student_count,
        (SELECT COUNT(*) FROM grupos_juegos gj WHERE gj.group_id = g.id)::int AS game_count
       FROM grupos g WHERE g.course_id = $1 ORDER BY g.created_at ASC`,
      [courseId]
    );
    return result.rows.map(this.mapRow);
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM grupos WHERE id = $1`, [id]);
  }

  async addStudent(groupId: string, studentId: string): Promise<void> {
    await this.db.query(
      `UPDATE students SET group_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [groupId, studentId]
    );
  }

  async removeStudent(groupId: string, studentId: string): Promise<void> {
    await this.db.query(
      `UPDATE students SET group_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND group_id = $2`,
      [studentId, groupId]
    );
  }

  async getStudents(groupId: string): Promise<Student[]> {
    const result = await this.db.query(
      `SELECT s.*, u.id as user_id, u.username, u.password_hash, u.role
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.group_id = $1 AND s.enable = true
       ORDER BY s.name ASC`,
      [groupId]
    );
    return result.rows.map((row: any) => {
      const user = new User(row.user_id, row.username, row.password_hash, row.role as UserRole);
      return new Student(row.id, row.name, row.lastname, row.dni, row.course_id, user, row.group_id);
    });
  }

  async assignGame(id: string, groupId: string, gameId: string, level: number): Promise<void> {
    await this.db.query(
      `INSERT INTO grupos_juegos (id, group_id, game_id, level, is_enabled)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (group_id, game_id)
       DO UPDATE SET level = $4, is_enabled = true, updated_at = CURRENT_TIMESTAMP`,
      [id, groupId, gameId, level]
    );
  }

  async removeGame(groupId: string, gameId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM grupos_juegos WHERE group_id = $1 AND game_id = $2`,
      [groupId, gameId]
    );
  }

  async updateGame(groupId: string, gameId: string, level: number, isEnabled: boolean): Promise<void> {
    await this.db.query(
      `UPDATE grupos_juegos SET level = $3, is_enabled = $4, updated_at = CURRENT_TIMESTAMP
       WHERE group_id = $1 AND game_id = $2`,
      [groupId, gameId, level, isEnabled]
    );
  }

  async getGames(groupId: string): Promise<GrupoJuego[]> {
    const result = await this.db.query(
      `SELECT gj.*, g.id as g_id, g.name as g_name, g.description as g_description,
              g.image_url as g_image_url, g.route as g_route,
              g.difficulty_level as g_difficulty_level, g.is_active as g_is_active,
              g.created_at as g_created_at, g.updated_at as g_updated_at
       FROM grupos_juegos gj
       JOIN games g ON gj.game_id = g.id
       WHERE gj.group_id = $1
       ORDER BY gj.created_at ASC`,
      [groupId]
    );
    return result.rows.map(this.mapGameRow);
  }

  private mapRow(row: any): Grupo {
    return new Grupo(row.id, row.name, row.course_id, row.student_count, row.game_count);
  }

  private mapGameRow(row: any): GrupoJuego {
    return {
      id: row.id,
      groupId: row.group_id,
      gameId: row.game_id,
      level: row.level,
      isEnabled: row.is_enabled,
      game: new Game(
        row.g_id, row.g_name, row.g_description, row.g_image_url,
        row.g_route, row.g_difficulty_level, row.g_is_active,
        row.g_created_at, row.g_updated_at
      )
    };
  }
}
