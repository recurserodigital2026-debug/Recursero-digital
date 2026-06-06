import { GrupoRepository } from '../infrastructure/GrupoRepository';
import { IdGenerator } from '../infrastructure/IdGenerator';

export class AssignGameToGrupoUseCase {
  constructor(
    private grupoRepository: GrupoRepository,
    private uuidGenerator: IdGenerator
  ) {}

  async execute(groupId: string, gameId: string, levels: number[]): Promise<void> {
    if (!groupId || !gameId) throw new Error('groupId y gameId son requeridos');
    if (!levels || levels.length === 0) throw new Error('Debe seleccionar al menos un nivel');
    if (levels.some(l => l < 1)) throw new Error('El nivel debe ser un número mayor a 0');

    const id = this.uuidGenerator.generate();
    await this.grupoRepository.assignGame(id, groupId, gameId, levels);
  }
}
