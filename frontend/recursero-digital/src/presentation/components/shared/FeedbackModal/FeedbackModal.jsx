import React, { useEffect, useRef } from 'react';
import './FeedbackModal.css';

const FeedbackModal = ({ 
  isCorrect, 
  message, 
  feedback, 
  onContinue, 
  onClose,
  isValidationError,
  isLastQuestion,
  isSuccess,
  onRetry 
}) => {
  const buttonRef = useRef(null);

  const esCorrecto = feedback 
    ? feedback.isCorrect 
    : (isCorrect !== undefined ? isCorrect : isSuccess);

  let tituloPrincipal = feedback?.title || (esCorrecto ? '¡Correcto!' : '¡Incorrecto!');
  let textoPrincipal = feedback 
    ? feedback.text 
    : (message || (esCorrecto ? '¡Excelente trabajo! 🚀' : '¡Inténtalo de nuevo!'));

  if (isValidationError) {
    tituloPrincipal = '¡Atención! ⚠️';
  }

  const handleAction = esCorrecto ? onContinue : (onClose || onContinue);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!esCorrecto && onRetry) {
          onRetry();
        } else if (handleAction) {
          handleAction();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction, esCorrecto, onRetry]);

  if (feedback === null || (feedback === undefined && isCorrect === undefined && isSuccess === undefined && !isValidationError)) {
    return null;
  }

  return (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal-content slide-in">
        
        <div className={`feedback-modal-icon ${isValidationError ? 'warning-bg' : esCorrecto ? 'success-bg' : 'error-bg'}`}>
          <span className="feedback-icon-emoji">
            {isValidationError ? '💡' : esCorrecto ? '🎉' : '😢'}
          </span>
        </div>
        
        <h3 className={`feedback-modal-title ${isValidationError ? 'text-warning' : esCorrecto ? 'text-correct' : 'text-incorrect'}`}>
          {tituloPrincipal}
        </h3>
        
        <p className="feedback-modal-text">
          {textoPrincipal}
        </p>
        
        <div className="feedback-modal-button-container">
          {!esCorrecto && onRetry ? (
            <button 
              ref={buttonRef}
              type="button"
              onClick={(e) => { e.stopPropagation(); onRetry(); }} 
              className="feedback-modal-btn btn-retry"
            >
              🔄 Volver a intentar
            </button>
          ) : (
            <button 
              ref={buttonRef}
              type="button"
              onClick={(e) => { e.stopPropagation(); if (handleAction) handleAction(); }} 
              className="feedback-modal-btn"
            >
              {isValidationError ? '✍️ Corregir' : isLastQuestion ? '🏆 Ver Resultados' : '🚀 Continuar'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default FeedbackModal;