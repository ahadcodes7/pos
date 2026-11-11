import { z } from "zod";
import { defineRoute } from "../ipc/contract";
import { NoData } from "./common";

export const MenuCommand = z.enum([
  "quit",
  "reload",
  "toggleDevTools",
  "actualSize",
  "zoomIn",
  "zoomOut",
  "toggleFullScreen",
  "about",
]);
export type MenuCommand = z.infer<typeof MenuCommand>;

export const EditCommand = z.enum(["undo", "redo", "cut", "copy", "paste", "selectAll"]);
export type EditCommand = z.infer<typeof EditCommand>;

export const menuRoutes = {
  invoke: defineRoute({
    channel: "menu:invoke",
    input: MenuCommand,
    output: NoData,
    successMessage: "Menu command executed",
  }),
  edit: defineRoute({
    channel: "menu:edit",
    input: EditCommand,
    output: NoData,
    successMessage: "Edit command executed",
  }),
};
