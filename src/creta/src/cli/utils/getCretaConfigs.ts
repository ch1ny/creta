import type { Configuration } from 'electron-builder';
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { InlineConfig } from 'vite';
import constants from '../constants';

const DEFAULT_CONFIG_FILE_PREFIX = path.resolve(constants.scriptsCwd, 'creta.config');
const AVAILABLE_CONFIG_FILE_SUFFIX = ['js', 'ts', 'mjs', 'mts', 'cjs', 'cts'];

const getDefaultConfig = (): string => {
	for (const suffix of AVAILABLE_CONFIG_FILE_SUFFIX) {
		const resolvedConfigPath = `${DEFAULT_CONFIG_FILE_PREFIX}.${suffix}`;
		if (fs.existsSync(resolvedConfigPath)) {
			return resolvedConfigPath;
		}
	}
	return '';
};

const preBuildConfigFile = async (filePath: string, isEsm: boolean) => {
	const result = await build({
		entryPoints: [filePath],
		format: isEsm ? 'esm' : 'cjs',
		platform: 'node',
		sourcemap: false,
		target: ['node12'],
		write: false,
	});

	return {
		code: result.outputFiles[0].text,
	};
};

/**
 * 通过 Function 保证动态 import() 不会被编译成 resolve()
 */
const dynamicImport = new Function('file', 'return import(file)');
const loadConfigCode = async (configFile: string, builtCode: string, isEsm: boolean) => {
	if (isEsm) {
		const tmpConfigPath = path.resolve(__dirname, `creta.config.${Date.now()}.mjs`);
		fs.writeFileSync(tmpConfigPath, builtCode);
		try {
			// Only file and data URLs are supported by the default ESM loader. On Windows, absolute paths must be valid
			// 这里需要 file:// URLs.
			return await dynamicImport(pathToFileURL(tmpConfigPath));
		} catch (_) {
			console.log(_);
		} finally {
			try {
				fs.unlinkSync(tmpConfigPath);
			} catch {}
		}
	} else {
		const raw = require(configFile);
		return raw.__esModule ? raw.default : raw;
	}
};

const loadConfig = async (configPath?: string) => {
	const resolvedConfigPath = !!configPath ? path.resolve(configPath) : getDefaultConfig();
	if (!resolvedConfigPath) {
		return {};
	}

	const isEsm = /\.m[jt]s$/.test(resolvedConfigPath) || resolvedConfigPath.endsWith('.ts');

	try {
		const config = await preBuildConfigFile(resolvedConfigPath, isEsm);
		const result = await loadConfigCode(resolvedConfigPath, config.code, isEsm);
		return result.default;
	} catch (ex) {
		return {};
	}
};

interface IConfig {
	/**
	 * 是否使用 creta 轻量更新方案
	 * 若该项为 `false` 打包时不会触发更新包相关逻辑
	 */
	useCretaUpdater?: boolean;
	/**
	 * 构建产物输出目录
	 */
	outDir?: string;
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
export const getCretaConfigs = async () => {
	if (!cachedConfigs) {
		const config = await loadConfig();

		cachedConfigs = (() => {
			return config;
		})();
	}

	return cachedConfigs;
};
