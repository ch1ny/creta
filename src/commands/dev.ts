import cp from 'child_process';
import path from 'path';
import constants from '../constants';

const { libDir, scriptsCwd } = constants;

export default async () => {
	const devScriptPath = path.join(libDir, 'scripts', 'dev.js');
	process.env.CRETA_ENV = 'development';
	cp.execSync(`node ${devScriptPath}`, {
		cwd: scriptsCwd,
		stdio: 'inherit',
	});
};
