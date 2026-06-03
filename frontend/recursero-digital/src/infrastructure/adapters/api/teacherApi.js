import { API_BASE_URL } from '../../config/api';

export const getTeacherProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getTeacherCourses = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/courses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getMyCourseDetails = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/courses/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getCourseStudents = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/students`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getCourseGames = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/games`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Error al obtener juegos del curso: ${response.statusText}`);
  }
  return await response.json();
};

export const updateCourseGameStatus = async (courseGameId, isEnabled) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/games/${courseGameId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ isEnabled })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || `Error al actualizar estado del juego: ${response.statusText}`);
  }
  return await response.json();
};

export const getAllStudentsForTeacher = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/students`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const assignStudentToCourse = async (courseId, studentId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/courses/${courseId}/students`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ studentId })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al asignar alumno');
  }
  return await response.json();
};

export const removeStudentFromCourse = async (courseId, studentId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/teacher/me/courses/${courseId}/students/${studentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al remover alumno');
  }
  return await response.json();
};

export const getStudentDetails = async (studentId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/details`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getCourseStatistics = async (courseId) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/statistics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: response.statusText || 'Error desconocido' };
    }
    
    const errorMessage = errorData.error || errorData.message || `Error al obtener estadísticas: ${response.status} ${response.statusText}`;
    console.error('Error en getCourseStatistics:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(errorMessage);
  }
  
  return await response.json();
};

export const getGameReports = async (courseId, gameType) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/games/${gameType}/reports`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getGameCommonErrors = async (courseId, gameType) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/games/${gameType}/common-errors`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const getActivityConfig = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/activity-config`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const updateActivityConfig = async (courseId, config) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/activity-config`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });
  return await response.json();
};

export const getCourseGrades = async (courseId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/grades`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const updateStudentGrade = async (studentId, gradeData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/grade`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(gradeData)
  });
  return await response.json();
};


export const exportCourseData = async (courseId, format = 'csv') => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/export?format=${format}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  return response.blob();
};

export const getStudentGameAssignments = async (studentId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/student/${studentId}/games/assignments`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al obtener asignaciones');
  }
  return await response.json();
};

export const assignGameToStudent = async (studentId, gameId, level) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/student/${studentId}/games/${gameId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ level })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al asignar juego');
  }
  return await response.json();
};

export const removeGameFromStudent = async (studentId, gameId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/student/${studentId}/games/${gameId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al desasignar juego');
  }
  return await response.json();
};

export const updateStudentGame = async (studentId, gameId, level, isEnabled) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/student/${studentId}/games/${gameId}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, isEnabled })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al actualizar asignación');
  }
  return await response.json();
};

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

export const getGruposByCourse = async (courseId) => {
  const res = await fetch(`${API_BASE_URL}/grupos/course/${courseId}`, { headers: authHeaders() });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al obtener grupos'); }
  return await res.json();
};

export const createGrupo = async (name, courseId) => {
  const res = await fetch(`${API_BASE_URL}/grupos`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, courseId })
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al crear grupo'); }
  return await res.json();
};

export const deleteGrupo = async (groupId) => {
  const res = await fetch(`${API_BASE_URL}/grupos/${groupId}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al eliminar grupo'); }
  return await res.json();
};

export const getGrupoStudents = async (groupId) => {
  const res = await fetch(`${API_BASE_URL}/grupos/${groupId}/students`, { headers: authHeaders() });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al obtener alumnos del grupo'); }
  return await res.json();
};

export const assignStudentToGrupo = async (groupId, studentId) => {
  const res = await fetch(`${API_BASE_URL}/grupos/${groupId}/students/${studentId}`, {
    method: 'POST', headers: authHeaders()
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al agregar alumno al grupo'); }
  return await res.json();
};

export const removeStudentFromGrupo = async (groupId, studentId) => {
  const res = await fetch(`${API_BASE_URL}/grupos/${groupId}/students/${studentId}`, {
    method: 'DELETE', headers: authHeaders()
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al remover alumno del grupo'); }
  return await res.json();
};

export const getGrupoGames = async (groupId) => {
  const res = await fetch(`${API_BASE_URL}/grupos/${groupId}/games`, { headers: authHeaders() });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al obtener juegos del grupo'); }
  return await res.json();
};

export const assignGameToGrupo = async (groupId, gameId, level) => {
  const res = await fetch(`${API_BASE_URL}/grupos/${groupId}/games/${gameId}`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ level })
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al asignar juego al grupo'); }
  return await res.json();
};

export const removeGameFromGrupo = async (groupId, gameId) => {
  const res = await fetch(`${API_BASE_URL}/grupos/${groupId}/games/${gameId}`, {
    method: 'DELETE', headers: authHeaders()
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al remover juego del grupo'); }
  return await res.json();
};

export const updateGrupoGame = async (groupId, gameId, level, isEnabled) => {
  const res = await fetch(`${API_BASE_URL}/grupos/${groupId}/games/${gameId}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ level, isEnabled })
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al actualizar juego del grupo'); }
  return await res.json();
};

export const getAllGamesWithLevels = async () => {
  const res = await fetch(`${API_BASE_URL}/games/all-with-levels`, { headers: authHeaders() });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Error al obtener juegos'); }
  return await res.json();
};

export const resetCourseGameConfig = async (courseId, gameId) => {
  const res = await fetch(`${API_BASE_URL}/courses/${courseId}/games/${gameId}/reset`, {
    method: 'DELETE', 
    headers: authHeaders()
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || 'Error al restaurar los valores de fábrica');
  }
  return await res.json();
};

export const MOCK_DATA = {
  teacherProfile: {
    id: "teacher_1",
    name: "María González",
    email: "maria.gonzalez@school.edu",
    courses: ["Matemática 3º", "Matemática 4º"]
  },
  
  courseStats: {
    totalStudents: 25,
    activeStudents: 22,
    averageCourseScore: 84,
    totalGamesPlayed: 450,
    gamesDistribution: {
      ordenamiento: 150,
      escritura: 120,
      descomposicion: 100,
      escala: 80
    }
  },
  
  sampleStudent: {
    id: "student_1",
    name: "Juan Pérez",
    email: "juan.perez@student.edu",
    totalGamesPlayed: 25,
    averageScore: 85,
    lastActivity: "2024-10-12T10:30:00Z",
    progressByGame: {
      ordenamiento: { completed: 10, totalTime: 450, averageScore: 88 },
      escritura: { completed: 8, totalTime: 320, averageScore: 82 },
      descomposicion: { completed: 5, totalTime: 200, averageScore: 90 },
      escala: { completed: 2, totalTime: 100, averageScore: 75 }
    }
  }
};