import React from 'react';
import { useUserProgress } from '../../../hooks/useUserProgress';
import { getOrderConfig, formatNumber } from './utils';

const COMPLETED_CARD_STYLE = {
    display:'flex', flexDirection:'column', alignItems:'center', gap:'16px',
    padding:'40px 24px', background:'linear-gradient(135deg,#d1fae5,#a7f3d0)',
    borderRadius:'20px', border:'2px solid #34d399', maxWidth:'480px',
    margin:'0 auto', textAlign:'center'
};

const LevelSelectScreen = ({ order, onSelectLevel, onBackToStart, backendLevels = [], assignedLevel }) => {
    const { isLevelUnlocked, getMaxUnlockedLevel } = useUserProgress();
    const orderInfo = getOrderConfig(order);

    const isCompleted = (() => {
        if (assignedLevel == null) return false;
        if (getMaxUnlockedLevel('ordenamiento') > assignedLevel) return true;
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            const p = JSON.parse(atob(token.split('.')[1]));
            const sid = p?.id || p?.userId;
            return sid ? !!localStorage.getItem(`recursero_ordenamiento_done_${sid}_${assignedLevel}`) : false;
        } catch(e) { return false; }
    })();

    const formatRange = (min, max) => {
        return `${formatNumber(min)} - ${formatNumber(max)}`;
    };

    const allLevels = backendLevels.map((level) => ({
        number: level.level,
        name: level.name,
        range: formatRange(level.config.min, level.config.max),
        difficulty: level.difficulty,
        color: `level-${level.level}`,
        min: level.config.min,
        max: level.config.max
    }));

    const visibleLevels = assignedLevel != null
        ? allLevels.filter(l => l.number === assignedLevel)
        : allLevels;

    return (
        <div className="level-select-screen">
                <div className="header-controls">
                    <div className="buttons-group">
                        <button
                            className="btn-back-to-levels"
                            onClick={onBackToStart}
                            title="Volver a selección de orden"
                        >
                            ← Orden
                        </button>
                    </div>
                </div>
                <div className="level-select-content">
                    <h1 className="level-select-title">{orderInfo.icon} {orderInfo.name}</h1>
                    <p className="level-select-subtitle">{orderInfo.description}</p>
                    <div className="level-grid">
                        {visibleLevels.map(level => {
                    const isUnlocked = assignedLevel != null ? true : isLevelUnlocked('ordenamiento', level.number);
                    const isLocked = !isUnlocked;

                    return (
                        <button
                            key={level.number}
                            className={`level-btn ${level.color} ${isLocked ? 'locked' : ''}`}
                            onClick={() => isUnlocked && onSelectLevel(level.number)}
                            disabled={isLocked}
                        >
                            <div className="level-number">
                                {isLocked ? '🔒' : ''} {level.name}
                            </div>
                            <div className="level-range">{level.range}</div>
                            <div className="level-difficulty">{level.difficulty}</div>
                            {isLocked && (
                                <div className="locked-message">
                                    Completa el nivel {level.number - 1} para desbloquear
                                </div>
                            )}
                        </button>
                    );
                })}
                </div>
            </div>
        </div>
    );
};export default LevelSelectScreen;
