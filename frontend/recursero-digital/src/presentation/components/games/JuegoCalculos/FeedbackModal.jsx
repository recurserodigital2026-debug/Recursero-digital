import React, { useEffect, useRef } from 'react';

const FeedbackModal = ({ isCorrect, message, pointsEarned, onContinue }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.focus();
        }        
    }, []);

    const handleClick = (e) => {
        e.stopPropagation(); 
        onContinue();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation(); 
            onContinue();
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
            <div className="modal-content slide-in">
                <div className="desco-feedback-icon">
                    {isCorrect ? '🎉' : '😢'}
                </div>
                
                <h3 className={`desco-feedback-title ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
                    {isCorrect ? '¡Correcto!' : '¡Incorrecto!'}
                </h3>
                
                <p className="desco-feedback-text">
                    {message || (isCorrect ? `¡Excelente! Ganaste ${pointsEarned} puntos` : '¡Inténtalo de nuevo!')}
                </p>
                
                <div className="desco-feedback-button-container">
                    <button 
                        ref={buttonRef}
                        type="button"
                        onClick={handleClick} 
                        onKeyDown={handleKeyDown}
                        className="btn btn-check desco-feedback-button"
                    >
                        {isCorrect ? '🚀 Continuar' : '🔄 Reintentar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;