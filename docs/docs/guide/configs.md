# 配置 creta

当以命令行方式运行 `creta` 时，creta 会自动解析项目根目录下名为 `creta.config.js` 的文件。
最基础的配置文件如下所示：

```js
// creta.config.js
module.exports = {
  // 配置项
};
```

如果您不喜欢这种写法，`creta` 还允许您使用 **ESM** 语法编写配置文件，我们会在加载您的配置文件之前进行预处理，就像下面这样：

```ts
// creta.config.ts
export default {
	// 配置项
};
```

## 配置智能提示
在修改配置项时，您可以从 `creta/plugins` 中获取 `defineConfig` 工具函数，用来包裹您的配置项，并配合您的 IDE 实现智能提示：

```ts
import { defineConfig } from 'creta/plugins';

export default defineConfig({
	viteConfig: {
		server: {
			port: 1420, // 配置 vite 调试时使用的端口
		},
	},
});
```

## 情景配置

如果您的配置文件需要根据不同模式（`development` 或 `production`）来决定导出，您可以选择导出下面这样的一个函数：

```ts
import { defineConfig } from 'creta/plugins';

export default defineConfig(({ mode }) => {
	if (mode === 'development') {
		return {
			viteConfig: {
				server: {
					port: 1420, // 配置 vite 调试时使用的端口
				},
			},
		};
	} else {
		return {
			useCretaUpdater: false, // 不使用 creta 的更新方案
		}
	}
});
```

## [完整配置](/configs/all-configs.html)
