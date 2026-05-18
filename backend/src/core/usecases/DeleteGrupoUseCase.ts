import { GrupoRepository } from '../infrastructure/GrupoRepository';

export class DeleteGrupoUseCase {
  constructor(private grupoRepository: GrupoRepository) {}

  async execute(groupId: string): Promise<void> {
    if (!groupId) throw new Error('groupId es requerido');
    const grupo = await this.grupoRepository.findById(groupId);
    if (!grupo) throw new Error('Grupo no encontrado');
    await this.grupoRepository.delete(groupId);
  }
}
