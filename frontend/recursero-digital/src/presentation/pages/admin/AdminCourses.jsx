import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import '../../styles/pages/adminCourses.css';
import { createCourse, getAllCourses, updateCourse, deleteCourse, getAllTeachers, getCourseStudents } from '../../services/adminService';
import AddCourseForm from './AddCourseForm';
import EditCourseForm from './EditCourseForm';
import ListControls from '../../components/shared/ListControls';
import ConfirmModal from '../../components/shared/ConfirmModal';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [showDeleteCourseForm, setShowDeleteCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('nombre-asc');

  const teacherOptions = useMemo(() => {
    const names = Array.from(new Set(courses.map(c => c.teacher))).sort((a, b) => a.localeCompare(b));
    return [{ label: 'Todos los docentes', value: 'todos' }, ...names.map(n => ({ label: n, value: n }))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = courses.filter(course => {
      const matchesSearch = term === '' ||
        course.name.toLowerCase().includes(term) ||
        course.teacher.toLowerCase().includes(term);
      const matchesTeacher = teacherFilter === 'todos' || course.teacher === teacherFilter;
      return matchesSearch && matchesTeacher;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'nombre-desc':
          return b.name.localeCompare(a.name);
        case 'estudiantes-desc':
          return b.students - a.students;
        case 'estudiantes-asc':
          return a.students - b.students;
        case 'nombre-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [courses, searchTerm, teacherFilter, sortBy]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [coursesData, teachersData] = await Promise.all([
          getAllCourses(),
          getAllTeachers()
        ]);
        
        const coursesWithDetails = await Promise.all(
          coursesData.map(async (course) => {
            let studentsCount = 0;
            try {
              const courseStudents = await getCourseStudents(course.id);
              studentsCount = courseStudents ? courseStudents.length : 0;
            } catch (err) {
              console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
              studentsCount = 0;
            }
            
            const teacher = teachersData.find(t => course.teacherId && t.id === course.teacherId);
            const teacherName = teacher 
              ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim())
              : 'Sin docente asignado';
            
            return {
              id: course.id,
              name: course.name,
              teacher: teacherName,
              students: studentsCount,
              status: 'Activo',
            };
          })
        );
        
        setCourses(coursesWithDetails);
      } catch (err) {
        console.error('Error al cargar cursos:', err);
        setError('No se pudieron cargar los cursos');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleAddCourse = () => {
    setShowAddCourseForm(true);
  };

  const handleCloseForm = () => {
    setShowAddCourseForm(false);
    setShowEditCourseForm(false);
    setShowDeleteCourseForm(false);
    setSelectedCourse(null);
  };

  const handleCreateCourse = async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      await createCourse({ name: courseData.name });

      const [coursesData, teachersData] = await Promise.all([
        getAllCourses(),
        getAllTeachers()
      ]);
      
      const coursesWithDetails = await Promise.all(
        coursesData.map(async (course) => {
          let studentsCount = 0;
          try {
            const courseStudents = await getCourseStudents(course.id);
            studentsCount = courseStudents.students ? courseStudents.students.length : 0;
          } catch (err) {
            console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
          }
          
          const teacher = teachersData.find(t => course.teacherId && t.id === course.teacherId);
          const teacherName = teacher 
            ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim())
            : 'Sin docente asignado';
          
          return {
            id: course.id,
            name: course.name,
            teacher: teacherName,
            students: studentsCount,
            status: 'Activo',
          };
        })
      );
      
      setCourses(coursesWithDetails);
      setShowAddCourseForm(false);
      toast.success('Curso creado correctamente');
    } catch (err) {
      console.error('Error al crear curso:', err);
      setError(err.message || 'Error al crear curso');
      toast.error(err.message || 'Error al crear curso');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowEditCourseForm(true);
  };

  const handleUpdateCourse = async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      await updateCourse({ 
        courseId: courseData.id, 
        name: courseData.name 
      });
      
      const [coursesData, teachersData] = await Promise.all([
        getAllCourses(),
        getAllTeachers()
      ]);
      
      const coursesWithDetails = await Promise.all(
        coursesData.map(async (course) => {
          let studentsCount = 0;
          try {
            const courseStudents = await getCourseStudents(course.id);
            studentsCount = courseStudents.students ? courseStudents.students.length : 0;
          } catch (err) {
            console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
          }
          
          const teacher = teachersData.find(t => course.teacherId && t.id === course.teacherId);
          const teacherName = teacher 
            ? (teacher.name || teacher.fullName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim())
            : 'Sin docente asignado';
          
          return {
            id: course.id,
            name: course.name,
            teacher: teacherName,
            students: studentsCount,
            status: 'Activo',
          };
        })
      );
      
      setCourses(coursesWithDetails);
      setShowEditCourseForm(false);
      setSelectedCourse(null);
      toast.success('Curso actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar curso:', err);
      setError(err.message || 'Error al actualizar curso');
      toast.error(err.message || 'Error al actualizar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = (course) => {
    setSelectedCourse(course);
    setShowDeleteCourseForm(true);
  };

  const handleConfirmDelete = async (course) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCourse(course.id);

      setCourses(prev => prev.filter(c => c.id !== course.id));
      setShowDeleteCourseForm(false);
      setSelectedCourse(null);
      toast.success('Curso eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar curso:', err);
      setError(err.message || 'Error al eliminar curso');
      toast.error(err.message || 'Error al eliminar curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-courses">
      <div className="courses-header">
        <h1>Gestión de Cursos</h1>
        <button className="add-course-btn" onClick={handleAddCourse} disabled={loading}>
          {loading ? 'Creando...' : '+ Crear Curso'}
        </button>
      </div>

      {error && <div className="error-message-admin">{error}</div>}

      <ListControls
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Nombre o docente..."
        filters={[
          {
            label: 'Docente',
            value: teacherFilter,
            onChange: setTeacherFilter,
            options: teacherOptions,
          },
        ]}
        sort={{
          value: sortBy,
          onChange: setSortBy,
          options: [
            { label: 'Nombre (A-Z)', value: 'nombre-asc' },
            { label: 'Nombre (Z-A)', value: 'nombre-desc' },
            { label: 'Más estudiantes', value: 'estudiantes-desc' },
            { label: 'Menos estudiantes', value: 'estudiantes-asc' },
          ],
        }}
      />

      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <p className="no-results">No se encontraron cursos con los criterios de búsqueda</p>
        ) : filteredCourses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3>{course.name}</h3>
            </div>
            <div className="course-info">
              <p><strong>Docente:</strong> {course.teacher}</p>
              <p><strong>Estudiantes:</strong> {course.students}</p>
            </div>
            <div className="course-actions">
              <button
                className="edit-btn-cursos" 
                onClick={() => handleEditCourse(course)}
                disabled={loading}
              >
                Editar
              </button>
              <button 
                className="delete-btn-cursos" 
                onClick={() => handleDeleteCourse(course)}
                disabled={loading}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="courses-summary">
        <div className="summary-item">
          <span className="summary-number">{courses.length}</span>
          <span className="summary-label">Total Cursos</span>
        </div>
        <div className="summary-item">
          <span className="summary-number">{courses.reduce((acc, c) => acc + c.students, 0)}</span>
          <span className="summary-label">Total Estudiantes</span>
        </div>
      </div>

      {showAddCourseForm && (
        <AddCourseForm
          onClose={handleCloseForm}
          onSubmit={handleCreateCourse}
        />
      )}

      {showEditCourseForm && selectedCourse && (
        <EditCourseForm
          onClose={handleCloseForm}
          onSubmit={handleUpdateCourse}
          course={selectedCourse}
        />
      )}

      {showDeleteCourseForm && selectedCourse && (
        <ConfirmModal
          title="Eliminar Curso"
          message={`¿Eliminar el curso "${selectedCourse.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar Curso"
          danger
          loading={loading}
          onConfirm={() => handleConfirmDelete(selectedCourse)}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}