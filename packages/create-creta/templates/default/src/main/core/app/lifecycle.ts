import { app } from 'electron';
import appEntry from '../../index';
import { updateService } from '../services';

const beforeStartApp = async () => {
	await updateService.beforeStartCheck();
};

export const startApp = async () => {
	await beforeStartApp();

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit();
	});

	await appEntry();
};
