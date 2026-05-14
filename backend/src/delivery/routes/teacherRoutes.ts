import express, { Router } from 'express';
import { teacherController } from '../controllers/TeacherController';
import { protectAdminRoute, protectTeacherRoute, protectTeacherOrAdminRoute } from '../middleware/authMiddleWare';

const router: Router = express.Router();

router.post('/', protectAdminRoute(), teacherController.addTeacher);
router.get('/', protectAdminRoute(), teacherController.getAllTeachers);
router.post('/:teacherId/courses', protectAdminRoute(), teacherController.assignTeacherToCourses);
router.get('/me/courses', protectTeacherOrAdminRoute(), teacherController.getTeacherCourses);
router.get('/me/students', protectTeacherRoute(), teacherController.getAllStudentsForTeacher);
router.get('/me/courses/:courseId', protectTeacherRoute(), teacherController.getMyCourseDetails);
router.post('/me/courses/:courseId/students', protectTeacherRoute(), teacherController.assignStudentToCourse);
router.delete('/me/courses/:courseId/students/:studentId', protectTeacherRoute(), teacherController.removeStudentFromCourse);

router.patch('/:teacherId', protectAdminRoute(), teacherController.updateTeacher);

router.delete('/:teacherId', protectAdminRoute(), teacherController.deleteTeacher);

router.patch('/:teacherId/enable', protectAdminRoute(), teacherController.enableTeacher);

export default router;