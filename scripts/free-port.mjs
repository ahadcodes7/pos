import net from "node:net";

// True if anything accepts a connection on host:port.
function isListening(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    socket.setTimeout(300);
    socket.once("connect", () => (socket.destroy(), resolve(true)));
    socket.once("timeout", () => (socket.destroy(), resolve(false)));
    socket.once("error", () => resolve(false));
  });
}

/**
 * First port >= start with nothing listening on 127.0.0.1 or ::1. Both are checked because
 * another server may hold the port on a different address (e.g. 0.0.0.0 vs ::1), which
 * Vite's own port check does not detect.
 */
export async function findFreePort(start) {
  for (let port = start; port < start + 100; port++) {
    const taken = (await isListening("127.0.0.1", port)) || (await isListening("::1", port));
    if (!taken) return port;
  }
  throw new Error(`No free port in ${start}-${start + 99}`);
}
