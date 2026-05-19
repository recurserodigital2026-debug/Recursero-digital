import { StudentGameRepository } from '../infrastructure/StudentGameRepository';

export class UpdateStudentGameUseCase {
  constructor(private studentGameRepository: StudentGameRepository) {}

  async execute(studentId: string, gameId: string, level: number, isEnabled: boolean): Promise<void> {
    if (!studentId || !gameId) throw new Error('studentId y gameId son requeridos');
    if (level < 1 || level > 3) throw new Error('El nivel debe ser 1, 2 o 3');

    const existing = await this.studentGameRepository.findByStudentAndGame(studentId, gameId);
    if (!existing) throw new Error('Asignación no encontrada');

    await this.studentGameRepository.update(studentId, gameId, level, isEnabled);
  }
}
