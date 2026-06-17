import React, { useEffect, useRef, useMemo } from 'react';

const FeedbackModal = ({ isSuccess, onContinue }) => {
    const buttonRef = useRef(null);

    const errorMessage = useMemo(() => {
        const messages = [
            "¡Intenta de nuevo!",
            "¡No te rindas!",
            "¡Casi lo tienes!",
            "¡Inténtalo otra vez!",
            "¡Tú puedes!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }, []);

    const errorDescription = useMemo(() => {
        const descriptions = [
            "El orden no es correcto. ¡No te rindas, tú puedes!",
            "Revisa el orden de los números. ¡Sigue intentando!",
            "Algo no está bien con el orden. ¡Vamos, inténtalo de nuevo!",
            "Fíjate bien en los números. ¡El siguiente intento será el bueno!"
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }, []);

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.focus();
        }
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                onContinue();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onContinue]);
    
    return (
        <div className="modal-overlay">
            <div className="modal-content slide-in">
                <div className="desco-feedback-icon">
                    {isSuccess ? '🎉' : '😢'}
                </div>
                
                <h3 className={`desco-feedback-title ${isSuccess ? 'feedback-correct' : 'feedback-incorrect'}`}>
                    {isSuccess ? '¡Bien Hecho!' : errorMessage}
                </h3>
                
                <p className="desco-feedback-text">
                    {isSuccess ? '¡Excelente!' : errorDescription}
                </p>
                
                <div className="desco-feedback-button-container">
                    <button 
                        ref={buttonRef}
                        onClick={onContinue} 
                        className="btn btn-check desco-feedback-button"
                    >
                        {isSuccess ? '🚀 Continuar' : '🔄 Reintentar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;