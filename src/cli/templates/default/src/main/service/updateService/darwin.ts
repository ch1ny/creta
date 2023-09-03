import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { EXE_DIR } from '@/constants';

const ContentsDir = path.dirname(EXE_DIR);

export default class Darwin {
	static async beforeStartCheck() {
		if (!fs.existsSync(path.join(ContentsDir, 'update.eup'))) return;

		// 阻塞
		await new Promise(() => {
			this.exeUpdater();
		});
	}

	static async exeUpdater() {
		const { spawn } = cp;
		const child = spawn(
			path.join(ContentsDir, 'updater'),
			['-p', `${process.pid}`, '-e', path.dirname(ContentsDir)],
			{
				detached: true,
				cwd: ContentsDir,
			}
		);
		child.unref();
	}
}
