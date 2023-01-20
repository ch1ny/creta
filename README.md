# CRETA

[![npm version](https://badgen.net/npm/v/creta)](https://www.npmjs.com/package/creta) [![npm weekly download](https://badgen.net/npm/dw/creta)](https://www.npmjs.com/package/creta) [![github stars](https://badgen.net/github/stars/ch1ny/creta)](https://github.com/ch1ny/creta/stargazers)

<div style="width: 100%; display: flex; justify-content: center;">
  <img src="https://assets.kira.host/image/creta_logo_colored.svg" alt="LOGO" width="150" />
</div>

## 介绍 - Introduce

**creta** 全称 `create react-electron-typescript app`，是一款为了协助前端程序员快速搭建 **React + TypeScript** 的 **Electron** 应用的脚手架。

## 使用 - Usage

> 欢迎阅读我们提供的[使用手册](https://creta.kira.host/)

**creta** 使用起来非常方便，只需一行指令即可搭建出 React+TypeScript+Electron 三合一的应用模板。
使用该脚手架前需要保证在当前机器上已安装有 **NodeJS** 环境，不过我相信绝大多数前端程序员都以具备了这一条前置条件，因此这里我便默认阅读本文的各位已经能够执行后续的操作了。

### 使用脚手架创建项目 - Create your project with CRETA

我们建议用户直接通过 `npx` 来省略安装 CLI 的过程，直接创建您的应用：
```bash
npx creta new my-app
```

当然，您也可以将该脚手架作为全局依赖进行安装：

```bash
npm install creta -g
creta new my-app
```

### 开发项目 - Develop your app

我们的 `creta` 脚手架中内置了 `dev` 及 `dist` 指令，并在应用模板中自动添加了对应的 `npm scripts`。
您可以直接在应用根目录下执行：

```bash
npm run dev
```

以在开发模式下运行您的程序；

也可以执行：

```bash
npm run dist
```

将您的应用程序打包成exe。
