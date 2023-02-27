import path from 'path';
import constants from '../constants';

/**
 * 获取配置文件中真正的脚本路径
 */
export const getResolvedScriptsPathRelativeToConfigDir = (relativePath: string) => {
	const configDir = path.resolve(constants.scriptsCwd, 'config');
	return path.resolve(configDir, relativePath);
};
