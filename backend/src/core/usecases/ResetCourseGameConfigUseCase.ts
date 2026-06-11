import { CourseRepository } from '../infrastructure/CourseRepository';
import { UserRole } from '../models/User';
import { CourseAccessDeniedError, CourseNotFoundError } from './GetCourseGameLevelsUseCase';

export interface ResetCourseGameConfigRequest {
    courseId: string;
    gameId: string;
    requester: {
        id: string;
        role: UserRole;
    };
}

export interface ResetCourseGameConfigResponse {
    reset: boolean;
    message: string;
}

export class ResetCourseGameConfigUseCase {
    constructor(private courseRepository: CourseRepository) {}

    async execute(request: ResetCourseGameConfigRequest): Promise<ResetCourseGameConfigResponse> {
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

        // Un docente solo puede operar sobre sus propios cursos. ADMIN no tiene restricción.
        if (request.requester.role === UserRole.TEACHER && course.teacher_id !== request.requester.id) {
            throw new CourseAccessDeniedError();
        }

        // No existe todavía una tabla de configuración personalizada por curso
        // (courses_games solo guarda is_enabled / order_index). Por eso no se borra nada:
        // todos los cursos ya usan la configuración global. Este endpoint queda como
        // no-op seguro hasta que se implemente la capa de overrides (course_game_levels).
        return {
            reset: false,
            message: 'Aún no existe configuración personalizada por curso para restaurar.'
        };
    }
}
