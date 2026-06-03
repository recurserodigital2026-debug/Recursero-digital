import React, { useState, useEffect } from 'react';
import { getTeacherCourses, resetCourseGameConfig } from '../../../infrastructure/adapters/api/teacherApi'; 
import '../../styles/pages/teacherGames.css'; 

const TeacherGameConfig = () => {
  const [cursos, setCursos] = useState([]);
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedJuego, setSelectedJuego] = useState('');
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [isResetting, setIsResetting] = useState(false); 

  const listaJuegos = [
    { id: 'ordenamiento', nombre: '🎮 Juego de Ordenamiento' },
    { id: 'escritura', nombre: '📝 Juego de Escritura' },
    { id: 'descomposicion', nombre: '🧩 Juego de Descomposición' },
    { id: 'escala', nombre: '📈 Juego de Escala' },
    { id: 'calculos', nombre: '🧮 Juego de Cálculos' }
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

  const handleResetearGlobal = async () => {
    if (!selectedCurso || !selectedJuego) return;

    const confirmar = window.confirm(
      "¿Estás seguro de que querés restaurar los valores por defecto? Se borrarán los cambios personalizados de este curso para volver a la configuración global de ReDa Kids."
    );

    if (confirmar) {
      try {
        setIsResetting(true);
        
        await resetCourseGameConfig(selectedCurso, selectedJuego);
        
        alert("¡Valores restaurados con éxito a la configuración global del sistema! 🪐");

      } catch (error) {
        console.error("Error al resetear configuración:", error);
        alert(`No se pudo resetear la configuración: ${error.message}. (Si estás usando mocks de desarrollo, esto es normal).`);
      } finally {
        setIsResetting(false);
      }
    }
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
            Personalizá las rules de los juegos y niveles de manera específica para cada uno de tus cursos.
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
            <h3>📊 Panel de Configuración Activo</h3>
            <p style={{ color: '#00ffcc' }}>
              Configurando <strong>{listaJuegos.find(j => j.id === selectedJuego)?.nombre}</strong> para el curso seleccionado.
            </p>
            
            <p style={{ fontSize: '14px', color: '#888', marginTop: '10px', marginBottom: '30px' }}>
              [Acá meteremos la Tabla editable de niveles]
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
              <button
                type="button"
                onClick={handleResetearGlobal}
                disabled={isResetting}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isResetting ? '#5a8bae' : '#1e88e5',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: isResetting ? 'not-allowed' : 'pointer',
                  opacity: isResetting ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(30, 136, 229, 0.4)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isResetting) {
                    e.target.style.backgroundColor = '#1565c0';
                    e.target.style.boxShadow = '0 6px 20px rgba(21, 101, 192, 0.6)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isResetting) {
                    e.target.style.backgroundColor = '#1e88e5';
                    e.target.style.boxShadow = '0 4px 14px rgba(30, 136, 229, 0.4)';
                    e.target.style.transform = 'translateY(0px)';
                  }
                }}
              >
                {isResetting ? '🔄 Restaurando...' : '🔄 Restaurar Valores por Defecto'}
              </button>
            </div>

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