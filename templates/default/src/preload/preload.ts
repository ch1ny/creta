import { contextBridge, ipcRenderer } from 'electron';

declare type IpcRendererHandler = (event: Electron.IpcRendererEvent, ...args: any[]) => void;

contextBridge.exposeInMainWorld('ipc', {
	...ipcRenderer,
	on: (channel: string, cb: IpcRendererHandler) => {
		ipcRenderer.on(channel, cb);
	},
	once: (channel: string, cb: IpcRendererHandler) => {
		ipcRenderer.once(channel, cb);
	},
	removeListener: (channel: string, cb: IpcRendererHandler) => {
		ipcRenderer.removeListener(channel, cb);
	},
});
