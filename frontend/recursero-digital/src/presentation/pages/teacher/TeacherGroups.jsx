import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getGruposByCourse,
  createGrupo,
  deleteGrupo,
  getGrupoStudents,
  assignStudentToGrupo,
  removeStudentFromGrupo,
  getGrupoGames,
  assignGameToGrupo,
  removeGameFromGrupo,
  updateGrupoGame,
  getCourseStudents,
  getAllGamesWithLevels,
} from '../../../infrastructure/adapters/api/teacherApi';
import '../../styles/pages/teacherGroups.css';

export default function TeacherGroups() {
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tab, setTab] = useState('students');
  const [groupStudents, setGroupStudents] = useState([]);
  const [groupGames, setGroupGames] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [courseStudents, setCourseStudents] = useState([]);
  const [addStudentSearch, setAddStudentSearch] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [courseGames, setCourseGames] = useState([]);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [pendingGames, setPendingGames] = useState({});
  const [originalGames, setOriginalGames] = useState({});
  const [savingGames, setSavingGames] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cursoSeleccionado');
    if (!saved) { navigate('/docente'); return; }
    try {
      const curso = JSON.parse(saved);
      setCourseId(curso.id.toString());
    } catch { navigate('/docente'); }
  }, [navigate]);

  const loadGrupos = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await getGruposByCourse(courseId);
      setGrupos(res.grupos || []);
    } catch (e) {
      showFeedbackMsg('error', e.message || 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadGrupos(); }, [loadGrupos]);

  const showFeedbackMsg = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setTab('students');
    await loadGroupDetail(group.id);
  };

  const loadGroupDetail = async (groupId) => {
    try {
      const [studentsRes, gamesRes] = await Promise.all([
        getGrupoStudents(groupId),
        getGrupoGames(groupId),
      ]);
      setGroupStudents(studentsRes.students || []);
      setGroupGames(gamesRes.games || []);
    } catch (e) {
      showFeedbackMsg('error', 'Error al cargar detalle del grupo');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      await createGrupo(newGroupName.trim(), courseId);
      setNewGroupName('');
      setShowCreateModal(false);
      showFeedbackMsg('success', 'Grupo creado exitosamente');
      await loadGrupos();
    } catch (e) {
      showFeedbackMsg('error', e.message || 'Error al crear grupo');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirmDelete) return;
    try {
      await deleteGrupo(confirmDelete.id);
      setConfirmDelete(null);
      if (selectedGroup?.id === confirmDelete.id) setSelectedGroup(null);
      showFeedbackMsg('success', 'Grupo eliminado');
      await loadGrupos();
    } catch (e) {
      showFeedbackMsg('error', e.message || 'Error al eliminar grupo');
      setConfirmDelete(null);
    }
  };

  const handleOpenAddStudent = async () => {
    setShowAddStudentModal(true);
    setAddStudentSearch('');
    setLoadingModal(true);
    try {
      const res = await getCourseStudents(courseId);
      setCourseStudents(res.students || []);
    } catch (e) {
      showFeedbackMsg('error', 'Error al cargar alumnos del curso');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleAddStudent = async (studentId) => {
    try {
      await assignStudentToGrupo(selectedGroup.id, studentId);
      showFeedbackMsg('success', 'Alumno agregado al grupo');
      await loadGroupDetail(selectedGroup.id);
    } catch (e) {
      showFeedbackMsg('error', e.message || 'Error al agregar alumno');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudentFromGrupo(selectedGroup.id, studentId);
      showFeedbackMsg('success', 'Alumno removido del grupo');
      await loadGroupDetail(selectedGroup.id);
    } catch (e) {
      showFeedbackMsg('error', e.message || 'Error al remover alumno');
    }
  };

  const handleOpenGamesModal = async () => {
    6
    setLoadingModal(true);
    setShowGamesModal(true);
    try {
      const res = await getAllGamesWithLevels();
      setCourseGames((res.games || []).map(g => ({
        ...g,
        levels: (g.levels || []).filter(l => l.isActive)
      })));
      const map = {};
      for (const gj of groupGames) {
        map[gj.gameId] = { levels: gj.levels?.length ? gj.levels : [gj.level], isEnabled: gj.isEnabled };
      }
      setOriginalGames(map);
      setPendingGames(map);
    } catch (e) {
      showFeedbackMsg('error', 'Error al cargar juegos');
    } finally {
      setLoadingModal(false);
    }
  };

  const handleToggleGame = (gameId) => {
    setPendingGames(prev => {
      if (prev[gameId]) {
        const next = { ...prev };
        delete next[gameId];
        return next;
      }
      const firstLevel = courseGames.find(g => g.gameId === gameId)?.levels?.[0]?.level ?? 1;
      return { ...prev, [gameId]: { levels: [firstLevel], isEnabled: true } };
    });
  };

  const handleGameLevelToggle = (gameId, level) => {
    setPendingGames(prev => {
      const current = prev[gameId];
      if (!current) return prev;
      const already = current.levels.includes(level);
      const newLevels = already
        ? current.levels.filter(l => l !== level)
        : [...current.levels, level].sort((a, b) => a - b);
      if (newLevels.length === 0) return prev;
      return { ...prev, [gameId]: { ...current, levels: newLevels } };
    });
  };

  const handleSaveGames = async () => {
    setSavingGames(true);
    try {
      const allIds = new Set([...Object.keys(originalGames), ...Object.keys(pendingGames)]);
      for (const gameId of allIds) {
        const orig = originalGames[gameId];
        const pend = pendingGames[gameId];
        if (!orig && pend) {
          await assignGameToGrupo(selectedGroup.id, gameId, pend.levels);
        } else if (orig && !pend) {
          await removeGameFromGrupo(selectedGroup.id, gameId);
        } else if (orig && pend && (
          JSON.stringify(orig.levels) !== JSON.stringify(pend.levels) || orig.isEnabled !== pend.isEnabled
        )) {
          await updateGrupoGame(selectedGroup.id, gameId, pend.levels, pend.isEnabled);
        }
      }
      setOriginalGames({ ...pendingGames });
      showFeedbackMsg('success', 'Juegos guardados correctamente');
      await loadGroupDetail(selectedGroup.id);
      setShowGamesModal(false);
    } catch (e) {
      showFeedbackMsg('error', e.message || 'Error al guardar juegos');
    } finally {
      setSavingGames(false);
    }
  };

  const enrolledInGroup = new Set(groupStudents.map(s => s.id));
  const filteredCourseStudents = courseStudents.filter(s => {
    if (s.group && !enrolledInGroup.has(s.id)) return false;
    const name = `${s.name} ${s.lastName || s.lastname || ''}`.toLowerCase();
    return name.includes(addStudentSearch.toLowerCase());
  });
  const hasPendingGameChanges = JSON.stringify(originalGames) !== JSON.stringify(pendingGames);

  if (loading) {
    return <div className="tg-page"><div className="tg-loading">Cargando grupos...</div></div>;
  }

  return (
    <div className="tg-page">
      {feedback && (
        <div className={`tg-toast tg-toast--${feedback.type}`}>{feedback.msg}</div>
      )}

      {!selectedGroup ? (
        <div className="tg-container">
          <div className="tg-header">
            <h1>Grupos</h1>
            <button className="tg-btn-primary" onClick={() => setShowCreateModal(true)}>
              + Nuevo Grupo
            </button>
          </div>

          {grupos.length === 0 ? (
            <div className="tg-empty">No hay grupos creados todavía.</div>
          ) : (
            <div className="tg-groups-grid">
              {grupos.map(g => (
                <div key={g.id} className="tg-group-card" onClick={() => handleSelectGroup(g)}>
                  <div className="tg-group-icon">👥</div>
                  <div className="tg-group-info">
                    <h3>{g.name}</h3>
                    <div className="tg-group-stats">
                      <span>{g.studentCount} alumnos</span>
                      <span>{g.gameCount} juegos</span>
                    </div>
                  </div>
                  <button
                    className="tg-btn-danger-sm"
                    onClick={e => { e.stopPropagation(); setConfirmDelete(g); }}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="tg-container">
          <div className="tg-detail-header">
            <button className="back-btn" onClick={() => setSelectedGroup(null)}>← Volver</button>
            <h2>{selectedGroup.name}</h2>
          </div>

          <div className="tg-tabs">
            <button className={`tg-tab ${tab === 'students' ? 'tg-tab--active' : ''}`} onClick={() => setTab('students')}>
              👨‍🎓 Alumnos ({groupStudents.length})
            </button>
            <button className={`tg-tab ${tab === 'games' ? 'tg-tab--active' : ''}`} onClick={() => setTab('games')}>
              🎮 Juegos ({groupGames.length})
            </button>
          </div>

          {tab === 'students' && (
            <div className="tg-tab-content">
              <div className="tg-tab-toolbar">
                <button className="tg-btn-primary" onClick={handleOpenAddStudent}>
                  + Agregar Alumno
                </button>
              </div>
              {groupStudents.length === 0 ? (
                <div className="tg-empty">Este grupo no tiene alumnos.</div>
              ) : (
                <div className="tg-students-list">
                  {groupStudents.map(s => (
                    <div key={s.id} className="tg-student-row">
                      <span className="tg-avatar">{s.name[0]}{(s.lastName || s.lastname || '?')[0]}</span>
                      <span className="tg-name">{s.name} {s.lastName || s.lastname}</span>
                      <button className="tg-btn-remove" onClick={() => handleRemoveStudent(s.id)}>
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'games' && (
            <div className="tg-tab-content">
              <div className="tg-tab-toolbar">
                <button className="tg-btn-primary" onClick={handleOpenGamesModal}>
                  Configurar Juegos
                </button>
              </div>
              {groupGames.length === 0 ? (
                <div className="tg-empty">No hay juegos asignados a este grupo.</div>
              ) : (
                <div className="tg-games-list">
                  {groupGames.map(gj => (
                    <div key={gj.id} className="tg-game-row">
                      <span className="tg-game-name">{gj.game?.name || gj.gameId}</span>
                      <span className="tg-level-badge">
                        {(gj.levels?.length ? gj.levels : [gj.level]).map(l => `Niv. ${l}`).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal crear grupo */}
      {showCreateModal && (
        <div className="tg-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="tg-modal" onClick={e => e.stopPropagation()}>
            <div className="tg-modal-header">
              <h3>Nuevo Grupo</h3>
              <button className="ts-modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <input
              className="tg-input"
              type="text"
              placeholder="Nombre del grupo"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
              autoFocus
            />
            <div className="tg-modal-footer">
              <button className="ts-btn-cancel" onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button className="tg-btn-primary" onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}>
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar grupo */}
      {confirmDelete && (
        <div className="tg-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="tg-modal" onClick={e => e.stopPropagation()}>
            <h3>Eliminar grupo</h3>
            <p>¿Seguro que querés eliminar el grupo <strong>{confirmDelete.name}</strong>? Los alumnos serán desasociados.</p>
            <div className="tg-modal-footer">
              <button className="ts-btn-cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="tg-btn-danger" onClick={handleDeleteGroup}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar alumno al grupo */}
      {showAddStudentModal && (
        <div className="tg-overlay" onClick={() => setShowAddStudentModal(false)}>
          <div className="tg-modal tg-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="tg-modal-header">
              <h3>Agregar Alumno al Grupo</h3>
              <button className="ts-modal-close" onClick={() => setShowAddStudentModal(false)}>✕</button>
            </div>
            <input
              className="tg-input"
              type="text"
              placeholder="Buscar alumno..."
              value={addStudentSearch}
              onChange={e => setAddStudentSearch(e.target.value)}
              autoFocus
            />
            <div className="tg-students-list tg-modal-list">
              {loadingModal ? (
                <p className="ts-loading">Cargando alumnos...</p>
              ) : filteredCourseStudents.length === 0 ? (
                <p className="ts-empty">No se encontraron alumnos</p>
              ) : (
                filteredCourseStudents.map(s => {
                  const inGroup = enrolledInGroup.has(s.id);
                  return (
                    <div key={s.id} className={`tg-student-row ${inGroup ? 'tg-student-row--enrolled' : ''}`}>
                      <span className="tg-avatar">{s.name[0]}{(s.lastName || s.lastname || '?')[0]}</span>
                      <span className="tg-name">{s.name} {s.lastName || s.lastname}</span>
                      <button
                        className="tg-btn-assign"
                        disabled={inGroup}
                        onClick={() => handleAddStudent(s.id)}
                      >
                        {inGroup ? 'En el grupo' : 'Agregar'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal configurar juegos del grupo */}
      {showGamesModal && (
        <div className="tg-overlay" onClick={() => setShowGamesModal(false)}>
          <div className="tg-modal tg-modal--wide" onClick={e => e.stopPropagation()}>
            <div className="tg-modal-header">
              <h3>Juegos del grupo</h3>
              <button className="ts-modal-close" onClick={() => setShowGamesModal(false)}>✕</button>
            </div>
            <p className="tg-modal-subtitle">Activá los juegos y elegí uno o más niveles. Los cambios se aplican al guardar.</p>
            {loadingModal ? (
              <p className="ts-loading">Cargando juegos...</p>
            ) : (
              <div className="sgam-list">
                {courseGames.map(game => {
                  const assigned = pendingGames[game.gameId];
                  return (
                    <div key={game.gameId} className={`sgam-row ${assigned ? 'sgam-row--active' : ''} sgam-row--group`}>
                      <div className="sgam-row-top">
                        <div className="sgam-info">
                          <span className="sgam-name">{game.gameName}</span>
                          {assigned && (
                            <span className="sgam-level-badge">
                              {assigned.levels.map(l => {
                                const info = game.levels.find(x => x.level === l);
                                return info?.name || `Niv. ${l}`;
                              }).join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="sgam-controls">
                          <button
                            className={`sgam-toggle ${assigned ? 'sgam-toggle--on' : 'sgam-toggle--off'}`}
                            disabled={savingGames}
                            onClick={() => handleToggleGame(game.gameId)}
                          >
                            {assigned ? 'Desasignar' : 'Asignar'}
                          </button>
                        </div>
                      </div>
                      {assigned && (
                        <div className="sgam-levels-multi">
                          {game.levels.map(l => (
                            <label
                              key={l.level}
                              className={`sgam-level-check ${assigned.levels.includes(l.level) ? 'sgam-level-check--on' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={assigned.levels.includes(l.level)}
                                disabled={savingGames}
                                onChange={() => handleGameLevelToggle(game.gameId, l.level)}
                              />
                              {l.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="sgam-footer">
              <button className="ts-btn-cancel" onClick={() => setShowGamesModal(false)} disabled={savingGames}>Cerrar</button>
              <button
                className="sgam-btn-save"
                onClick={handleSaveGames}
                disabled={savingGames || !hasPendingGameChanges || loadingModal}
              >
                {savingGames ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
