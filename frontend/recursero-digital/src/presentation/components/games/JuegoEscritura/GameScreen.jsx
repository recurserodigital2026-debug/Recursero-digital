import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { generateHintExample } from './utils';

const GameScreen = ({ 
    level, 
    activity, 
    totalActivities = 5,
    points,
    attempts,
    numbers, 
    wordPairs, 
    dragAnswers, 
    usedNumbers,
    onDragStart, 
    onDragOver, 
    onDrop, 
    onRemoveNumber,
    onCheck,
    onBackToLevels,
    allLevels = [],
    onGameComplete,
}) => {
    const navigate = useNavigate();
    
    const allUsedNumbers = [...numbers];
    const hintExample = generateHintExample(level - 1, allUsedNumbers);
    
    const [showExitModal, setShowExitModal] = useState(false);
    const [showWinModal, setShowWinModal] = useState(false);  
    const [pendingTarget, setPendingTarget] = useState(null);
    const [finalTotalPoints, setFinalTotalPoints] = useState(points);
        
    const currentLevelNumber = parseInt(String(level).replace(/[^0-9]/g, ''), 10);
        
    const maxLevelAllowed = allLevels.length > 0 
        ? allLevels.reduce((max, lvl) => lvl.level > max ? lvl.level : max, 0)
        : 3;
        
    const isUltimateVictory = currentLevelNumber === maxLevelAllowed;
    const isLastQuestion = activity === totalActivities;
        
    useEffect(() => {
        if (isLastQuestion && isUltimateVictory && points > 0) {
            const pointsFromPreviousLevels = allLevels.reduce((sum, lvl) => {
                const lvlNum = lvl.level || 0;
                return lvlNum < currentLevelNumber ? sum + (lvl.puntos || 0) : sum;
            }, 0);
        
            setFinalTotalPoints(pointsFromPreviousLevels + points);
                    
            const timer = setTimeout(() => {
                setShowWinModal(true);
            }, 1200);
                return () => clearTimeout(timer);
            }
        }, [activity, points, isLastQuestion, isUltimateVictory, allLevels, currentLevelNumber]);
        
        const handleExitClick = (target) => {
            const tieneRespuesta = dragAnswers && Object.keys(dragAnswers).length > 0;
        
            if (tieneRespuesta || activity > 1 || points > 0) {
                setPendingTarget(target);
                setShowExitModal(true);
            } else {
                if (target === 'juegos') navigate('/alumno/juegos');
                if (target === 'niveles') onBackToLevels();
            }
        };

    const handleConfirmExit = () => {
        setShowExitModal(false);
        if (pendingTarget === 'juegos') navigate('/alumno/juegos');
        if (pendingTarget === 'niveles') onBackToLevels();
    };

    return (
        <div className="game-content">
             <div className="game-content escala-game-content"
                style={{
                filter: showExitModal ? 'blur(4px)' : 'none',
                pointerEvents: showExitModal ? 'none' : 'auto',
                transition: 'filter 0.3s ease'
                }}
            >
            <div className="escritura-game-header">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button 
                            className="btn-back-to-dashboard"
                            onClick={() => handleExitClick('juegos')}
                            title="Volver a Juegos"
                        >
                            ← Juegos
                        </button>
                        <button 
                            className="btn-back-to-levels"
                            onClick={() => handleExitClick('niveles')}
                            title="Volver a niveles"
                        >
                            ← Niveles
                        </button>
                    </div>
                    
                    <div className="game-status">
                        <div className="status-item">
                            <div className="status-icon">🏆</div>
                            <div className="status-label">Nivel</div>
                            <div className="status-value">{level}</div>
                        </div>
                        <div className="status-item">
                            <div className="status-icon">📝</div>
                            <div className="status-label">Actividad</div>
                            <div className="status-value">{activity}/{totalActivities}</div>
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
                
                <h1 className="game-title">🔤 Juego de Escritura 🔤</h1>
                <p className="game-instruction">Arrastra cada número a su palabra correspondiente</p>
            </div>

            <div className="game-play-area">
                <div className="numbers-section">
                    <h3 className="numbers-title">Números Disponibles</h3>
                    <div className="escritura-numbers-container">
                        {numbers.map((number, index) => {
                            if (usedNumbers.has(number)) {
                                return null;
                            }
                            
                            return (
                                <div 
                                    key={`number-${index}`}
                                    className="escritura-number-box"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, number)}
                                >
                                    {number}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="words-section">
                    <div className="escritura-words-container">
                        {wordPairs.map((wordPair, index) => (
                            <div 
                                key={`word-${index}`} 
                                className={`escritura-word-pair drop-zone ${dragAnswers[index] ? 'filled' : 'empty'}`}
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, index)}
                                onClick={() => dragAnswers[index] && onRemoveNumber(index)}
                                title={dragAnswers[index] ? "Hacé clic para quitar" : "Arrastra un número aquí"}
                            >
                                <div className="escritura-number-display">
                                    {dragAnswers[index] || '?'}
                                </div>
                                <div className="escritura-word-text">{wordPair.word}</div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="button-group">
                    <button 
                        onClick={onCheck} 
                        className="btn"
                        disabled={Object.keys(dragAnswers).length !== wordPairs.length}
                    >
                        Verificar Respuestas
                    </button>
                </div>

                {/* Pista Permanente */}
                <div className="permanent-hint">
                    <div className="permanent-hint-header">
                        <span className="hint-icon">💡</span>
                        <h4>Ejemplo</h4>
                    </div>
                    <div className="permanent-hint-content">
                        <div className="hint-numbers">
                            <span className="hint-label">Ejemplo:</span>
                            <span className="hint-number">{hintExample.number}</span>
                            <span className="hint-arrow">→</span>
                            <span className="hint-word">{hintExample.word}</span>
                        </div>
                    </div>
                </div>
            </div>
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
            {showWinModal && (
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
                                    {finalTotalPoints} puntos
                                </span>
                            </div>
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={() => {
                                    if (onGameComplete) {
                                        onGameComplete(true, finalTotalPoints);
                                    }
                                    navigate('/alumno/juegos');
                                }}
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
            )}
            </div>
    );
};

export default GameScreen;