import { BrowserWindow } from 'electron';
import path from 'path';
import { ARGS, ASAR_ROOT_PATH, IS_PACKAGED, PRELOAD_DIR, screenSize } from '../constants';

export default class MainWindow {
	protected static windowInstance?: BrowserWindow;

	public static createWindow(): BrowserWindow {
		return MainWindow.window;
	}

	public static get window(): BrowserWindow {
		if (!this.windowInstance) {
			const { width: screenWidth = 1050, height: screenHeight = 700 } = screenSize;
			const mainWindow = new BrowserWindow({
				width: Math.min(1050, screenWidth - 70),
				height: Math.min(700, screenHeight - 50),
				frame: false,
				show: false,
				webPreferences: {
					devTools: !IS_PACKAGED,
					preload: path.join(PRELOAD_DIR, 'preload.js'),
					webSecurity: false,
				},
			});

			// 监听窗口 resize 事件
			mainWindow.on('maximize', () => {
				mainWindow.webContents.send('WINDOW.ON_MAXIMIZE');
			});
			mainWindow.on('unmaximize', () => {
				mainWindow.webContents.send('WINDOW.ON_UNMAXIMIZE');
			});

			mainWindow.on('ready-to-show', () => {
				mainWindow.show();
			});

			if (IS_PACKAGED) {
				mainWindow.loadFile(path.resolve(ASAR_ROOT_PATH, './renderer/index.html'));
			} else {
				mainWindow.loadURL(`http://127.0.0.1:${ARGS['--port']}/`);
				mainWindow.once('ready-to-show', () => {
					mainWindow.webContents.openDevTools();
				});
			}
			this.windowInstance = mainWindow;
		}
		return this.windowInstance;
	}
}
