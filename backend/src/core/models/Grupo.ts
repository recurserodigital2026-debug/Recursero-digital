import { Game } from './Game';

export interface GrupoJuego {
  id: string;
  groupId: string;
  gameId: string;
  level: number;
  isEnabled: boolean;
  game?: Game;
}

export class Grupo {
  id: string;
  name: string;
  courseId: string;
  studentCount: number;
  gameCount: number;

  constructor(
    id: string,
    name: string,
    courseId: string,
    studentCount: number = 0,
    gameCount: number = 0
  ) {
    this.id = id;
    this.name = name;
    this.courseId = courseId;
    this.studentCount = studentCount;
    this.gameCount = gameCount;
  }
}
