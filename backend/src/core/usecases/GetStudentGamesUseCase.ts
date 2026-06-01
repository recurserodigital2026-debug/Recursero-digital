import { StudentRepository } from '../infrastructure/StudentRepository';
import { CourseRepository } from '../infrastructure/CourseRepository';
import { StudentGameRepository } from '../infrastructure/StudentGameRepository';
import { GrupoRepository } from '../infrastructure/GrupoRepository';
import { CourseGame } from '../models/CourseGame';
import { StudentNotFoundError } from '../models/exceptions/StudentNotFoundError';
import { StudentInvalidRequestError } from '../models/exceptions/StudentInvalidRequestError';

export interface GetStudentGamesRequest {
    studentId: string;
}

export interface StudentGamesResponse {
    studentId: string;
    courseId: string | null;
    games: (CourseGame & { level?: number })[];
    source: 'student' | 'group' | 'course';
}

export class GetStudentGamesUseCase {
    private studentRepository: StudentRepository;
    private courseRepository: CourseRepository;
    private studentGameRepository: StudentGameRepository;
    private grupoRepository: GrupoRepository;

    constructor(
        studentRepository: StudentRepository,
        courseRepository: CourseRepository,
        studentGameRepository: StudentGameRepository,
        grupoRepository: GrupoRepository
    ) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.studentGameRepository = studentGameRepository;
        this.grupoRepository = grupoRepository;
    }

    async execute(request: GetStudentGamesRequest): Promise<StudentGamesResponse> {
        if (!request || !request.studentId) {
            throw new StudentInvalidRequestError('studentId es requerido');
        }

        const student = await this.studentRepository.findById(request.studentId);
        if (!student) {
            throw new StudentNotFoundError();
        }

        const courseId = student.getCourseId();
        if (!courseId) {
            return {
                studentId: student.id,
                courseId: null,
                games: [],
                source: 'course'
            };
        }

        const groupId = student.getGroupId();
        if (groupId) {
            const groupGames = await this.grupoRepository.getGames(groupId);
            const enabledGroupGames = groupGames.filter(g => g.isEnabled);
            if (enabledGroupGames.length > 0) {
                const games = enabledGroupGames.map(g => {
                    const cg = new CourseGame(
                        g.id,
                        student.getCourseId() || '',
                        g.gameId,
                        true,
                        g.level,
                        g.game
                    ) as CourseGame & { level?: number };
                    cg.level = g.level;
                    return cg;
                });
                return { studentId: student.id, courseId: student.getCourseId(), games, source: 'group' };
            }
        }

        // Priority 2: individual student assignments
        const hasPersonalAssignments = await this.studentGameRepository.hasAssignments(request.studentId);
        if (hasPersonalAssignments) {
            const assignments = await this.studentGameRepository.findByStudentId(request.studentId);
            const enabledAssignments = assignments.filter(a => a.isEnabled);

            const games = enabledAssignments.map(a => {
                const cg = new CourseGame(
                    a.id,
                    student.getCourseId() || '',
                    a.gameId,
                    true,
                    a.level,
                    a.game
                ) as CourseGame & { level?: number };
                cg.level = a.level;
                return cg;
            });

            return {
                studentId: student.id,
                courseId: student.getCourseId(),
                games,
                source: 'student'
            };
        }

        return {
            studentId: student.id,
            courseId: courseId,
            games: [],
            source: 'course'
        };
    }
}
