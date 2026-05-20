import React from 'react';
import { levelConfig, operationConfig, getLevelCountForOperation } from './utils';
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
                      {level.description}
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
          {operation === 'suma' && (
            <>
              <div className="tip-item">
                <div className="tip-title">Nivel 1</div>
                <div className="tip-text">Sumas de dos cifras sin acarreo (ninguna columna pasa de 9)</div>
              </div>
              <div className="tip-item">
                <div className="tip-title">Nivel 2</div>
                <div className="tip-text">Sumas con decenas exactas: 10, 20, 30… 90</div>
              </div>
              <div className="tip-item">
                <div className="tip-title">Nivel 3</div>
                <div className="tip-text">Sumas libres de dos cifras (se permite acarreo)</div>
              </div>
              <div className="tip-item">
                <div className="tip-title">Nivel 4</div>
                <div className="tip-text">Sumas dobles: el mismo número dos veces (200 + 200, 1.000 + 1.000)</div>
              </div>
              <div className="tip-item">
                <div className="tip-title">Nivel 5</div>
                <div className="tip-text">Sumas complementarias que dan 100, 1.000 o 10.000 (la respuesta varía pregunta a pregunta)</div>
              </div>
            </>
          )}
          
          {operation === 'resta' && (
            <>
              <div className="tip-item">
                <div className="tip-title">Nivel 1</div>
                <div className="tip-text">Visualiza los números y restalos!</div>
              </div>
              <div className="tip-item">
                <div className="tip-title">Nivel 2</div>
                <div className="tip-text">Centenas</div>
              </div>
              <div className="tip-item">
                <div className="tip-title">Nivel 3</div>
                <div className="tip-text">Miles</div>
              </div>
            </>
          )}
          
          {operation === 'multiplicacion' && (
            <>
              <div className="tip-item">
                <div className="tip-title">Nivel 1</div>
                <div className="tip-text">Tablas básicas. Recuerda las multiplicaciones fundamentales</div>
              </div>
              <div className="tip-item">
                <div className="tip-title">Nivel 2</div>
                <div className="tip-text">Por 10, 100, 1000. ¡Solo agrega ceros!</div>
              </div>
              <div className="tip-item">
                <div className="tip-title">Nivel 3</div>
                <div className="tip-text">Encuentra el factor. Divide el resultado por el número conocido</div>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelSelectScreen;