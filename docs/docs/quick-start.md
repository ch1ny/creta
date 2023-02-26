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

上图就是我们通过 `creta-cli` 新建的一个 creta 应用的初始目录结构。最外层主要是由 `config`、`public` 和 `src` 三个目录组成。

### config

![config目录结构](/assets/config-dir.webp)

其中，`config` 目录主要存放着项目的配置信息，包括开发配置以及打包配置。你可以通过引入我们提供的 `plugin` 来协助获取配置项的类型信息，辅助配置。

### public

![public目录结构](/assets/public-dir.webp)

`public` 目录被视作 `vite` 的 [`publicDir`](https://cn.vitejs.dev/config/shared-options.html#publicdir)，作为静态资源服务的文件夹。你可以在 `src/render/vite.config.ts` 中修改相关配置。

### src

![src目录结构](/assets/src-dir.webp)

`src` 目录是一个 creta 应用最核心的部分，它存放着我们应用的源码文件。对应着我们对 electron 应用三部分的划分，我们将 `src` 分割为了对应的三部分：

- `main`: 主进程源码
- `preload`: 预加载脚本源码
- `render`: 渲染进程源码

#### 主进程

主进程的入口位于 `src/main/core/bin.ts` 中，它是整个 electron 应用的入口文件，但是我们不建议您对它进行修改。您应该在 `src/main/index.ts` 中定义您自己的入口函数，并通过 `export default` 的方式将您的入口函数暴露出去。

#### 预加载脚本

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

#### 渲染进程

creta 的渲染进程使用 `vite` 进行构建，vite 配置文件位于 `src/render/vite.config.ts`。我们为项目添加了路径别名 `@`，它对应着目录 `src/render/`。并添加了 `css module` 相关配置以及针对 less 的预编译配置，您可以通过 `import styles from '*.module.less';` 进行使用。同样的，我们将相关配置暴露出来，也是希望开发者可以根据自身的需求进行**自定义**配置。

## 调试你的第一个 creta 项目

在了解完我们的项目基本的目录结构后，我们来尝试运行我们的 creta 程序。
首先，我们先在根目录下执行命令 `npm install` 或 `yarn` 来安装项目所需的依赖项。待所有依赖安装完毕后，我们在终端内执行 `npm run dev` 命令，它将为您唤起 vite 以及 electron 。

![默认creta应用](/assets/hello-creta.webp)

上图便是我们启动的默认 creta 应用，它自动创建了一个无边框窗口。下面我们尝试在渲染进程中修改代码，我们来到 `src/render/components/MainBody/index.tsx` 中，将 `Hello CRETA` 修改为 `My first creta app!`，保存，你便能看到更新后的应用界面。

![我的第一个creta应用](/assets/my-first-creta-app.webp)

## 将你的 creta 应用打包

当一切开发工作都完成后，你希望将你的 electron 应用打包成可执行程序并发布出去。在项目根目录下执行指令 `npm run dist`，它会将你的应用代码进行编译，并执行打包的相关逻辑，你只需要根据提示输入相关信息，即可得到打包后的应用程序。
下面是我们在 win32 平台上将应用打包为 x64 架构的应用的示例：

![win32-x64](/assets/dist-on-win32-x64.webp)

打包完毕后，你会在项目根目录的 `dist` 文件夹下找到构建后的可执行程序。
