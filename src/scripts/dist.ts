import chalk from 'chalk';
import cp from 'child_process';
import fse from 'fs-extra';
import path from 'path';
import constants from '../constants';

const { scriptsCwd } = constants;

const buildRender = () =>
	new Promise<void>((resolve) => {
		cp.execSync('webpack --mode production', {
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
	fse.outputJsonSync(
		path.resolve(scriptsCwd, 'build', 'package.json'),
		{
			name: `${packageName}`,
			version: `${packageVersion}`,
			author: `${packageAuthor}`,
			license: `${packageLicense}`,
			description: `${packageDescription}`,
			main: 'main/core/bin.js',
		},
		{
			spaces: '\t',
			EOL: '\n',
		}
	);

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

	// switch (platform) {
	// 	case 'darwin':
	// 		await buildUpdaterOnDarwin(appName, arch);
	// 		break;
	// 	case 'win32':
	// 		await buildUpdaterOnWin32(appName, arch);
	// 		break;
	// 	default:
	// 	// no-op;
	// }
};

main();
