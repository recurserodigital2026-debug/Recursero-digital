import React from 'react';
import { useNavigate } from 'react-router-dom';

const CongratsModal = ({ 
    score, 
    totalQuestions, // Esto es el puntaje máximo posible, no la cantidad de preguntas
    levelName, 
    nextLevelUnlocked, 
    onPlayAgain,
    onBackToLevels 
}) => {
    const navigate = useNavigate();
    
    const isPerfect = score === totalQuestions;

    return (
        <div className="modal-overlay">
            <div className="modal-content congrats">
                <div className="congrats-header">
                    <div className="congrats-icon">
                        {isPerfect ? '🌟' : '🎉'}
                    </div>
                    
                    <h2 className="congrats-title">
                        ¡Nivel Completado!
                    </h2>
                    
                    <p className="congrats-subtitle">
                        {isPerfect ? '¡Puntaje Perfecto! Eres increíble.' : '¡Has terminado todas las secuencias!'}
                    </p>
                </div>

                <div className="score-summary">
                    {/* Eliminamos el círculo de porcentaje */}
                    
                    <div className="level-info">
                        <h3>
                            🌊 {levelName} 🌊
                        </h3>
                        
                        <div className="level-passed-info">
                            <p className="level-passed-text" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                Puntos Obtenidos
                            </p>
                            <div className="score-display-large" style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e3a8a' }}>
                                {score} / {totalQuestions}
                            </div>
                            
                            {nextLevelUnlocked ? (
                                <p className="level-unlocked-text">
                                    🔓 ¡Siguiente nivel desbloqueado!
                                </p>
                            ) : (
                                <p className="level-unlocked-text">
                                    🏆 ¡Juego completado!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="congrats-actions">
                    <button
                        className="btn-back-to-games btn-main-gradient bg-space-gradient"
                        onClick={() => navigate('/alumno/juegos')}
                    >
                        🎮 Volver a Juegos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CongratsModal;