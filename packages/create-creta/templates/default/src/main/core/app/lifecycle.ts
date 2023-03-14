import { app } from 'electron';
import { updateService } from '../services';

const beforeStartApp = async () => {
	await updateService.beforeStartCheck();
};

export const startApp = async () => {
	await beforeStartApp();

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit();
	});

	const { default: appEntry } = await import('../../index');
	await appEntry();
};
