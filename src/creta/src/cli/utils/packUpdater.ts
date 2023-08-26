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

async function packUpdaterOnWin32(
	appOutDir: string,
	arch: Arch,
	outDir: string,
	appVersion: string
) {
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

	files = Array.from(
		new Set(
			files.concat([
				// 默认需要打包的文件
				'resources/app.asar',
			])
		)
	);

	const unpackedUpdateDir = path.resolve(constants.cretaRootDir, 'update');
	await fse.remove(unpackedUpdateDir).catch(() => -1);

	await Promise.all(
		files.map((file) =>
			fse
				.ensureFile(path.resolve(appOutDir, file))
				.then(() =>
					fse
						.ensureDir(path.dirname(path.resolve(unpackedUpdateDir, file)))
						.then(() =>
							fse.copyFile(path.resolve(appOutDir, file), path.resolve(unpackedUpdateDir, file))
						)
						.catch((error) => {
							// 目标目录创建失败
							console.log(
								chalk.yellow.bold('[WARN]'),
								chalk.yellow(
									`Can't create directory named "${path.dirname(
										path.resolve(unpackedUpdateDir, file)
									)}" 'cause:`
								)
							);
							console.log(error);
						})
				)
				.catch(() => {
					// 待拷贝的文件不存在
					console.log(
						chalk.yellow.bold('[WARN]'),
						chalk.yellow(
							`File "${path.resolve(appOutDir, file)}" won't be copied 'cause it doesn't exist.`
						)
					);
				})
		)
	);

	console.log(chalk.blueBright('8.2 制作更新包'));
	const eupName = `update-win32-${archName}-v${appVersion}.eup`;
	cp.execSync(`creta eup update ${path.resolve(outDir, eupName)}`, { cwd: scriptsCwd });
	await fse.remove(unpackedUpdateDir).catch(() => -1);
}

async function packUpdaterOnDarwin(
	appOutDir: string,
	arch: Arch,
	outDir: string,
	appVersion: string,
	productFilename: string
) {
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

	files = Array.from(
		new Set(
			files.concat([
				// 默认需要打包的文件
				`Frameworks/${productFilename} Helper (GPU).app/Contents/info.plist`,
				`Frameworks/${productFilename} Helper (Plugin).app/Contents/Info.plist`,
				`Frameworks/${productFilename} Helper (Renderer).app/Contents/Info.plist`,
				`Frameworks/${productFilename} Helper.app/Contents/Info.plist`,
				'Info.plist', // 右键显示简介版本号
				'Resources/app.asar', // 应用资源
				'Resources/electron.icns', // 图标文件
			])
		)
	);

	const unpackedUpdateDir = path.resolve(constants.cretaRootDir, 'update');
	await fse.remove(unpackedUpdateDir).catch(() => -1);

	await Promise.all(
		files.map((file) =>
			fse
				.ensureFile(path.resolve(appOutDir, file))
				.then(() =>
					fse
						.ensureDir(path.dirname(path.resolve(unpackedUpdateDir, file)))
						.then(() =>
							fse.copyFile(path.resolve(dirname, file), path.resolve(unpackedUpdateDir, file))
						)
						.catch((error) => {
							// 目标目录创建失败
							console.log(
								chalk.yellow.bold('[WARN]'),
								chalk.yellow(
									`Can't create directory named "${path.dirname(
										path.resolve(unpackedUpdateDir, file)
									)}" 'cause:`
								)
							);
							console.log(error);
						})
				)
				.catch(() => {
					// 待拷贝的文件不存在
					console.log(
						chalk.yellow.bold('[WARN]'),
						chalk.yellow(
							`File "${path.resolve(appOutDir, file)}" won't be copied 'cause it doesn't exist.`
						)
					);
				})
		)
	);

	console.log(chalk.blueBright('8.2 制作更新包'));
	const eupName = `update-darwin-${archName}-v${appVersion}.eup`;
	cp.execSync(`creta eup update ${path.resolve(outDir, eupName)}`, { cwd: scriptsCwd });
	await fse.remove(unpackedUpdateDir).catch(() => -1);
}

export const packUpdater = async (context: PackContext) => {
	const { appOutDir, arch, electronPlatformName, outDir, packager } = context;

	switch (electronPlatformName) {
		case 'darwin':
			await packUpdaterOnDarwin(
				path.resolve(appOutDir, `${packager.appInfo.productFilename}.app`),
				arch,
				outDir,
				packager.appInfo.version,
				packager.appInfo.productFilename
			);
			break;
		case 'win32':
			await packUpdaterOnWin32(appOutDir, arch, outDir, packager.appInfo.version);
			break;
		default:
			// no-op;
			console.log(
				chalk.yellow('[WARN]'),
				'轻量更新器暂不支持',
				chalk.magenta(`'${electronPlatformName}'`),
				'平台'
			);
	}
};
