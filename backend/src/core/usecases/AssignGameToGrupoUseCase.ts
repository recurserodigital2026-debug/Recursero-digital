import { GrupoRepository } from '../infrastructure/GrupoRepository';
import { IdGenerator } from '../infrastructure/IdGenerator';

export class AssignGameToGrupoUseCase {
  constructor(
    private grupoRepository: GrupoRepository,
    private uuidGenerator: IdGenerator
  ) {}

  async execute(groupId: string, gameId: string, level: number): Promise<void> {
    if (!groupId || !gameId) throw new Error('groupId y gameId son requeridos');
    if (!level || level < 1 || level > 3) throw new Error('El nivel debe ser 1, 2 o 3');

    const id = this.uuidGenerator.generate();
    await this.grupoRepository.assignGame(id, groupId, gameId, level);
  }
}
