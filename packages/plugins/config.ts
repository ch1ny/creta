import type { Configuration } from 'electron-builder';
import type { InlineConfig } from 'vite';

interface IConfig {
	/**
	 * electron-builder 配置项
	 */
	electronBuilderConfig?: Configuration;
	/**
	 * 当主进程或预加载脚本代码发生改变时，
	 * 立即编译代码并重启 electron 应用，
	 * 默认为 true
	 */
	electronFastReload?: boolean;
	/**
	 * 对应平台下更新包需要打包的文件
	 */
	updateFilesPath?: {
		win32?:
			| string[]
			| {
					ia32?: string[];
					x64?: string[];
			  };
		darwin?:
			| string[]
			| {
					ia32?: string[];
					x64?: string[];
					arm64?: string[];
					armv7l?: string[];
					universal?: string[];
			  };
		linux?:
			| string[]
			| {
					x64?: string[];
					arm64?: string[];
					armv7l?: string[];
			  };
	};
	/**
	 * 是否使用 creta 轻量更新方案
	 * 若该项为 `false` 打包时不会触发更新包相关逻辑
	 */
	useCretaUpdater?: boolean;
	/**
	 * vite 配置
	 */
	viteConfig?: Omit<InlineConfig, 'configFile'>;
}

type TDefineConfigFn = (params: { mode: 'development' | 'production' }) => IConfig;

export const defineConfig = (param: IConfig | TDefineConfigFn) => {
	if (typeof param !== 'function') return param;

	return param({
		mode: process.env.CRETA_ENV as 'development' | 'production',
	});
};
