import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentList from '../../components/teacher/StudentList';
import {
  getCourseStudents,
  getAllStudentsForTeacher,
  assignStudentToCourse,
  removeStudentFromCourse,
} from '../../../infrastructure/adapters/api/teacherApi';
import '../../styles/pages/teacherStudents.css';

const TeacherStudents = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para remover
  const [removingId, setRemovingId] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // { id, name, lastname }
  const [listKey, setListKey] = useState(0); // fuerza re-render de StudentList

  // Estado para el modal de agregar
  const [showAddModal, setShowAddModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loadingAll, setLoadingAll] = useState(false);
  const [search, setSearch] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    const cursoGuardado = localStorage.getItem('cursoSeleccionado');
    if (cursoGuardado) {
      try {
        const curso = JSON.parse(cursoGuardado);
        if (curso && curso.id) {
          setSelectedCourse(curso.id.toString());
          setLoading(false);
        } else {
          navigate('/docente');
        }
      } catch {
        navigate('/docente');
      }
    } else {
      navigate('/docente');
    }
  }, [navigate]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Abrir modal: cargar todos los alumnos y los ya inscriptos
  const handleOpenAddModal = useCallback(async () => {
    setShowAddModal(true);
    setSearch('');
    setLoadingAll(true);
    try {
      const [allRes, enrolledRes] = await Promise.all([
        getAllStudentsForTeacher(),
        getCourseStudents(selectedCourse),
      ]);
      setAllStudents(allRes.students || []);
      const ids = new Set((enrolledRes.students || []).map(s => s.id));
      setEnrolledIds(ids);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAll(false);
    }
  }, [selectedCourse]);

  const handleAssign = async (studentId) => {
    setAssigningId(studentId);
    try {
      await assignStudentToCourse(selectedCourse, studentId);
      setEnrolledIds(prev => new Set([...prev, studentId]));
      setListKey(k => k + 1);
      showFeedback('success', 'Alumno asignado correctamente');
    } catch (e) {
      showFeedback('error', e.message || 'Error al asignar alumno');
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemoveStudent = (id, name, lastname) => {
    setConfirmRemove({ id, name, lastname });
  };

  const handleConfirmRemove = async () => {
    if (!confirmRemove) return;
    setRemovingId(confirmRemove.id);
    setConfirmRemove(null);
    try {
      await removeStudentFromCourse(selectedCourse, confirmRemove.id);
      setListKey(k => k + 1);
      showFeedback('success', 'Alumno removido del curso');
    } catch (e) {
      showFeedback('error', e.message || 'Error al remover alumno');
    } finally {
      setRemovingId(null);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setCurrentView('student');
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setCurrentView('list');
  };

  const calculateTotalProgress = (student) => {
    if (!student?.progressByGame || Object.keys(student.progressByGame).length === 0) return 0;
    const vals = Object.values(student.progressByGame).map(g => g.averageScore || 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const filteredStudents = allStudents.filter(s => {
    const fullName = `${s.name} ${s.lastname}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="teacher-students">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="teacher-students">
        <div className="error-message">
          <p>No hay curso seleccionado</p>
          <button onClick={() => navigate('/docente')}>Seleccionar Curso</button>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-students">
      {/* Feedback toast */}
      {feedback && (
        <div className={`ts-toast ts-toast--${feedback.type}`}>
          {feedback.msg}
        </div>
      )}

      <div className="contenido-alumno">
        {currentView === 'list' && (
          <>
            <div className="ts-add-bar">
              <button className="ts-btn-add" onClick={handleOpenAddModal}>
                + Agregar Alumno
              </button>
            </div>

            <StudentList
              key={listKey}
              courseId={selectedCourse}
              onSelectStudent={handleSelectStudent}
              onRemoveStudent={handleRemoveStudent}
              removingId={removingId}
            />
          </>
        )}

        {currentView === 'student' && selectedStudent && (
          <div>
            <div className="detalle-header">
              <button className="back-btn" onClick={handleBackToList}>
                ← Volver a la Lista
              </button>
              <h2>Perfil de {selectedStudent.name}</h2>
            </div>

            <div className="student-profile-placeholder">
              <div className="profile-card">
                <h3>Información del Estudiante</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nombre:</label>
                    <span>{selectedStudent.name}</span>
                  </div>
                  <div className="info-item">
                    <label>Juegos Jugados:</label>
                    <span>{selectedStudent.totalGamesPlayed}</span>
                  </div>
                  <div className="info-item">
                    <label>Progreso total:</label>
                    <span>{calculateTotalProgress(selectedStudent)}%</span>
                  </div>
                </div>
              </div>

              <div className="games-detail">
                <h3>Progreso por Juego</h3>
                <div className="games-grid">
                  {Object.entries(selectedStudent.progressByGame || {}).map(([game, progress]) => {
                    const gameNames = {
                      ordenamiento: 'Ordenamiento',
                      escritura: 'Escritura',
                      descomposicion: 'Descomposición',
                      escala: 'Escala Numérica',
                      calculos: 'Cálculos'
                    };
                    return (
                      <div key={game} className="game-detail-card">
                        <h4>{gameNames[game] || game.charAt(0).toUpperCase() + game.slice(1)}</h4>
                        <div className="game-estadisticas">
                          <div className="stat">
                            <span className="labels">Actividades completadas</span>
                            <span className="values">{progress.completed}</span>
                          </div>
                          <div className="stat">
                            <span className="labels">Progreso</span>
                            <span className="values">{progress.averageScore}%</span>
                          </div>
                          <div className="stat">
                            <span className="labels">Tiempo Total</span>
                            <span className="values">{Math.round(progress.totalTime / 60)}m</span>
                          </div>
                          <div className="stat">
                            <span className="labels">Cantidad total de reintentos</span>
                            <span className="values">{progress.totalAttempts || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal confirmar remover */}
      {confirmRemove && (
        <div className="ts-modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="ts-modal" onClick={e => e.stopPropagation()}>
            <h3>Remover alumno</h3>
            <p>¿Seguro que querés remover a <strong>{confirmRemove.name} {confirmRemove.lastname}</strong> del curso?</p>
            <div className="ts-modal-actions">
              <button className="ts-btn-cancel" onClick={() => setConfirmRemove(null)}>Cancelar</button>
              <button className="ts-btn-danger" onClick={handleConfirmRemove}>Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar alumno */}
      {showAddModal && (
        <div className="ts-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ts-modal ts-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="ts-modal-header">
              <h3>Agregar Alumno al Curso</h3>
              <button className="ts-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <input
              className="ts-search"
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />

            <div className="ts-students-list">
              {loadingAll ? (
                <p className="ts-loading">Cargando alumnos...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="ts-empty">No se encontraron alumnos</p>
              ) : (
                filteredStudents.map(s => {
                  const isEnrolled = enrolledIds.has(s.id);
                  return (
                    <div key={s.id} className={`ts-student-row ${isEnrolled ? 'ts-student-row--enrolled' : ''}`}>
                      <div className="ts-student-row-info">
                        <span className="ts-student-avatar">{s.name[0]}{s.lastname[0]}</span>
                        <span className="ts-student-fullname">{s.name} {s.lastname}</span>
                        {isEnrolled && <span className="ts-badge">Ya inscripto</span>}
                      </div>
                      <button
                        className="ts-btn-assign"
                        disabled={isEnrolled || assigningId === s.id}
                        onClick={() => handleAssign(s.id)}
                      >
                        {assigningId === s.id ? '...' : isEnrolled ? 'Inscripto' : 'Asignar'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
