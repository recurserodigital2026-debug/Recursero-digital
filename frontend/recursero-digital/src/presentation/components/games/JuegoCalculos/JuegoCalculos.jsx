import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../../../styles/globals/games.css";
import "./JuegoCalculos.css";
import Spinner from '../../shared/Spinner';

import StartScreen from './StartScreen';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';
import CongratsModal from './CongratsModal';
import { useUserProgress } from '../../../hooks/useUserProgress';
import useGameScoring from '../../../hooks/useGameScoring';
import { useGameLevels } from '../../../../hooks/useGameLevels';
import { GAME_IDS, PROGRESS_KEYS } from '../../../../constants/games';
import { getBackendLevel, getLevelCountForOperation, getOperationForDbLevel } from './utils';

const JuegoCalculos = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const storedLevel = sessionStorage.getItem('assignedLevel:/alumno/juegos/calculos');
  const assignedLevel = storedLevel != null ? Number(storedLevel) : null;
  const storedLevels = sessionStorage.getItem('assignedLevels:/alumno/juegos/calculos');
const assignedLevels = useMemo(() => {
    return storedLevels
      ? JSON.parse(storedLevels)
      : (assignedLevel != null ? [assignedLevel] : null);
  }, [storedLevels, assignedLevel]);

  const assignedOperations = useMemo(() => {
    return assignedLevels
      ? new Set(assignedLevels.map(l => getOperationForDbLevel(l)).filter(Boolean))
      : null;
  }, [assignedLevels]);
  const { unlockLevel } = useUserProgress();
  const {
    incrementAttempts,
    resetScoring,
    completeActivity,
    addPoints,
    startActivityTimer,
    playError
  } = useGameScoring();

  // Game state management
  const [gameState, setGameState] = useState('start'); // 'start', 'levelSelect', 'playing', 'gameComplete'
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [assignedLevelCompleted, setAssignedLevelCompleted] = useState(false);
  const [gameResults, setGameResults] = useState({
    isWin: false,
    finalScore: 0,
    lives: 0,
    correctAnswers: 0,
    totalQuestions: 0
  });

  const { levels: allLevels, loading: levelsLoading } = useGameLevels(GAME_IDS.CALCULOS, false, courseId);

  useEffect(() => {
    if (!courseId) {
      navigate('/alumno/juegos', { replace: true });
    }
  }, [courseId, navigate]);

  const handleBackToGames = useCallback(() => {
    navigate('/alumno/juegos', { replace: true });
  }, [navigate]);

  const handleStartGame = useCallback((operation) => {
    setSelectedOperation(operation);
    setAssignedLevelCompleted(false);
    setGameState('levelSelect');
  }, []);

  const handleSelectLevel = useCallback((level) => {
    setSelectedLevel(level);
    setGameState('playing');
    resetScoring();
    startActivityTimer();
  }, [resetScoring, startActivityTimer]);

  const handleActivityComplete = useCallback((activityIndex, attempts, correctAnswers, totalQuestions, isLastActivity = false) => {
    const levelNumber = parseInt(selectedLevel.replace('nivel', ''));
    const backendLevel = getBackendLevel(selectedOperation, levelNumber);
    const backendLevelIndex = backendLevel - 1;

    let maxUnlockedLevel = backendLevel;
    if (isLastActivity && levelNumber < getLevelCountForOperation(selectedOperation)) {
      maxUnlockedLevel = getBackendLevel(selectedOperation, levelNumber + 1);
    }
    
    completeActivity(
      backendLevelIndex,  
      GAME_IDS.CALCULOS,                
      activityIndex,                 
      maxUnlockedLevel,
      {
        correctAnswers,
        totalQuestions,
        attempts: attempts
      }
    );

  }, [selectedLevel, selectedOperation, completeActivity]);

  const handleBackToStart = useCallback(() => {
    setSelectedOperation(null);
    setSelectedLevel(null);
    setAssignedLevelCompleted(false);
    setGameState('start');
  }, []);

  const handleBackToLevelSelect = useCallback(() => {
    setSelectedLevel(null);
    setGameState('levelSelect');
  }, []);

  const handleGameComplete = useCallback((isWin, finalScore, correctAnswers, totalQuestions, totalAttempts) => {
    setGameResults({
      isWin,
      finalScore,
      lives: 0, // No lives system
      correctAnswers,
      totalQuestions,
      totalAttempts
    });

    const levelNumber = parseInt(selectedLevel.replace('nivel', ''));

    if (isWin && levelNumber < getLevelCountForOperation(selectedOperation)) {
      const gameId = `calculos-${selectedOperation}`;
      unlockLevel(gameId, levelNumber + 1);
    }

    if (isWin && assignedLevels !== null) {
      const completedDbLevel = getBackendLevel(selectedOperation, levelNumber);
      if (assignedLevels.includes(completedDbLevel)) {
        setAssignedLevelCompleted(true);
        try {
          const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
          const studentId = payload?.id || payload?.userId;
          if (studentId) {
            localStorage.setItem(
              `recursero_calculos_done_${studentId}_${selectedOperation}_${levelNumber}`,
              '1'
            );
          }
        } catch  (error) {
        console.warn("No se pudo guardar el progreso en localStorage", error);
      }
      }
    }

    setGameState('gameComplete');
}, [selectedLevel, selectedOperation, unlockLevel, assignedLevels]); 

  const handleUpdateScore = useCallback((points) => {
    addPoints(points);
  }, [addPoints]);

  const handleUpdateAttempts = useCallback(() => {
    incrementAttempts();
    playError();
  }, [incrementAttempts, playError]);

  if (levelsLoading) {
    return (
      <div className="game-wrapper bg-space-gradient">
        <Spinner label="Cargando niveles..." />
      </div>
    );
  }

  const renderCurrentScreen = () => {
    switch(gameState) {
      case 'start':
        return (
          <StartScreen
            onStartGame={handleStartGame}
            onBackToGames={handleBackToGames}
            assignedOperations={assignedOperations}
          />
        );

      case 'levelSelect':
        return (
          <LevelSelectScreen
            operation={selectedOperation}
            onSelectLevel={handleSelectLevel}
            onBackToStart={handleBackToStart}
            assignedLevels={assignedLevels}
            assignedLevelCompleted={assignedLevelCompleted}
          />
        );

      case 'playing':
        return (
          <GameScreen 
            operation={selectedOperation}
            level={selectedLevel}
            allLevels={allLevels}
            onGameComplete={handleGameComplete}
            onBackToLevelSelect={handleBackToLevelSelect}
            onUpdateScore={handleUpdateScore}
            onUpdateAttempts={handleUpdateAttempts}
            onActivityComplete={handleActivityComplete}
            onStartActivityTimer={startActivityTimer}
          />
        );

      case 'gameComplete':
        return (
          <>
            {/* Keep the previous screen visible behind the modal */}
            <GameScreen 
              operation={selectedOperation}
              level={selectedLevel}
              allLevels={allLevels}
              onGameComplete={handleGameComplete}
              onBackToLevelSelect={handleBackToLevelSelect}
              onUpdateScore={handleUpdateScore}
              onUpdateAttempts={handleUpdateAttempts}
            />
            <CongratsModal
              isVisible={true}
              isWin={gameResults.isWin}
              operation={selectedOperation}
              level={selectedLevel}
              finalScore={gameResults.finalScore}
              totalQuestions={gameResults.totalQuestions}
              correctAnswers={gameResults.correctAnswers}
              totalAttempts={gameResults.totalAttempts}
              onBackToGames={handleBackToGames}
            />
          </>
        );

      default:
        return (
          <StartScreen 
            onStartGame={handleStartGame}
            onBackToGames={handleBackToGames}
          />
        );
    }
  };

  return (
    <div className="game-wrapper bg-space-gradient">
      {renderCurrentScreen()}
    </div>
  );
};

export default JuegoCalculos;