import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AddUserForm from "./AddUserForm";
import EditStudentForm from "./EditStudentForm";
import EditTeacherForm from "./EditTeacherForm";
import BulkUploadForm from "./BulkUploadForm";
import "../../styles/pages/adminUsers.css";
import AdminTeachers from "../admin/AdminTeachers";
import ListControls from "../../components/shared/ListControls";
import { createStudent, getAllStudents, createTeacher, getAllTeachers, getAllCourses, getCourseStudents, updateStudent, deleteStudent, enableStudent, updateTeacher, deleteTeacher, enableTeacher, bulkUploadStudents } from "../../services/adminService";

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("students");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentCourseFilter, setStudentCourseFilter] = useState("todos");
  const [studentStatusFilter, setStudentStatusFilter] = useState("activo");
  const [studentSortBy, setStudentSortBy] = useState("nombre-asc");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showBulkUploadForm, setShowBulkUploadForm] = useState(false);
  const [showEditStudentForm, setShowEditStudentForm] = useState(false);
  const [showEditTeacherForm, setShowEditTeacherForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const studentCourseOptions = useMemo(() => {
    const named = courses.map(c => ({ label: c.name, value: String(c.id) }));
    return [
      { label: 'Todos los cursos', value: 'todos' },
      ...named,
      { label: 'Sin curso', value: 'sin-curso' },
    ];
  }, [courses]);

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase();
    const result = students.filter(student => {
      const matchesSearch = term === '' ||
        (student.name || '').toLowerCase().includes(term) ||
        (student.username || '').toLowerCase().includes(term);
      const matchesCourse = studentCourseFilter === 'todos' ||
        (studentCourseFilter === 'sin-curso' && !student.courseId) ||
        String(student.courseId) === studentCourseFilter;
      const isActive = student.enable !== false;
      const matchesStatus = studentStatusFilter === 'todos' ||
        (studentStatusFilter === 'activo' && isActive) ||
        (studentStatusFilter === 'inactivo' && !isActive);
      return matchesSearch && matchesCourse && matchesStatus;
    });

    result.sort((a, b) =>
      studentSortBy === 'nombre-desc'
        ? (b.name || '').localeCompare(a.name || '')
        : (a.name || '').localeCompare(b.name || '')
    );

    return result;
  }, [students, studentSearch, studentCourseFilter, studentStatusFilter, studentSortBy]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión como administrador.");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const coursesData = await getAllCourses();
        setCourses(coursesData);
        
        if (activeTab === "students") {
          const data = await getAllStudents();
          setStudents(
            data.map((s) => {
              const course = coursesData.find(c => c.id === s.courseId);
              return {
                id: s.id,
                name: s.name || `${s.firstName} ${s.lastName}`,
                firstName: s.firstName,
                lastName: s.lastName,
                username: s.username,
                courseId: s.courseId || null,
                courseName: course ? course.name : 'Sin curso',
                enable: s.enable !== undefined ? s.enable : true,
                status: s.enable !== false ? "Activo" : "Inactivo",
              };
            })
          );
        } else if (activeTab === "teachers") {
          const [teachersData, coursesData] = await Promise.all([
            getAllTeachers(),
            getAllCourses()
          ]);
          
          const teachersWithDetails = await Promise.all(
            teachersData.map(async (teacher) => {
              const teacherCourses = coursesData.filter(course => course.teacherId === teacher.id);
              
              const allStudents = new Set();
              
              for (const course of teacherCourses) {
                try {
                  const courseStudents = await getCourseStudents(course.id);
                  if (Array.isArray(courseStudents)) {
                    courseStudents.forEach(student => allStudents.add(student.id));
                  }
                } catch (err) {
                  console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
                }
              }
              
              return {
                id: teacher.id,
                name: teacher.fullName || `${teacher.name} ${teacher.surname}`,
                firstName: teacher.firstName || teacher.name,
                lastName: teacher.lastName || teacher.surname,
                surname: teacher.surname,
                username: teacher.username,
                email: teacher.email,
                enable: teacher.enable !== undefined ? teacher.enable : true,
                status: teacher.enable !== false ? "Activo" : "Inactivo",
                courses: teacherCourses,
                students: Array.from(allStudents).map(id => ({ id })) // Array de IDs únicos
              };
            })
          );
          
          setTeachers(teachersWithDetails);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err.message || "No se pudieron cargar los datos. Verifica que estés logueado como administrador.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab]);

  const handleAddUser = () => {
    setShowAddUserForm(true);
  };

  const handleBulkUpload = () => {
    setShowBulkUploadForm(true);
  };

  const handleBulkUploadSubmit = async (studentsData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await bulkUploadStudents(studentsData);
      
      const data = await getAllStudents();
      setStudents(
        data.map((s) => {
          const course = courses.find(c => c.id === s.courseId);
          return {
            id: s.id,
            name: s.name || s.firstName + " " + s.lastName,
            firstName: s.firstName,
            lastName: s.lastName,
            username: s.username,
            courseId: s.courseId || null,
            courseName: course ? course.name : 'Sin curso',
            enable: s.enable !== undefined ? s.enable : true,
            status: s.enable !== false ? "Activo" : "Inactivo",
          };
        })
      );
      
      setShowBulkUploadForm(false);

      toast.success(result.message || "Carga masiva completada");
      if (result.errorDetails && result.errorDetails.length > 0) {
        const detail = "Detalles de errores:\n" + result.errorDetails.join("\n");
        setError(detail);
        toast.error(`${result.errorDetails.length} fila(s) con errores. Revisá el detalle.`);
      }

    } catch (err) {
      console.error("Error en carga masiva:", err);
      setError(err.message || "Error en la carga masiva de estudiantes");
      toast.error(err.message || "Error en la carga masiva de estudiantes");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowAddUserForm(false);
    setShowBulkUploadForm(false);
    setShowEditStudentForm(false);
    setShowEditTeacherForm(false);
    setSelectedStudent(null);
    setSelectedTeacher(null);
    setFormError(null);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowEditStudentForm(true);
  };

  const handleToggleStudentStatus = async (student) => {
    try {
      setLoading(true);
      setError(null);
      
      const wasDisabled = student.enable === false;
      if (wasDisabled) {
        await enableStudent(student.id);
      } else {
        await deleteStudent(student.id);
      }
      toast.success(wasDisabled ? "Estudiante activado" : "Estudiante desactivado");

      const data = await getAllStudents();
      setStudents(
        data.map((s) => {
          const course = courses.find(c => c.id === s.courseId);
          return {
            id: s.id,
            name: s.name || `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            username: s.username,
            courseId: s.courseId || null,
            courseName: course ? course.name : 'Sin curso',
            enable: s.enable !== undefined ? s.enable : true,
            status: s.enable !== false ? "Activo" : "Inactivo",
          };
        })
      );
    } catch (err) {
      console.error("Error al cambiar estado del estudiante:", err);
      setError(err.message || "Error al cambiar estado del estudiante");
      toast.error(err.message || "Error al cambiar estado del estudiante");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowEditTeacherForm(true);
  };

  const handleToggleTeacherStatus = async (teacher) => {
    try {
      setLoading(true);
      setError(null);
      
      const wasDisabled = teacher.enable === false;
      if (wasDisabled) {
        await enableTeacher(teacher.id);
      } else {
        await deleteTeacher(teacher.id);
      }
      toast.success(wasDisabled ? "Docente activado" : "Docente desactivado");

      const [teachersData, coursesData] = await Promise.all([
        getAllTeachers(),
        getAllCourses()
      ]);

      const teachersWithDetails = await Promise.all(
        teachersData.map(async (teacher) => {
          const teacherCourses = coursesData.filter(course => course.teacherId === teacher.id);
          const allStudents = new Set();

          for (const course of teacherCourses) {
            try {
              const courseStudents = await getCourseStudents(course.id);
              if (Array.isArray(courseStudents)) {
                courseStudents.forEach(student => allStudents.add(student.id));
              }
            } catch (err) {
              console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
            }
          }

          return {
            id: teacher.id,
            name: teacher.fullName || `${teacher.name} ${teacher.surname}`,
            firstName: teacher.firstName || teacher.name,
            lastName: teacher.lastName || teacher.surname,
            surname: teacher.surname,
            username: teacher.username,
            email: teacher.email,
            enable: teacher.enable !== undefined ? teacher.enable : true,
            status: teacher.enable !== false ? "Activo" : "Inactivo",
            courses: teacherCourses,
            students: Array.from(allStudents).map(id => ({ id }))
          };
        })
      );

      setTeachers(teachersWithDetails);
    } catch (err) {
      console.error("Error al cambiar estado del docente:", err);
      setError(err.message || "Error al cambiar estado del docente");
      toast.error(err.message || "Error al cambiar estado del docente");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (studentData) => {
    try {
      setLoading(true);
      setError(null);
      await updateStudent(studentData);
      
      const data = await getAllStudents();
      setStudents(
        data.map((s) => {
          const course = courses.find(c => c.id === s.courseId);
          return {
            id: s.id,
            name: s.name || `${s.firstName} ${s.lastName}`,
            firstName: s.firstName,
            lastName: s.lastName,
            username: s.username,
            courseId: s.courseId || null,
            courseName: course ? course.name : 'Sin curso',
            enable: s.enable !== undefined ? s.enable : true,
            status: s.enable !== false ? "Activo" : "Inactivo",
          };
        })
      );
      
      handleCloseForm();
      toast.success("Estudiante actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar estudiante:", err);
      setError(err.message || "Error al actualizar estudiante");
      toast.error(err.message || "Error al actualizar estudiante");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeacher = async (teacherData) => {
    try {
      setLoading(true);
      setError(null);
      await updateTeacher(teacherData);
      
      const [teachersData, coursesData] = await Promise.all([
        getAllTeachers(),
        getAllCourses()
      ]);
      
      const teachersWithDetails = await Promise.all(
        teachersData.map(async (teacher) => {
          const teacherCourses = coursesData.filter(course => course.teacherId === teacher.id);
          const allStudents = new Set();
          
          for (const course of teacherCourses) {
            try {
              const courseStudents = await getCourseStudents(course.id);
              if (Array.isArray(courseStudents)) {
                courseStudents.forEach(student => allStudents.add(student.id));
              }
            } catch (err) {
              console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
            }
          }
          
          return {
            id: teacher.id,
            name: teacher.fullName || `${teacher.name} ${teacher.surname}`,
            username: teacher.username,
            email: teacher.email,
            enable: teacher.enable !== undefined ? teacher.enable : true,
            status: teacher.enable !== false ? "Activo" : "Inactivo",
            courses: teacherCourses,
            students: Array.from(allStudents).map(id => ({ id }))
          };
        })
      );
      
      setTeachers(teachersWithDetails);
      handleCloseForm();
      toast.success("Docente actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar docente:", err);
      setError(err.message || "Error al actualizar docente");
      toast.error(err.message || "Error al actualizar docente");
    } finally {
      setLoading(false);
    }
  };

  const [formError, setFormError] = useState(null);

  const handleUserSubmit = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      setFormError(null);

      if (activeTab === "students") {
        await createStudent(userData);
        const data = await getAllStudents();
        setStudents(
          data.map((s) => {
            const course = courses.find(c => c.id === s.courseId);
            return {
              id: s.id,
              name: s.name || `${s.firstName} ${s.lastName}`,
              firstName: s.firstName,
              lastName: s.lastName,
              username: s.username,
              courseId: s.courseId || null,
              courseName: course ? course.name : 'Sin curso',
              enable: s.enable !== undefined ? s.enable : true,
              status: s.enable !== false ? "Activo" : "Inactivo",
            };
          })
        );
      } else if (activeTab === "teachers") {
        await createTeacher({
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          username: userData.username,
          password: userData.password,
        });
        const [teachersData, coursesData] = await Promise.all([
          getAllTeachers(),
          getAllCourses()
        ]);
        
        const teachersWithDetails = await Promise.all(
          teachersData.map(async (teacher) => {
            const teacherCourses = coursesData.filter(course => course.teacherId === teacher.id);
            const allStudents = new Set();
            
            for (const course of teacherCourses) {
              try {
                const courseStudents = await getCourseStudents(course.id);
                if (Array.isArray(courseStudents)) {
                  courseStudents.forEach(student => allStudents.add(student.id));
                }
              } catch (err) {
                console.warn(`No se pudieron obtener estudiantes del curso ${course.id}:`, err);
              }
            }
            
            return {
              id: teacher.id,
              name: teacher.fullName || `${teacher.name} ${teacher.surname}`,
              firstName: teacher.firstName || teacher.name,
              lastName: teacher.lastName || teacher.surname,
              surname: teacher.surname,
              username: teacher.username,
              email: teacher.email,
              enable: teacher.enable !== undefined ? teacher.enable : true,
              status: teacher.enable !== false ? "Activo" : "Inactivo",
              courses: teacherCourses,
              students: Array.from(allStudents).map(id => ({ id }))
            };
          })
        );
        
        setTeachers(teachersWithDetails);
      }

      setFormError(null);
      setShowAddUserForm(false);
      toast.success(activeTab === "students" ? "Estudiante creado correctamente" : "Docente creado correctamente");
    } catch (err) {
      console.error("Error al crear usuario:", err);
      const errorMessage = err.message || "Error al crear usuario";
      setFormError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-users">
      <div className="users-header">
        <h1>Gestión de Usuarios</h1>
        <div className="header-actions">
          <button className="add-user-btn" onClick={handleAddUser} disabled={loading}>
            {loading ? "Guardando..." : "+ Agregar Usuario"}
          </button>
          {activeTab === "students" && (
            <button className="bulk-upload-btn" onClick={handleBulkUpload} disabled={loading}>
              📄 Carga Masiva
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message-admin">{error}</div>}

      <div className="users-tabs">
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Estudiantes
        </button>
        <button
          className={`tab-btn ${activeTab === "teachers" ? "active" : ""}`}
          onClick={() => setActiveTab("teachers")}
        >
          Docentes
        </button>
      </div>

      {activeTab === "students" && (
        <div className="users-table">
          <h2>Estudiantes</h2>
          <ListControls
            searchValue={studentSearch}
            onSearchChange={setStudentSearch}
            searchPlaceholder="Nombre o username..."
            filters={[
              {
                label: 'Curso',
                value: studentCourseFilter,
                onChange: setStudentCourseFilter,
                options: studentCourseOptions,
              },
              {
                label: 'Estado',
                value: studentStatusFilter,
                onChange: setStudentStatusFilter,
                options: [
                  { label: 'Todos', value: 'todos' },
                  { label: 'Activos', value: 'activo' },
                  { label: 'Inactivos', value: 'inactivo' },
                ],
              },
            ]}
            sort={{
              value: studentSortBy,
              onChange: setStudentSortBy,
              options: [
                { label: 'Nombre (A-Z)', value: 'nombre-asc' },
                { label: 'Nombre (Z-A)', value: 'nombre-desc' },
              ],
            }}
          />
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Username</th>
                <th>Curso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="no-results">No se encontraron estudiantes con los criterios de búsqueda</td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.username}</td>
                  <td>{student.courseName || 'Sin curso'}</td>
                  <td>
                    <button 
                      className="edit-botn" 
                      onClick={() => handleEditStudent(student)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button 
                      className={student.enable === false ? "activate-botn" : "delete-botn"} 
                      onClick={() => handleToggleStudentStatus(student)}
                      disabled={loading}
                    >
                      {student.enable === false ? "Activar" : "Desactivar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "teachers" && (
        <AdminTeachers 
          teachers={teachers} 
          onEdit={handleEditTeacher}
          onToggleStatus={handleToggleTeacherStatus}
        />
      )}

      {showAddUserForm && (
        <AddUserForm
          onClose={handleCloseForm}
          onSubmit={handleUserSubmit}
          userType={
            activeTab === "students"
              ? "estudiante"
              : activeTab === "teachers"
              ? "docente"
              : "administrador"
          }
          error={formError}
        />
      )}

      {showEditStudentForm && selectedStudent && (
        <EditStudentForm
          onClose={handleCloseForm}
          onSubmit={handleUpdateStudent}
          student={selectedStudent}
          courses={courses}
        />
      )}

      {showEditTeacherForm && selectedTeacher && (
        <EditTeacherForm
          onClose={handleCloseForm}
          onSubmit={handleUpdateTeacher}
          teacher={selectedTeacher}
          courses={courses}
        />
      )}

      {showBulkUploadForm && (
        <BulkUploadForm
          onClose={handleCloseForm}
          onSubmit={handleBulkUploadSubmit}
        />
      )}
    </div>
  );
}
