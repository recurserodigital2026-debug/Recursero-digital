import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProgress } from '../../../hooks/useUserProgress';

const COMPLETED_CARD_STYLE = {
    display:'flex', flexDirection:'column', alignItems:'center', gap:'16px',
    padding:'40px 24px', background:'linear-gradient(135deg,#d1fae5,#a7f3d0)',
    borderRadius:'20px', border:'2px solid #34d399', maxWidth:'480px',
    margin:'0 auto', textAlign:'center'
};

const LevelSelectScreen = ({ levels, onSelectLevel, assignedLevel }) => {
    const navigate = useNavigate();
    const { isLevelUnlocked, getMaxUnlockedLevel } = useUserProgress();

    const isCompleted = (() => {
        if (assignedLevel == null) return false;
        if (getMaxUnlockedLevel('escala') > assignedLevel) return true;
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            const p = JSON.parse(atob(token.split('.')[1]));
            const sid = p?.id || p?.userId;
            return sid ? !!localStorage.getItem(`recursero_escala_done_${sid}_${assignedLevel}`) : false;
        } catch(e) { return false; }
    })();

    if (isCompleted) {
        return (
            <div className="game-container">
                <div className="level-select-screen">
                    <div className="header-controls">
                        <div className="buttons-group">
                            <button className="btn-back-to-dashboard" onClick={() => navigate('/alumno/juegos')}>← Juegos</button>
                        </div>
                    </div>
                    <div className="level-select-content">
                        <h1 className="level-select-title">🔢 Anterior y Posterior</h1>
                        <div style={COMPLETED_CARD_STYLE}>
                            <span style={{fontSize:'64px'}}>🏆</span>
                            <h2 style={{fontSize:'1.5rem',fontWeight:700,color:'#065f46',margin:0}}>¡Ya completaste este nivel!</h2>
                            <p style={{fontSize:'1rem',color:'#047857',margin:0}}>Aguarda a que tu docente te asigne un nuevo nivel para continuar.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const levelIcons = ['🔍', '📈', '🎯'];

    const visibleLevels = assignedLevel != null
        ? levels.filter((_, i) => i + 1 === assignedLevel)
        : levels;

    return (
        <div className="game-container">
            <div className="level-select-screen">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button
                            className="btn-back-to-dashboard"
                            onClick={() => navigate('/alumno/juegos')}
                            title="Volver a juegos"
                        >
                            ← Juegos
                        </button>
                    </div>
                </div>

                <div className="level-select-content">
                    <h1 className="level-select-title">⚡ Elige tu Aventura ⚡</h1>
                    <p className="level-select-subtitle">Selecciona el nivel de dificultad</p>

                    <div className="level-grid">
                        {visibleLevels.map((level, i) => {
                            const originalIndex = assignedLevel != null ? assignedLevel - 1 : i;
                            const levelNumber = originalIndex + 1;
                            const isUnlocked = assignedLevel != null ? true : isLevelUnlocked('escala', levelNumber);
                            const isLocked = !isUnlocked;

                            return (
                                <button
                                    key={originalIndex}
                                    className={`level-btn level-${levelNumber} ${isLocked ? 'locked' : ''}`}
                                    onClick={() => isUnlocked && onSelectLevel(originalIndex)}
                                    disabled={isLocked}
                                >
                                    <div className="level-header">
                                        <div className="level-number">
                                            {isLocked ? '🔒' : levelIcons[originalIndex]} Nivel {levelNumber}
                                        </div>
                                        <div className="level-difficulty">{level.name}</div>
                                    </div>
                                    <div className="level-info">
                                        <div className="level-range">Números del {level.range}</div>
                                        <div className="level-operation">
                                            Operación: {level.operation > 1 ? `±${level.operation}` : '±1'}
                                        </div>
                                        {isLocked && (
                                            <div className="locked-message">
                                                Completa el nivel {levelNumber - 1} primero
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelSelectScreen;