import { formatNumber } from '../utils';

const VALID_TARGETS = [100, 1000, 10000];

const pickOperandA = (target, step) => {
    const choices = (target / step) - 1;
    const k = 1 + Math.floor(Math.random() * choices);
    return k * step;
};

const resolveTarget = (config) => {
    if (Array.isArray(config.targets)) {
        if (config.targets.length === 0) {
            throw new Error('sumToTarget: targets vacío');
        }
        for (const t of config.targets) {
            if (!VALID_TARGETS.includes(t)) {
                throw new Error(`sumToTarget: target inválido en targets (${t})`);
            }
        }
        return config.targets[Math.floor(Math.random() * config.targets.length)];
    }
    if (!VALID_TARGETS.includes(config.target)) {
        throw new Error(`sumToTarget: target inválido (${config.target})`);
    }
    return config.target;
};

export const generate = (config) => {
    const target = resolveTarget(config);
    const step = target / 10;
    const a = pickOperandA(target, step);
    const b = target - a;
    return {
        pregunta: `${formatNumber(a)} + ${formatNumber(b)} =`,
        respuesta: target,
        meta: { operandA: a, operandB: b, operation: 'suma', kind: 'sum_to_target', target },
    };
};

export const predicate = (calc, config) => {
    const { operandA: a, operandB: b, operation } = calc.meta;
    if (operation !== 'suma') return false;
    const target = calc.respuesta;
    if (!VALID_TARGETS.includes(target)) return false;
    if (Array.isArray(config.targets)) {
        if (!config.targets.includes(target)) return false;
    } else if (config.target !== target) {
        return false;
    }
    const step = target / 10;
    if (a <= 0 || b <= 0) return false;
    if (a === target || b === target) return false;
    if (a % step !== 0 || b % step !== 0) return false;
    return a + b === target;
};
