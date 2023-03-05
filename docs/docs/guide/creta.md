# 什么是 creta

<div style="width: 100%; display: flex; justify-content: center;">
  <img src="https://assets.kira.host/image/creta_logo_colored.svg" alt="LOGO" width="150" />
</div>

<div style="width: 100%; display: flex;">
  <a href="https://www.npmjs.com/package/creta">
    <img src="https://badgen.net/npm/v/creta" alt="npm version" />
  </a>
  &nbsp;
  <a href="https://www.npmjs.com/package/creta">
    <img src="https://badgen.net/npm/dw/creta" alt="npm weekly download" />
  </a>
  &nbsp;
  <a href="https://github.com/ch1ny/creta/stargazers">
    <img src="https://badgen.net/github/stars/ch1ny/creta" alt="github stars" />
  </a>
</div>

[Creta](https://github.com/ch1ny/creta) 全称 `create React + Electron + TypeScript app`，是一款为了协助前端开发者快速搭建基于 React.js + TypeScript 的 Electron 应用模板的脚手架工具。

creta 由三部分组成：
- 第一部分是[creta脚手架CLI](https://github.com/ch1ny/creta/tree/master/src)，它包含**新建项目**、**开发模式调试**以及**构建打包**三大功能模块。
- 第二部分是[creta-updater](https://github.com/ch1ny/creta/tree/master/creta-updater)，它是由 Rust 编写的 `eup`（基于 Deflate算法的应用更新包）压缩及解压程序，被 `creta` 用来作为默认的应用更新方案工具。
- 第三部分是我们提供的一些[插件](https://github.com/ch1ny/creta/tree/master/plugins)，在开发时为用户提高一定的开发体验。

## 它是如何工作的

事实上，`creta` 为开发者提供了基本的项目模板，在使用 `creta` 新建项目之后，开发者可以直接通过我们提供的模板进行开发。

一个 electron 应用主要由三部分组成，基于 `Node.js` 的主进程部分、基于 web 开发的渲染进程部分，以及预加载脚本。我们的模板中分别为用户在 `src` 目录下创建了三个子目录，主进程、预加载脚本、渲染进程的代码对应着 `main`、`preload` 和 `renderer`。

三个部分都已配置好基本的 typescript 开发环境，其中渲染程序则额外包含了 `React.js` 的相关依赖，并使用 `vite` 进行构建，同时我们也已为您做好了 `module.css` 的相关配置。

当您通过 `creta` 提供的调试脚本进行调试时，我们会对您的 ts 代码进行编译，并为您依次启动 vite 与 electron。当您尝试打包您的应用时，我们会根据您提供的信息将您的应用打包成可执行文件，并为您制作好更新包。
