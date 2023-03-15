import chalk from 'chalk';
import cp from 'child_process';
import fs from 'fs';
import fse from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';

/**
 * copied from [create-vite](https://github.com/vitejs/vite/blob/main/packages/create-vite/src/index.ts)
 *
 * @param userAgent
 * @returns
 */
function pkgFromUserAgent(userAgent: string | undefined) {
	if (!userAgent) return undefined;
	const pkgSpec = userAgent.split(' ')[0];
	const pkgSpecArr = pkgSpec.split('/');
	return {
		name: pkgSpecArr[0],
		version: pkgSpecArr[1],
	};
}

class Constants {
	private _gitName?: string;
	get gitName() {
		if (this._gitName !== undefined) return this._gitName;
		this._gitName = cp.execSync('git config --global user.name', { encoding: 'utf8' }).trim();
		return this._gitName;
	}

	rootDir = path.resolve(__dirname, '..');
	templatesDir = path.join(this.rootDir, 'templates');
}
const constants = new Constants();

interface IProjectProps {
	projectName: string;
	projectVersion: string;
	projectDescription: string;
	projectAuthor: string;
	projectLicense: string;
}

const getProjectProps = async () => {
	console.log(chalk.bold.blueBright('开始创建项目'));
	const projectProps: IProjectProps = await inquirer.prompt([
		{
			type: 'input',
			name: 'projectVersion',
			message: '项目版本',
			default: '0.1.0',
		},
		{
			type: 'input',
			name: 'projectDescription',
			message: '项目描述',
		},
		{
			type: 'input',
			name: 'projectAuthor',
			message: '项目作者',
			default: `${constants.gitName}`,
		},
		{
			type: 'input',
			name: 'projectLicense',
			message: '项目证书',
			default: 'MIT',
		},
	]);
	return projectProps;
};

const initProjectDirectory = async (projectName: string, projectDir: string) => {
	// 判断当前文件夹下是否有目标路径的目录
	if (fs.existsSync(projectDir)) {
		console.log(chalk.red(`Folder named '${projectName}' has already been existed`));
		process.exit(-1);
	}
	// 创建文件夹
	await fs.promises.mkdir(projectDir, { recursive: true });
};

const copyTemplate = async (props: IProjectProps, projectDir: string) => {
	// 获取模板
	const templates = (await fs.promises.readdir(constants.templatesDir)).filter((tmp) =>
		fs.existsSync(path.resolve(constants.templatesDir, tmp, 'creta.template.json'))
	);
	const { template } = await inquirer.prompt([
		{
			name: 'template',
			type: 'list',
			message: '选择一个模板',
			choices: templates.map((templateDir) => {
				const { name = templateDir, color = {} } = require(path.resolve(
					constants.templatesDir,
					templateDir,
					'creta.template.json'
				));

				const coloredName = chalk.rgb(color.r ?? 255, color.g ?? 255, color.b ?? 255)(name);

				return {
					name: coloredName,
					value: templateDir,
				};
			}),
		},
	]);

	// 拷贝模板
	await fse.copy(path.join(constants.templatesDir, template), projectDir, {
		filter: async (filePath) => {
			const isDirectory = (await fs.promises.lstat(filePath)).isDirectory();
			if (isDirectory) {
				if (
					filePath.endsWith('build') ||
					filePath.endsWith('dist') ||
					filePath.endsWith('node_modules') ||
					filePath.endsWith('.yalc')
				)
					return false;
			} else {
				if (filePath.endsWith('.lock') || filePath.endsWith('creta.template.json')) return false;
			}
			return true;
		},
	});

	/**
	 * 重命名 .gitignore
	 * 因为 npm 会将 .gitignore 重命名为 .npmignore
	 */
	fse.rename(path.resolve(projectDir, 'creta.gitignore'), path.resolve(projectDir, '.gitignore'));

	const { projectName, projectDescription, projectVersion, projectAuthor, projectLicense } = props;
	// 重写 package.json
	const packageJson = await fse.readJson(path.join(projectDir, 'package.json'));
	packageJson.name = projectName;
	packageJson.version = projectVersion;
	packageJson.description = projectDescription;
	packageJson.author = projectAuthor;
	packageJson.license = projectLicense;
	await fse.writeJson(path.join(projectDir, 'package.json'), packageJson, {
		spaces: '\t',
		EOL: '\n',
	});

	try {
		cp.execSync('git init', {
			cwd: projectDir,
		});
	} catch (e) {}

	// 安装依赖
	const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
	const pkgManager = pkgInfo ? pkgInfo.name : 'npm';
	try {
		if (pkgManager === 'pnpm') {
			// pnpm workspace
			fse.writeFileSync(
				path.resolve(projectDir, 'pnpm-workspace.yaml'),
				`packages:\n  - 'src/main'\n  - 'src/preload'\n  - 'src/renderer'`
			);
		}

		cp.execSync(`${pkgManager} install`, {
			cwd: projectDir,
			stdio: 'inherit',
		});
	} catch (e) {
		return;
	}

	// cSpell: disable-next-line
	console.log(chalk.cyan('Ciallo~~ ( ∠·ω< )⌒★'));
	console.log(chalk.green('creta 应用初始化完毕，期待与您的下一次相遇'));
};

const validateProjectName = (projectName: string): boolean => {
	const error = (errMsg: string) => {
		console.log(chalk.red(`× ${errMsg}`));
	};

	if (!projectName) {
		error('请输入项目名');
		return false;
	}
	if (/[\\:*?"<>|]/.test(projectName)) {
		error('请输入合法文件名');
		return false;
	}
	return true;
};

export default async (projectName: string) => {
	if (!validateProjectName(projectName)) return;

	// 目标根路径，process.cwd()为脚手架工作时的路径，将其与用户输入的项目名称拼接起来作为目标路径
	const projectDir = path.resolve(process.cwd(), projectName);
	await initProjectDirectory(projectName, projectDir);

	const props = {
		...(await getProjectProps()),
		projectName,
	};
	await copyTemplate(props, projectDir);
};
