import { app } from 'electron';
import path from 'path';
import { parseArgvArrayToJson, parseSingleArgv } from './core/utils';

export const IS_PACKAGED = app.isPackaged;

export const EXE_PATH = app.getPath('exe');
/**
 * exe 所在的文件夹目录，
 * 例 exe 的完整路径为
 * D:/文件夹/electron.exe
 * 则 EXE_DIR 的值为
 * D:/文件夹
 */
export const EXE_DIR = path.dirname(EXE_PATH);

/**
 * app.asar 根目录，对应开发环境下的 build 文件夹
 */
export const ASAR_ROOT_PATH = path.resolve(__dirname, '..');

export const PRELOAD_DIR = path.resolve(ASAR_ROOT_PATH, 'preload');

export const ARGS = parseArgvArrayToJson(process.argv.slice(2).map(parseSingleArgv));

export const screenSize: {
	width?: number;
	height?: number;
} = {};
