import { StudentGameRepository, StudentGameAssignment } from '../infrastructure/StudentGameRepository';
import { StudentRepository } from '../infrastructure/StudentRepository';

export interface StudentGameAssignmentsResponse {
  studentId: string;
  studentName: string;
  assignments: StudentGameAssignment[];
}

export class GetStudentGameAssignmentsUseCase {
  constructor(
    private studentGameRepository: StudentGameRepository,
    private studentRepository: StudentRepository
  ) {}

  async execute(studentId: string): Promise<StudentGameAssignmentsResponse> {
    if (!studentId) throw new Error('studentId es requerido');

    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new Error('Estudiante no encontrado');

    const assignments = await this.studentGameRepository.findByStudentId(studentId);

    return {
      studentId,
      studentName: `${student.name} ${student.lastname}`,
      assignments
    };
  }
}
