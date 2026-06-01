import { Request, Response } from 'express';
import { DependencyContainer } from '../../config/DependencyContainer';

const container = DependencyContainer.getInstance();

export const createGrupo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, courseId } = req.body as { name: string; courseId: string };
        const id = await container.createGrupoUseCase.execute(name, courseId);
        res.status(201).json({ message: 'Grupo creado exitosamente', id });
    } catch (error: any) {
        if (error.message.includes('requerido') || error.message.includes('nombre')) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error en createGrupo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const deleteGrupo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId } = req.params as { groupId: string };
        await container.deleteGrupoUseCase.execute(groupId);
        res.status(200).json({ message: 'Grupo eliminado exitosamente' });
    } catch (error: any) {
        if (error.message === 'Grupo no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        console.error('Error en deleteGrupo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getGruposByCourse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { courseId } = req.params as { courseId: string };
        const grupos = await container.getGruposByCourseUseCase.execute(courseId);
        res.status(200).json({ grupos });
    } catch (error: any) {
        console.error('Error en getGruposByCourse:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getGrupoStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId } = req.params as { groupId: string };
        const students = await container.grupoRepository.getStudents(groupId);
        res.status(200).json({
            students: students.map(s => ({
                id: s.id,
                name: s.name,
                lastName: s.lastname,
                username: s.user?.username ?? '',
                groupId: s.getGroupId()
            }))
        });
    } catch (error: any) {
        console.error('Error en getGrupoStudents:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const assignStudentToGrupo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, studentId } = req.params as { groupId: string; studentId: string };
        await container.assignStudentToGrupoUseCase.execute(groupId, studentId);
        res.status(200).json({ message: 'Alumno agregado al grupo exitosamente' });
    } catch (error: any) {
        if (error.message === 'Grupo no encontrado' || error.message === 'Estudiante no encontrado') {
            res.status(404).json({ error: error.message });
            return;
        }
        if (error.message === 'El alumno ya pertenece a otro grupo. Retíralo primero antes de asignarlo a este grupo.') {
            res.status(409).json({ error: error.message });
            return;
        }
        console.error('Error en assignStudentToGrupo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const removeStudentFromGrupo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, studentId } = req.params as { groupId: string; studentId: string };
        await container.removeStudentFromGrupoUseCase.execute(groupId, studentId);
        res.status(200).json({ message: 'Alumno removido del grupo exitosamente' });
    } catch (error: any) {
        console.error('Error en removeStudentFromGrupo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getGrupoGames = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId } = req.params as { groupId: string };
        const games = await container.grupoRepository.getGames(groupId);
        res.status(200).json({ games });
    } catch (error: any) {
        console.error('Error en getGrupoGames:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const assignGameToGrupo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, gameId } = req.params as { groupId: string; gameId: string };
        const { level } = req.body as { level: number };
        if (!level) {
            res.status(400).json({ error: 'El nivel es requerido' });
            return;
        }
        await container.assignGameToGrupoUseCase.execute(groupId, gameId, Number(level));
        res.status(200).json({ message: 'Juego asignado al grupo exitosamente' });
    } catch (error: any) {
        if (error.message.includes('nivel') || error.message.includes('requerido')) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error en assignGameToGrupo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const removeGameFromGrupo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, gameId } = req.params as { groupId: string; gameId: string };
        await container.removeGameFromGrupoUseCase.execute(groupId, gameId);
        res.status(200).json({ message: 'Juego removido del grupo exitosamente' });
    } catch (error: any) {
        console.error('Error en removeGameFromGrupo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const updateGrupoGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const { groupId, gameId } = req.params as { groupId: string; gameId: string };
        const { level, isEnabled } = req.body as { level: number; isEnabled: boolean };
        if (level === undefined || isEnabled === undefined) {
            res.status(400).json({ error: 'level e isEnabled son requeridos' });
            return;
        }
        await container.updateGrupoGameUseCase.execute(groupId, gameId, Number(level), Boolean(isEnabled));
        res.status(200).json({ message: 'Juego del grupo actualizado exitosamente' });
    } catch (error: any) {
        if (error.message.includes('nivel')) {
            res.status(400).json({ error: error.message });
            return;
        }
        console.error('Error en updateGrupoGame:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
