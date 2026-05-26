import React from 'react';
import { getOperationName, getLevelName, formatNumber } from './utils';

const CongratsModal = ({
  isVisible,
  isWin,
  operation,
  level,
  finalScore,
  totalQuestions,
  correctAnswers,
  totalAttempts,
  onBackToGames
}) => {
  if (!isVisible) return null;

  const isCompleted = isWin;
  const performancePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  const getPerformanceMessage = () => {
    if (performancePercentage === 100) return "¡Perfecto! 🏆";
    if (performancePercentage >= 80) return "¡Excelente! 🌟";
    if (performancePercentage >= 60) return "¡Muy bien! 👏";
    if (performancePercentage >= 40) return "¡Buen intento! 💪";
    return "¡A seguir practicando! 📚";
  };


  const getPerformanceColor = () => {
    if (performancePercentage >= 80) return "text-green-600";
    if (performancePercentage >= 60) return "text-blue-600";
    if (performancePercentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content congrats-modal">
        
        <div className={`modal-icon ${isCompleted ? 'success-icon' : 'error-icon'}`}>
          <span className="icon-emoji">
            {isCompleted ? '🎉' : '😔'}
          </span>
        </div>

        <h2 className={`modal-title ${isCompleted ? 'success-title' : 'error-title'}`}>
          {isCompleted ? '¡Completaste el nivel exitosamente!' : '¡Juego Terminado!'}
        </h2>
        
        <div className="modal-stats">
          <h3 className="stats-title">
            {getOperationName(operation)} - {getLevelName(level)}
          </h3>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Puntos</span>
              <span className="stat-value">{formatNumber(finalScore)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Respuestas correctas</span>
              <span className="stat-value">{correctAnswers}/{totalQuestions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Intentos totales</span>
              <span className="stat-value">{totalAttempts || 0}</span>
            </div>
          </div>
          
          <p className={`performance-message ${getPerformanceColor()}`}>
            {getPerformanceMessage()}
          </p>
          
          <p className="completion-message">
            {isCompleted ? '¡Buen trabajo!' : '¡Sigue practicando!'}
          </p>
          <p className="next-challenge">
            Tu docente te asignará el próximo nivel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="modal-buttons">
          <button
            onClick={onBackToGames}
            className="btn-primary modal-btn"
          >
            🏠 Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongratsModal;