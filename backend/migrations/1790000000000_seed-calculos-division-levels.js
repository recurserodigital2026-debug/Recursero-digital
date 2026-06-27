/* eslint-disable camelcase */

// División (por ejes) como 4ª operación de JuegoCalculos.
// 7 niveles bajo game-calculos, niveles backend 12–18 (sin colisionar con
// suma 1–3/10–11, resta 4–6, multiplicación 7–9). Ver specs/002-division-operation/.
// Nota: el "factor faltante" se omite a propósito: es un cálculo de multiplicación y
// multiplicación ya tiene su nivel "Encuentra el factor".
exports.shorthands = undefined;

const COLOR = 'from-cyan-400 to-blue-500';
const ICON = '➗';

const LEVELS = [
    {
        id: 'level-calculos-division-1', level: 12,
        name: 'Nivel 1 - Reparto con resta sucesiva',
        description: 'Repartí en grupos iguales y contá cuántos grupos se forman',
        difficulty: 'Fácil',
        config: { operation: 'division', icon: ICON, color: COLOR, kind: 'division_repeated_subtraction', groupSizes: [3, 4, 5, 6], maxGroups: 12 },
    },
    {
        id: 'level-calculos-division-2', level: 13,
        name: 'Nivel 2 - ¿Alcanza justo o falta?',
        description: 'Problemas de reparto con cociente y resto',
        difficulty: 'Intermedio',
        config: { operation: 'division', icon: ICON, color: COLOR, kind: 'division_word_remainder', divisorRange: [3, 6], dividendMax: 60, allowExact: true },
    },
    {
        id: 'level-calculos-division-3', level: 14,
        name: 'Nivel 3 - Dividir directamente',
        description: 'Divisiones exactas usando la tabla pitagórica',
        difficulty: 'Fácil',
        config: { operation: 'division', icon: ICON, color: COLOR, kind: 'division_facts', maxDivisor: 10, maxQuotient: 10 },
    },
    {
        id: 'level-calculos-division-4', level: 15,
        name: 'Nivel 4 - Divisiones con resto',
        description: 'Tabla pitagórica con resto distinto de cero',
        difficulty: 'Intermedio',
        config: { operation: 'division', icon: ICON, color: COLOR, kind: 'division_with_remainder', divisorRange: [2, 9], dividendMax: 99 },
    },
    {
        id: 'level-calculos-division-5', level: 16,
        name: 'Nivel 5 - División por 10, 100 y 1.000',
        description: 'Dividir por la unidad seguida de ceros',
        difficulty: 'Intermedio',
        config: { operation: 'division', icon: ICON, color: COLOR, kind: 'division_by_powers_of_ten', divisors: [10, 100, 1000], itemsPerExercise: 3 },
    },
    {
        id: 'level-calculos-division-6', level: 17,
        name: 'Nivel 6 - Cálculos conocidos',
        description: 'Usá un cálculo conocido para resolver cálculos nuevos',
        difficulty: 'Avanzado',
        config: { operation: 'division', icon: ICON, color: COLOR, kind: 'division_scaling', baseFacts: [[10, 5, 2], [40, 4, 10], [30, 3, 10]], scales: [10, 100], derivations: ['scale', 'decompose'], maxAddendMultiple: 2 },
    },
    {
        id: 'level-calculos-division-7', level: 18,
        name: 'Nivel 7 - Cálculo aproximado',
        description: 'Estimá el resultado sin hacer la cuenta exacta',
        difficulty: 'Avanzado',
        config: { operation: 'division', icon: ICON, color: COLOR, kind: 'division_estimation', shapes: ['threshold', 'nearest'], dividendMax: 320, divisorMax: 30 },
    },
];

exports.up = (pgm) => {
    // Limpia cualquier fila previa de división (p. ej. el seed anterior de 8 niveles).
    pgm.sql(`DELETE FROM games_levels WHERE id LIKE 'level-calculos-division-%';`);
    for (const lvl of LEVELS) {
        pgm.sql(`
            INSERT INTO games_levels (id, game_id, level, name, description, difficulty, activities_count, config, is_active)
            VALUES (
                '${lvl.id}',
                'game-calculos',
                ${lvl.level},
                '${lvl.name.replace(/'/g, "''")}',
                '${lvl.description.replace(/'/g, "''")}',
                '${lvl.difficulty}',
                5,
                '${JSON.stringify(lvl.config)}'::jsonb,
                true
            )
            ON CONFLICT (id) DO UPDATE
                SET config      = EXCLUDED.config,
                    name        = EXCLUDED.name,
                    description = EXCLUDED.description,
                    difficulty  = EXCLUDED.difficulty,
                    level       = EXCLUDED.level,
                    is_active   = EXCLUDED.is_active;
        `);
    }
};

exports.down = (pgm) => {
    pgm.sql(`DELETE FROM games_levels WHERE id LIKE 'level-calculos-division-%';`);
};
