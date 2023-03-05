import cp from 'child_process';
import path from 'path';
import { build } from 'vite';
import constants from '../constants';
import { getCretaConfigs } from './getCretaConfigs';

const { cliDir, scriptsCwd } = constants;
const { viteConfig = {} } = getCretaConfigs();

export const buildRender = () =>
	build({
		...viteConfig,
		configFile: path.resolve(cliDir, 'vite.config.ts'),
	});

export const buildPreload = () =>
	new Promise<void>((resolve) => {
		cp.execSync('tsc', {
			cwd: path.resolve(scriptsCwd, 'src', 'preload'),
		});
		resolve();
	});

export const buildMain = () =>
	new Promise<void>((resolve) => {
		cp.execSync('tsc', {
			cwd: path.resolve(scriptsCwd, 'src', 'main'),
		});
		resolve();
	});
