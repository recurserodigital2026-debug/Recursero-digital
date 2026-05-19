import { GrupoRepository } from '../infrastructure/GrupoRepository';

export class RemoveStudentFromGrupoUseCase {
  constructor(private grupoRepository: GrupoRepository) {}

  async execute(groupId: string, studentId: string): Promise<void> {
    await this.grupoRepository.removeStudent(groupId, studentId);
  }
}
