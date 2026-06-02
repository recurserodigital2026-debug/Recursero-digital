import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const GameScreen = ({ 
    level, 
    activity, 
    totalActivities,
    points,
    attempts,
    question,
    userAnswer,
    onAnswerChange,
    onCheckAnswer,
    onBackToLevels,
    formatNumber,
    allLevels = [],
    onGameComplete,
}) => {
    const navigate = useNavigate();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userAnswer.trim()) {
            onCheckAnswer();
        }
    };

    const handleExitClick = (target) => {
        if (userAnswer.trim() !== '' || activity > 1 || points > 0) {
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
            <div style={{
                filter: showExitModal ? 'blur(4px)' : 'none',
                pointerEvents: showExitModal ? 'none' : 'auto',
                transition: 'filter 0.3s ease'
            }}>
            <header className="desco-game-header">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button 
                            className="btn-back-to-dashboard"
                            onClick={() => handleExitClick('juegos')}
                            title="Volver al dashboard"
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
                
                <h1 className="game-title">🧩 Descomposición y Composición Numérica</h1>
                <p className="game-instruction">
                    {question.type === 'decomposition' 
                        ? '🔢 Descompone el número en sus valores posicionales'
                        : '➕ Suma los valores para formar el número'
                    }
                </p>
            </header>

            <div className="game-play-area">
                {/* Pregunta principal */}
                <div className="desco-question-card">
                    {question.type === 'decomposition' ? (
                        <div className="question-number">
                            {formatNumber(question.number)}
                        </div>
                    ) : (
                        <div className="question-decomposition-text">
                            {question.decomposition.join(' + ')}
                        </div>
                    )}
                </div>

                {/* Sección de respuesta */}
                <div className="answer-card">
                    <p className="answer-instruction">
                        {question.type === 'decomposition' 
                            ? 'Escribe la descomposición:'
                            : 'Escribe el número:'
                        }
                    </p>

                    <form onSubmit={handleSubmit} className="answer-form">
                        <input
                            type="text"
                            className="answer-input-styled"
                            value={userAnswer}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            placeholder={
                                question.type === 'decomposition' 
                                    ? 'Ej: 2000 + 300 + 40 + 7'
                                    : 'Escribe el número completo'
                            }
                        />
                    </form>

                    <div className="desco-button-group">
                        <button
                            onClick={onCheckAnswer}
                            disabled={!userAnswer.trim()}
                            className="btn-verify"
                            title="Verificar respuesta"
                        >
                            ✓ Verificar
                        </button>
                        
                        <button
                            onClick={() => onAnswerChange('')}
                            className="btn-clear"
                            title="Limpiar respuesta"
                        >
                            ↺ Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Pista permanente */}
            <div className="permanent-hint">
                <div className="permanent-hint-header">
                    <span className="hint-icon">💡</span>
                    <h4>Ayuda</h4>
                </div>
                <div className="permanent-hint-content">
                    <p className="hint-text">
                        {question.type === 'decomposition' 
                            ? 'Separa cada cifra según su valor posicional (unidades, decenas, centenas, etc.)'
                            : 'Suma todos los números para obtener el resultado final'
                        }
                    </p>
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
                                Perderás todo tus puntos
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