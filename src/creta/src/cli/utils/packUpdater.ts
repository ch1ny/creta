import chalk from 'chalk';
import cp from 'child_process';
import type { AfterPackContext as PackContext } from 'electron-builder';
import fse from 'fs-extra';
import path from 'path';

import constants from '../constants';
import { getCretaConfigs } from './getCretaConfigs';

const { binDir, scriptsCwd } = constants;

enum Arch {
	ia32 = 0,
	x64 = 1,
	armv7l = 2,
	arm64 = 3,
	universal = 4,
}
const ArchName = ['ia32', 'x64', 'armv7l', 'arm64', 'universal'];

async function packUpdaterOnWin32(appOutDir: string, arch: Arch, outDir: string) {
	console.log(chalk.bold.blueBright('7. 复制更新器'));
	await fse.copyFile(
		path.resolve(binDir, 'exe', 'win32', 'updater.exe'),
		path.resolve(appOutDir, 'updater.exe')
	);

	console.log(chalk.bold.blueBright('8. 生成更新文件'));
	console.log(chalk.blueBright('8.1 复制需要更新的文件'));
	const { updateFilesPath = {} } = await getCretaConfigs();

	const archName = ArchName[arch];
	let files: string[];
	if (!!updateFilesPath['win32'] && !Array.isArray(updateFilesPath['win32'])) {
		files = updateFilesPath['win32'][archName] || [];
	} else {
		files = updateFilesPath['win32'] || [];
	}

	await Promise.all(
		files.map((file) => fse.ensureDir(path.dirname(path.resolve(scriptsCwd, 'update', file))))
	);

	await Promise.all(
		files.map((file) =>
			fse.copyFile(path.resolve(appOutDir, file), path.resolve(scriptsCwd, 'update', file))
		)
	);

	console.log(chalk.blueBright('8.2 制作更新包'));
	const eupName = `update-win32-${archName}.eup`;
	cp.execSync(`creta eup update ${path.resolve(outDir, eupName)}`, { cwd: scriptsCwd });
	await fse.remove(path.resolve(scriptsCwd, 'update'));
}

async function packUpdaterOnDarwin(appOutDir: string, arch: Arch, outDir: string) {
	console.log(chalk.bold.blueBright('7. 复制更新器'));
	await fse.copyFile(
		path.resolve(binDir, 'exe', 'darwin', 'updater'),
		path.resolve(appOutDir, 'Contents', 'updater')
	);

	console.log(chalk.bold.blueBright('8. 生成更新文件'));
	console.log(chalk.blueBright('8.1 复制需要更新的文件'));
	const dirname = path.resolve(appOutDir, 'Contents');
	const { updateFilesPath = {} } = await getCretaConfigs();

	const archName = ArchName[arch];
	let files: string[];
	if (!!updateFilesPath['darwin'] && !Array.isArray(updateFilesPath['darwin'])) {
		files = updateFilesPath['darwin'][archName] || [];
	} else {
		files = updateFilesPath['darwin'] || [];
	}

	await Promise.all(
		files.map((file) => fse.ensureDir(path.dirname(path.resolve(scriptsCwd, 'update', file))))
	);

	await Promise.all(
		files.map((file) =>
			fse.copyFile(path.resolve(dirname, file), path.resolve(scriptsCwd, 'update', file))
		)
	);

	console.log(chalk.blueBright('8.2 制作更新包'));
	const eupName = `update-darwin-${archName}.eup`;
	cp.execSync(`creta eup update ${path.resolve(outDir, eupName)}`, { cwd: scriptsCwd });
	cp.execSync(`rm -rf ${path.resolve(scriptsCwd, 'update')}`);
}

export const packUpdater = async (context: PackContext) => {
	const { appOutDir, arch, electronPlatformName, outDir, packager } = context;

	switch (electronPlatformName) {
		case 'darwin':
			await packUpdaterOnDarwin(
				path.resolve(appOutDir, `${packager.appInfo.productFilename}.app`),
				arch,
				outDir
			);
			break;
		case 'win32':
			await packUpdaterOnWin32(appOutDir, arch, outDir);
			break;
		default:
			// no-op;
			console.log(
				chalk.yellow('[WARN]'),
				'暂不支持',
				chalk.magenta(`'${electronPlatformName}'`),
				'平台'
			);
	}
};
