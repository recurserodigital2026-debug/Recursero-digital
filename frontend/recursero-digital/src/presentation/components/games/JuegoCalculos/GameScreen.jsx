import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../../../context/SoundContext';
import SoundToggle from '../../shared/SoundToggle';
import FeedbackModal from './FeedbackModal';
import {
  getQuestionsForLevel,
  validateAnswer,
  getOperationName,
  getLevelName,
  getRandomEncouragement,
  getRandomMotivation,
  getLevelNumber,
  getBackendLevel
} from './utils';

const MultiplicationVisual = ({ multiplicationVisual }) => {
  if (!multiplicationVisual) return null;
  const { factor1, factor2 } = multiplicationVisual;

  const renderDots = (count) => {
    const puntos = Array.from({ length: count });
    const columnas = (count === 2 || count === 4) ? 2 : 3;

    return (
      <div style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#FFFFFF',
        border: '2.5px solid #333333',
        borderRadius: '14px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05), inset 0 -3px 0 rgba(0,0,0,0.08)',
        display: 'grid',
        gridTemplateColumns: `repeat(${columnas}, auto)`,
        justifyContent: 'center',
        alignContent: 'center',
        padding: '6px',
        gap: '8px', 
        boxSizing: 'border-box'
      }}>
        {puntos.map((_, i) => (
          <div
            key={i}
            style={{
              width: '9px',
              height: '9px',
              backgroundColor: '#333333',
              borderRadius: '50%',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      margin: '10px auto 15px auto',
      userSelect: 'none'
    }}>

      {renderDots(factor1)}
      
      <span style={{
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#0d0d0f',
        fontFamily: 'sans-serif',
        lineHeight: 1
      }}>
        ×
      </span>

      {renderDots(factor2)}
    </div>
  );
};

const GameScreen = ({ 
  operation, 
  level, 
  allLevels = [],
  onGameComplete, 
  onBackToLevelSelect,
  onUpdateScore,
  onUpdateAttempts,
  onActivityComplete,
  onStartActivityTimer
}) => {
  const navigate = useNavigate();
  const { playVictory } = useSound();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ isCorrect: false, message: '', pointsEarned: 0 });  
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0); 
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const[showExitModal, setShowExitModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);  
  const [pendingTarget, setPendingTarget] = useState(null);

  const inputRef = useRef(null);
  
  const backendLevelConfig = useMemo(() => {
    if (!allLevels || allLevels.length === 0) return null;
    const levelNumber = parseInt(level.replace('nivel', ''));
    const backendLevelNumber = getBackendLevel(operation, levelNumber);
    return allLevels.find(l => Number(l.level) === backendLevelNumber) || null;
  }, [allLevels, operation, level]);

  // Generar preguntas. Si backendLevelConfig es null, getQuestionsForLevel usa config local de respaldo.
  const questions = useMemo(() => {
    try {
      const levelNumber = parseInt(level.replace('nivel', ''));
      return getQuestionsForLevel(operation, levelNumber, backendLevelConfig);
    } catch (e) {
      console.error('Error generando preguntas para nivel:', level, e);
      return [];
    }
  }, [operation, level, backendLevelConfig]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setScore(0);
    setShowFeedback(false);
    setFeedbackData({ isCorrect: false, message: '', pointsEarned: 0 });   
    setIsAnswerSubmitted(false);
    setAttempts(0);
    setTotalAttempts(0);
    setCorrectAnswers(0);
  }, [operation, level, questions]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (currentQuestionIndex > 0 && onStartActivityTimer) {
      onStartActivityTimer();
    }
  }, [currentQuestionIndex, onStartActivityTimer]);

  const handleSubmitAnswer = () => {
    if (userAnswer.trim() === '' || isAnswerSubmitted) return;

    const userAnswerNum = parseInt(userAnswer);
    const isCorrect = validateAnswer(userAnswerNum, currentQuestion.respuesta);
    
    setIsAnswerSubmitted(true);

    if (isCorrect) {
      const pointsEarned = calculatePoints();
      setScore(prev => prev + pointsEarned);
      const newCorrectAnswers = correctAnswers + 1;
      setCorrectAnswers(newCorrectAnswers);
      onUpdateScore(pointsEarned);

      const currentLevelNumber = parseInt(level.replace('nivel', ''));
      const maxLevelAllowed = (operation === 'suma') ? 5 : 3;
      const isUltimateVictory = currentLevelNumber === maxLevelAllowed;;

      if (onActivityComplete && !(isLastQuestion && isUltimateVictory)) {
        onActivityComplete(currentQuestionIndex, attempts, 1, 1, isLastQuestion);
      }
      
      setFeedbackData({
          isCorrect: true,
          message: `${getRandomEncouragement()}`,
          pointsEarned: pointsEarned
      });      
      setShowFeedback(true);
    } else {
      setAttempts(prev => prev + 1);
      setTotalAttempts(prev => prev + 1);
      onUpdateAttempts();
      
      setFeedbackData({
          isCorrect: false,
          message: getRandomMotivation(),
          pointsEarned: 0
      });
      setShowFeedback(true);
    }
  };

  const handleFeedbackContinue = () => {
      setShowFeedback(false);
      
      if (feedbackData.isCorrect) {
          if (isLastQuestion) {
              const pointsInCurrentLevel = score;
              const newCorrectAnswers = correctAnswers;
              const isWin = newCorrectAnswers >= Math.ceil(questions.length * 0.6);
              
              const currentLevelNumber = parseInt(level.replace('nivel', ''));
              const maxLevelAllowed = (operation === 'suma') ? 5 : 3;
              const isUltimateVictory = currentLevelNumber === maxLevelAllowed;

              if (isWin && isUltimateVictory) {
                if (playVictory) playVictory();
                const currentBackendLevel = backendLevelConfig?.level || 0;

                const totalScoreAcumulado = allLevels.reduce((sum, lvl) => {
                  return lvl.level < currentBackendLevel ? sum + (lvl.puntos || 0) : sum;
                }, 0);

                const granTotalCompleto = totalScoreAcumulado + pointsInCurrentLevel;

                setScore(granTotalCompleto);
                setIsAnswerSubmitted(true);
                setShowWinModal(true);
              } else {
                if (isWin && playVictory) playVictory();
                onGameComplete(isWin, pointsInCurrentLevel, newCorrectAnswers, questions.length, totalAttempts);
              } 
          } else {
              nextQuestion();
          }
      } else {
          setUserAnswer('');
          setIsAnswerSubmitted(false);
          if (inputRef.current) inputRef.current.focus();
      }
  };

  const calculatePoints = () => {
    const levelNumber = parseInt(level.replace('nivel', ''));
    const baseScore = 50 * levelNumber;
    const penalty = attempts * 10;
    return Math.max(10, baseScore - penalty);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setUserAnswer('');
    setShowFeedback(false);
    setIsAnswerSubmitted(false);
    setAttempts(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAnswerSubmitted) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmitAnswer();
    }
  };

  const handleExit = (target) => {
    if(userAnswer.trim() !== '' || currentQuestionIndex > 0 || score > 0) {
      setPendingTarget(target);
      setShowExitModal(true);
    } else {
      if(target == 'juegos') navigate('/alumno/juegos');
      if (target == 'niveles') onBackToLevelSelect();
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if(pendingTarget === 'juegos') navigate('/alumno/juegos');
    if(pendingTarget === 'niveles') onBackToLevelSelect();
  };

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="game-container">
        <div className="level-select-screen">
          <div className="header-controls">
            <div className="buttons-group">
              <button onClick={onBackToLevelSelect} className="btn-back-to-levels">← Niveles</button>
            </div>
          </div>
          <div className="level-select-content" style={{ textAlign: 'center', color: 'white' }}>
            <p>Este nivel no está disponible. Consultá a tu docente.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-content">
      <div style= {{
        filter: showExitModal ? 'blur(4px)' : 'none',
        pointerEvents: showExitModal ? 'none' : 'auto',
        transition: 'filter 0.3s ease'
      }}>
      <header className="desco-game-header">
        <div className="header-controls">
          <div className="buttons-group">
            <button 
              onClick={() => handleExit('juegos')}
              className="btn-back-to-dashboard"
              title="Volver a juegos"
            >
              ← Juegos
            </button>
            <button 
              onClick={() => handleExit('niveles')}
              className="btn-back-to-levels"
              title="Volver a niveles"
            >
              ← Niveles
            </button>
          </div>
          
          <div className="game-status">
            <div className="status-item" style={{ padding: '2px' }}>
              <SoundToggle />
              </div>
              <div className="status-item">
              <div className="status-icon">🏆</div>
              <div className="status-label">Nivel</div>
              <div className="status-value">{getLevelNumber(level)}</div>
            </div>
            <div className="status-item">
              <div className="status-icon">📝</div>
              <div className="status-label">Actividad</div>
              <div className="status-value">{currentQuestionIndex + 1}/{questions.length}</div>
            </div>
            <div className="status-item">
              <div className="status-icon">⭐</div>
              <div className="status-label">Puntos</div>
              <div className="status-value">{score}</div>
            </div>
            <div className="status-item">
              <div className="status-icon">🎯</div>
              <div className="status-label">Intentos</div>
              <div className="status-value">{attempts}</div>
            </div>
          </div>
        </div>
        
        <h1 className="game-title">
          🧮 {getOperationName(operation)} - {getLevelName(level)}
        </h1>
        <p className="game-instruction">
          Resuelve la operación y escribe el resultado
        </p>
      </header>

      <div className="calculos-game-play-area">

        {/* Sección de respuesta */}
        <div className="answer-card">
          <div className="answer-section">
            <div className="calculation-display">
              <span className="question-text">{currentQuestion.pregunta.replace(' =', '')}</span>
            </div>
              <MultiplicationVisual multiplicationVisual={currentQuestion?.soporteVisual} />
          <div className="equals-display">
            <span className="equals-sign">=</span>
          </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userAnswer}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setUserAnswer(value);
              }}
              onKeyPress={handleKeyPress}
              disabled={isAnswerSubmitted}
              className="answer-input-styled"
              placeholder="Tu respuesta"
            />
          </div>

          <div className="calculos-button-group">
            <button
              onClick={handleSubmitAnswer}
              disabled={userAnswer.trim() === '' || isAnswerSubmitted}
              className="btn-verify"
              title="Verificar respuesta"
            >
              {isAnswerSubmitted ? '⏳ Enviado' : '✓ Verificar'}
            </button>
            
            <button
              onClick={() => setUserAnswer('')}
              className="btn-clear"
              title="Limpiar respuesta"
              disabled={isAnswerSubmitted}
            >
              ↺ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Pista permanente */}
      <div className="permanent-hint">
        <div className="permanent-hint-header">
          <span className="hint-icon">💡</span>
          <h4>Ayuda</h4>
        </div>
        <div className="permanent-hint-content">
          <p className="hint-text">
            Presiona Enter para enviar tu respuesta rápidamente
          </p>
        </div>
      </div>
      </div>
    
      {showExitModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content congrats-model" style={{ maxWidth: '420px'}}>
            <h2 className="modal-title" style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '15px' }}>
              ¿Seguro quieres volver a los {pendingTarget === 'juegos' ? 'juegos' : 'niveles'}?
            </h2>
            <div className="modal-stats" style={{ marginBottom: '25px'}}>
              <p className="performance-message" style={{ color: '#fb703', fontSize: '1.3rem', fontWeight: 'bold' }}>
                Perderás todos tus puntos
              </p>
            </div>
            <div className="modal-buttons" style={{ display: 'flex', gap: '15px', flexDirection: 'row' }}>
              <button 
                onClick={handleConfirmExit}
                className="modal-btn"
                style={{
                  backgroundColor: '#ebeaf1',
                  color: 'black', 
                  border: '2px solid #333',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  flex: 1,
                  boxShadow: '0 3px 0 #222'
                }}
                >
                Sí
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="modal-btn"
                style={{
                  backgroundColor: '#ebeaf1',
                  color: 'black',
                  border: '2px solid #333',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  flex: 1,
                  boxShadow: '0 3px 0 #222'
                }}
                >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showWinModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content congrats-modal">

            <div className="modal-icon success-icon">
              <span className="icon-emoji">🎉</span>
            </div>

            <h2 className="modal-title success-title">
              ¡FELICITACIONES!
            </h2>

            <div className="modal-stats">
              <p className="completion-message" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>
                Has completado todos los niveles
              </p>

              <div style={{ marginTop: '24px 0', padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <span className="stats-label" style={{ display: '1.block', fontSize: '1.1rem', color: '#aaa' }}>
                  Puntos
                </span>
                <span className="stats-value" style={{ fontSize: '2.5 rem', fontWeight: '900', color: '#ffb703' }}>
                  {score} puntos
                </span>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => {
                  const finalScore = score;
                  const isWin = correctAnswers >= Math.ceil(questions.length * 0.6);

                  if(onActivityComplete) {
                    onActivityComplete(currentQuestionIndex, attempts, 1, 1, true);
                  }
                  onGameComplete(isWin, finalScore, correctAnswers, questions.length, totalAttempts);

                  navigate('/alumno/juegos');
                }}
                className="modal-btn"
                style={{
                  backgroundColor: '#4A7856',
                  color: 'white',
                  border: '2px solid #333',
                  borderRadius: '15px',
                  padding: '14px 24px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #222',
                  width: '100%',
                }}
              >
                🎮 Volver a Juegos
              </button>
            </div>

          </div>
        </div>
      )}
      {showFeedback && (
          <FeedbackModal 
              isCorrect={feedbackData.isCorrect}
              message={feedbackData.message}
              pointsEarned={feedbackData.pointsEarned}
              onContinue={handleFeedbackContinue}
          />
      )}
    </div>
  );
}

export default GameScreen;