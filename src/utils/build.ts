import cp from 'child_process';
import path from 'path';
import { build } from 'vite';
import constants from '../constants';
import { getCretaConfigs } from './getCretaConfigs';
import { getResolvedScriptsPathRelativeToConfigDir } from './getScriptsPath';

const { cliDir, scriptsCwd } = constants;
const { afterBuildScripts = {}, viteConfig = {} } = getCretaConfigs();

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
		const script = afterBuildScripts['preload'];
		if (
			!!script &&
			typeof script === 'string' &&
			(script.endsWith('.js') || script.endsWith('.ts'))
		) {
			const nodeCmd = script.endsWith('.js') ? 'node' : 'ts-node';
			cp.execSync(`${nodeCmd} ${getResolvedScriptsPathRelativeToConfigDir(script)}`, {
				cwd: scriptsCwd,
				stdio: 'inherit',
			});
		}
		resolve();
	});

export const buildMain = () =>
	new Promise<void>((resolve) => {
		cp.execSync('tsc', {
			cwd: path.resolve(scriptsCwd, 'src', 'main'),
		});
		const script = afterBuildScripts['main'];
		if (
			!!script &&
			typeof script === 'string' &&
			(script.endsWith('.js') || script.endsWith('.ts'))
		) {
			const nodeCmd = script.endsWith('.js') ? 'node' : 'ts-node';
			cp.execSync(`${nodeCmd} ${getResolvedScriptsPathRelativeToConfigDir(script)}`, {
				cwd: scriptsCwd,
				stdio: 'inherit',
			});
		}
		resolve();
	});
