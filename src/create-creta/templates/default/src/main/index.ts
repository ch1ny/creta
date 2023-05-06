import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as CONSTANTS from './constants';
import MainWindow from './windows/MainWindow';

const { screenSize } = CONSTANTS;

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

	// 窗口按钮事件
	ipcMain.on('DRAG_BAR.BUTTONS_ONCLICK', (ev, button: number) => {
		const targetWindow = BrowserWindow.fromWebContents(ev.sender);
		if (!targetWindow) return;

		switch (button) {
			case -1: // 隐藏窗口
				targetWindow.hide();
				break;
			case 0: // 窗口最小化
				targetWindow.minimize();
				break;
			case 1: // 最大化 / 还原窗口
				targetWindow.isMaximized() ? targetWindow.unmaximize() : targetWindow.maximize();
				break;
			default:
			// no-op
		}
	});

	MainWindow.createWindow();
};
