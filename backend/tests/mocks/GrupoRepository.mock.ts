import { GrupoRepository } from '../../src/core/infrastructure/GrupoRepository';
import { Grupo, GrupoJuego } from '../../src/core/models/Grupo';
import { Student } from '../../src/core/models/Student';

export class MockGrupoRepository implements GrupoRepository {
    private grupos: Grupo[] = [];
    private games: GrupoJuego[] = [];
    private students: Map<string, string[]> = new Map();

    async create(id: string, name: string, courseId: string): Promise<void> {
        this.grupos.push(new Grupo(id, name, courseId));
    }

    async findById(id: string): Promise<Grupo | null> {
        return this.grupos.find(g => g.id === id) || null;
    }

    async findByCourseId(courseId: string): Promise<Grupo[]> {
        return this.grupos.filter(g => g.courseId === courseId);
    }

    async delete(id: string): Promise<void> {
        this.grupos = this.grupos.filter(g => g.id !== id);
    }

    async addStudent(groupId: string, studentId: string): Promise<void> {
        const list = this.students.get(groupId) || [];
        list.push(studentId);
        this.students.set(groupId, list);
    }

    async removeStudent(groupId: string, studentId: string): Promise<void> {
        const list = this.students.get(groupId) || [];
        this.students.set(groupId, list.filter(id => id !== studentId));
    }

    async getStudents(_groupId: string): Promise<Student[]> {
        return [];
    }

    async assignGame(id: string, groupId: string, gameId: string, level: number): Promise<void> {
        this.games.push({ id, groupId, gameId, level, isEnabled: true });
    }

    async removeGame(groupId: string, gameId: string): Promise<void> {
        this.games = this.games.filter(g => !(g.groupId === groupId && g.gameId === gameId));
    }

    async updateGame(groupId: string, gameId: string, level: number, isEnabled: boolean): Promise<void> {
        const g = this.games.find(g => g.groupId === groupId && g.gameId === gameId);
        if (g) {
            g.level = level;
            g.isEnabled = isEnabled;
        }
    }

    async getGames(groupId: string): Promise<GrupoJuego[]> {
        return this.games.filter(g => g.groupId === groupId);
    }

    clear(): void {
        this.grupos = [];
        this.games = [];
        this.students = new Map();
    }
}
