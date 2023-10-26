import fs from 'fs';
import path from 'path';
import { build } from 'vite';
import constants from '../constants';
import { getCretaConfigs } from './getCretaConfigs';
import { tscBuild } from './tsc';

const { defaultViteConfig, scriptsCwd } = constants;

export const buildRender = async () => {
	const { outDir = path.resolve(process.cwd(), 'build'), viteConfig = {} } =
		await getCretaConfigs();
	return build({
		...defaultViteConfig,
		...viteConfig,
		build: {
			...viteConfig.build,
			outDir: path.resolve(outDir, 'renderer'),
		},
	});
};

export const buildPreload = async () =>
	tscBuild(
		(await fs.promises.readdir(path.resolve(scriptsCwd, 'src', 'preload')))
			.filter((file) => file.endsWith('.js') || file.endsWith('.ts'))
			.map((file) => path.resolve(scriptsCwd, 'src', 'preload', file)),
		path.resolve(scriptsCwd, 'src', 'preload', 'tsconfig.json')
	);

export const buildMain = async () => {
	const mainRootDir = path.resolve(scriptsCwd, 'src', 'main');
	const nextDirList = [mainRootDir];
	const filesToBuild: string[] = [];

	let nextDir: string | undefined;
	while ((nextDir = nextDirList.shift())) {
		const files = await fs.promises.readdir(path.resolve(nextDir));
		files.map(async (fileName) => {
			const filePath = path.resolve(nextDir!, fileName);
			const fsStatus = await fs.promises.stat(filePath);
			if (fsStatus.isDirectory()) {
				nextDirList.push(filePath);
			} else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
				filesToBuild.push(filePath);
			}
		});
	}

	await tscBuild(filesToBuild, path.resolve(scriptsCwd, 'src', 'main', 'tsconfig.json'));
};
