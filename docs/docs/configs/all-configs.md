# 完整配置

## electronBuilderConfig

`electron-builder` build 配置，用于 `dist` 命令构建应用分发版本。creta 已做好一定程度的预配置，您可以向 `creta.config.js` 的 `electronBuilderConfig` 加入配置来覆盖我们的原有配置。

 creta 默认的部分配置项如下，完整配置可参考 [`electron-builder`](https://github.com/electron-userland/electron-builder) 。：

```js
{
  electronBuilderConfig: {
    productName: 'creta-app', // 应用名
    appId: 'org.creta.app', // 应用 id
    copyright: `Copyright © ${new Date().getFullYear()}`, // 版权信息
    asar: true, // 使用 asar
    asarUnpack: '**/*.{node,dll}', // 不使用 asar 封包的文件
    files: ['build'], // 需要打包的文件
    compression: 'maximum', // 压缩等级
    nsis: { // nsis 相关配置
      oneClick: false, // 一键安装
      allowElevation: true, // 允许权限提升
      allowToChangeInstallationDirectory: true, // 允许更换安装目录
      createDesktopShortcut: true, // 创建桌面快捷方式
      createStartMenuShortcut: false, // 创建开始菜单快捷方式
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64', 'ia32'],
        },
      ],
    },
    linux: {
      target: ['AppImage'],
      category: 'Development',
    },
    mac: {
      target: {
        target: 'default',
        arch: ['arm64', 'x64'],
      },
      type: 'distribution',
      hardenedRuntime: true,
      entitlements: 'assets/entitlements.mac.plist',
      entitlementsInherit: 'assets/entitlements.mac.plist',
      gatekeeperAssess: false,
    },
    dmg: {
      contents: [
        {
          x: 130,
          y: 220,
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications',
        },
      ],
    },
    directories: {
      output: 'dist', // 导出至 dist
    },
    afterPack: async (ctx) => {
      // 如果开发者设置了自行更新则不打包更新包及安装程序
      if (useCretaUpdater) {
        packUpdater(ctx);
      }
      
      // 解析 creta.config 中的 afterPack 并执行
      const afterPack = resolveFunction(userConfigAfterPack, 'afterPack');
      if (afterPack != null) {
        await afterPack(ctx);
      }
    },
  }
}
```

## electronFastReload

当主进程或预加载脚本代码发生改变时，立即编译代码并重启 electron 应用，默认值为 `true`。

## useCretaUpdater

是否使用 creta 轻量更新方案，若该项为 `false` 打包时不会触发更新包相关逻辑。默认值为 `true`。

## updateFilesPath

对应平台及架构下更新包需要打包的文件，该配置项仅在 [`useCretaUpdater`](/configs/all-configs.html#usecretaupdater) 设置为 `true` 时起作用。
支持平台包括 `win32`、`darwin`、`linux`，支持架构包括 `ia32`, `x64`, `armv7l`, `arm64`, `universal` 。
配置格式如下，键为平台名，值为需要打包进更新包的文件路径。也可以根据不同架构进行进一步定制。
```js
{
  updateFilesPath: {
    win32: ['resources/app.asar'],
  },
}
// 或
{
  updateFilesPath: {
    win32: {
      ia32: ['resources/app.asar'],
      x64: ['resources/app.asar']
    },
  },
}
```

## viteConfig

vite 相关配置，完整配置请参阅 [配置 Vite](https://cn.vitejs.dev/config/) 。
creta 默认 `vite.config.ts` 内容如下，用户可通过 `viteConfig` 覆盖默认配置。

```ts
// cSpell: disable-next-line
// @ts-nocheck
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

const PROJECT_ROOT_DIR = process.cwd();

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(PROJECT_ROOT_DIR, 'src', 'renderer'),
    },
  },
  publicDir: path.resolve(PROJECT_ROOT_DIR, 'public'),
  root: path.resolve(PROJECT_ROOT_DIR, 'src', 'renderer'),
  build: {
    outDir: path.resolve(PROJECT_ROOT_DIR, 'build', 'renderer'),
  },
  css: {
    //* css模块化
    modules: {
      // css模块化 文件以.module.[css|less|scss]结尾
      generateScopedName: '[name]_[hash:base64:5]',
      hashPrefix: 'prefix',
    },
  },
});
```

## 完整配置参考

```js
{
  electronBuilderConfig: {
    productName: 'creta-app',
    appId: 'org.creta.app',
    copyright: `Copyright © ${new Date().getFullYear()}`,
    asar: true,
    asarUnpack: '**\\*.{node,dll}',
    files: ['build'],
    compression: 'maximum',
    nsis: {
      oneClick: false,
      allowElevation: true,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: false,
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64', 'ia32'],
        },
      ],
    },
    linux: {
      target: ['AppImage'],
      category: 'Development',
    },
    mac: {
      target: {
        target: 'default',
        arch: ['arm64', 'x64'],
      },
      type: 'distribution',
      hardenedRuntime: true,
      entitlements: 'assets/entitlements.mac.plist',
      entitlementsInherit: 'assets/entitlements.mac.plist',
      gatekeeperAssess: false,
    },
    dmg: {
      contents: [
        {
          x: 130,
          y: 220,
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications',
        },
      ],
    },
    directories: {
      output: 'dist',
    },
  },
  electronFastReload: true,
  updateFilesPath: {
		win32: ['resources/app.asar'],
		darwin: [
			'Frameworks/ReactElectronTypescriptTemplate Helper (GPU).app/Contents/info.plist',
			'Frameworks/ReactElectronTypescriptTemplate Helper (Plugin).app/Contents/Info.plist',
			'Frameworks/ReactElectronTypescriptTemplate Helper (Renderer).app/Contents/Info.plist',
			'Frameworks/ReactElectronTypescriptTemplate Helper.app/Contents/Info.plist',
			'Info.plist',
			'Resources/app.asar',
			'Resources/electron.icns',
		],
  },
  useCretaUpdater: true,
  viteConfig: {
    server: {
      port: 1420,
    },
    css: {
      //* css模块化
      modules: {
        // css模块化 文件以.module.[css|less|scss]结尾
        generateScopedName: '[name]_[hash:base64:5]',
        hashPrefix: 'prefix',
      },
    },
  },
}
```
