import cp from 'child_process';
import path from 'path';
import constants from '../constants';

const { binDir } = constants;

export default async (sourcePath: string, targetPath: string) => {
	const eup = path.join(binDir, 'exe', process.platform === 'win32' ? 'eup.exe' : 'eup');

	cp.execSync(
		`${eup} compress -i ${sourcePath} -o ${
			targetPath.endsWith('.eup') ? targetPath : targetPath + '.eup'
		}`,
		{
			stdio: 'inherit',
		}
	);
};
