/** First port >= start with nothing listening on 127.0.0.1 or ::1. */
export function findFreePort(start: number): Promise<number>;
