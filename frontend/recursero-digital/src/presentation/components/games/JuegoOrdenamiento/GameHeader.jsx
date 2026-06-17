import React from 'react';
import SoundToggle from '../../shared/SoundToggle';

const GameHeader = ({
  currentLevel,
  currentActivity,
  totalActivities,
  attempts,
  points,
  onBackToGames,
  onBackToLevels
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
          <SoundToggle />
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
