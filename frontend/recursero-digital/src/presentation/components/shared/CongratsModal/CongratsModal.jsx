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
  stars,
  isWin = true,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // El confetti sólo celebra una victoria.
    if (isVisible && isWin) {
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
  }, [isVisible, isWin]);

  if (!isVisible) return null;

  const performancePercentage = totalQuestions > 0
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 100;

  // Si el juego no envía `stars`, se derivan del % de aciertos (back-compat).
  const starCount = (stars >= 1 && stars <= 3)
    ? stars
    : performancePercentage >= 100 ? 3 : performancePercentage >= 60 ? 2 : 1;

  const getPerformanceMessage = () => {
    if (!isWin) return "¡Sigue practicando! 📚";
    if (starCount >= 3) return "¡Perfecto! 🏆";
    if (starCount === 2) return "¡Muy bien! 🌟";
    return "¡A seguir practicando! 💪";
  };

  const getPerformanceColor = () => {
    if (!isWin) return "text-red-400";
    if (starCount >= 3) return "text-green-400";
    if (starCount === 2) return "text-blue-400";
    return "text-yellow-400";
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 12000 }}>
      <div className="modal-content congrats-modal">
        <div className={`modal-icon ${isWin ? 'success-icon' : 'error-icon'}`}>
          <span className="icon-emoji">{isWin ? '🎉' : '😢'}</span>
        </div>

        <h2 className={`modal-title ${isWin ? 'success-title' : 'error-title'}`}>
          {isWin ? '¡Completaste el nivel exitosamente!' : '¡Juego Terminado!'}
        </h2>

        {isWin && (
          <div className="congrats-stars" role="img" aria-label={`${starCount} de 3 estrellas`}>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`congrats-star ${n <= starCount ? 'filled' : 'empty'}`}
                style={{ animationDelay: `${n * 0.12}s` }}
              >
                {n <= starCount ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        )}

        <div className="modal-stats">
          <h3 className="stats-title">{titleNivel}</h3>

          <div className="stats-grid">
            {finalScore !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Puntos</span>
                <span className="stat-value">{finalScore}</span>
              </div>
            )}
            {totalQuestions !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Respuestas correctas</span>
                <span className="stat-value">{correctAnswers}/{totalQuestions}</span>
              </div>
            )}
            {totalAttempts !== undefined && (
              <div className="stat-item">
                <span className="stat-label">Intentos totales</span>
                <span className="stat-value">{totalAttempts}</span>
              </div>
            )}
          </div>

          <p className={`performance-message ${getPerformanceColor()} font-bold text-lg mt-2`}>
            {getPerformanceMessage()}
          </p>

          <p className="completion-message">{isWin ? '¡Buen trabajo!' : '¡No te rindas!'}</p>
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
