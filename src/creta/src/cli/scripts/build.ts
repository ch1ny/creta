import chalk from 'chalk';
import fse from 'fs-extra';
import path from 'path';
import constants from '../constants';
import { buildMain, buildPreload, buildRender, getCretaConfigs } from '../utils';

const { scriptsCwd } = constants;

const main = async () => {
	const { outDir = path.resolve(scriptsCwd, 'build') } = await getCretaConfigs();
	console.log(chalk.bold.blueBright('1. 清空输出目录'));
	fse.emptyDirSync(outDir);

	console.log(chalk.bold.blueBright('2. 读取package.json数据'));

	console.log(chalk.bold.blueBright('3. 编译ts代码'));
	await Promise.all([buildRender(), buildPreload(), buildMain()]);
	console.log(chalk.bold.greenBright('编译结束'));
};

main();
