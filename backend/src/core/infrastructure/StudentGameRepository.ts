import { Game } from '../models/Game';

export interface StudentGameAssignment {
  id: string;
  studentId: string;
  gameId: string;
  level: number;
  isEnabled: boolean;
  game?: Game;
}

export interface StudentGameRepository {
  findByStudentId(studentId: string): Promise<StudentGameAssignment[]>;
  findByStudentAndGame(studentId: string, gameId: string): Promise<StudentGameAssignment | null>;
  assign(id: string, studentId: string, gameId: string, level: number): Promise<void>;
  remove(studentId: string, gameId: string): Promise<void>;
  update(studentId: string, gameId: string, level: number, isEnabled: boolean): Promise<void>;
  hasAssignments(studentId: string): Promise<boolean>;
}
