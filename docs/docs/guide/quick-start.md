# 快速开始

> 本文将帮助您熟悉**creta**，达到快速开发的目的。

## 新建项目

> 我们推荐您通过 `npx` 使用本脚手架

使用 `creta` 创建可以非常方便地创建您的应用，只需要在终端输入如下指令并执行即可:

```bash
npx creta new my-app
```

![新建项目](/assets/new-app.webp)

根据提示输入信息，接下来您的目录中便会出现一个名为 `my-app` 的文件夹，其内部就是您的应用源码文件了。

:::tip
当然，您也可以通过全局安装的方式安装我们的依赖:
```bash
npm install -g creta
# 或
yarn global add creta

creta new my-app
```
但是我们不推荐您进行全局安装，在使用全局安装的脚手架时，部分指令可能并不能达到您需要的效果，因此我们推荐您通过 `npx` 来使用本脚手架。
:::

## 认识一下 creta 应用结构

![新建项目目录结构](/assets/new-project-dir.webp)

上图就是我们通过 `creta-cli` 新建的一个 creta 应用的初始目录结构。

`public` 目录被视作 `vite` 的 [`publicDir`](https://cn.vitejs.dev/config/shared-options.html#publicdir)，作为静态资源服务的文件夹。你可以通过 `creta.config.js` 修改 vite 相关配置。

![src目录结构](/assets/src-dir.webp)

我们应用的源码存放在 `src` 目录下，我们根据 electron 应用的三个主要部分将它分割为了对应的三个子目录：

- `main`: 主进程源码
- `preload`: 预加载脚本源码
- `renderer`: 渲染进程源码

### 主进程

主进程的入口位于 `src/main/core/bin.ts` 中，它是整个 electron 应用的入口文件，但是我们不建议您对它进行修改。您应该在 `src/main/index.ts` 中定义您自己的入口函数，并通过 `export default` 的方式将您的入口函数暴露出去。

### 预加载脚本

通过[预加载脚本](https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts)，您可以定义在您的窗口开始加载网页内容前应该加载哪些代码。它们运行在渲染进程当中，但是仍能访问 `Nodejs API` ，因此它们具有相对来说更多的权限。由于预加载脚本与渲染进程共享同一个全局 `Window` 接口，因此您可以在预加载脚本中向 `window` 暴露部分接口供其使用。

正如我们在模板中为您提供了这样的一个预加载脚本，它将 `electron.ipcRenderer` 挂载到了 `window` 对象上。

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

### 渲染进程

creta 的渲染进程使用 `vite` 进行构建，vite 配置文件被我们隐藏在了 `creta` 依赖当中，位于 `node_modules/creta/vite.config.ts`。我们为项目添加了路径别名 `@`，它对应着目录 `src/renderer/`。并添加了 `css modules` 相关配置，您可以通过 `import styles from '*.module.css';` 进行使用。我们已经为您的渲染进程添加了 `less` 以及 `sass` 依赖，您可以在项目中直接使用。

出于某种考量，我们没有选择将 vite 的配置文件直接暴露出来，但是你仍然可以在项目根目录下的 `creta.config.js` 中添加对应的配置项，以达到根据自身需求定制 vite 配置的目的。

## 调试你的第一个 creta 项目

在了解完我们的项目基本的目录结构后，我们来尝试运行我们的 creta 程序。
首先，我们先在根目录下执行命令 `npm install` 或 `yarn` 来安装项目所需的依赖项。待所有依赖安装完毕后，我们在终端内执行 `npm run dev` 命令，它将为您唤起 vite 以及 electron 。

![默认creta应用](/assets/hello-creta.webp)

上图便是我们启动的默认 creta 应用，它自动创建了一个无边框窗口。下面我们尝试在渲染进程中修改代码，我们来到 `src/renderer/components/MainBody/index.tsx` 中，将 `Hello CRETA` 修改为 `My first creta app!`，保存，你便能看到更新后的应用界面。

![我的第一个creta应用](/assets/my-first-creta-app.webp)

## 将你的 creta 应用打包

当一切开发工作都完成后，你希望将你的 electron 应用打包成可执行程序并发布出去。在项目根目录下执行指令 `npm run dist`，它会将你的应用代码进行编译，并执行打包的相关逻辑，你只需要勾选需要构建的目标平台，即可得到打包后的应用程序。
下面是我们在 win32 平台上将应用打包为 x64、ia32 架构的应用的示例：

![win32-x64](/assets/run-dist.webp)

creta 的打包基于 [`electron-builder`](https://github.com/electron-userland/electron-builder) ，我们提供了基本的配置，但您同样可以通过 [`creta.config.js`](/configs/all-configs.html#electronbuilderconfig) 定制属于您的打包方案。
