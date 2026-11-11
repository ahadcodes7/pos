import http, { type IncomingMessage, type ServerResponse } from "node:http";
import type { IpcMainInvokeEvent } from "electron";
import { authRoutes } from "@/shared/contracts/auth.contract";
import type { IpcFailure, RouteDef } from "@/shared/ipc/contract";
import ApiError from "../errors/api-error";
import { toFailure } from "../errors/error-handler";
import { executeRoute, type RouteHandler } from "../ipc/execute";
import { authHandlers } from "../modules/auth/auth.routes";

export const BRIDGE_PATH = "/__bridge/";
const MAX_BODY_BYTES = 64 * 1024;

// Only auth is reachable from the browser. Handlers never read the IPC event.
const noIpcEvent = {} as IpcMainInvokeEvent;
const handlers = authHandlers as Record<string, RouteHandler<RouteDef>>;
const routes = new Map<string, { route: RouteDef; handler: RouteHandler<RouteDef> }>();
for (const [name, route] of Object.entries(authRoutes)) {
  const handler = handlers[name];
  if (!handler) throw new Error(`No handler for auth route ${name}`);
  routes.set(route.channel, { route, handler });
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function refuse(res: ServerResponse, status: number, err: ApiError, channel: string) {
  const failure: IpcFailure = toFailure(err, channel);
  send(res, status, failure);
}

/** Why the request must not reach a route, or null. Blocks other websites and non-API callers. */
function rejection(req: IncomingMessage): { status: number; error: ApiError } | null {
  if (req.method !== "POST") return { status: 405, error: ApiError.badRequest("Use POST") };
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.startsWith("application/json")) {
    return { status: 415, error: ApiError.badRequest("Content-Type must be application/json") };
  }
  const site = req.headers["sec-fetch-site"];
  if (site !== undefined && site !== "same-origin") {
    return { status: 403, error: ApiError.forbidden("Cross-site requests are not allowed") };
  }
  return null;
}

function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    req.on("end", () => resolve(size > MAX_BODY_BYTES ? null : Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const pathname = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
  const channel = pathname.startsWith(BRIDGE_PATH) ? decodeURIComponent(pathname.slice(BRIDGE_PATH.length)) : "";

  const rejected = rejection(req);
  if (rejected) return refuse(res, rejected.status, rejected.error, channel);

  const target = routes.get(channel);
  if (!target) return refuse(res, 404, ApiError.notFound("This action is not available in the browser"), channel);

  const raw = await readBody(req);
  if (raw === null) return refuse(res, 413, ApiError.badRequest("Request is too large"), channel);

  let payload: unknown;
  try {
    payload = raw === "" ? undefined : JSON.parse(raw);
  } catch {
    return refuse(res, 400, ApiError.badRequest("Request body is not valid JSON"), channel);
  }

  // Replies keep the IPC envelope; failures are data for the renderer, as they are over IPC.
  send(res, 200, await executeRoute(target.route, target.handler, payload, noIpcEvent));
}

/** HTTP server exposing the auth routes to a browser during development. Bind it to loopback only. */
export function createBridgeServer() {
  return http.createServer((req, res) => {
    handle(req, res).catch((err: unknown) => send(res, 500, toFailure(err, "web-bridge")));
  });
}
