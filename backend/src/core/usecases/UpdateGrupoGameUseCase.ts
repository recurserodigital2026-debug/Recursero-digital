import { GrupoRepository } from '../infrastructure/GrupoRepository';

export class UpdateGrupoGameUseCase {
  constructor(private grupoRepository: GrupoRepository) {}

  async execute(groupId: string, gameId: string, levels: number[], isEnabled: boolean): Promise<void> {
    if (!levels || levels.length === 0) throw new Error('Debe seleccionar al menos un nivel');
    if (levels.some(l => l < 1)) throw new Error('El nivel debe ser un número mayor a 0');
    await this.grupoRepository.updateGame(groupId, gameId, levels, isEnabled);
  }
}
