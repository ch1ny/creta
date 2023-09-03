import { Inject, Service } from '@/core/di';
import UpdateService from '../updateService';
import { BrowserWindow, app, ipcMain, screen } from 'electron';
import { screenSize } from '@/constants';
import MainWindow from '@/windows/MainWindow';

@Service({
	instant: true,
})
export default class AppService {
	@Inject(UpdateService) private updateService!: UpdateService;

	private async beforeReady() {
		await this.updateService.beforeStartCheck();

		ipcMain.handle('APP.VERSION', () => {
			return app.getVersion();
		});

		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') app.quit();
		});
	}

	private async onReady() {
		const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
		screenSize.width = screenWidth;
		screenSize.height = screenHeight;

		// 窗口按钮事件
		ipcMain.on('COMMON.DRAG_BAR.BUTTONS_ONCLICK', (ev, button: number) => {
			const targetWindow = BrowserWindow.fromWebContents(ev.sender);
			if (!targetWindow) return;

			switch (button) {
				case -1: // 隐藏窗口
					targetWindow.close();
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
	}

	constructor() {
		(async () => {
			await this.beforeReady();
			await app.whenReady();
			await this.onReady();
		})();
	}
}
