export const digitsOf = (n) => {
    if (n === 0) return 1;
    let count = 0;
    let value = Math.abs(n);
    while (value > 0) {
        count += 1;
        value = Math.floor(value / 10);
    }
    return count;
};

export const digitAt = (n, position) => {
    return Math.floor(Math.abs(n) / 10 ** position) % 10;
};

export const hasExactDigits = (n, count) => {
    if (!Number.isInteger(n) || n < 0) return false;
    return digitsOf(n) === count;
};

export const noCarryOnSum = (a, b) => {
    const d = Math.max(digitsOf(a), digitsOf(b));
    for (let i = 0; i < d; i += 1) {
        if (digitAt(a, i) + digitAt(b, i) > 9) return false;
    }
    return true;
};

export const noBorrowOnSub = (a, b) => {
    if (a < b) return false;
    const d = Math.max(digitsOf(a), digitsOf(b));
    for (let i = 0; i < d; i += 1) {
        if (digitAt(a, i) < digitAt(b, i)) return false;
    }
    return true;
};
