import { contextBridge, ipcRenderer } from "electron";

const electronAPI = {
  user: {
    create: (payload: unknown) => {
      return ipcRenderer.invoke("user:create", payload);
    },
    list: () => {
      return ipcRenderer.invoke("user:list");
    },
  },
  auth: {
    login: (payload: unknown) => {
      return ipcRenderer.invoke("auth:login", payload);
    },
    logout: () => {
      return ipcRenderer.invoke("auth:logout");
    },
    status: () => {
      return ipcRenderer.invoke("auth:status");
    },
    currentUser: () => {
      return ipcRenderer.invoke("auth:currentUser");
    },
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
