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
        if (getMaxUnlockedLevel('escritura') > assignedLevel) return true;
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            const p = JSON.parse(atob(token.split('.')[1]));
            const sid = p?.id || p?.userId;
            return sid ? !!localStorage.getItem(`recursero_escritura_done_${sid}_${assignedLevel}`) : false;
        } catch(e) { return false; }
    })();

    if (isCompleted) {
        return (
            <div className="level-select-screen">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button className="btn-back-to-levels" onClick={() => navigate('/alumno/juegos')}>← Juegos</button>
                    </div>
                </div>
                <div className="level-select-content">
                    <h1 className="level-select-title">✏️ Números en Letras ✏️</h1>
                    <div style={COMPLETED_CARD_STYLE}>
                        <span style={{fontSize:'64px'}}>🏆</span>
                        <h2 style={{fontSize:'1.5rem',fontWeight:700,color:'#065f46',margin:0}}>¡Ya completaste este nivel!</h2>
                        <p style={{fontSize:'1rem',color:'#047857',margin:0}}>Aguarda a que tu docente te asigne un nuevo nivel para continuar.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!levels || levels.length === 0) {
        return (
            <div className="level-select-screen">
                <div className="level-select-content">
                    <p>No hay niveles disponibles</p>
                </div>
            </div>
        );
    }

    const visibleLevels = assignedLevel != null
        ? levels.filter((_, i) => i + 1 === assignedLevel)
        : levels;

    return (
        <div className="level-select-screen">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button
                            className="btn-back-to-levels"
                            onClick={() => navigate('/alumno/juegos')}
                            title="Volver a juegos"
                        >
                            ← Juegos
                        </button>
                    </div>
                </div>

                <div className="level-select-content">
                    <h1 className="level-select-title">Elige un nivel</h1>
                    <p className="level-select-subtitle">Selecciona la dificultad que prefieras</p>

                    <div className="level-grid">
                        {visibleLevels.map((level, index) => {
                            const levelNumber = assignedLevel != null ? assignedLevel : index + 1;
                            const isUnlocked = assignedLevel != null ? true : isLevelUnlocked('escritura', levelNumber);
                            const isLocked = !isUnlocked;
                            const range = level.range || `${level.min} - ${level.max}`;

                            return (
                                <button
                                    key={levelNumber}
                                    onClick={() => isUnlocked && onSelectLevel(levelNumber)}
                                    className={`level-btn level-${levelNumber} ${isLocked ? 'locked' : ''}`}
                                    disabled={isLocked}
                                >
                                    <div className="level-header">
                                        <div className="level-number">
                                            {isLocked ? '🔒' : '📝'} Nivel {levelNumber}
                                        </div>
                                        <div className="level-difficulty">{level.difficulty || level.name || 'Nivel'}</div>
                                    </div>
                                    <div className="level-info">
                                        <div className="level-range">Números {range}</div>
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
    );
};

export default LevelSelectScreen;