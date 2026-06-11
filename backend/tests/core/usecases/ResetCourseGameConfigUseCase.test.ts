import { ResetCourseGameConfigUseCase, ResetCourseGameConfigRequest } from "../../../src/core/usecases/ResetCourseGameConfigUseCase";
import { CourseAccessDeniedError, CourseNotFoundError } from "../../../src/core/usecases/GetCourseGameLevelsUseCase";
import { InMemoryCourseRepository } from "../../../src/infrastructure/InMemoryCourseRepository";
import { Course } from "../../../src/core/models/Course";
import { UserRole } from "../../../src/core/models/User";

describe('ResetCourseGameConfigUseCase', () => {
    let useCase: ResetCourseGameConfigUseCase;
    let courseRepository: InMemoryCourseRepository;

    const OWNER_ID = 'teacher-owner';
    const COURSE_ID = 'course-123';
    const GAME_ID = 'game-ordenamiento';

    beforeEach(async () => {
        courseRepository = new InMemoryCourseRepository();
        await courseRepository.addCourse(new Course(COURSE_ID, 'Matemáticas 3° A', OWNER_ID, []));
        useCase = new ResetCourseGameConfigUseCase(courseRepository);
    });

    const request = (overrides: Partial<ResetCourseGameConfigRequest> = {}): ResetCourseGameConfigRequest => ({
        courseId: COURSE_ID,
        gameId: GAME_ID,
        requester: { id: OWNER_ID, role: UserRole.TEACHER },
        ...overrides
    });

    it('lanza error cuando falta courseId', async () => {
        await expect(useCase.execute(request({ courseId: '' })))
            .rejects.toThrow('courseId es requerido');
    });

    it('lanza error cuando falta gameId', async () => {
        await expect(useCase.execute(request({ gameId: '' })))
            .rejects.toThrow('gameId es requerido');
    });

    it('lanza CourseNotFoundError cuando el curso no existe', async () => {
        await expect(useCase.execute(request({ courseId: 'no-existe' })))
            .rejects.toBeInstanceOf(CourseNotFoundError);
    });

    it('lanza CourseAccessDeniedError cuando el docente no es dueño del curso', async () => {
        await expect(useCase.execute(request({
            requester: { id: 'otro-docente', role: UserRole.TEACHER }
        }))).rejects.toBeInstanceOf(CourseAccessDeniedError);
    });

    it('devuelve reset:false (no-op) cuando el docente es dueño del curso', async () => {
        const result = await useCase.execute(request());
        expect(result.reset).toBe(false);
        expect(typeof result.message).toBe('string');
    });

    it('permite a un ADMIN aunque no sea dueño del curso', async () => {
        const result = await useCase.execute(request({
            requester: { id: 'cualquier-admin', role: UserRole.ADMIN }
        }));
        expect(result.reset).toBe(false);
    });
});
