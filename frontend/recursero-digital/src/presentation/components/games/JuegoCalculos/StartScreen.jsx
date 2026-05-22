import React from 'react';
import { operationConfig, getLevelCountForOperation } from './utils';

const StartScreen = ({ onStartGame, onBackToGames }) => {
  return (
    <div className="game-container">
      <div className="start-screen">
        <div className="header-controls">
          <div className="buttons-group">
            <button 
              onClick={onBackToGames}
              className="btn-back-to-levels"
              title="Volver a juegos"
            >
              ← Juegos
            </button>
          </div>
        </div>

        <div className="start-content">
          <h1>🧮 Juego de Cálculos 🧮</h1>
          <p>Elige una operación y resuélvelas!</p>

          <div className="operation-selection">
            {Object.entries(operationConfig).map(([key, config]) => (
              <button 
                key={key}
                className={`operation-card ${config.textColor.replace('text-', '')}`}
                onClick={() => onStartGame(key)}
              >
                <div className="operation-icon">
                  {config.icon}
                </div>
                <div className="operation-title">
                  {config.name}
                </div>
                <div className="operation-description">
                  {key === 'suma' && 'Operaciones básicas hasta números grandes'}
                  {key === 'resta' && 'Ejercicios progresivos y desafiantes'}
                  {key === 'multiplicacion' && 'Completa resultados y factores'}
                </div>
                <div className="operation-levels">
                  {getLevelCountForOperation(key)} niveles de dificultad
                </div>
              </button>
            ))}
          </div>

          <div className="start-features">
            <div className="feature-item">
              <span className="feature-icon">1️⃣</span>
              <span className="feature-text">Elige Operación</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">2️⃣</span>
              <span className="feature-text">Escoge Nivel</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">3️⃣</span>
              <span className="feature-text">¡Calcula!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;