import { GrupoRepository } from '../infrastructure/GrupoRepository';

export class RemoveGameFromGrupoUseCase {
  constructor(private grupoRepository: GrupoRepository) {}

  async execute(groupId: string, gameId: string): Promise<void> {
    await this.grupoRepository.removeGame(groupId, gameId);
  }
}
