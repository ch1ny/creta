interface IDevConfig {
	/**
	 * 前端调试时使用的端口号
	 */
	DEV_PORT?: number;
}

export const defineDevConfig = (config: IDevConfig) => config;
