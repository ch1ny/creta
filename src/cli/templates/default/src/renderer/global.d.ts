import type { IpcRendererEvent } from 'electron';

declare global {
	declare module '*.module.css' {
		const styles: { readonly [key: string]: string };
		export default styles;
	}
	declare module '*.module.less' {
		const styles: { readonly [key: string]: string };
		export default styles;
	}
	declare module '*.module.scss' {
		const styles: { readonly [key: string]: string };
		export default styles;
	}

	declare module '*.png';
	declare module '*.jpg';
	declare module '*.gif';

	declare interface Window {
		ipcRenderer: {
			on: (channel: string, cb: (evt: IpcRendererEvent, ...args: any[]) => any) => void;
			once: (channel: string, cb: (evt: IpcRendererEvent, ...args: any[]) => any) => void;
			removeListener: (channel: string, cb: (...args: any[]) => any) => void;
			removeAllListeners: (channel: string) => void;
			send: (channel: string, ...args: any[]) => void;
			invoke: (channel: string, ...args: any[]) => Promise<any>;
			sendSync: (channel: string, ...args: any[]) => void;
			postMessage: (channel: string, message: any, transfer?: MessagePort[]) => void;
			sendTo: (webContentsId: number, channel: string, ...args: any[]) => void;
			sendToHost: (channel: string, ...args: any[]) => void;
		};
	}
}
