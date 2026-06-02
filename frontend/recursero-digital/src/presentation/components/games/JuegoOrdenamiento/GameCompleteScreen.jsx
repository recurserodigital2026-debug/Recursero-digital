import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameCompleteScreen = ({ points }) => {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content congrats-modal">
        <div className="modal-icon success-icon">
          <span className="icon-emoji">🎉</span>
        </div>

        <h2 className="modal-title success-title">
          ¡FELICITACIONES!
        </h2>

        <div className="modal-stats">
          <p className="completion-message" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>
            Has completado todos los niveles
          </p>

          <div style={{ margin: '24px 0', padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <span className="stats-label" style={{ display: 'block', fontSize: '1.1rem', color: '#aaa' }}>
              Puntos
            </span>
            <span className="stats-value" style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffb703' }}>
              {points} puntos
            </span>
          </div>
        </div>

        <div className="modal-buttons">
          <button
            onClick={() => navigate('/alumno/juegos')}
            className="modal-btn"
            style={{
              backgroundColor: '#4A7856',
              color: 'white',
              border: '2px solid #333',
              borderRadius: '15px',
              padding: '14px 24px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #222',
              width: '100%',
            }}
          >
            🎮 Volver a Juegos
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteScreen;
