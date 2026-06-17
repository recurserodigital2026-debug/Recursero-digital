import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameLevels } from '../../../../hooks/useGameLevels';

const CongratsModal = ({ level, points, courseId, onNextLevel }) => {
    const navigate = useNavigate();
    const { levels: backendLevels } = useGameLevels('escritura', true, courseId);
    const totalLevels = backendLevels.length;
    const isLastLevel = level >= totalLevels;

    return (
        <div className="modal-overlay">
            <div className="paper-note modal-content congrats">
                <h2>🎉 ¡Felicidades!</h2>
                <p>¡Completaste el Nivel {level}!</p>
                <div className="points-display">
                    <p><strong>Puntos totales: {points} 🎯</strong></p>
                </div>
                {(!isLastLevel && onNextLevel) ? <p>¡Desbloqueaste el siguiente nivel!</p> : <p>¡Completaste todos los niveles!</p>}
                <div className="escritura-modal-buttons">
                    <button onClick={() => navigate('/alumno/juegos')} className="btn escritura-btn-secondary">
                        🎮 Volver a Juegos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CongratsModal;