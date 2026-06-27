// Shared helpers for the división generators (eje 1–8). Mirrors predicates.js.
// All generators produce exercises that MUST pass their predicate (Constitution III),
// verified by generators/index.js::dispatch().

export const randInt = (min, max) =>
    min + Math.floor(Math.random() * (max - min + 1));

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Exact (remainder-0) division check.
export const dividesExact = (dividendo, divisor) =>
    divisor !== 0 && dividendo % divisor === 0;

export const remainderOf = (dividendo, divisor) => dividendo % divisor;

export const quotientOf = (dividendo, divisor) => Math.floor(dividendo / divisor);

// `dividendo = divisor·cociente + resto`, con 0 ≤ resto < divisor.
export const isValidDivision = (dividendo, divisor, cociente, resto) =>
    divisor > 0 &&
    resto >= 0 &&
    resto < divisor &&
    dividendo === divisor * cociente + resto;
