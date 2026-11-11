import { unwrap } from "@/renderer/lib/ipc";
import type { WindowChrome } from "@/shared/contracts/chrome.contract";

export async function setWindowChrome(chrome: WindowChrome): Promise<void> {
  await unwrap(window.electronAPI.chrome.set(chrome));
}
