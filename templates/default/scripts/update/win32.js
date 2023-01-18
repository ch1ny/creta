const path = require('path');
const chalk = require('chalk');
const cp = require('child_process');
const fse = require('fs-extra');
const { DIRNAME } = require('../common');

const updateWin32 = async (appName, arch) => {
	console.log(chalk.bold.blueBright('7. 复制更新器'));
	await fse.copyFile(
		path.resolve(DIRNAME, 'updaters', 'win32', 'updater.exe'),
		path.resolve(DIRNAME, 'dist', `${appName}-win32-${arch}`, 'updater.exe')
	);

	console.log(chalk.bold.blueBright('8. 生成更新文件'));
	console.log(chalk.blueBright('8.1 复制需要更新的文件'));
	const dirname = `${appName}-win32-${arch}`;
	const { UPDATE_FILES_PATH } = require('../../config/dist.config');
	const files = UPDATE_FILES_PATH['win32'];

	const sourceDir = path.resolve(DIRNAME, 'dist', dirname);

	await Promise.all(
		files.map((file) => fse.ensureDir(path.dirname(path.resolve(DIRNAME, 'update', file))))
	);

	await Promise.all(
		files.map((file) =>
			fse.copyFile(path.resolve(sourceDir, file), path.resolve(DIRNAME, 'update', file))
		)
	);

	console.log(chalk.blueBright('8.2 制作更新包'));
	// 解压: tar -zxf 压缩包名.tar.gz
	// const targzName = `update.tar.gz`;
	// cp.execSync(`tar -zcf 'dist/${targzName}' 'update'`, { cwd: DIRNAME });
	// cp.execSync(`rm -rf ${path.resolve(DIRNAME, 'update')}`);
};

module.exports = {
	updateWin32,
};
