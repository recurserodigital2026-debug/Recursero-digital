import React from 'react';
import { levelConfig, operationConfig, getLevelCountForOperation, getLevelDescription, levelDescriptions, getLocalLevelForOperation } from './utils';
import { useUserProgress } from '../../../hooks/useUserProgress';

const LevelSelectScreen = ({ operation, onSelectLevel, onBackToStart, assignedLevel, assignedLevelCompleted }) => {
  const operationInfo = operationConfig[operation];
  const { isLevelUnlocked } = useUserProgress();

  const assignedLocalLevel = assignedLevel != null ? getLocalLevelForOperation(assignedLevel, operation) : null;

  const checkPersistedCompletion = () => {
    if (assignedLocalLevel == null) return false;
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const studentId = payload?.id || payload?.userId;
      if (!studentId) return false;
      return !!localStorage.getItem(`recursero_calculos_done_${studentId}_${operation}_${assignedLocalLevel}`);
    } catch (e) {
      return false;
    }
  };

  const isCompleted = assignedLocalLevel != null && (
    assignedLevelCompleted ||
    checkPersistedCompletion()
  );

  const isLevelAvailable = (levelNumber) => {
    if (assignedLocalLevel != null) return levelNumber === assignedLocalLevel;
    return isLevelUnlocked(`calculos-${operation}`, levelNumber);
  };

  const levelIcons = ['🎯', '⚡', '🚀', '🌟', '👑', '💎', '🏆'];
  const allLevels = levelConfig.slice(0, getLevelCountForOperation(operation));
  const visibleLevels = assignedLocalLevel != null
    ? allLevels.filter((_, i) => i + 1 === assignedLocalLevel)
    : allLevels;

  if (isCompleted) {
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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '40px 24px',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              borderRadius: '20px',
              border: '2px solid #34d399',
              maxWidth: '480px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '64px' }}>🏆</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065f46', margin: 0 }}>
                ¡Ya completaste este nivel!
              </h2>
              <p style={{ fontSize: '1rem', color: '#047857', margin: 0 }}>
                Aguarda a que tu docente te asigne un nuevo nivel para continuar.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              const levelNumber = assignedLocalLevel != null ? assignedLocalLevel : index + 1;
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