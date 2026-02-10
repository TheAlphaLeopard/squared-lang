/**
 * Squared (^2) Random Module
 * All randomness logic lives here.
 */

/**
 * Squared (^2) Random Module
 * Robust header: Squared Module 1.0
 */

export const random = (min, max) => {
    const nMin = Number(min) || 0;
    const nMax = Number(max) || 0;
    return Math.floor(Math.random() * (nMax - nMin + 1)) + nMin;
};

export const pick = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return arr[Math.floor(Math.random() * arr.length)];
};

export default {
    random,
    pick
};