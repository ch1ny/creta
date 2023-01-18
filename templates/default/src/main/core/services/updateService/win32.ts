import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { EXE_DIR, EXE_PATH } from '../../../constants';
import { IUpdateService } from './interface';

class Win32 implements IUpdateService {
	async beforeStartCheck() {
		if (!fs.existsSync(path.resolve(EXE_DIR, 'resources', 'update.eup'))) return;

		this.exeUpdater();
	}

	async exeUpdater() {
		const { spawn } = cp;
		const updaterDir = path.resolve(EXE_DIR, 'resources');
		const child = spawn(
			path.join(updaterDir, 'updater.exe'),
			[process.platform, `${process.pid}`, EXE_PATH],
			{
				detached: true,
				cwd: updaterDir,
			}
		);
		child.unref();
	}
}

export const WIN32 = new Win32();
