import React from 'react';

const CongratsModal = ({ level, points, onNextLevel, onBackToLevels }) => (
    <div className="modal-overlay">
        <div className="paper-note modal-content congrats">
            <h2>🎉 ¡Felicidades!</h2>
            <p>¡Completaste el Nivel {level}!</p>
            <div className="points-display">
                <p><strong>Puntos totales: {points} 🎯</strong></p>
            </div>
            {onNextLevel ? <p>¡Desbloqueaste el siguiente nivel!</p> : <p>¡Completaste todos los niveles!</p>}
            <div className="modal-buttons">
                <button onClick={onBackToLevels} className="btn btn-secondary">
                    🏠 Volver a Niveles
                </button>
                {onNextLevel && (
                    <button onClick={onNextLevel} className="btn btn-next-level">
                        ➡️ Siguiente Nivel
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default CongratsModal;