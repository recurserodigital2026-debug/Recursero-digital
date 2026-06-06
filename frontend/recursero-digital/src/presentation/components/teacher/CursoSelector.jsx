import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherCourses } from '../../../infrastructure/adapters/api/teacherApi';
import "../../styles/components/cursoSelector.css";




export default function CursoSelector() {
  const navigate = useNavigate();
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');

  const coloresDisponibles = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];

  const obtenerIcono = () => {
    return "🔢";
  };

  const capitalizarPrimeraLetra = (texto) => {
    if (!texto) return '';
    return texto.toUpperCase();
  };

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setUsername(capitalizarPrimeraLetra(userEmail));
    }
  }, []);

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoading(true);

        const response = await getTeacherCourses();

        if (response.courses && response.courses.length > 0) {
          const cursosConEstilo = response.courses.map((curso, index) => ({
            id: curso.id.toString(),
            nombre: curso.name,
            icono: obtenerIcono(),
            color: coloresDisponibles[index % coloresDisponibles.length]
          }));
          setCursos(cursosConEstilo);
        } else {
          setCursos([]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar cursos:', error);
        setCursos([]);
        setLoading(false);
      }
    };

    cargarCursos();
  }, []);

  const handleCursoSelect = (curso) => {
    setCursoSeleccionado(curso);
    localStorage.setItem('cursoSeleccionado', JSON.stringify(curso));
    navigate('/docente/dashboard');
  };

  if (loading) {
    return (
      <div className="curso-selector-container">
        <div className="curso-selector-header">
          <h1>{username ? username : 'Docente'}</h1>
          <p>Cargando tus cursos...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="curso-selector-container">
        <div className="curso-selector-header">
          <h1> {username ? username : 'Docente'}</h1>
          <p>Error al cargar los cursos</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (cursos.length === 0 && !loading) {
    return (
      <div className="curso-selector-container">
        <div className="curso-selector-header">
          <h1>{username ? username : 'Docente'}</h1>
        </div>
        <div className="sin-curso-container">
          <div className="sin-curso-card">
            <div className="sin-curso-emoji">📚</div>
            <h2 className="sin-curso-titulo">Todavía no tenés un curso asignado</h2>
            <p className="sin-curso-texto">Aguardá a que el administrador te asigne uno y acá van a aparecer tus cursos 🏫</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="curso-selector-container">
      <div className="curso-selector-header">
        <h1>{username ? username : 'Docente'}</h1>
        <p>Seleccioná el curso que querés gestionar</p>
      </div>

      <div className="cursos-grid">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className={`curso-card ${cursoSeleccionado?.id === curso.id ? 'selected' : ''}`}
            onClick={() => handleCursoSelect(curso)}
            onMouseDown={() => handleCursoSelect(curso)}
            onTouchStart={() => handleCursoSelect(curso)}
            style={{ '--curso-color': curso.color }}
          >
            <div className="curso-icono">
              {curso.icono}
            </div>
            <h3 className="curso-nombre">{curso.nombre}</h3>
          </div>
        ))}
      </div>

      <div className="curso-selector-footer">
        <p>💡 Podés cambiar de curso en cualquier momento desde tu perfil</p>
      </div>
    </div>
  );
}