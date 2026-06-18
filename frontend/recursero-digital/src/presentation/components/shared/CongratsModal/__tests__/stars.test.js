import { describe, it, expect } from 'vitest';
import { starsFromErrors, starsFromPercentage } from '../stars';

describe('starsFromErrors (umbral fijo: 0→3, 1-3→2, 4+→1)', () => {
  it('sin errores → 3 estrellas', () => {
    expect(starsFromErrors(0)).toBe(3);
  });

  it('1 a 3 errores → 2 estrellas', () => {
    expect(starsFromErrors(1)).toBe(2);
    expect(starsFromErrors(2)).toBe(2);
    expect(starsFromErrors(3)).toBe(2);
  });

  it('4 o más errores → 1 estrella', () => {
    expect(starsFromErrors(4)).toBe(1);
    expect(starsFromErrors(50)).toBe(1);
  });

  it('valores inválidos no rompen (default seguro)', () => {
    expect(starsFromErrors(undefined)).toBe(3);
    expect(starsFromErrors(-3)).toBe(3);
  });
});

describe('starsFromPercentage (% de aciertos)', () => {
  it('100% → 3 estrellas', () => {
    expect(starsFromPercentage(100)).toBe(3);
  });

  it('≥60% (aprobado) → 2 estrellas', () => {
    expect(starsFromPercentage(60)).toBe(2);
    expect(starsFromPercentage(80)).toBe(2);
    expect(starsFromPercentage(99)).toBe(2);
  });

  it('<60% → 1 estrella', () => {
    expect(starsFromPercentage(59)).toBe(1);
    expect(starsFromPercentage(0)).toBe(1);
  });

  it('valor inválido → 1 estrella', () => {
    expect(starsFromPercentage(undefined)).toBe(1);
  });
});
