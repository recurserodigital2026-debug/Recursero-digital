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
            // División (por ejes)
            'division_repeated_subtraction',
            'division_word_remainder',
            'division_facts',
            'division_with_remainder',
            'division_by_powers_of_ten',
            'division_scaling',
            'division_estimation',
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
            case 'division_repeated_subtraction': {
                const c = config as any;
                if (c.operation !== 'division') {
                    throw new Error('config.operation debe ser "division" para division_repeated_subtraction');
                }
                if (!Array.isArray(c.groupSizes) || c.groupSizes.length === 0 ||
                    !c.groupSizes.every((n: any) => Number.isInteger(n) && n >= 1)) {
                    throw new Error('config.groupSizes debe ser un arreglo no vacío de enteros ≥ 1 para division_repeated_subtraction');
                }
                if (!Number.isInteger(c.maxGroups) || c.maxGroups < 1) {
                    throw new Error('config.maxGroups debe ser un entero ≥ 1 para division_repeated_subtraction');
                }
                break;
            }
            case 'division_word_remainder': {
                const c = config as any;
                if (c.operation !== 'division') {
                    throw new Error('config.operation debe ser "division" para division_word_remainder');
                }
                if (!Array.isArray(c.divisorRange) || c.divisorRange.length !== 2) {
                    throw new Error('config.divisorRange debe ser [min, max] para division_word_remainder');
                }
                {
                    const [mn, mx] = c.divisorRange;
                    if (!Number.isInteger(mn) || !Number.isInteger(mx) || mn < 2 || mn > mx) {
                        throw new Error('config.divisorRange inválido (2 ≤ min ≤ max) para division_word_remainder');
                    }
                    if (!Number.isInteger(c.dividendMax) || c.dividendMax < mn) {
                        throw new Error('config.dividendMax inválido para division_word_remainder');
                    }
                }
                if (typeof c.allowExact !== 'boolean') {
                    throw new Error('config.allowExact debe ser booleano para division_word_remainder');
                }
                break;
            }
            case 'division_facts': {
                const c = config as any;
                if (c.operation !== 'division') {
                    throw new Error('config.operation debe ser "division" para division_facts');
                }
                if (!Number.isInteger(c.maxDivisor) || c.maxDivisor < 2 || c.maxDivisor > 10) {
                    throw new Error('config.maxDivisor debe estar entre 2 y 10 para division_facts');
                }
                if (!Number.isInteger(c.maxQuotient) || c.maxQuotient < 2 || c.maxQuotient > 10) {
                    throw new Error('config.maxQuotient debe estar entre 2 y 10 para division_facts');
                }
                break;
            }
            case 'division_with_remainder': {
                const c = config as any;
                if (c.operation !== 'division') {
                    throw new Error('config.operation debe ser "division" para division_with_remainder');
                }
                if (!Array.isArray(c.divisorRange) || c.divisorRange.length !== 2) {
                    throw new Error('config.divisorRange debe ser [min, max] para division_with_remainder');
                }
                {
                    const [mn, mx] = c.divisorRange;
                    if (!Number.isInteger(mn) || !Number.isInteger(mx) || mn < 2 || mn > mx) {
                        throw new Error('config.divisorRange inválido (min ≥ 2) para division_with_remainder');
                    }
                    if (!Number.isInteger(c.dividendMax) || c.dividendMax < mn) {
                        throw new Error('config.dividendMax inválido para division_with_remainder');
                    }
                }
                break;
            }
            case 'division_by_powers_of_ten': {
                const c = config as any;
                if (c.operation !== 'division') {
                    throw new Error('config.operation debe ser "division" para division_by_powers_of_ten');
                }
                {
                    const allowed = [10, 100, 1000];
                    if (!Array.isArray(c.divisors) || c.divisors.length === 0 ||
                        !c.divisors.every((d: any) => allowed.includes(d))) {
                        throw new Error('config.divisors debe ser un subconjunto no vacío de {10,100,1000} para division_by_powers_of_ten');
                    }
                }
                if (!Number.isInteger(c.itemsPerExercise) || c.itemsPerExercise < 1) {
                    throw new Error('config.itemsPerExercise debe ser un entero ≥ 1 para division_by_powers_of_ten');
                }
                break;
            }
            case 'division_scaling': {
                const c = config as any;
                if (c.operation !== 'division') {
                    throw new Error('config.operation debe ser "division" para division_scaling');
                }
                if (!Array.isArray(c.baseFacts) || c.baseFacts.length === 0 ||
                    !c.baseFacts.every((f: any) =>
                        Array.isArray(f) && f.length === 3 && f[1] !== 0 &&
                        f[0] % f[1] === 0 && f[0] / f[1] === f[2])) {
                    throw new Error('config.baseFacts debe ser un arreglo no vacío de [a,b,c] con a%b===0 y a/b===c para division_scaling');
                }
                {
                    const allowedScales = [10, 100, 1000];
                    if (!Array.isArray(c.scales) || c.scales.length === 0 ||
                        !c.scales.every((s: any) => allowedScales.includes(s))) {
                        throw new Error('config.scales debe ser un subconjunto no vacío de {10,100,1000} para division_scaling');
                    }
                }
                break;
            }
            case 'division_estimation': {
                const c = config as any;
                if (c.operation !== 'division') {
                    throw new Error('config.operation debe ser "division" para division_estimation');
                }
                {
                    const allowedShapes = ['threshold', 'nearest'];
                    if (!Array.isArray(c.shapes) || c.shapes.length === 0 ||
                        !c.shapes.every((s: any) => allowedShapes.includes(s))) {
                        throw new Error('config.shapes debe ser un subconjunto no vacío de {threshold,nearest} para division_estimation');
                    }
                }
                break;
            }
        }
    }
}

