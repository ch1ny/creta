import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { EXE_DIR } from '../../../constants';
import { IUpdateService } from './interface';

const ContentsParentDir = path.resolve(EXE_DIR, '../..');

class Darwin implements IUpdateService {
	async beforeStartCheck() {
		if (!fs.existsSync(path.join(ContentsParentDir, 'update.eup'))) return;

		// 阻塞
		await new Promise(() => {
			this.exeUpdater();
		});
	}

	async exeUpdater() {
		const { spawn } = cp;
		const child = spawn(
			path.join(ContentsParentDir, 'updater'),
			['-p', `${process.pid}`, '-e', path.dirname(path.join(EXE_DIR, '..'))],
			{
				detached: true,
				cwd: ContentsParentDir,
			}
		);
		child.unref();
	}
}

export const DARWIN = new Darwin();
