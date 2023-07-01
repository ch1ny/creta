import cp from 'child_process';
import path from 'path';
import { build } from 'vite';
import electron from 'vite-electron-plugin';
import nodecPlugin from './nodec/plugin';
import constants from '../constants';
import { getCretaConfigs } from './getCretaConfigs';

const { cretaRootDir, defaultViteConfig, scriptsCwd } = constants;

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
	new Promise<void>((resolve) => {
		cp.execSync('tsc', {
			cwd: path.resolve(scriptsCwd, 'src', 'preload'),
			stdio: 'inherit',
		});
		resolve();
	});

export const buildMain = async () => {
	const { outDir = path.resolve(scriptsCwd, 'build'), viteConfig = {} } = await getCretaConfigs();

	const buildResult = await build({
		root: cretaRootDir,
		plugins: [
			electron({
				include: ['src/main'],
				outDir: outDir,
				logger: {
					info: () => undefined,
				},
			}),
			nodecPlugin({
				requirePath: path.resolve(outDir, 'main', 'nodec.js'),
				includes: [path.resolve(outDir, 'main')],
			}),
		],
		build: {
			write: false,
		},
	});

	// await nodec({
	// 	requirePath: path.resolve(outDir, 'main', 'nodec.js'),
	// 	includes: [path.resolve(outDir, 'main')],
	// });

	return buildResult;
};
