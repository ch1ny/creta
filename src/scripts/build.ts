import chalk from 'chalk';
import cp from 'child_process';
import fse from 'fs-extra';
import path from 'path';
import constants from '../constants';

const { scriptsCwd } = constants;

const buildRender = () =>
	new Promise<void>((resolve) => {
		cp.execSync('tsc&&vite build', {
			cwd: path.resolve(scriptsCwd, 'src', 'render'),
		});
		resolve();
	});

const buildPreload = () =>
	new Promise<void>((resolve) => {
		cp.execSync('tsc', {
			cwd: path.resolve(scriptsCwd, 'src', 'preload'),
		});
		resolve();
	});

const buildMain = () =>
	new Promise<void>((resolve) => {
		cp.execSync('tsc', {
			cwd: path.resolve(scriptsCwd, 'src', 'main'),
		});
		resolve();
	});

const main = async () => {
	console.log(chalk.bold.blueBright('1. 清空build目录'));
	fse.emptyDirSync(path.resolve(scriptsCwd, 'build'));

	console.log(chalk.bold.blueBright('2. 读取package.json数据'));

	console.log(chalk.bold.blueBright('3. 编译ts代码'));
	await Promise.all([buildRender(), buildPreload(), buildMain()]);
	console.log(chalk.bold.greenBright('编译结束'));
};

main();
