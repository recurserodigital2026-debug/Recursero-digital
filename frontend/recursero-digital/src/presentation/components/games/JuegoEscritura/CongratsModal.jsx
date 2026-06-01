import React from 'react';
import { useGameLevels } from '../../../../hooks/useGameLevels';

const CongratsModal = ({ level, points, courseId, onNextLevel, onBackToLevels }) => {
    const { levels: backendLevels } = useGameLevels('escritura', true, courseId);
    const totalLevels = backendLevels.length;
    const isLastLevel = level >= totalLevels;

    return (
        <div className="modal-overlay">
            <div className="paper-note modal-content congrats" data-aos="zoom-in">
                <h2>🎉 ¡Felicidades!</h2>
                <p>¡Completaste el Nivel {level}!</p>
                <div className="points-display">
                    <p><strong>Puntos totales: {points} 🎯</strong></p>
                </div>
                {(!isLastLevel && onNextLevel) ? <p>¡Desbloqueaste el siguiente nivel!</p> : <p>¡Completaste todos los niveles!</p>}
                <div className="escritura-modal-buttons">
                    <button onClick={onBackToLevels} className="btn escritura-btn-secondary">
                        🏠 Volver a Niveles
                    </button>
                    {!isLastLevel && onNextLevel && (
                        <button onClick={onNextLevel} className="btn escritura-btn-next-level">
                            ➡️ Siguiente Nivel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CongratsModal;