import chalk from 'chalk';
import cp from 'child_process';
import fse from 'fs-extra';
import path from 'path';

import constants from '../../constants';

const { binDir, scriptsCwd } = constants;

export const buildUpdaterOnWin32 = async (appName: string, arch: 'x86' | 'x64') => {
	console.log(chalk.bold.blueBright('7. 复制更新器'));
	await fse.copyFile(
		path.resolve(binDir, 'exe', 'updater.exe'),
		path.resolve(scriptsCwd, 'dist', `${appName}-win32-${arch}`, 'updater.exe')
	);

	console.log(chalk.bold.blueBright('8. 生成更新文件'));
	console.log(chalk.blueBright('8.1 复制需要更新的文件'));
	const dirname = `${appName}-win32-${arch}`;
	const { UPDATE_FILES_PATH = {} } = require(path.resolve(scriptsCwd, 'config/dist.config'));
	const files: string[] = UPDATE_FILES_PATH['win32'] || [];

	const sourceDir = path.resolve(scriptsCwd, 'dist', dirname);

	await Promise.all(
		files.map((file) => fse.ensureDir(path.dirname(path.resolve(scriptsCwd, 'update', file))))
	);

	await Promise.all(
		files.map((file) =>
			fse.copyFile(path.resolve(sourceDir, file), path.resolve(scriptsCwd, 'update', file))
		)
	);

	console.log(chalk.blueBright('8.2 制作更新包'));
	cp.execSync(`creta eup update dist/update.eup`, { cwd: scriptsCwd });
	cp.execSync(`rm -rf ${path.resolve(scriptsCwd, 'update')}`);
};
