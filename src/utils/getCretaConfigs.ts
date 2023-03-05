import path from 'path';
import type { InlineConfig } from 'vite';
import constants from '../constants';

interface IConfig {
	/**
	 * 编译结束后执行的脚本
	 * - **main**: 主进程编译完成后执行的脚本
	 * - **preload**: 预加载脚本编译完成后执行的脚本
	 * - **renderer**: 渲染进程编译完成后执行的脚本
	 */
	afterBuildScripts: {
		main?: string;
		preload?: string;
		renderer?: string;
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
	 * 当主进程或预加载脚本代码发生改变时，
	 * 立即编译代码并重启 electron 应用，
	 * 默认为 true
	 */
	relaunchOnChange?: boolean;
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

let cachedConfigs: IConfig;

/**
 * 获取配置文件中真正的脚本路径
 */
export const getCretaConfigs = () => {
	if (!cachedConfigs) {
		const configPath = path.resolve(constants.scriptsCwd, 'creta.config.js');
		cachedConfigs = (() => {
			try {
				return require(configPath);
			} catch (e) {
				return {};
			}
		})();
	}

	return cachedConfigs;
};
