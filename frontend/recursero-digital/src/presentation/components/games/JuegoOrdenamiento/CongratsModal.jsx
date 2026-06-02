import React from 'react';
import { useNavigate } from 'react-router-dom';

const CongratsModal = ({ level, points, onNextLevel }) => {
    const navigate = useNavigate();
    return (
        <div className="modal-overlay">
            <div className="paper-note modal-content congrats">
                <h2>🎉 ¡Felicidades!</h2>
                <p>¡Completaste el Nivel {level}!</p>
                <div className="points-display">
                    <p><strong>Puntos totales: {points} 🎯</strong></p>
                </div>
                {onNextLevel ? <p>¡Desbloqueaste el siguiente nivel!</p> : <p>¡Completaste todos los niveles!</p>}
                <div className="modal-buttons">
                    <button onClick={() => navigate('/alumno/juegos')} className="btn btn-secondary">
                        🎮 Volver a Juegos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CongratsModal;