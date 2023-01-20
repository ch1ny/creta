declare module '*.less' {
	const styles: { readonly [key: string]: string };
	export default styles;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.gif';

declare interface Window {
	ipc: {
		on: (channel: string, cb: Function) => void;
		once: (channel: string, cb: Function) => void;
		removeListener: (channel: string, cb: Function) => void;
		removeAllListeners: (channel: string) => void;
		send: (channel: string, ...args: any[]) => void;
		invoke: (channel: string, ...args: any[]) => Promise<any>;
		sendSync: (channel: string, ...args: any[]) => void;
		postMessage: (channel: string, message: any, transfer?: MessagePort[]) => void;
		sendTo: (webContentsId: number, channel: string, ...args: any[]) => void;
		sendToHost: (channel: string, ...args: any[]) => void;
	};
}
