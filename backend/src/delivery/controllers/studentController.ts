import { Request, Response } from 'express';
import { DependencyContainer } from '../../config/DependencyContainer';
import { StudentAlreadyExistsError } from '../../core/models/exceptions/StudentAlreadyExistsError';
import { AuthenticatedRequest } from '../middleware/authMiddleWare';
import { StudentNotFoundError } from '../../core/models/exceptions/StudentNotFoundError';
import { StudentInvalidRequestError } from '../../core/models/exceptions/StudentInvalidRequestError';
import { UpdateStudentUseCase } from '../../core/usecases/UpdateStudentUseCase';
import { DeleteStudentUseCase } from '../../core/usecases/DeleteStudentUseCase';
import { EnableStudentUseCase } from '../../core/usecases/EnableStudentUseCase';

interface AddStudentRequest {
    name: string;
    lastName: string;
    username: string;
    password: string;
    dni: string;
}

interface AddStudentResponse {
    message?: string;
    error?: string;
}

const dependencyContainer = DependencyContainer.getInstance();
const addStudentUseCase = dependencyContainer.addStudentUseCase;

const addStudent = async (req: Request<{}, AddStudentResponse, AddStudentRequest>, res: Response<AddStudentResponse>): Promise<void> => {
    const { name, lastName, username, password, dni } = req.body;

    try {
        await addStudentUseCase.execute({
            name,
            lastName,
            username,
            password,
            dni
        });
        
        res.status(201).json({ message: 'Estudiante creado exitosamente' });
    } catch (error) {
        if (error instanceof StudentInvalidRequestError) {
            res.status(400).json({ error: error.message });
            return;
        }
        
        if (error instanceof StudentAlreadyExistsError) {
            res.status(409).json({ error: error.message });
            return;
        }
        
        console.error('Error en addStudent:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getAllStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = (dependencyContainer.studentRepository as any).db;
        const result = await db.query(
            `SELECT s.*, u.id as user_id, u.username, u.password_hash, u.role 
             FROM students s 
             JOIN users u ON s.user_id = u.id 
             ORDER BY s.created_at DESC`
        );
        
        res.status(200).json({
            students: result.rows.map((row: any) => ({
                id: row.id,
                name: `${row.name} ${row.lastname}`,
                firstName: row.name,
                lastName: row.lastname,
                username: row.username,
                dni: row.dni,
                courseId: row.course_id || null,
                enable: row.enable ?? true
            }))
        });
    } catch (error) {
        console.error('Error en getAllStudents:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getMyGames = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }
        const result = await dependencyContainer.getStudentGamesUseCase.execute({ studentId: req.user.id });

        res.status(200).json(result);
    } catch (error: any) {
        if (error instanceof StudentNotFoundError) {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error instanceof StudentInvalidRequestError) {
            res.status(400).json({ error: error.message });
            return;
        }
        
        console.error('Error en getMyGames:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.params as { studentId: string };
        const { name, lastname, username, password, courseId } = req.body as { 
            name: string; 
            lastname: string; 
            username: string; 
            password?: string | null;
            courseId?: string | null;
        };

        if (!studentId) {
            res.status(400).json({ error: 'studentId es requerido' });
            return;
        }

        if (!name || name.trim() === '') {
            res.status(400).json({ error: 'El nombre es requerido' });
            return;
        }

        if (!lastname || lastname.trim() === '') {
            res.status(400).json({ error: 'El apellido es requerido' });
            return;
        }

        if (!username || username.trim() === '') {
            res.status(400).json({ error: 'El username es requerido' });
            return;
        }

        const useCase = dependencyContainer.updateStudentUseCase;
        const result = await useCase.execute({ 
            studentId, 
            name: name.trim(), 
            lastname: lastname.trim(), 
            username: username.trim(),
            password: password || null,
            courseId: courseId || null
        });

        res.status(200).json({ 
            message: 'Estudiante actualizado exitosamente', 
            student: result 
        });
    } catch (error: any) {
        if (error.message === 'El estudiante no existe') {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error.message.includes('username ya está en uso')) {
            res.status(409).json({ error: error.message });
            return;
        }
        console.error('Error en updateStudent:', error);
        res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
    }
};

const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.params as { studentId: string };

        if (!studentId) {
            res.status(400).json({ error: 'studentId es requerido' });
            return;
        }

        const useCase = dependencyContainer.deleteStudentUseCase;
        await useCase.execute({ studentId });

        res.status(200).json({ message: 'Estudiante deshabilitado exitosamente' });
    } catch (error: any) {
        if (error.message === 'Estudiante no encontrado' || error.message === 'El estudiante no existe') {
            res.status(404).json({ error: 'El estudiante no existe' });
            return;
        }
        console.error('Error en deleteStudent:', error);
        res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
    }
};

const enableStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.params as { studentId: string };

        if (!studentId) {
            res.status(400).json({ error: 'studentId es requerido' });
            return;
        }

        const useCase = dependencyContainer.enableStudentUseCase;
        await useCase.execute({ studentId });

        res.status(200).json({ message: 'Estudiante reactivado exitosamente' });
    } catch (error: any) {
        if (error.message === 'Estudiante no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        console.error('Error en enableStudent:', error);
        res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
    }
};

const getStudentGameAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.params as { studentId: string };
        const result = await dependencyContainer.getStudentGameAssignmentsUseCase.execute(studentId);
        res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'Estudiante no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        console.error('Error en getStudentGameAssignments:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const assignGameToStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, gameId } = req.params as { studentId: string; gameId: string };
        const { level } = req.body as { level: number };

        if (!level) {
            res.status(400).json({ error: 'El nivel es requerido' });
            return;
        }

        await dependencyContainer.assignGameToStudentUseCase.execute(studentId, gameId, Number(level));
        res.status(200).json({ message: 'Juego asignado al alumno correctamente' });
    } catch (error: any) {
        if (error.message === 'Estudiante no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error.message.includes('nivel')) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error en assignGameToStudent:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const removeGameFromStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, gameId } = req.params as { studentId: string; gameId: string };
        await dependencyContainer.removeGameFromStudentUseCase.execute(studentId, gameId);
        res.status(200).json({ message: 'Juego desasignado del alumno correctamente' });
    } catch (error: any) {
        if (error.message === 'Estudiante no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        console.error('Error en removeGameFromStudent:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const updateStudentGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, gameId } = req.params as { studentId: string; gameId: string };
        const { level, isEnabled } = req.body as { level: number; isEnabled: boolean };

        if (level === undefined || isEnabled === undefined) {
            res.status(400).json({ error: 'level e isEnabled son requeridos' });
            return;
        }

        await dependencyContainer.updateStudentGameUseCase.execute(studentId, gameId, Number(level), Boolean(isEnabled));
        res.status(200).json({ message: 'Asignación actualizada correctamente' });
    } catch (error: any) {
        if (error.message === 'Asignación no encontrada') {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error.message.includes('nivel')) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error en updateStudentGame:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const studentController = { addStudent, getMyGames, getAllStudents, updateStudent, deleteStudent, enableStudent, getStudentGameAssignments, assignGameToStudent, removeGameFromStudent, updateStudentGame };

export const assignCourseToStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.params as { studentId: string };
        const { courseId } = req.body as { courseId: string };

        if (!courseId) {
            res.status(400).json({ error: 'courseId es requerido' });
            return;
        }

        await dependencyContainer.assignCourseToStudentUseCase.execute({ studentId, courseId });

        res.status(200).json({ message: 'Curso asignado al estudiante correctamente' });
    } catch (error: any) {
        if (error.message === 'Estudiante no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error.message === 'Curso no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: error?.message ?? 'Error interno del servidor' });
    }
};

export const studentExtendedController = { addStudent, getMyGames, assignCourseToStudent };
