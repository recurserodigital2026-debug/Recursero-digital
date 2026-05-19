import { formatNumber } from '../utils';

const VALID_TARGETS = [100, 1000, 10000];

const pickOperandA = (target, step) => {
    const choices = (target / step) - 1;
    const k = 1 + Math.floor(Math.random() * choices);
    return k * step;
};

export const generate = (config) => {
    const { target } = config;
    if (!VALID_TARGETS.includes(target)) {
        throw new Error(`sumToTarget: target inválido (${target})`);
    }
    const step = target / 10;
    const a = pickOperandA(target, step);
    const b = target - a;
    return {
        pregunta: `${formatNumber(a)} + ${formatNumber(b)} =`,
        respuesta: target,
        meta: { operandA: a, operandB: b, operation: 'suma', kind: 'sum_to_target' },
    };
};

export const predicate = (calc, config) => {
    const { target } = config;
    if (!VALID_TARGETS.includes(target)) return false;
    const { operandA: a, operandB: b, operation } = calc.meta;
    if (operation !== 'suma') return false;
    const step = target / 10;
    if (a <= 0 || b <= 0) return false;
    if (a === target || b === target) return false;
    if (a % step !== 0 || b % step !== 0) return false;
    return a + b === target;
};
