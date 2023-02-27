import cp from 'child_process';
import path from 'path';
import constants from '../constants';

const { libDir, scriptsCwd } = constants;

export default async () => {
	const distScriptPath = path.join(libDir, 'scripts', 'dist.js');
	process.env.CRETA_ENV = 'production';
	cp.execSync(`node ${distScriptPath}`, {
		cwd: scriptsCwd,
		stdio: 'inherit',
	});
};
