import { GrupoRepository } from '../infrastructure/GrupoRepository';
import { Grupo } from '../models/Grupo';

export class GetGruposByCourseUseCase {
  constructor(private grupoRepository: GrupoRepository) {}

  async execute(courseId: string): Promise<Grupo[]> {
    if (!courseId) throw new Error('courseId es requerido');
    return this.grupoRepository.findByCourseId(courseId);
  }
}
