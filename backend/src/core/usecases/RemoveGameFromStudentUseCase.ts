import { StudentGameRepository } from '../infrastructure/StudentGameRepository';
import { StudentRepository } from '../infrastructure/StudentRepository';

export class RemoveGameFromStudentUseCase {
  constructor(
    private studentGameRepository: StudentGameRepository,
    private studentRepository: StudentRepository
  ) {}

  async execute(studentId: string, gameId: string): Promise<void> {
    if (!studentId || !gameId) throw new Error('studentId y gameId son requeridos');

    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new Error('Estudiante no encontrado');

    await this.studentGameRepository.remove(studentId, gameId);
  }
}
