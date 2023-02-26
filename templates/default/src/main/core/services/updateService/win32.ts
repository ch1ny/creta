import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { EXE_DIR, EXE_PATH } from '../../../constants';
import { IUpdateService } from './interface';

class Win32 implements IUpdateService {
	async beforeStartCheck() {
		if (!fs.existsSync(path.resolve(EXE_DIR, 'update.eup'))) return;

		// 阻塞
		await new Promise(() => {
			this.exeUpdater();
		});
	}

	async exeUpdater() {
		const { spawn } = cp;

		const child = spawn(
			path.join(EXE_DIR, 'updater.exe'),
			['-p', `${process.pid}`, '-e', EXE_PATH],
			{
				detached: true,
				cwd: EXE_DIR,
				stdio: 'ignore',
			}
		);
		child.unref();
	}
}

export const WIN32 = new Win32();
