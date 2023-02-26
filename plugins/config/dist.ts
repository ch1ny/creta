interface IDistConfig {
	/**
	 * 对应平台下更新包需要打包的文件
	 */
	UPDATE_FILES_PATH?: Record<'win32' | 'darwin' | 'linux', string[]>;
	/**
	 * 是否需要自定义更新方案
	 * 若该项为 `true` 打包时不会触发更新包相关逻辑
	 */
	CUSTOM_UPDATER?: boolean;
}

export const defineDistConfig = (config: IDistConfig) => config;
