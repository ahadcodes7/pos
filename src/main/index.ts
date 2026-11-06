import { app } from "electron";
import { bootstrapApp } from "./app";
import { config } from "dotenv";

config();

bootstrapApp();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
