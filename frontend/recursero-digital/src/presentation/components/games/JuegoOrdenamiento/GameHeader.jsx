import React from 'react';

const GameHeader = ({
  currentLevel,
  currentActivity,
  totalActivities,
  attempts,
  points,
  onBackToGames,
  onBackToLevels,
  soundEnabled,
  toggleSound
}) => {
  return (
    <div className="header-controls">
      <div className="buttons-group">
        <button 
          className="btn-back-to-dashboard"
          onClick={onBackToGames}
          title="Volver a juegos"
        >
          ← Juegos
        </button>
        <button 
          className="btn-back-to-levels"
          onClick={onBackToLevels}
          title="Volver a niveles"
        >
          ← Niveles
        </button>
      </div>
      
      <div className="game-status">
        <div className="status-item" style={{ padding: '2px' }}>
          <button 
            onClick={toggleSound} 
            title={soundEnabled ? "Silenciar sonidos" : "Activar sonidos"}
            style={{
              background: soundEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.25)',
              border: soundEnabled ? '2px solid #ffb703' : '2px solid #ef4444',
              borderRadius: '12px',
              fontSize: '1.4rem',
              cursor: 'pointer',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 3px 0 rgba(0,0,0,0.2)',
              outline: 'none'
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        
        <div className="status-item">
          <div className="status-icon">🏆</div>
          <div className="status-label">Nivel</div>
          <div className="status-value">{currentLevel + 1}</div>
        </div>
        <div className="status-item">
          <div className="status-icon">📝</div>
          <div className="status-label">Actividad</div>
          <div className="status-value">{currentActivity + 1}/{totalActivities}</div>
        </div>
        <div className="status-item">
          <div className="status-icon">⭐</div>
          <div className="status-label">Puntos</div>
          <div className="status-value">{points}</div>
        </div>
        <div className="status-item">
          <div className="status-icon">🎯</div>
          <div className="status-label">Intentos</div>
          <div className="status-value">{attempts}</div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
