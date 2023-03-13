import cp from 'child_process';
import path from 'path';
import constants from '../constants';

const { libCoreDir, scriptsCwd } = constants;

export default async () => {
	const distScriptPath = path.join(libCoreDir, 'scripts', 'dist.js');
	process.env.CRETA_ENV = 'production';
	cp.execSync(`node ${distScriptPath}`, {
		cwd: scriptsCwd,
		stdio: 'inherit',
	});
};
