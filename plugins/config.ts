import type { InlineConfig } from 'vite';

interface IConfig {
	/**
	 * 编译结束后执行的脚本
	 */
	afterBuildScripts: {
		/**
		 * 主进程编译完成后执行的脚本
		 */
		main?: string;
		/**
		 * 预加载脚本编译完成后执行的脚本
		 */
		preload?: string;
		/**
		 * 渲染进程编译完成后执行的脚本
		 */
		render?: string;
	};
	/**
	 * 打包完成后执行的脚本
	 */
	afterDist?: string;
	/**
	 * 代码完成编译后，
	 * 准备打包前执行的脚本
	 */
	beforeDist?: string;
	/**
	 * 是否需要自定义更新方案
	 * 若该项为 `true` 打包时不会触发更新包相关逻辑
	 */
	customUpdater?: boolean;
	/**
	 * 对应平台下更新包需要打包的文件
	 */
	updateFilesPath?: {
		win32?: string[];
		darwin?: string[];
		linux?: string[];
	};
	/**
	 * vite 配置
	 */
	viteConfig?: Omit<InlineConfig, 'configFile'>;
}

export const defineConfig = (config: IConfig) => config;
