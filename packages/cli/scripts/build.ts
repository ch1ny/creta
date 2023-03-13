import chalk from 'chalk';
import fse from 'fs-extra';
import path from 'path';
import constants from '../constants';
import { buildMain, buildPreload, buildRender } from '../utils';

const { scriptsCwd } = constants;

const main = async () => {
	console.log(chalk.bold.blueBright('1. 清空build目录'));
	fse.emptyDirSync(path.resolve(scriptsCwd, 'build'));

	console.log(chalk.bold.blueBright('2. 读取package.json数据'));

	console.log(chalk.bold.blueBright('3. 编译ts代码'));
	await Promise.all([buildRender(), buildPreload(), buildMain()]);
	console.log(chalk.bold.greenBright('编译结束'));
};

main();
