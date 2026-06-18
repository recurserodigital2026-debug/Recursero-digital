// Cálculo de estrellas (1–3) para el cartel de fin de nivel.
//
// Dos bases distintas según el juego:
// - Juegos sin estado de derrota (Escala, Escritura, Ordenamiento, Descomposición):
//   sólo se llega al cartel acertando todo, así que el desempeño se mide por EFICIENCIA
//   (cantidad de errores cometidos antes de acertar). Menos errores = más estrellas.
// - JuegoCalculos: tiene aprobado/desaprobado (umbral 60%), así que las estrellas salen
//   del % real de aciertos.

// Estrellas por eficiencia (errores cometidos), umbral fijo e igual para los 5 juegos:
//   sin errores      → 3 ⭐
//   1 a 3 errores    → 2 ⭐
//   4 o más errores  → 1 ⭐
// Como se reintenta hasta acertar, los errores son "intentos de más", no fracasos.
export const starsFromErrors = (errors) => {
  const safeErrors = Number.isFinite(errors) ? Math.max(0, errors) : 0;
  if (safeErrors === 0) return 3;
  if (safeErrors <= 3) return 2;
  return 1;
};

// Estrellas por % de aciertos: 100% = 3 ⭐, ≥60% (aprobado) = 2 ⭐, resto = 1 ⭐.
export const starsFromPercentage = (pct) => {
  const safePct = Number.isFinite(pct) ? pct : 0;
  if (safePct >= 100) return 3;
  if (safePct >= 60) return 2;
  return 1;
};
