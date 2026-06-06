import React, { useState, useEffect } from 'react';
import {
  getStudentGameAssignments,
  assignGameToStudent,
  removeGameFromStudent,
  updateStudentGame,
  getCourseGames,
  getAllGamesWithLevels,
} from '../../../infrastructure/adapters/api/teacherApi';

const StudentGameAssignModal = ({ student, courseId, onClose }) => {
  const [courseGames, setCourseGames] = useState([]);
  const [gameLevelsMap, setGameLevelsMap] = useState({});
  const [originalAssignments, setOriginalAssignments] = useState({});
  const [pendingAssignments, setPendingAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gamesRes, assignRes, levelsRes] = await Promise.all([
          getCourseGames(courseId),
          getStudentGameAssignments(student.id),
          getAllGamesWithLevels(),
        ]);

        const games = (gamesRes.courseGames || gamesRes.games || [])
          .filter(cg => cg.game)
          .map(cg => cg.game);
        setCourseGames(games);

        const levelsMap = {};
        for (const g of levelsRes.games || []) {
          levelsMap[g.gameId] = (g.levels || []).filter(l => l.isActive);
        }
        setGameLevelsMap(levelsMap);

        const map = {};
        for (const a of assignRes.assignments || []) {
          map[a.gameId] = { level: a.level, isEnabled: a.isEnabled };
        }
        setOriginalAssignments(map);
        setPendingAssignments(map);
      } catch (e) {
        setFeedback({ type: 'error', msg: e.message || 'Error al cargar datos' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [student.id, courseId]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggle = (gameId) => {
    setPendingAssignments(prev => {
      if (prev[gameId]) {
        const next = { ...prev };
        delete next[gameId];
        return next;
      }
      const firstLevel = (gameLevelsMap[gameId]?.[0]?.level) ?? 1;
      return { ...prev, [gameId]: { level: firstLevel, isEnabled: true } };
    });
  };

  const handleLevelChange = (gameId, newLevel) => {
    setPendingAssignments(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], level: Number(newLevel) },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const allGameIds = new Set([
        ...Object.keys(originalAssignments),
        ...Object.keys(pendingAssignments),
      ]);

      for (const gameId of allGameIds) {
        const orig = originalAssignments[gameId];
        const pend = pendingAssignments[gameId];

        if (!orig && pend) {
          await assignGameToStudent(student.id, gameId, pend.level);
        } else if (orig && !pend) {
          await removeGameFromStudent(student.id, gameId);
        } else if (orig && pend && (orig.level !== pend.level || orig.isEnabled !== pend.isEnabled)) {
          await updateStudentGame(student.id, gameId, pend.level, pend.isEnabled);
        }
      }

      setOriginalAssignments({ ...pendingAssignments });
      showFeedback('success', 'Cambios guardados correctamente');
    } catch (e) {
      showFeedback('error', e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const hasPendingChanges = JSON.stringify(originalAssignments) !== JSON.stringify(pendingAssignments);

  return (
    <div className="ts-modal-overlay" onClick={onClose}>
      <div className="ts-modal ts-modal--wide sgam-modal" onClick={e => e.stopPropagation()}>
        <div className="ts-modal-header">
          <h3>Juegos de {student.name} {student.lastname}</h3>
          <button className="ts-modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="sgam-subtitle">
          Activá los juegos y elegí el nivel. Los cambios se aplican al hacer click en Guardar.
        </p>

        {feedback && (
          <div className={`sgam-toast sgam-toast--${feedback.type}`}>{feedback.msg}</div>
        )}

        {loading ? (
          <p className="ts-loading">Cargando juegos...</p>
        ) : courseGames.length === 0 ? (
          <p className="ts-empty">No hay juegos disponibles en el curso.</p>
        ) : (
          <div className="sgam-list">
            {courseGames.map(game => {
              const assigned = pendingAssignments[game.id];
              const gameLevels = gameLevelsMap[game.id] || [];
              const assignedLevelInfo = gameLevels.find(l => l.level === assigned?.level);
              const levelInList = !!assignedLevelInfo;
              const selectOptions = (assigned && !levelInList)
                ? [{ level: assigned.level, name: `Nivel ${assigned.level}` }, ...gameLevels]
                : gameLevels;

              return (
                <div key={game.id} className={`sgam-row ${assigned ? 'sgam-row--active' : ''}`}>
                  <div className="sgam-info">
                    <span className="sgam-name">{game.name}</span>
                    {assigned && (
                      <span className="sgam-level-badge">
                        {assignedLevelInfo ? assignedLevelInfo.name : `Nivel ${assigned.level}`}
                      </span>
                    )}
                  </div>

                  <div className="sgam-controls">
                    {assigned && (
                      <select
                        className="sgam-select"
                        value={assigned.level}
                        disabled={saving}
                        onChange={e => handleLevelChange(game.id, e.target.value)}
                      >
                        {selectOptions.map(l => (
                          <option key={l.level} value={l.level}>{l.name}</option>
                        ))}
                      </select>
                    )}

                    <button
                      className={`sgam-toggle ${assigned ? 'sgam-toggle--on' : 'sgam-toggle--off'}`}
                      disabled={saving}
                      onClick={() => handleToggle(game.id)}
                    >
                      {assigned ? 'Desasignar' : 'Asignar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="sgam-footer">
          <button className="ts-btn-cancel" onClick={onClose} disabled={saving}>
            Cerrar
          </button>
          <button
            className="sgam-btn-save"
            onClick={handleSave}
            disabled={saving || !hasPendingChanges || loading}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentGameAssignModal;
