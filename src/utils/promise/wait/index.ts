/**
 * Returns a promise that resolves after the specified amount of time in milliseconds.
 * @param ms Amount in milliseconds to wait.
 */
export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))
