import { z } from "zod";

/** Input/output for routes that take or return nothing. */
export const Empty = z.undefined();

/**
 * Money is always an integer amount in minor units (e.g. paisa), never a float.
 * Format for display only at the UI edge.
 */
export const Money = z.int();
export type Money = z.infer<typeof Money>;
