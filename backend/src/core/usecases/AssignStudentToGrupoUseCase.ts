import { GrupoRepository } from '../infrastructure/GrupoRepository';
import { StudentRepository } from '../infrastructure/StudentRepository';

export class AssignStudentToGrupoUseCase {
  constructor(
    private grupoRepository: GrupoRepository,
    private studentRepository: StudentRepository
  ) {}

  async execute(groupId: string, studentId: string): Promise<void> {
    const grupo = await this.grupoRepository.findById(groupId);
    if (!grupo) throw new Error('Grupo no encontrado');

    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new Error('Estudiante no encontrado');

    await this.grupoRepository.addStudent(groupId, studentId);
  }
}
