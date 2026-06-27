import { UpdateGameLevelUseCase } from '../../../src/core/usecases/UpdateGameLevelUseCase';
import { GameLevel, GameLevelConfig } from '../../../src/core/models/GameLevel';
import { GameLevelRepository } from '../../../src/core/infrastructure/GameLevelRepository';

class MockGameLevelRepository implements GameLevelRepository {
    private gameLevels: Map<string, GameLevel> = new Map();

    async findByGameId(gameId: string): Promise<GameLevel[]> {
        return Array.from(this.gameLevels.values()).filter(l => l.getGameId() === gameId);
    }

    async findByGameIdAndLevel(gameId: string, level: number): Promise<GameLevel | null> {
        const levels = await this.findByGameId(gameId);
        return levels.find(l => l.getLevel() === level) || null;
    }

    async findById(id: string): Promise<GameLevel | null> {
        return this.gameLevels.get(id) || null;
    }

    async findActiveByGameId(gameId: string): Promise<GameLevel[]> {
        const levels = await this.findByGameId(gameId);
        return levels.filter(l => l.getIsActive());
    }

    async save(gameLevel: GameLevel): Promise<GameLevel> {
        this.gameLevels.set(gameLevel.getId(), gameLevel);
        return gameLevel;
    }

    async update(id: string, gameLevelData: Partial<GameLevel>): Promise<GameLevel | null> {
        const existing = this.gameLevels.get(id);
        if (!existing) return null;

        const updated = new GameLevel(
            existing.id,
            existing.gameId,
            existing.level,
            gameLevelData.name ?? existing.name,
            gameLevelData.description ?? existing.description,
            gameLevelData.difficulty ?? existing.difficulty,
            gameLevelData.activitiesCount ?? existing.activitiesCount,
            gameLevelData.config ?? existing.config,
            gameLevelData.isActive ?? existing.isActive,
            existing.createdAt,
            new Date()
        );

        this.gameLevels.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        return this.gameLevels.delete(id);
    }

    async findAll(): Promise<GameLevel[]> {
        return Array.from(this.gameLevels.values());
    }

    addLevel(level: GameLevel): void {
        this.gameLevels.set(level.getId(), level);
    }

    clear(): void {
        this.gameLevels.clear();
    }

    async getTotalActivitiesCount(gameId: string): Promise<number> {
        const levels = await this.findByGameId(gameId);
        return levels.reduce((total, level) => total + level.getActivitiesCount(), 0);
    }
}

describe('UpdateGameLevelUseCase', () => {
    let repository: MockGameLevelRepository;
    let useCase: UpdateGameLevelUseCase;

    beforeEach(() => {
        repository = new MockGameLevelRepository();
        useCase = new UpdateGameLevelUseCase(repository);
    });

    afterEach(() => {
        repository.clear();
    });

    describe('execute - Happy Path', () => {
        it('should update level name successfully', async () => {
            const config: GameLevelConfig = { min: 100, max: 999 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Nivel 1',
                'Descripción original',
                'Fácil',
                5,
                config
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                name: 'Nivel 1 Actualizado'
            });

            expect(result.level.name).toBe('Nivel 1 Actualizado');
            expect(result.level.description).toBe('Descripción original');
        });

        it('should update multiple fields at once', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Original',
                'Desc original',
                'Fácil',
                5,
                config
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                name: 'Actualizado',
                description: 'Nueva descripción',
                difficulty: 'Intermedio',
                activitiesCount: 10
            });

            expect(result.level.name).toBe('Actualizado');
            expect(result.level.description).toBe('Nueva descripción');
            expect(result.level.difficulty).toBe('Intermedio');
            expect(result.level.activitiesCount).toBe(10);
        });

        it('should update config successfully', async () => {
            const originalConfig: GameLevelConfig = { min: 100, max: 999 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Nivel 1',
                'Desc',
                'Fácil',
                5,
                originalConfig
            );
            repository.addLevel(level);

            const newConfig: GameLevelConfig = { min: 200, max: 1999, color: 'blue' };
            const result = await useCase.execute({
                id: 'level-1',
                config: newConfig
            });

            expect(result.level.config.min).toBe(200);
            expect(result.level.config.max).toBe(1999);
            expect(result.level.config.color).toBe('blue');
        });

        it('should update isActive status', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Nivel 1',
                'Desc',
                'Fácil',
                5,
                config,
                true
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                isActive: false
            });

            expect(result.level.isActive).toBe(false);
        });
    });

    describe('execute - Validation', () => {
        it('should throw error when id is empty', async () => {
            await expect(
                useCase.execute({ id: '' })
            ).rejects.toThrow('id es requerido');
        });

        it('should throw error when id is only whitespace', async () => {
            await expect(
                useCase.execute({ id: '   ' })
            ).rejects.toThrow('id es requerido');
        });

        it('should throw error when level not found', async () => {
            await expect(
                useCase.execute({ id: 'non-existent', name: 'Test' })
            ).rejects.toThrow('Nivel con id non-existent no encontrado');
        });

        it('should throw error when activitiesCount is less than 1', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-test', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            await expect(
                useCase.execute({ id: 'level-1', activitiesCount: 0 })
            ).rejects.toThrow('activitiesCount debe ser mayor a 0');

            await expect(
                useCase.execute({ id: 'level-1', activitiesCount: -1 })
            ).rejects.toThrow('activitiesCount debe ser mayor a 0');
        });

        it('should throw error when config is not an object', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-test', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            await expect(
                useCase.execute({ id: 'level-1', config: 'invalid' as any })
            ).rejects.toThrow('config debe ser un objeto');
        });
    });

    describe('execute - Partial Updates', () => {
        it('should only update provided fields', async () => {
            const config: GameLevelConfig = { min: 100, max: 999 };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Original',
                'Desc original',
                'Fácil',
                5,
                config,
                true
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                name: 'Solo nombre actualizado'
            });

            expect(result.level.name).toBe('Solo nombre actualizado');
            expect(result.level.description).toBe('Desc original');
            expect(result.level.difficulty).toBe('Fácil');
            expect(result.level.activitiesCount).toBe(5);
            expect(result.level.isActive).toBe(true);
        });

        it('should preserve existing config when not provided', async () => {
            const originalConfig: GameLevelConfig = { min: 100, max: 999, color: 'blue' };
            const level = new GameLevel(
                'level-1',
                'game-test',
                1,
                'Test',
                'Desc',
                'Fácil',
                5,
                originalConfig
            );
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                name: 'Actualizado'
            });

            expect(result.level.config).toEqual(originalConfig);
        });
    });

    describe('execute - Real World Scenarios', () => {
        it('should update Ordenamiento level configuration', async () => {
            const config: GameLevelConfig = { min: 100, max: 999, numbersCount: 6 };
            const level = new GameLevel(
                'level-ordenamiento-1',
                'game-ordenamiento',
                1,
                'Nivel 1',
                'Números de 3 dígitos',
                'Fácil',
                5,
                config
            );
            repository.addLevel(level);

            const newConfig: GameLevelConfig = { min: 200, max: 1999, numbersCount: 8, color: 'green' };
            const result = await useCase.execute({
                id: 'level-ordenamiento-1',
                config: newConfig,
                activitiesCount: 7
            });

            expect(result.level.config.numbersCount).toBe(8);
            expect(result.level.config.min).toBe(200);
            expect(result.level.activitiesCount).toBe(7);
        });

        it('should update Escala level with operation', async () => {
            const config: GameLevelConfig = { min: 5, max: 95, operation: 1 };
            const level = new GameLevel(
                'level-escala-1',
                'game-escala',
                1,
                'Vecinos Cercanos',
                'Desc',
                'Fácil',
                5,
                config
            );
            repository.addLevel(level);

            const newConfig: GameLevelConfig = { min: 10, max: 100, operation: 2, color: 'blue' };
            const result = await useCase.execute({
                id: 'level-escala-1',
                config: newConfig
            });

            expect(result.level.config.operation).toBe(2);
            expect(result.level.config.min).toBe(10);
        });

        it('should accept every valid config.kind', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-calculos', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            const validConfigs: GameLevelConfig[] = [
                { kind: 'sum_to_target', target: 100, operation: 'suma' },
                { kind: 'sum_to_target', target: 1000, operation: 'suma' },
                { kind: 'sum_to_target', target: 10000, operation: 'suma' },
                { kind: 'whole_multiples', step: 10, min: 10, max: 90, operation: 'suma' },
                { kind: 'whole_multiples', step: 100, min: 100, max: 900, operation: 'resta' },
                { kind: 'identical_numbers', min: 10, max: 99, operation: 'suma' },
                { kind: 'no_carry_sum', digitCount: 2, operation: 'suma' },
                { kind: 'no_carry_sum', digitCount: 4, operation: 'suma' },
                { kind: 'no_borrow_sub', digitCount: 3, operation: 'resta' },
                { kind: 'free_form', digitCount: 2, operation: 'suma' },
                { kind: 'free_form', digitCount: 4, operation: 'resta' },
            ];

            for (const cfg of validConfigs) {
                const result = await useCase.execute({ id: 'level-1', config: cfg });
                expect(result.level.config.kind).toBe((cfg as any).kind);
            }
        });

        it('should reject an unknown config.kind', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-calculos', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            await expect(
                useCase.execute({ id: 'level-1', config: { kind: 'magic_kind' } as any })
            ).rejects.toThrow('config.kind inválido');
        });

        it('should reject sum_to_target with invalid target', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-calculos', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            await expect(
                useCase.execute({
                    id: 'level-1',
                    config: { kind: 'sum_to_target', target: 250, operation: 'suma' } as any,
                })
            ).rejects.toThrow('config.target debe ser 100, 1000 o 10000');
        });

        it('should reject no_carry_sum without digitCount', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-calculos', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            await expect(
                useCase.execute({
                    id: 'level-1',
                    config: { kind: 'no_carry_sum', operation: 'suma' } as any,
                })
            ).rejects.toThrow('config.digitCount debe ser 2, 3 o 4');
        });

        it('should reject whole_multiples with wrong operation', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-calculos', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            await expect(
                useCase.execute({
                    id: 'level-1',
                    config: { kind: 'whole_multiples', step: 10, min: 10, max: 90, operation: 'multiplicacion' } as any,
                })
            ).rejects.toThrow('config.operation debe ser "suma" o "resta" para whole_multiples');
        });

        it('should allow updating a legacy config (no kind) untouched', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-test', 1, 'Test', 'Desc', 'Fácil', 5, config);
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                config: { min: 5, max: 50 },
            });
            expect(result.level.config.min).toBe(5);
        });

        it('should deactivate a level', async () => {
            const config: GameLevelConfig = { min: 1, max: 100 };
            const level = new GameLevel('level-1', 'game-test', 1, 'Test', 'Desc', 'Fácil', 5, config, true);
            repository.addLevel(level);

            const result = await useCase.execute({
                id: 'level-1',
                isActive: false
            });

            expect(result.level.isActive).toBe(false);
            const updated = await repository.findById('level-1');
            expect(updated?.getIsActive()).toBe(false);
        });
    });

    describe('execute - División kinds', () => {
        const seed = () => {
            const level = new GameLevel('level-div', 'game-calculos', 12, 'Test', 'Desc', 'Fácil', 5, { min: 1, max: 100 });
            repository.addLevel(level);
        };

        const validDivisionConfigs: GameLevelConfig[] = [
            { kind: 'division_repeated_subtraction', operation: 'division', groupSizes: [3, 4, 5, 6], maxGroups: 12 } as any,
            { kind: 'division_word_remainder', operation: 'division', divisorRange: [3, 6], dividendMax: 60, allowExact: true } as any,
            { kind: 'division_facts', operation: 'division', maxDivisor: 10, maxQuotient: 10 } as any,
            { kind: 'division_with_remainder', operation: 'division', divisorRange: [2, 9], dividendMax: 99 } as any,
            { kind: 'division_by_powers_of_ten', operation: 'division', divisors: [10, 100, 1000], itemsPerExercise: 3 } as any,
            { kind: 'division_scaling', operation: 'division', baseFacts: [[10, 5, 2], [40, 4, 10]], scales: [10, 100], derivations: ['scale', 'decompose'], maxAddendMultiple: 2 } as any,
            { kind: 'division_estimation', operation: 'division', shapes: ['threshold', 'nearest'], dividendMax: 320, divisorMax: 30 } as any,
        ];

        it('should accept every valid división config.kind', async () => {
            seed();
            for (const cfg of validDivisionConfigs) {
                const result = await useCase.execute({ id: 'level-div', config: cfg });
                expect(result.level.config.kind).toBe((cfg as any).kind);
            }
        });

        it('should reject any división kind with wrong operation', async () => {
            seed();
            await expect(
                useCase.execute({ id: 'level-div', config: { kind: 'division_facts', operation: 'suma', maxDivisor: 10, maxQuotient: 10 } as any })
            ).rejects.toThrow('config.operation debe ser "division" para division_facts');
        });

        it('should reject division_facts missing maxQuotient', async () => {
            seed();
            await expect(
                useCase.execute({ id: 'level-div', config: { kind: 'division_facts', operation: 'division', maxDivisor: 10 } as any })
            ).rejects.toThrow('config.maxQuotient debe estar entre 2 y 10');
        });

        it('should reject division_with_remainder with divisor min < 2', async () => {
            seed();
            await expect(
                useCase.execute({ id: 'level-div', config: { kind: 'division_with_remainder', operation: 'division', divisorRange: [1, 9], dividendMax: 99 } as any })
            ).rejects.toThrow('config.divisorRange inválido');
        });

        it('should reject division_repeated_subtraction with empty groupSizes', async () => {
            seed();
            await expect(
                useCase.execute({ id: 'level-div', config: { kind: 'division_repeated_subtraction', operation: 'division', groupSizes: [], maxGroups: 12 } as any })
            ).rejects.toThrow('config.groupSizes');
        });

        it('should reject division_word_remainder missing allowExact', async () => {
            seed();
            await expect(
                useCase.execute({ id: 'level-div', config: { kind: 'division_word_remainder', operation: 'division', divisorRange: [3, 6], dividendMax: 60 } as any })
            ).rejects.toThrow('config.allowExact debe ser booleano');
        });

        it('should reject division_by_powers_of_ten with a non power-of-ten divisor', async () => {
            seed();
            await expect(
                useCase.execute({ id: 'level-div', config: { kind: 'division_by_powers_of_ten', operation: 'division', divisors: [10, 7], itemsPerExercise: 3 } as any })
            ).rejects.toThrow('config.divisors debe ser un subconjunto');
        });

        it('should reject division_scaling with an inconsistent base fact', async () => {
            seed();
            await expect(
                useCase.execute({ id: 'level-div', config: { kind: 'division_scaling', operation: 'division', baseFacts: [[10, 3, 4]], scales: [10] } as any })
            ).rejects.toThrow('config.baseFacts');
        });

        it('should reject division_estimation with an invalid shape', async () => {
            seed();
            await expect(
                useCase.execute({ id: 'level-div', config: { kind: 'division_estimation', operation: 'division', shapes: ['weird'] } as any })
            ).rejects.toThrow('config.shapes debe ser un subconjunto');
        });
    });
});

