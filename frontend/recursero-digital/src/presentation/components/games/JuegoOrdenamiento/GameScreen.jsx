import React, { useState, useEffect, useRef } from 'react';
import GameHeader from './GameHeader';
import { getOrderInstruction } from './utils';

const GameScreen = ({ 
  currentLevel, 
  currentActivity, 
  totalActivities,
  completedActivities = 0,
  attempts,
  points,
  numbers,
  targetNumbers,
  numbersCount,
  onDrop,
  onRemove,
  onBackToLevels,
  onBackToGames,
  generateHint,
  showPermanentHint,
  order,
}) => {

  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);

  const [shouldAnimateHint, setShouldAnimateHint] = useState(false);
  const previousShowHint = useRef(showPermanentHint);

  const handleExitClick = (target) => {
    const tieneRespuesta = targetNumbers.length > 0;

    if (tieneRespuesta || currentActivity > 1 || points > 0) {
        setPendingTarget(target);
        setShowExitModal(true);
    } else {
        if (target === 'juegos') onBackToGames();
        if (target === 'niveles') onBackToLevels();
    }
  };

  const handleConfirmExit = () => {
      setShowExitModal(false);
      if (pendingTarget === 'juegos') onBackToGames();
      if (pendingTarget === 'niveles') onBackToLevels();
  };

  useEffect(() => {
    if (showPermanentHint && !previousShowHint.current) {
      setShouldAnimateHint(true);
      const timer = setTimeout(() => {
        setShouldAnimateHint(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    previousShowHint.current = showPermanentHint;
  }, [showPermanentHint]);

  const NumberBox = React.memo(({ number, isInTarget = false, onDrop, onRemove }) => {
    const handleDragStart = (e) => {
      e.dataTransfer.setData('text/plain', number.toString());
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleClick = () => {
      if (isInTarget) {
        onRemove(number);
      } else if (targetNumbers.length < numbersCount) {
        onDrop(number);
      }
    };

    return (
      <div
        className={`ordenamiento-number-box ${isInTarget ? 'in-target' : ''}`}
        draggable={!isInTarget}
        onDragStart={handleDragStart}
        onClick={handleClick}
        data-value={number}
      >
        {number}
      </div>
    );
  });

  const DropTarget = React.memo(() => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setIsDragOver(false);
      }
    };

    const handleDropEvent = (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const draggedNumber = parseInt(e.dataTransfer.getData('text/plain'));
      if (!targetNumbers.includes(draggedNumber) && targetNumbers.length < numbersCount) {
        onDrop(draggedNumber);
      }
    };

    return (
      <div
        className={`drop-target ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
      >
        {targetNumbers.length === 0 ? (
          <p className="drop-hint">Arrastra los números aquí o haz clic en ellos</p>
        ) : (
          targetNumbers.map((number, index) => (
            <NumberBox 
              key={`${number}-${index}`} 
              number={number} 
              isInTarget 
              onRemove={onRemove}
            />
          ))
        )}
      </div>
    );
  });

  const PermanentHint = React.memo(() => (
    <div className={`permanent-hint ${shouldAnimateHint ? 'hint-animate' : ''}`}>
      <div className="permanent-hint-header">
        <span className="hint-icon">💡</span>
        <h4>¡Pista especial!</h4>
      </div>
      <div className="permanent-hint-content">
        <p className="hint-text">{generateHint()}</p>
        <div className="hint-numbers">
          <span className="hint-label">Números:</span>
          {numbers.map(num => (
            <span key={num} className="hint-number">{num}</span>
          ))}
        </div>
      </div>
    </div>
  ));

  const availableNumbers = numbers.filter(num => !targetNumbers.includes(num));
  const progressPercentage = totalActivities > 0
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;

return (
    <div className="game-container"> 
      <div 
        className="game-content"
        style={{
          filter: showExitModal ? 'blur(4px)' : 'none',
          pointerEvents: showExitModal ? 'none' : 'auto',
          transition: 'filter 0.3s ease'
        }}
      >
        <header className="ordenamiento-game-header">
          <GameHeader
            currentLevel={currentLevel}
            currentActivity={currentActivity}
            totalActivities={totalActivities}
            attempts={attempts}
            points={points}
            onBackToGames={() => handleExitClick('juegos')}
            onBackToLevels={() => handleExitClick('niveles')}
          />
          <h1 className="game-title">🎯 Ordenamiento Numérico</h1>
          <p className="game-instruction">
            {(() => {
              const instruction = getOrderInstruction(order);
              return (
                <span>
                  {instruction.icon} {instruction.text} <span className="highlight-text">{instruction.highlight1}</span> {instruction.middle} <span className="highlight-text">{instruction.highlight2}</span> {instruction.endIcon}
                </span>
              );
            })()}
          </p>
        </header>

        <div className="ordenamiento-progress-container">
          <div 
            className="ordenamiento-progress-bar"
            data-progress={progressPercentage}
            style={{'--progress-width': `${progressPercentage}%`}}
          />
        </div>

        <div className="game-play-area">
          <DropTarget />
          
          <div className="numbers-section">
            <h3 className="numbers-title">Números a ordenar:</h3>
            <div className="ordenamiento-numbers-container">
              {availableNumbers.map(number => (
                <NumberBox 
                  key={number} 
                  number={number} 
                  onDrop={onDrop}
                />
              ))}
            </div>
          </div>
        </div>

        {showPermanentHint && <PermanentHint />}
      </div> 

      {showExitModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal-content congrats-model" style={{ maxWidth: '420px' }}>
                <h2 className="modal-title" style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '15px' }}>
                    ¿Seguro quieres volver a los {pendingTarget === 'juegos' ? 'juegos' : 'niveles'}?
                </h2>
                <div className="modal-stats" style={{ marginBottom: '25px' }}>
                    <p className="performance-message" style={{ color: '#ffb703', fontSize: '1.3rem', fontWeight: 'bold' }}>
                        Perderás todos tus puntos
                    </p>
                </div>
                <div className="modal-buttons" style={{ display: 'flex', gap: '15px', flexDirection: 'row' }}>
                    <button 
                        onClick={handleConfirmExit}
                        className="modal-btn"
                        style={{
                            backgroundColor: '#ebeaf1', color: 'black', border: '2px solid #333',
                            borderRadius: '12px', padding: '10px 24px', fontSize: '1rem',
                            fontWeight: 'bold', cursor: 'pointer', flex: 1, boxShadow: '0 3px 0 #222'
                        }}
                    >
                        Sí
                    </button>
                    <button
                        onClick={() => setShowExitModal(false)}
                        className="modal-btn"
                        style={{
                            backgroundColor: '#ebeaf1', color: 'black', border: '2px solid #333',
                            borderRadius: '12px', padding: '10px 24px', fontSize: '1rem',
                            fontWeight: 'bold', cursor: 'pointer', flex: 1, boxShadow: '0 3px 0 #222'
                        }}
                    >
                        No
                    </button>
                </div>
            </div>
          </div>
      )}
    </div> 
  );
};

export default GameScreen;