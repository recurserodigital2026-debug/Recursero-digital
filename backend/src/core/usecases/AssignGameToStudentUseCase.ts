import { StudentGameRepository } from '../infrastructure/StudentGameRepository';
import { StudentRepository } from '../infrastructure/StudentRepository';
import { IdGenerator } from '../infrastructure/IdGenerator';

export class AssignGameToStudentUseCase {
  constructor(
    private studentGameRepository: StudentGameRepository,
    private studentRepository: StudentRepository,
    private uuidGenerator: IdGenerator
  ) {}

  async execute(studentId: string, gameId: string, level: number): Promise<void> {
    if (!studentId || !gameId) throw new Error('studentId y gameId son requeridos');
    if (!level || level < 1) throw new Error('El nivel debe ser un número mayor a 0');

    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new Error('Estudiante no encontrado');

    const id = this.uuidGenerator.generate();
    await this.studentGameRepository.assign(id, studentId, gameId, level);
  }
}
