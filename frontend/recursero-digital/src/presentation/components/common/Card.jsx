import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiRequest } from '../../../infrastructure/config/api';
import '../../styles/components/card.css';
import DefaultGameImage from '../../../assets/JuegoOrdenamiento-fontpage.png';
import Spinner from '../shared/Spinner';

const imageModules = import.meta.glob('../../../assets/*', { eager: true });
const IMAGE_MAP = Object.entries(imageModules).reduce((acc, [path, module]) => {
  const fileName = path.split('/').pop();
  if (fileName && module && typeof module === 'object' && 'default' in module) {
    acc[fileName] = module.default;
  }
  return acc;
}, {});

const resolveGameImage = (imageUrl) => {
  if (!imageUrl) {
    return IMAGE_MAP['JuegoOrdenamiento-fontpage.png'] || DefaultGameImage;
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  const fileName = imageUrl.split('/').pop();
  if (fileName && IMAGE_MAP[fileName]) {
    return IMAGE_MAP[fileName];
  }

  return DefaultGameImage;
};

export function Card() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('/student/me/games');

      if (response.ok && response.data && Array.isArray(response.data.games)) {
        const source = response.data.source || 'course';
        setCourseId(response.data.courseId || null);
        const transformedGames = response.data.games
          .filter((courseGame) => courseGame?.game)
          .map((courseGame) => {
            const gameData = courseGame.game;
            const assignedLevel = (source === 'student' || source === 'group') ? (courseGame.level ?? courseGame.orderIndex ?? null) : null;
            const assignedLevels = (source === 'group' && Array.isArray(courseGame.levels) && courseGame.levels.length > 0)
              ? courseGame.levels
              : (assignedLevel != null ? [assignedLevel] : null);
            return {
              id: gameData.id,
              name: gameData.name,
              description: gameData.description,
              imageUrl: resolveGameImage(gameData.imageUrl),
              route: gameData.route || '/alumno/juegos',
              difficultyLevel: gameData.difficultyLevel ?? 1,
              orderIndex: courseGame.orderIndex ?? 0,
              assignedLevel,
              assignedLevels,
            };
          });

        setGames(transformedGames);
      } else {
        setGames([]);
        setError('No fue posible obtener los juegos del curso.');
      }
    } catch (fetchError) {
      console.error('Error al cargar juegos:', fetchError);
      setError('Error al cargar los juegos. Inténtalo nuevamente.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleJugar = (route, assignedLevel, assignedLevels) => {
    if (assignedLevel != null) {
      sessionStorage.setItem(`assignedLevel:${route}`, assignedLevel);
    } else {
      sessionStorage.removeItem(`assignedLevel:${route}`);
    }
    if (assignedLevels?.length) {
      sessionStorage.setItem(`assignedLevels:${route}`, JSON.stringify(assignedLevels));
    } else {
      sessionStorage.removeItem(`assignedLevels:${route}`);
    }
    if (!courseId) {
      console.warn('No courseId disponible; navegando a la ruta base');
      navigate(route);
      return;
    }
    const target = route.endsWith('/') ? `${route}${courseId}` : `${route}/${courseId}`;
    navigate(target);
  };

  if (loading) {
    return <div className="container"><Spinner label="Cargando juegos..." /></div>;
  }

  if (error || games.length === 0) {
    const hasCourse = courseId !== null;
    return (
      <div className="sin-juegos-container">
        <div className="sin-juegos-card">
          <div className="sin-juegos-emoji">📚</div>
          {hasCourse ? (
            <>
              <h2 className="sin-juegos-titulo">Todavía no tenés un grupo asignado</h2>
              <p className="sin-juegos-texto">Aguardá a que tu docente te asigne un grupo y acá van a aparecer tus juegos 🎮</p>
            </>
          ) : (
            <>
              <h2 className="sin-juegos-titulo">Todavía no tenés un curso asignado</h2>
              <p className="sin-juegos-texto">Aguardá a que tu docente te asigne uno y acá van a aparecer tus juegos 🎮</p>
            </>
          )}
        </div>
      </div>
    );
  }

    return (
        <>
            <div className='contenedor-card'>
                {games
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((game) => (
                        <box className="card" key={game.id}>
                            <img src={game.imageUrl} alt={game.name} className="imagegame"/>
                            <div className='textgame'>
                                <h2 className="titlegame">{game.name}</h2>
                                {game.assignedLevel ? (
                                  <p className="descriptiongame card-nivel-asignado">
                                    Nivel asignado: <strong>Nivel {game.assignedLevel}</strong>
                                  </p>
                                ) : (
                                  <p className="descriptiongame">{game.description}</p>
                                )}
                                <button className="buttongame" onClick={() => handleJugar(game.route, game.assignedLevel, game.assignedLevels)}>Jugar</button>
                            </div>
                        </box>
                    ))
                }
            </div>
        </>
    )
}
