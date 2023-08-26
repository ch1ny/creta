import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { EXE_DIR } from '../../../constants';
import { IUpdateService } from './interface';

const ContentsDir = path.dirname(EXE_DIR);

class Darwin implements IUpdateService {
	async beforeStartCheck() {
		if (!fs.existsSync(path.join(ContentsDir, 'update.eup'))) return;

		// 阻塞
		await new Promise(() => {
			this.exeUpdater();
		});
	}

	async exeUpdater() {
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

export const DARWIN = new Darwin();
