const { contextBridge, ipcRenderer } = require("electron");

const electronAPI = {
  user: {
    create: (payload) => {
      return ipcRenderer.invoke("user:create", payload);
    },
    list: () => {
      return ipcRenderer.invoke("user:list");
    },
  },
  auth: {
    login: (payload) => {
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
  menu: {
    invoke: (command) => ipcRenderer.invoke("menu:invoke", command),
    edit: (command) => ipcRenderer.invoke("menu:edit", command),
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
