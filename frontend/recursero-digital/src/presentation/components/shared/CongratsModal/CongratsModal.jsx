import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import './CongratsModal.css';

const CongratsModal = ({
  isVisible,
  titleNivel,
  finalScore,
  totalQuestions,
  correctAnswers,
  totalAttempts,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 13000 };
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        });
        
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const performancePercentage = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 100;

  const getPerformanceMessage = () => {
    if (performancePercentage === 100) return "¡Perfecto! 🏆";
    if (performancePercentage >= 80) return "¡Excelente! 🌟";
    if (performancePercentage >= 60) return "¡Muy bien! 👏";
    if (performancePercentage >= 40) return "¡Buen intento! 💪";
    return "¡A seguir practicando! 📚";
  };

  const getPerformanceColor = () => {
    if (performancePercentage >= 80) return "text-green-400";
    if (performancePercentage >= 60) return "text-blue-400";
    if (performancePercentage >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 12000 }}>
      <div className="modal-content congrats-modal">
        <div className="modal-icon success-icon">
          <span className="icon-emoji">🎉</span>
        </div>

        <h2 className="modal-title success-title">
          ¡Completaste el nivel exitosamente!
        </h2>
        
        <div className="modal-stats">
          <h3 className="stats-title">{titleNivel}</h3>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Puntos</span>
              <span className="stat-value">{finalScore}</span>
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
          
          <p className={`performance-message ${getPerformanceColor()} font-bold text-lg mt-2`}>
            {getPerformanceMessage()}
          </p>
          
          <p className="completion-message">¡Buen trabajo!</p>
          <p className="next-challenge">
            Tu docente te asignará el próximo nivel.
          </p>
        </div>

        <div className="modal-buttons">
          <button
            onClick={() => navigate('/alumno/juegos')}
            className="btn-primary modal-btn"
          >
            🎮 Volver a Juegos
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongratsModal;