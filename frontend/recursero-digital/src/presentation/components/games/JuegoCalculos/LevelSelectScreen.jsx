import React from 'react';
import { levelConfig, operationConfig, getLevelCountForOperation, getLevelDescription, levelDescriptions, getLocalLevelForOperation } from './utils';
import { useUserProgress } from '../../../hooks/useUserProgress';

const LevelSelectScreen = ({ operation, onSelectLevel, onBackToStart, assignedLevels, assignedLevelCompleted }) => {
  const operationInfo = operationConfig[operation];
  const { isLevelUnlocked } = useUserProgress();

  // DB levels → local level numbers for THIS operation
  const assignedLocalLevels = assignedLevels
    ? assignedLevels.map(l => getLocalLevelForOperation(l, operation)).filter(l => l !== null)
    : null;

  const checkPersistedCompletion = () => {
    if (!assignedLocalLevels?.length) return false;
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const studentId = payload?.id || payload?.userId;
      if (!studentId) return false;
      return assignedLocalLevels.every(l =>
        !!localStorage.getItem(`recursero_calculos_done_${studentId}_${operation}_${l}`)
      );
    } catch (e) {
      return false;
    }
  };

  const isCompleted = assignedLocalLevels?.length > 0 && (
    (assignedLocalLevels.length === 1 && assignedLevelCompleted) ||
    checkPersistedCompletion()
  );

  const isLevelAvailable = (levelNumber) => {
    if (assignedLocalLevels?.length > 0) return assignedLocalLevels.includes(levelNumber);
    return isLevelUnlocked(`calculos-${operation}`, levelNumber);
  };

  const levelIcons = ['🎯', '⚡', '🚀', '🌟', '👑', '💎', '🏆'];
  const allLevels = levelConfig.slice(0, getLevelCountForOperation(operation));
  const visibleLevels = assignedLocalLevels?.length > 0
    ? allLevels.filter((_, i) => assignedLocalLevels.includes(i + 1))
    : allLevels;

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
              const levelNumber = assignedLocalLevels?.length > 0 ? level.number : index + 1;
              const levelKey = `nivel${levelNumber}`;
              const isUnlocked = isLevelAvailable(levelNumber);
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
                      {isLocked ? '🔒' : levelIcons[levelNumber - 1]} Nivel {level.number}
                    </div>
                  </div>
                  <div className="level-info">
                    <div className="level-range">
                      {getLevelDescription(operation, levelNumber) || level.description}
                    </div>
                    <div className="level-points">
                      {50 * levelNumber} puntos base
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