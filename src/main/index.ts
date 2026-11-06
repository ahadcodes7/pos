import { app } from "electron";
import { bootstrapApp } from "./app";
import { config } from "dotenv";
import { logError } from "./errors/error-handler";

config();

// Errors outside IPC (IPC failures go through errors/error-handler.ts toFailure).
// uncaughtException is left to Electron's default handling.
process.on("unhandledRejection", (reason) => logError("Unhandled promise rejection", reason));

bootstrapApp();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
