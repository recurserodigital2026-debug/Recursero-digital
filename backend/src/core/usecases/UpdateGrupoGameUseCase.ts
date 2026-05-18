import { GrupoRepository } from '../infrastructure/GrupoRepository';

export class UpdateGrupoGameUseCase {
  constructor(private grupoRepository: GrupoRepository) {}

  async execute(groupId: string, gameId: string, level: number, isEnabled: boolean): Promise<void> {
    if (level < 1 || level > 3) throw new Error('El nivel debe ser 1, 2 o 3');
    await this.grupoRepository.updateGame(groupId, gameId, level, isEnabled);
  }
}
