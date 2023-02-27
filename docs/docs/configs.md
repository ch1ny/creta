# 配置 creta

当以命令行方式运行 `creta` 时，creta 会自动解析项目根目录下名为 `creta.config.js` 的文件。
最基础的配置文件是这样的：

```js
// creta.config.js
module.exports = {
  // 配置项
};
```

## 配置智能提示
在修改配置项时，您可以从 `creta/types` 中获取 `defineConfig` 工具函数，用来包裹您的配置项，并配合您的 IDE 实现智能提示：

```js
const { defineConfig } = require('creta/types');

module.exports = defineConfig({
	viteConfig: {
		server: {
			port: 1420, // 配置 vite 调试时使用的端口
		},
	},
});

```
