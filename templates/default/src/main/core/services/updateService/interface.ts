export interface IUpdateService {
	/**
	 * 应用启动前检查是否存在可用的更新包
	 */
	beforeStartCheck: () => Promise<void>;
	exeUpdater: () => Promise<void>;
}
