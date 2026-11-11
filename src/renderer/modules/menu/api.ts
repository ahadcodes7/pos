import { unwrap } from "@/renderer/lib/ipc";
import type { EditCommand, MenuCommand } from "@/shared/contracts/menu.contract";

export async function invokeMenuCommand(command: MenuCommand): Promise<void> {
  await unwrap(window.electronAPI.menu.invoke(command));
}

export async function invokeEditCommand(command: EditCommand): Promise<void> {
  await unwrap(window.electronAPI.menu.edit(command));
}
