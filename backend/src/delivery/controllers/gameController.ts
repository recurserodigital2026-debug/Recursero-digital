import { Request, Response } from 'express';
import { DependencyContainer } from '../../config/DependencyContainer';

const container = DependencyContainer.getInstance();

export const gameController = {
    getGameLevels: async (req: Request, res: Response): Promise<void> => {
        try {
            const { gameId } = req.params as { gameId: string };
            const { onlyActive } = req.query as { onlyActive?: string };

            if (!gameId || gameId.trim() === '') {
                res.status(400).json({ 
                    error: 'gameId es requerido' 
                });
                return;
            }

            const result = await container.getGameLevelsUseCase.execute({
                gameId,
                onlyActive: onlyActive === 'true'
            });

            if (result.levels.length === 0) {
                res.status(200).json({
                    gameId: result.gameId,
                    levels: [],
                    message: `No se encontraron niveles para el juego ${gameId}`
                });
                return;
            }

            res.status(200).json(result);
        } catch (error: any) {
            console.error('Error en getGameLevels:', error);
            
            if (error.message === 'gameId es requerido') {
                res.status(400).json({ error: error.message });
                return;
            }

            res.status(500).json({ 
                error: 'Error interno del servidor al obtener niveles del juego' 
            });
        }
    },

    getGameLevel: async (req: Request, res: Response): Promise<void> => {
        try {
            const { gameId, level } = req.params as { gameId: string; level: string };

            if (!gameId || gameId.trim() === '') {
                res.status(400).json({ error: 'gameId es requerido' });
                return;
            }

            const levelNumber = parseInt(level, 10);
            if (isNaN(levelNumber) || levelNumber < 1) {
                res.status(400).json({ error: 'level debe ser un número entero mayor a 0' });
                return;
            }

            const gameLevel = await container.gameLevelRepository.findByGameIdAndLevel(
                gameId,
                levelNumber
            );

            if (!gameLevel) {
                res.status(404).json({ 
                    error: `Nivel ${levelNumber} no encontrado para el juego ${gameId}` 
                });
                return;
            }

            res.status(200).json({
                id: gameLevel.getId(),
                gameId: gameLevel.getGameId(),
                level: gameLevel.getLevel(),
                name: gameLevel.getName(),
                description: gameLevel.getDescription(),
                difficulty: gameLevel.getDifficulty(),
                activitiesCount: gameLevel.getActivitiesCount(),
                config: gameLevel.getConfig()
            });
        } catch (error: any) {
            console.error('Error en getGameLevel:', error);
            res.status(500).json({ 
                error: 'Error interno del servidor al obtener el nivel del juego' 
            });
        }
    },

    getAllGamesWithLevels: async (req: Request, res: Response): Promise<void> => {
        try {
            const db = (container.gameLevelRepository as any).db;
            const result = await db.query(
                `SELECT gl.*, g.name as game_name
                 FROM games_levels gl
                 JOIN games g ON gl.game_id = g.id
                 ORDER BY gl.game_id, gl.level ASC`
            );

            const gamesMap = new Map<string, any>();

            result.rows.forEach((row: any) => {
                const gameId = row.game_id;
                if (!gamesMap.has(gameId)) {
                    gamesMap.set(gameId, {
                        gameId,
                        gameName: row.game_name,
                        levels: []
                    });
                }
                gamesMap.get(gameId).levels.push({
                    id: row.id,
                    level: row.level,
                    name: row.name,
                    description: row.description,
                    difficulty: row.difficulty,
                    activitiesCount: row.activities_count,
                    config: row.config,
                    isActive: row.is_active
                });
            });

            const games = Array.from(gamesMap.values()).map(game => ({
                ...game,
                levels: game.levels.sort((a: any, b: any) => a.level - b.level),
                totalLevels: game.levels.length,
                activeLevels: game.levels.filter((l: any) => l.isActive).length
            }));

            res.status(200).json({ games });
        } catch (error: any) {
            console.error('Error en getAllGamesWithLevels:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    updateGameLevel: async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params as { id: string };
            const updateData = req.body as {
                name?: string;
                description?: string;
                difficulty?: string;
                activitiesCount?: number;
                config?: any;
                isActive?: boolean;
            };

            if (!id || id.trim() === '') {
                res.status(400).json({ error: 'id es requerido' });
                return;
            }

            const result = await container.updateGameLevelUseCase.execute({
                id,
                ...updateData
            });

            res.status(200).json(result);
        } catch (error: any) {
            console.error('Error en updateGameLevel:', error);
            
            if (error.message.includes('no encontrado')) {
                res.status(404).json({ error: error.message });
                return;
            }

            if (error.message.includes('es requerido') || error.message.includes('debe ser')) {
                res.status(400).json({ error: error.message });
                return;
            }

            res.status(500).json({ 
                error: 'Error interno del servidor al actualizar el nivel' 
            });
        }
    }
};

