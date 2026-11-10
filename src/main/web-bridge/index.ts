import { config } from "dotenv";
import { createBridgeServer } from "./server";

config();

const port = Number(process.env.WEB_BRIDGE_PORT);
if (!Number.isInteger(port) || port <= 0) throw new Error("WEB_BRIDGE_PORT is not set");

createBridgeServer().listen(port, "127.0.0.1", () => {
  console.log(`Web auth bridge listening on 127.0.0.1:${port}`);
});
