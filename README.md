# CRETA

## 介绍 - Introduce

**creta** 全称 `create react-electron-typescript app`，是一款为了协助前端程序员快速搭建 **React + TypeScript** 的 **Electron** 应用的脚手架。

## 使用 - Usage

**creta** 使用起来非常方便，只需一行指令即可搭建出 React+TypeScript+Electron 三合一的应用模板。
使用该脚手架前需要保证在当前机器上已安装有 **NodeJS** 环境，不过我相信绝大多数前端程序员都以具备了这一条前置条件，因此这里我便默认阅读本文的各位已经能够执行后续的操作了。

### 使用脚手架创建项目 - Create your project with this CRETA

我们建议用户直接通过 `npx` 来省略安装 CLI 的过程，直接创建您的应用：
```bash
npx creta new [projectName]
```

当然，您也可以将该脚手架作为全局依赖进行安装：
```bash
npm install creta -g
creta new [projectName]
```
