import { ipcMain } from 'electron';
import { DARWIN } from './darwin';
import { IUpdateService } from './interface';
import { WIN32 } from './win32';

class UpdateService implements IUpdateService {
	constructor() {
		ipcMain.on('APP.UPDATE.EXE_UPDATER', () => {
			this.exeUpdater();
		});
	}

	async beforeStartCheck() {
		switch (process.platform) {
			case 'win32':
				return await WIN32.beforeStartCheck();
			case 'darwin':
				return await DARWIN.beforeStartCheck();
			case 'linux':
				return; // TODO:
			default:
				throw new Error(`暂不支持 ${process.platform} 平台`);
		}
	}

	async exeUpdater() {
		switch (process.platform) {
			case 'win32':
				return await WIN32.exeUpdater();
			case 'darwin':
				return await DARWIN.exeUpdater();
			case 'linux':
				return; // TODO:
			default:
				throw new Error(`暂不支持 ${process.platform} 平台`);
		}
	}
}

export const updateService = new UpdateService();
