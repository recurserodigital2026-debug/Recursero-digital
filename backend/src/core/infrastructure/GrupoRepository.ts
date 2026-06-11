import { Grupo, GrupoJuego } from '../models/Grupo';
import { Student } from '../models/Student';

export interface GrupoRepository {
  create(id: string, name: string, courseId: string): Promise<void>;
  findById(id: string): Promise<Grupo | null>;
  findByCourseId(courseId: string): Promise<Grupo[]>;
  delete(id: string): Promise<void>;
  addStudent(groupId: string, studentId: string): Promise<void>;
  removeStudent(groupId: string, studentId: string): Promise<void>;
  getStudents(groupId: string): Promise<Student[]>;
  assignGame(id: string, groupId: string, gameId: string, levels: number[]): Promise<void>;
  removeGame(groupId: string, gameId: string): Promise<void>;
  updateGame(groupId: string, gameId: string, levels: number[], isEnabled: boolean): Promise<void>;
  getGames(groupId: string): Promise<GrupoJuego[]>;
}
