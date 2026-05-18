import { StudentGameRepository, StudentGameAssignment } from '../../src/core/infrastructure/StudentGameRepository';

export class MockStudentGameRepository implements StudentGameRepository {
    private assignments: StudentGameAssignment[] = [];

    async findByStudentId(studentId: string): Promise<StudentGameAssignment[]> {
        return this.assignments.filter(a => a.studentId === studentId);
    }

    async findByStudentAndGame(studentId: string, gameId: string): Promise<StudentGameAssignment | null> {
        return this.assignments.find(a => a.studentId === studentId && a.gameId === gameId) || null;
    }

    async assign(id: string, studentId: string, gameId: string, level: number): Promise<void> {
        this.assignments.push({ id, studentId, gameId, level, isEnabled: true });
    }

    async remove(studentId: string, gameId: string): Promise<void> {
        this.assignments = this.assignments.filter(a => !(a.studentId === studentId && a.gameId === gameId));
    }

    async update(studentId: string, gameId: string, level: number, isEnabled: boolean): Promise<void> {
        const a = this.assignments.find(a => a.studentId === studentId && a.gameId === gameId);
        if (a) {
            a.level = level;
            a.isEnabled = isEnabled;
        }
    }

    async hasAssignments(studentId: string): Promise<boolean> {
        return this.assignments.some(a => a.studentId === studentId);
    }

    clear(): void {
        this.assignments = [];
    }
}
