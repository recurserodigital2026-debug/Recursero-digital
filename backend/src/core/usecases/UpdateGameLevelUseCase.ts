import { GameLevelRepository } from '../infrastructure/GameLevelRepository';
import { GameLevel, GameLevelConfig } from '../models/GameLevel';

export interface UpdateGameLevelRequest {
    id: string;
    name?: string;
    description?: string;
    difficulty?: string;
    activitiesCount?: number;
    config?: GameLevelConfig;
    isActive?: boolean;
}

export interface UpdateGameLevelResponse {
    level: {
        id: string;
        gameId: string;
        level: number;
        name: string;
        description: string;
        difficulty: string;
        activitiesCount: number;
        config: GameLevelConfig;
        isActive: boolean;
    };
}

export class UpdateGameLevelUseCase {
    constructor(
        private gameLevelRepository: GameLevelRepository
    ) {}

    async execute(request: UpdateGameLevelRequest): Promise<UpdateGameLevelResponse> {
        this.validateRequest(request);

        const existingLevel = await this.gameLevelRepository.findById(request.id);
        if (!existingLevel) {
            throw new Error(`Nivel con id ${request.id} no encontrado`);
        }

        const updatedLevel = await this.gameLevelRepository.update(request.id, {
            name: request.name,
            description: request.description,
            difficulty: request.difficulty,
            activitiesCount: request.activitiesCount,
            config: request.config,
            isActive: request.isActive
        });

        if (!updatedLevel) {
            throw new Error('Error al actualizar el nivel');
        }

        return {
            level: {
                id: updatedLevel.getId(),
                gameId: updatedLevel.getGameId(),
                level: updatedLevel.getLevel(),
                name: updatedLevel.getName(),
                description: updatedLevel.getDescription(),
                difficulty: updatedLevel.getDifficulty(),
                activitiesCount: updatedLevel.getActivitiesCount(),
                config: updatedLevel.getConfig(),
                isActive: updatedLevel.getIsActive()
            }
        };
    }

    private validateRequest(request: UpdateGameLevelRequest): void {
        if (!request.id || request.id.trim() === '') {
            throw new Error('id es requerido');
        }

        if (request.activitiesCount !== undefined && request.activitiesCount < 1) {
            throw new Error('activitiesCount debe ser mayor a 0');
        }

        if (request.config !== undefined) {
            if (typeof request.config !== 'object' || request.config === null) {
                throw new Error('config debe ser un objeto');
            }
            if ('kind' in request.config) {
                this.validateConfigKind(request.config);
            }
        }
    }

    private validateConfigKind(config: GameLevelConfig): void {
        const validKinds = [
            'sum_to_target',
            'whole_multiples',
            'identical_numbers',
            'no_carry_sum',
            'no_borrow_sub',
            'free_form',
        ];
        const { kind } = config as { kind?: string };
        if (!kind || !validKinds.includes(kind)) {
            throw new Error(
                `config.kind inválido: '${kind}'. Valores aceptados: ${validKinds.join(', ')}`
            );
        }

        switch (kind) {
            case 'sum_to_target': {
                const target = (config as any).target;
                if (![100, 1000, 10000].includes(target)) {
                    throw new Error('config.target debe ser 100, 1000 o 10000 para sum_to_target');
                }
                if ((config as any).operation !== 'suma') {
                    throw new Error('config.operation debe ser "suma" para sum_to_target');
                }
                break;
            }
            case 'whole_multiples': {
                const step = (config as any).step;
                if (![10, 100, 1000].includes(step)) {
                    throw new Error('config.step debe ser 10, 100 o 1000 para whole_multiples');
                }
                if (typeof (config as any).min !== 'number' || typeof (config as any).max !== 'number') {
                    throw new Error('config.min y config.max son requeridos para whole_multiples');
                }
                if (!['suma', 'resta'].includes((config as any).operation)) {
                    throw new Error('config.operation debe ser "suma" o "resta" para whole_multiples');
                }
                break;
            }
            case 'identical_numbers': {
                if (typeof (config as any).min !== 'number' || typeof (config as any).max !== 'number') {
                    throw new Error('config.min y config.max son requeridos para identical_numbers');
                }
                if ((config as any).operation !== 'suma') {
                    throw new Error('config.operation debe ser "suma" para identical_numbers');
                }
                break;
            }
            case 'no_carry_sum': {
                if (![2, 3, 4].includes((config as any).digitCount)) {
                    throw new Error('config.digitCount debe ser 2, 3 o 4 para no_carry_sum');
                }
                if ((config as any).operation !== 'suma') {
                    throw new Error('config.operation debe ser "suma" para no_carry_sum');
                }
                break;
            }
            case 'no_borrow_sub': {
                if (![2, 3, 4].includes((config as any).digitCount)) {
                    throw new Error('config.digitCount debe ser 2, 3 o 4 para no_borrow_sub');
                }
                if ((config as any).operation !== 'resta') {
                    throw new Error('config.operation debe ser "resta" para no_borrow_sub');
                }
                break;
            }
            case 'free_form': {
                if (![2, 3, 4].includes((config as any).digitCount)) {
                    throw new Error('config.digitCount debe ser 2, 3 o 4 para free_form');
                }
                if (!['suma', 'resta'].includes((config as any).operation)) {
                    throw new Error('config.operation debe ser "suma" o "resta" para free_form');
                }
                break;
            }
        }
    }
}

