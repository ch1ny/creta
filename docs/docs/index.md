# 快速开始

## creta

> creta = create **React + Electron + TypeScript** app

[Creta](https://github.com/ch1ny/creta) 全称 `create React + Electron + TypeScript app`，是一款为了协助前端开发者快速搭建基于 React.js + TypeScript 的 Electron 应用模板的脚手架工具。

本文将帮助您熟悉**creta**，达到快速开发的目的。

## 新建项目

> 我们推荐您通过 `npx` 使用本脚手架

使用 `creta` 创建可以非常方便地创建您的应用，只需要在终端输入如下指令并执行即可:

```bash
npx creta new my-app
```

接下来您的目录中便会出现一个名为 `my-app` 的文件夹，其内部就是您的应用源码文件了。

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

## 开发与打包

`creta` 内置了 `dev` 和 `dist` 指令，同时在初始化应用模板时已经为应用添加了对应的 `npm scripts`，保障了使用者的开发效率。

我们继续上面的名为 `my-app` 的项目，接下来我们先进入到应用的根目录下：
```bash
cd my-app
```

接下来在根目录下执行 `npm run dev` 指令即可在开发模式下预览您的应用。

当您完成开发后，可以执行 `npm run dist` 指令将您的代码构建为可执行文件。
