import chalk from 'chalk';
import cp from 'child_process';
import fse from 'fs-extra';
import path from 'path';
import constants from '../../constants';
import { getCretaConfigs } from '../../utils';

const { binDir, scriptsCwd } = constants;

export const buildUpdaterOnDarwin = async (appName: string, arch: 'x86' | 'x64') => {
	console.log(chalk.bold.blueBright('7. 复制更新器'));
	await fse.copyFile(
		path.resolve(binDir, 'exe', 'updater'),
		path.resolve(scriptsCwd, 'dist', `${appName}-darwin-${arch}/${appName}.app`, 'updater')
	);

	console.log(chalk.bold.blueBright('8. 生成更新文件'));
	console.log(chalk.blueBright('8.1 复制需要更新的文件'));
	const dirname = `${appName}-darwin-${arch}/${appName}.app/Contents`;
	const { updateFilesPath = {} } = getCretaConfigs();
	const files: string[] = updateFilesPath['darwin'] || [];

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
	// 解压: tar -zxf 压缩包名.tar.gz
	cp.execSync(`creta eup update dist/update.eup`, { cwd: scriptsCwd });
	cp.execSync(`rm -rf ${path.resolve(scriptsCwd, 'update')}`);
};
