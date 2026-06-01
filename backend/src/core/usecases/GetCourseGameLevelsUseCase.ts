import { CourseRepository } from '../infrastructure/CourseRepository';
import { StudentRepository } from '../infrastructure/StudentRepository';
import { UserRole } from '../models/User';
import { GetGameLevelsUseCase, GetGameLevelsResponse } from './GetGameLevelsUseCase';

export interface GetCourseGameLevelsRequest {
    courseId: string;
    gameId: string;
    onlyActive?: boolean;
    requester: {
        id: string;
        role: UserRole;
    };
}

export class CourseNotFoundError extends Error {
    constructor() {
        super('El curso no existe');
        this.name = 'CourseNotFoundError';
    }
}

export class CourseAccessDeniedError extends Error {
    constructor() {
        super('No tenés permisos para acceder a este curso');
        this.name = 'CourseAccessDeniedError';
    }
}

export class GetCourseGameLevelsUseCase {
    constructor(
        private courseRepository: CourseRepository,
        private studentRepository: StudentRepository,
        private getGameLevelsUseCase: GetGameLevelsUseCase
    ) {}

    async execute(request: GetCourseGameLevelsRequest): Promise<GetGameLevelsResponse> {
        if (!request.courseId || request.courseId.trim() === '') {
            throw new Error('courseId es requerido');
        }
        if (!request.gameId || request.gameId.trim() === '') {
            throw new Error('gameId es requerido');
        }

        const course = await this.courseRepository.findById(request.courseId);
        if (!course) {
            throw new CourseNotFoundError();
        }

        if (request.requester.role === UserRole.STUDENT) {
            const student = await this.studentRepository.findById(request.requester.id);
            if (!student || student.getCourseId() !== request.courseId) {
                throw new CourseAccessDeniedError();
            }
        }

        return this.getGameLevelsUseCase.execute({
            gameId: request.gameId,
            onlyActive: request.onlyActive,
        });
    }
}
