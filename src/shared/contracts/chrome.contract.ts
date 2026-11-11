import { z } from "zod";
import { defineRoute } from "../ipc/contract";
import { NoData } from "./common";

/**
 * Colors for the native Windows caption buttons. The renderer reads the themed
 * sidebar tokens and sends them here so the overlay never clashes with the title strip.
 */
const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a #RRGGBB color");

export const WindowChrome = z.object({
  color: HexColor,
  symbolColor: HexColor,
});
export type WindowChrome = z.infer<typeof WindowChrome>;

export const chromeRoutes = {
  set: defineRoute({
    channel: "chrome:set",
    input: WindowChrome,
    output: NoData,
    successMessage: "Window chrome updated",
  }),
};
