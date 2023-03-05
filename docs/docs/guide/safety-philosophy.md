# creta 的安全哲学

我们先来简单了解一下 electron 应用的工作原理。electron 是一个基于 Chromium 和 NodeJS 的跨平台桌面应用开发构建框架，这意味着我们需要同时开发 NodeJS 和浏览器两套环境的代码。

当一个 electron 程序运行时，它会首先启动运行在 NodeJS 环境的**主进程脚本**，它是整个应用的核心，你将通过它与系统交互。在主进程中，你可以调用 electron 提供的 API 创建应用窗口。你可以将这些窗口理解成一个 Chrome 浏览器，你的页面代码将运行在这个窗口中，我们称之为**渲染进程**。

但是，渲染进程终究是传统的 web 代码，我们无法绕过浏览器的安全策略直接与系统交互（比如自由地在硬盘上读写文件），一切与系统相关的操作都需要由主进程来完成。要完成这一点，就必须要让渲染进程调用 electron 提供的系统 API。这就引出了一个问题 —— **主进程运行于 NodeJS，而渲染进程运行在浏览器中，应该要如何让两个不同的环境发生交互？**

很多开发者采用的策略是开启 **node 集成**(`nodeIntegration`)并关闭**上下文隔离**(`contextIsolation`)，以使得渲染进程能够直接调用在 Node 环境才能使用的 API。诚然，这种做法会带来一定的开发效率，但是这是非常危险的做法，因为 electron 提供了很多强大的原生能力。

:::tip **不妨设想一下这样一种情况**
假如我们的 electron 应用访问了一个危险站点，它使用了一些恶意的脚本调用了 electron 的一些系统能力，而我们关闭了上下文隔离使得这些恶意脚本的执行畅通无阻，它能够肆无忌惮地访问并修改用户电脑中的所有文件。这将会带来灾难性的后果，而开发了这样的危险的应用的你，也完全不可能摆脱干系。
:::

## electron 主进程与渲染进程通信最佳实践

事实上，我们可以通过**预加载脚本**，提前将一些特定的功能接口暴露给渲染进程。就像 creta 提供的默认模板那样：

```ts
// src/preload/preload.ts
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
```
```ts
// src/renderer/global.d.ts
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
```

我们通过预加载脚本，将 `ipcRenderer` 的所有 API 挂载到了渲染进程 `Window` 接口的 `ipc` 对象上，同时我们在渲染进程的 `global.d.ts` 中重新声明了 `Window` 接口。这样一来，我们便能在渲染进程中，直接通过 `window.ipc` 来调用 IpcRenderer 的所有功能，同时避免了暴露一些危险系数极大的系统级 API 。

你会看到，creta 的设计思路将会完全遵循它的安全哲学。
