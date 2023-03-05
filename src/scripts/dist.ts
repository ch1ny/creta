import chalk from 'chalk';
import cp from 'child_process';
import fse from 'fs-extra';
import path from 'path';
import constants from '../constants';
import {
	buildMain,
	buildPreload,
	buildRender,
	getCretaConfigs,
	getResolvedScriptsPathRelativeToConfigDir,
} from '../utils';
import { buildUpdaterOnDarwin } from './updater/darwin';
import { buildUpdaterOnWin32 } from './updater/win32';
const { scriptsCwd } = constants;

const main = async () => {
	const {
		/**
		 * 代码完成编译后，
		 * 准备打包前执行的脚本
		 */
		beforeDist,
		/**
		 * 打包完成后执行的脚本
		 */
		afterDist,
		/**
		 * 自行设计更新方案
		 */
		customUpdater = false,
	} = getCretaConfigs();

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

	// 执行预打包脚本
	if (
		!!beforeDist &&
		typeof beforeDist === 'string' &&
		(beforeDist.endsWith('.js') || beforeDist.endsWith('.ts'))
	) {
		const nodeCmd = beforeDist.endsWith('.js') ? 'node' : 'ts-node';
		console.log(chalk.blueBright('执行预打包脚本'));
		const beforeDistPath = getResolvedScriptsPathRelativeToConfigDir(beforeDist);
		cp.execSync(`${nodeCmd} ${beforeDistPath}`, {
			cwd: scriptsCwd,
			stdio: 'inherit',
		});
	}

	console.log(chalk.bold.blueBright('5. 设置electron-packager打包参数'));
	const inquirer = (await import('inquirer')).default;
	const platform = process.platform; // TODO: 交叉编译支持
	const { arch, overwrite } = await inquirer.prompt([
		{
			name: 'arch',
			message: '请选择目标架构',
			type: 'list',
			choices: ['x64', 'x86'],
		},
		{
			name: 'overwrite',
			message: '是否覆盖',
			type: 'list',
			choices: ['Y', 'N'],
		},
	]);
	const appName = packageName
		.split('/')
		.reverse()[0]
		.split('-')
		.map((str: string) => `${str.substring(0, 1).toUpperCase()}${str.substring(1)}`)
		.join('');
	const electronPackagerOptions = [
		path.resolve(scriptsCwd, 'build'),
		appName,
		`--platform=${platform}`,
		`--arch=${arch}`,
		`--out`,
		`${path.resolve(scriptsCwd, 'dist/')}`,
		`--asar`,
		overwrite === 'Y' ? '--overwrite' : '',
	];

	if (platform === 'win32') {
		const { needAdmin } = await inquirer.prompt([
			{
				name: 'needAdmin',
				message: '是否需要管理员权限',
				type: 'list',
				choices: ['N', 'Y'],
			},
		]);
		if (needAdmin === 'Y')
			electronPackagerOptions.push(
				'--win32metadata.requested-execution-level=requireAdministrator'
			);
	}

	console.log(chalk.bold.blueBright('6. electron-packager打包可执行文件'));
	cp.execSync(`electron-packager ${electronPackagerOptions.join(' ')}`);

	// 如果开发者设置了自行更新则不打包更新包及安装程序
	if (!customUpdater) {
		switch (platform) {
			case 'darwin':
				await buildUpdaterOnDarwin(appName, arch);
				break;
			case 'win32':
				await buildUpdaterOnWin32(appName, arch);
				break;
			default:
			// no-op;
		}
	}

	// 执行打包后脚本
	if (
		!!afterDist &&
		typeof afterDist === 'string' &&
		(afterDist.endsWith('.js') || afterDist.endsWith('.ts'))
	) {
		const nodeCmd = afterDist.endsWith('.js') ? 'node' : 'ts-node';
		console.log(chalk.blueBright('执行打包后脚本'));
		const afterDistPath = getResolvedScriptsPathRelativeToConfigDir(afterDist);
		cp.execSync(`${nodeCmd} ${afterDistPath}`, {
			cwd: scriptsCwd,
			stdio: 'inherit',
		});
	}
};

main();
