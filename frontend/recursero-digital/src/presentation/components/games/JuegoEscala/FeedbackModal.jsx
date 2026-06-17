import React, { useEffect, useRef } from 'react';

const FeedbackModal = ({ feedback, onContinue, onClose }) => {
    const buttonRef = useRef(null);
    
    const handleAction = feedback?.isCorrect ? onContinue : onClose;
    useEffect(() => {
        if (buttonRef.current) buttonRef.current.focus();

        // Escuchamos keydown (no keyup): el Enter que ENVÍA la respuesta dispara su
        // keydown sobre el input ANTES de que se monte este modal, así que este
        // listener no lo captura y el cartel no se cierra solo. El preventDefault evita
        // además que el Enter nativo del botón con foco dispare la acción por duplicado.
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && handleAction) {
                event.preventDefault();
                handleAction();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleAction]);

    if (!feedback) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
            <div className="modal-content slide-in">
                <div className="desco-feedback-icon">
                    {feedback.isCorrect ? '🎉' : '😢'}
                </div>
                
                <h3 className={`desco-feedback-title ${feedback.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
                    {feedback.title || (feedback.isCorrect ? '¡Excelente trabajo!' : '¡Incorrecto!')}
                </h3>
                
                <p className="desco-feedback-text">
                    {feedback.text}
                </p>
                
                <div className="desco-feedback-button-container">
                    <button 
                        ref={buttonRef}
                        onClick={handleAction} 
                        className="btn btn-check desco-feedback-button"
                    >
                        {feedback.isCorrect ? '🚀 Continuar' : '🔄 Reintentar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;