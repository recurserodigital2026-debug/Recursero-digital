import { GrupoRepository } from '../infrastructure/GrupoRepository';
import { IdGenerator } from '../infrastructure/IdGenerator';

export class CreateGrupoUseCase {
  constructor(
    private grupoRepository: GrupoRepository,
    private uuidGenerator: IdGenerator
  ) {}

  async execute(name: string, courseId: string): Promise<string> {
    if (!name?.trim()) throw new Error('El nombre del grupo es requerido');
    if (!courseId) throw new Error('El curso es requerido');

    const id = this.uuidGenerator.generate();
    await this.grupoRepository.create(id, name.trim(), courseId);
    return id;
  }
}
