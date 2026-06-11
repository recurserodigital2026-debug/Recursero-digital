import React, { useState, useEffect } from 'react';
import { getTeacherCourses } from '../../../infrastructure/adapters/api/teacherApi';
import '../../styles/pages/teacherGames.css'; 

const TeacherGameConfig = () => {
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedJuego, setSelectedJuego] = useState('');
  const [loadingCursos, setLoadingCursos] = useState(true);

  const listaJuegos = [
    { id: 'game-ordenamiento', nombre: '🎮 Juego de Ordenamiento' },
    { id: 'game-escritura', nombre: '📝 Juego de Escritura' },
    { id: 'game-descomposicion', nombre: '🧩 Juego de Descomposición' },
    { id: 'game-escala', nombre: '📈 Juego de Escala' },
    { id: 'game-calculos', nombre: '🧮 Juego de Cálculos' }
  ];

  useEffect(() => {
    const cargarCursosConfig = async () => {
      try {
        setLoadingCursos(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('Sin token en Config: Usando mocks');
          setCursos([
            { id: '1', nombre: 'Matemáticas 3° A' },
            { id: '2', nombre: 'Matemáticas 3° B' }
          ]);
          setLoadingCursos(false);
          return;
        }

        const response = await getTeacherCourses();
        if (response.courses && response.courses.length > 0) {
          const cursosMapeados = response.courses.map(curso => ({
            id: curso.id.toString(),
            nombre: curso.name
          }));
          setCursos(cursosMapeados);
        } else {
          setCursos([{ id: '1', nombre: 'Matemáticas 3° A' }]);
        }
      } catch (error) {
        console.error('Error al traer cursos en configuración:', error);
        setCursos([{ id: '1', nombre: 'Matemáticas 3° A' }]);
      } finally {
        setLoadingCursos(false);
      }
    };

    cargarCursosConfig();
  }, []);

  const handleCursoChange = (e) => {
    setSelectedCurso(e.target.value);
    console.log("Curso seleccionado para configurar:", e.target.value);
  };

  const handleJuegoChange = (e) => {
    setSelectedJuego(e.target.value);
    console.log("Juego seleccionado para configurar:", e.target.value);
  };

  return (
    <div 
      style={{ 
        maxWidth: '1100px', 
        margin: '40px auto 0 auto', 
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(150, 80, 255, 0.25) 50%, rgba(31, 38, 135, 0.1) 100%)', 
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',                       
        border: '1px solid rgba(255, 255, 255, 0.25)', 
        backdropFilter: 'blur(15px)',                
        WebkitBackdropFilter: 'blur(15px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)', 
        boxSizing: 'border-box'
      }}
    >
      <div className="teacher-games-container" style={{ padding: '20px', color: 'white' }}>
        
        <div className="header-section" style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2>⚙️ Configuración de Parámetros por Curso</h2>
          <p style={{ color: '#ffffff' }}>
            Personalizá las reglas de los juegos y niveles de manera específica para cada uno de tus cursos.
          </p>
        </div>
          
        <div className="selectors-card" style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '20px', 
          borderRadius: '10px',
          backdropFilter: 'blur(5px)',
          marginBottom: '20px',
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              1. Seleccionar Curso:
            </label>
            <select 
              value={selectedCurso} 
              onChange={handleCursoChange}
              disabled={loadingCursos}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: '#ffffff', 
                color: '#333333',           
                border: 'none',
                outline: 'none',
                fontWeight: '500',
                fontSize: '16px',
                cursor: loadingCursos ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingCursos ? (
                <option style={{ color: '#333' }}>Cargando cursos...</option>
              ) : (
                <>
                  <option value="" style={{ color: '#333' }}>Elegí un curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id} style={{ color: '#333' }}>
                      {curso.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              2. Seleccionar Juego:
            </label>
            <select 
              value={selectedJuego} 
              onChange={handleJuegoChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: '#ffffff', 
                color: '#333333',           
                border: 'none',
                outline: 'none',
                fontWeight: '500',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              <option value="" style={{ color: '#333' }}>Elegí un juego</option>
              {listaJuegos.map((juego) => (
                <option key={juego.id} value={juego.id} style={{ color: '#333' }}>
                  {juego.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCurso && selectedJuego ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '40px',
            borderRadius: '10px',
            border: '1px dashed #00ffcc',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <h3>📊 Panel de Configuración</h3>
            <p style={{ color: '#00ffcc' }}>
              Configurando <strong>{listaJuegos.find(j => j.id === selectedJuego)?.nombre}</strong> para el curso seleccionado.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
              <button
                type="button"
                disabled
                title="Función en desarrollo"
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#5a6b7a',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: 'not-allowed',
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔄 Restaurar Valores por Defecto
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>
              🚧 En desarrollo
            </p>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#ccc',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            marginTop: '20px'
          }}>
            💡 Por favor, seleccioná un curso y un juego para cargar los parámetros editables.
          </div>
        )}

      </div> 
    </div>
  );
};

export default TeacherGameConfig;
