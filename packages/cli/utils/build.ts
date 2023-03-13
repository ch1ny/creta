import cp from 'child_process';
import path from 'path';
import { build } from 'vite';
import constants from '../constants';
import { getCretaConfigs } from './getCretaConfigs';

const { cretaRootDir, scriptsCwd } = constants;

export const buildRender = async () => {
	const { viteConfig = {} } = await getCretaConfigs();
	return build({
		...viteConfig,
		configFile: path.resolve(cretaRootDir, 'vite.config.ts'),
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

export const buildMain = async () =>
	new Promise<void>((resolve) => {
		cp.execSync('tsc', {
			cwd: path.resolve(scriptsCwd, 'src', 'main'),
			stdio: 'inherit',
		});
		resolve();
	});
