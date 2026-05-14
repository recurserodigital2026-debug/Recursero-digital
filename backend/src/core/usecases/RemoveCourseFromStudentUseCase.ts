import { StudentRepository } from '../infrastructure/StudentRepository';
import { CourseRepository } from '../infrastructure/CourseRepository';

export interface RemoveCourseFromStudentRequest {
    studentId: string;
    courseId: string;
}

export class RemoveCourseFromStudentUseCase {
    constructor(
        private studentRepository: StudentRepository,
        private courseRepository: CourseRepository
    ) {}

    async execute(request: RemoveCourseFromStudentRequest): Promise<void> {
        const { studentId, courseId } = request;

        if (!studentId || !courseId) {
            throw new Error('studentId y courseId son requeridos');
        }

        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }

        
        const student = await this.studentRepository.findById(studentId);
        if (!student) {
            throw new Error('Estudiante no encontrado');
        }

        if (student.courseId !== courseId) {
            throw new Error('El estudiante no pertenece a este curso');
        }

        await this.studentRepository.removeCourseFromStudent(studentId);
    }
}
