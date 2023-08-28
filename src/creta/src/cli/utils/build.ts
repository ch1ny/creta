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

export const buildMain = async () =>
	tscBuild(
		[constants.mainScriptEntryFile],
		path.resolve(scriptsCwd, 'src', 'main', 'tsconfig.json')
	);
