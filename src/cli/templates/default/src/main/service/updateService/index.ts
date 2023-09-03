import { ipcMain } from 'electron';
import { Service } from '@/core/di';
import Darwin from './darwin';
import Win32 from './win32';

@Service()
export default class UpdateService {
	constructor() {
		ipcMain.on('APP.UPDATE.EXE_UPDATER', () => {
			this.exeUpdater();
		});
	}

	async beforeStartCheck() {
		switch (process.platform) {
			case 'win32':
				return await Win32.beforeStartCheck();
			case 'darwin':
				return await Darwin.beforeStartCheck();
			case 'linux':
				return; // TODO:
			default:
				throw new Error(`暂不支持 ${process.platform} 平台`);
		}
	}

	async exeUpdater() {
		switch (process.platform) {
			case 'win32':
				return await Win32.exeUpdater();
			case 'darwin':
				return await Darwin.exeUpdater();
			case 'linux':
				return; // TODO:
			default:
				throw new Error(`暂不支持 ${process.platform} 平台`);
		}
	}
}
