import React from 'react';
import { levelConfig, operationConfig, getLevelCountForOperation, getLevelDescription, levelDescriptions } from './utils';
import { useUserProgress } from '../../../hooks/useUserProgress';

const LevelSelectScreen = ({ operation, onSelectLevel, onBackToStart }) => {
  const operationInfo = operationConfig[operation];
  const { isLevelUnlocked } = useUserProgress();

  const levelIcons = ['🎯', '⚡', '🚀', '🌟', '👑', '💎', '🏆'];
  const visibleLevels = levelConfig.slice(0, getLevelCountForOperation(operation));

  return (
    <div className="game-container">
      <div className="level-select-screen">
        <div className="header-controls">
          <div className="buttons-group">
            <button 
              onClick={onBackToStart}
              className="btn-back-to-dashboard"
              title="Volver a operaciones"
            >
              ← Operaciones
            </button>
          </div>
        </div>
        
        <div className="level-select-content">
          <h1 className="level-select-title">
            {operationInfo.icon} {operationInfo.name}
          </h1>

          <div className="level-grid">
            {visibleLevels.map((level, index) => {
              const levelNumber = index + 1;
              const levelKey = `nivel${levelNumber}`;
              const gameId = `calculos-${operation}`;
              const isUnlocked = isLevelUnlocked(gameId, levelNumber);
              const isLocked = !isUnlocked;
              
              return (
                <button 
                  key={levelKey}
                  className={`level-btn level-${levelNumber} ${isLocked ? 'locked' : ''}`}
                  onClick={() => isUnlocked && onSelectLevel(levelKey)}
                  disabled={isLocked}
                >
                  <div className="level-header">
                    <div className="level-number">
                      {isLocked ? '🔒' : levelIcons[index]} Nivel {level.number}
                    </div>
                  </div>
                  <div className="level-info">
                    <div className="level-range">
                      {getLevelDescription(operation, levelNumber) || level.description}
                    </div>
                    <div className="level-points">
                      {50 * (index + 1)} puntos base
                    </div>
                    {isLocked && index > 0 && (
                      <div className="locked-message">
                        Completa el nivel {index} para desbloquear
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips Section */}
        <div className="level-tips">
          <h3>💡 Consejos para {operationInfo.name}</h3>
          <div className="tips-grid">
            {Object.entries(levelDescriptions[operation] ?? {}).map(([n, text]) => (
              <div key={n} className="tip-item">
                <div className="tip-title">Nivel {n}</div>
                <div className="tip-text">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelSelectScreen;