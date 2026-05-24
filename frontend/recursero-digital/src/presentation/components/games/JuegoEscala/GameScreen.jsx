import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidNumber } from './util';

const GameScreen = ({ 
    activity,
    totalActivities,
    points,
    attempts,
    question,
    userAnswers,
    onAnswersChange,
    onCheckAnswer,
    onBackToLevels,
    level,
    levelConfig,
    inputErrors,
    setInputErrors,
    isProcessing,
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

    const handleInputChange = (field, value) => {
        if (isProcessing) return;

        const isValid = isValidNumber(value);
        setInputErrors(prev => ({
            ...prev,
            [field]: !isValid
        }));

        if (isValid) {
            onAnswersChange(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleKeyDown = (e, field) => {
        if (isProcessing) return;

        if (e.key === 'Enter') {
            e.preventDefault();
            if (field === 'anterior') {
                const posteriorInput = document.querySelector('input[aria-label="Número posterior en la secuencia"]');
                if (posteriorInput) posteriorInput.focus();
            } else if (field === 'posterior') {
                if (userAnswers.anterior && userAnswers.posterior && !inputErrors?.anterior && !inputErrors?.posterior) {
                    onCheckAnswer();
                }
            }
        }
    };

const handleExitClick = (target) => {
    const tieneRespuesta = userAnswers?.anterior?.trim() !== '' || userAnswers?.posterior?.trim() !== '';

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
        <div className="game-container">
            <div className="game-content escala-game-content"
                style={{
                filter: showExitModal ? 'blur(4px)' : 'none',
                pointerEvents: showExitModal ? 'none' : 'auto',
                transition: 'filter 0.3s ease'
                }}
            >
                <header className="escala-game-header">
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
                
                <h1 className="game-title">⚡ Anterior y Posterior ⚡</h1>
                <p className="game-instruction">
                    🔍 Encuentra los números anterior y posterior en la secuencia
                </p>
            </header>

            <div className="game-play-area escala-game-play-area">
                <div className="escala-question-card">
                    <div className="escala-sequence-visual">
                        {/* Números anteriores para contexto */}
                        {Array.from({ length: 2 }, (_, i) => question.baseNumber - (3 * question.operation) + (i * question.operation)).map(num => (
                            <div
                                key={`before-${num}`}
                                className="context-number"
                            >
                                {num}
                            </div>
                        ))}
                        
                        {/* Input para anterior */}
                        <div className="missing-anterior">
                            <input
                                type="text"
                                value={userAnswers.anterior || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^-?\d+$/.test(value)) {
                                        handleInputChange('anterior', value);
                                    }
                                }}
                                onKeyDown={(e) => handleKeyDown(e, 'anterior')}
                                disabled={isProcessing}
                                className={`sequence-input ${inputErrors?.anterior ? 'error' : ''} ${isProcessing ? 'disabled' : ''}`}
                                placeholder="?"
                                aria-label="Número anterior en la secuencia"
                                aria-invalid={inputErrors?.anterior}
                                role="spinbutton"
                            />
                        </div>
                        
                        {/* Número central */}
                        <div className="central-number">
                            {question.baseNumber}
                        </div>
                        
                        {/* Input para posterior */}
                        <div className="missing-posterior">
                            <input
                                type="text"
                                value={userAnswers.posterior || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^-?\d+$/.test(value)) {
                                        handleInputChange('posterior', value);
                                    }
                                }}
                                onKeyDown={(e) => handleKeyDown(e, 'posterior')}
                                disabled={isProcessing}
                                className={`sequence-input ${inputErrors?.posterior ? 'error' : ''} ${isProcessing ? 'disabled' : ''}`}
                                placeholder="?"
                                aria-label="Número posterior en la secuencia"
                                aria-invalid={inputErrors?.posterior}
                                role="spinbutton"
                            />
                        </div>
                        
                        {/* Números posteriores para contexto */}
                        {Array.from({ length: 2 }, (_, i) => question.baseNumber + (2 * question.operation) + (i * question.operation)).map(num => (
                            <div
                                key={`after-${num}`}
                                className="context-number"
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="button-group">
                        <button
                            onClick={onCheckAnswer}
                            disabled={!userAnswers.anterior || !userAnswers.posterior || inputErrors?.anterior || inputErrors?.posterior || isProcessing}
                            className="btn-verify"
                            title="Verificar respuesta"
                        >
                            {isProcessing ? '⏳ Procesando...' : '✓ Verificar'}
                        </button>
                        
                        <button
                            onClick={() => onAnswersChange({ anterior: '', posterior: '' })}
                            className="btn-clear"
                            title="Limpiar respuestas"
                            disabled={isProcessing}
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
                        {levelConfig.description}
                    </p>
                    <p className="hint-text">
                        Usa Enter para navegar entre campos y verificar tu respuesta
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
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameScreen;