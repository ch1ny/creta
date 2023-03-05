import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import url from 'url';
import * as CONSTANTS from './constants';

const { ARGS, ASAR_ROOT_PATH, IS_PACKAGED, PRELOAD_DIR, screenSize } = CONSTANTS;

/**
 * 应用主进程入口
 * 您需要在这个函数中书写您的逻辑
 */
export default async () => {
	ipcMain.handle('APP.VERSION', () => {
		return app.getVersion();
	});

	await app.whenReady();

	const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
	screenSize.width = screenWidth;
	screenSize.height = screenHeight;

	// 创建主窗口
	const mainWindow = new BrowserWindow({
		width: parseInt(`${screenWidth * 0.7}`),
		height: parseInt(`${screenHeight * 0.8}`),
		frame: false,
		transparent: true,
		show: false,
		webPreferences: {
			devTools: !IS_PACKAGED,
			preload: path.join(PRELOAD_DIR, 'preload.js'),
			webSecurity: false,
		},
	});
	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
	});
	if (IS_PACKAGED) {
		mainWindow.loadURL(
			url.format({
				pathname: path.resolve(ASAR_ROOT_PATH, './renderer/index.html'),
				protocol: 'file:',
				slashes: true,
			})
		);
	} else {
		mainWindow.loadURL(`http://127.0.0.1:${ARGS['--port']}/`);
	}
};
