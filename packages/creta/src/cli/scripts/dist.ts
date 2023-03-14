import chalk from 'chalk';
import cp from 'child_process';
import fse from 'fs-extra';
import path from 'path';
import constants from '../constants';
import { buildMain, buildPreload, buildRender } from '../utils';
import pack from '../utils/pack';
const { scriptsCwd } = constants;

const main = async () => {
	console.log(chalk.bold.blueBright('1. 清空build目录'));
	fse.emptyDirSync(path.resolve(scriptsCwd, 'build'));

	console.log(chalk.bold.blueBright('2. 读取package.json数据'));
	const packageJson = fse.readJsonSync(path.resolve(scriptsCwd, 'package.json'));
	const {
		name: packageName = '',
		version: packageVersion = '1.0.0',
		author: packageAuthor = '',
		license: packageLicense = 'MIT',
		description: packageDescription = '',
	} = packageJson;

	console.log(chalk.bold.blueBright('3. 编译ts代码'));
	await Promise.all([buildRender(), buildPreload(), buildMain()]);
	console.log(chalk.bold.greenBright('编译结束'));

	console.log(chalk.bold.blueBright('4. 生成package.json'));
	// 读取主进程依赖
	const { dependencies = {} } = fse.readJsonSync(
		path.resolve(scriptsCwd, 'src', 'main', 'package.json')
	);
	fse.outputJsonSync(
		path.resolve(scriptsCwd, 'build', 'package.json'),
		{
			name: `${packageName}`,
			version: `${packageVersion}`,
			author: `${packageAuthor}`,
			license: `${packageLicense}`,
			description: `${packageDescription}`,
			main: 'main/core/bin.js',
			dependencies,
		},
		{
			spaces: '\t',
			EOL: '\n',
		}
	);

	// 目前将 node_modules 与项目一并打包
	cp.execSync('npm install', {
		cwd: path.resolve(scriptsCwd, 'build'),
	});

	console.log(chalk.bold.blueBright('5. 选择 electron-builder 构建目标平台'));
	const platform = process.platform;
	const inquirer = (await import('inquirer')).default;
	const { targets } = await inquirer.prompt({
		name: 'targets',
		message: '请选择目标平台(多选)',
		type: 'checkbox',
		choices: [
			{
				name: 'windows',
				value: 'win32',
				checked: platform === 'win32',
			},
			{
				name: 'macOS',
				value: 'darwin',
				checked: platform === 'darwin',
			},
			{
				name: 'linux',
				value: 'linux',
				checked: platform === 'linux',
			},
		],
	});

	if (targets.length === 0) {
		console.log(chalk.yellow('[WARN]'), '未选择目标平台');
		return;
	}

	console.log(chalk.bold.blueBright('6. electron-builder 打包可执行程序'));
	await pack(targets);
};

main();
