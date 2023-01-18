const path = require('path');
const chalk = require('chalk');
const cp = require('child_process');
const fse = require('fs-extra');
const { DIRNAME } = require('../common');

const updateDarwin = async (appName, arch) => {
	console.log(chalk.bold.blueBright('7. 复制更新器'));
	const updater = 'updater';
	await fse.copyFile(
		path.resolve(DIRNAME, 'updaters', 'darwin', 'updater'),
		path.resolve(DIRNAME, 'dist', `${appName}-darwin-${arch}/${appName}.app`, 'updater')
	);

	console.log(chalk.bold.blueBright('8. 生成更新文件'));
	console.log(chalk.blueBright('8.1 复制需要更新的文件'));
	const dirname = `${appName}-darwin-${arch}/${appName}.app/Contents`;
	const { UPDATE_FILES_PATH } = require('../../config/dist.config');
	const files = UPDATE_FILES_PATH['darwin'];

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
	const tarGzName = `update.tar.gz`;
	cp.execSync(`tar -zcf 'dist/${tarGzName}' 'update'`, { cwd: DIRNAME });
	cp.execSync(`rm -rf ${path.resolve(DIRNAME, 'update')}`);
};

module.exports = {
	updateDarwin,
};
