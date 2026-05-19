import express, { Router } from 'express';
import { protectTeacherOrAdminRoute } from '../middleware/authMiddleWare';
import {
    createGrupo,
    deleteGrupo,
    getGruposByCourse,
    getGrupoStudents,
    assignStudentToGrupo,
    removeStudentFromGrupo,
    getGrupoGames,
    assignGameToGrupo,
    removeGameFromGrupo,
    updateGrupoGame
} from '../controllers/grupoController';

const router: Router = express.Router();

router.post('/', protectTeacherOrAdminRoute(), createGrupo);
router.get('/course/:courseId', protectTeacherOrAdminRoute(), getGruposByCourse);
router.delete('/:groupId', protectTeacherOrAdminRoute(), deleteGrupo);

router.get('/:groupId/students', protectTeacherOrAdminRoute(), getGrupoStudents);
router.post('/:groupId/students/:studentId', protectTeacherOrAdminRoute(), assignStudentToGrupo);
router.delete('/:groupId/students/:studentId', protectTeacherOrAdminRoute(), removeStudentFromGrupo);

router.get('/:groupId/games', protectTeacherOrAdminRoute(), getGrupoGames);
router.post('/:groupId/games/:gameId', protectTeacherOrAdminRoute(), assignGameToGrupo);
router.delete('/:groupId/games/:gameId', protectTeacherOrAdminRoute(), removeGameFromGrupo);
router.patch('/:groupId/games/:gameId', protectTeacherOrAdminRoute(), updateGrupoGame);

export default router;
