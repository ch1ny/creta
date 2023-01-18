import chalk from 'chalk';
import fs from 'fs';
import fse from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { constants } from '../constants';

interface IProjectProps {
	projectName: string;
	projectVersion: string;
	projectDescription: string;
	projectAuthor: string;
	projectLicense: string;
}

const getProjectProps = async () => {
	console.log(chalk.bold.blueBright('1. 开始创建项目'));
	const projectProps: IProjectProps = await inquirer.prompt([
		{
			type: 'input',
			name: 'projectName',
			message: '项目名称',
			validate: function (input) {
				const done = (<any>this).async();
				if (!input) {
					done('请输入项目名');
					return;
				}
				if (/[\\:*?"<>|]/.test(input)) {
					done('请输入合法文件名');
					return;
				}
				done(null, true);
			},
		},
		{
			type: 'input',
			name: 'projectVersion',
			message: '项目版本',
			default: '1.0.0',
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

const initProjectDirectory = async (props: IProjectProps, projectDir: string) => {
	const { projectName } = props;

	// 判断当前文件夹下是否有目标路径的目录
	if (fs.existsSync(projectDir)) {
		throw Error(`Folder named '${projectName}' has already been existed`);
	}
	// 创建文件夹
	await fs.promises.mkdir(projectDir, { recursive: true });
};

const copyTemplate = async (props: IProjectProps, projectDir: string) => {
	// 拷贝模板
	await fse.copy(path.join(constants.templatesDir, 'default'), projectDir, {
		filter: async (filePath) => {
			const isDirectory = (await fs.promises.lstat(filePath)).isDirectory();
			if (isDirectory) {
				if (
					filePath.endsWith('build') ||
					filePath.endsWith('dist') ||
					filePath.endsWith('node_modules') ||
					filePath.endsWith('updater/target')
				)
					return false;
			} else {
				if (filePath.endsWith('yarn.lock')) return false;
			}
			return true;
		},
	});

	const { projectName, projectVersion, projectAuthor, projectLicense } = props;
	// 重写 package.json
	const packageJson = await fse.readJson(path.join(projectDir, 'package.json'));
	packageJson.name = projectName;
	packageJson.version = projectVersion;
	packageJson.author = projectAuthor;
	packageJson.license = projectLicense;
	await fse.writeJson(path.join(projectDir, 'package.json'), packageJson, {
		spaces: '\t',
		EOL: '\n',
	});
};

export default async () => {
	const props = await getProjectProps();

	// 目标根路径，process.cwd()为脚手架工作时的路径，将其与用户输入的项目名称拼接起来作为目标路径
	const projectDir = path.resolve(process.cwd(), props.projectName);
	await initProjectDirectory(props, projectDir);
	await copyTemplate(props, projectDir);
};
