import { z } from "zod";

/** Input for routes that take nothing. */
export const Empty = z.void();

/** Output for routes that return nothing; `data` is always present on the wire, so it is null. */
export const NoData = z.null();

/**
 * Money is always an integer amount in minor units (e.g. paisa), never a float.
 * Format for display only at the UI edge.
 */
export const Money = z.int();
export type Money = z.infer<typeof Money>;
