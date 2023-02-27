import cp from 'child_process';
import path from 'path';
import constants from '../constants';

const { libDir, scriptsCwd } = constants;

export default async () => {
	const buildScriptPath = path.join(libDir, 'scripts', 'build.js');
	process.env.CRETA_ENV = 'production';
	cp.execSync(`node ${buildScriptPath}`, {
		cwd: scriptsCwd,
		stdio: 'inherit',
	});
};
