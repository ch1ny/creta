import cp from 'child_process';
import path from 'path';
import constants from '../constants';

const { scriptsCwd } = constants;

const COMMANDS =
	process.platform === 'win32'
		? {
				VITE: 'vite.cmd',
				ELECTRON: 'electron.cmd',
		  }
		: {
				VITE: 'vite',
				ELECTRON: 'electron',
		  };

const main = async () => {
	// 1. 启动渲染进程
	const react = cp.spawn(COMMANDS.VITE, {
		cwd: path.resolve(scriptsCwd, 'src', 'render'),
	});
	react.stdout.on('data', (data) => {
		console.log(`${data}`);
	});
	react.unref();

	// 2. 启动 electron
	cp.execSync('tsc', { cwd: path.resolve(scriptsCwd, 'src', 'main') });
	cp.execSync('tsc', { cwd: path.resolve(scriptsCwd, 'src', 'preload') });
	const { DEV_PORT } = require(path.resolve(scriptsCwd, 'config/dev.config'));
	const electron = cp.spawn(COMMANDS.ELECTRON, ['.', `--port=${DEV_PORT}`], {
		cwd: scriptsCwd,
	});
	electron.on('close', () => {
		switch (process.platform) {
			case 'win32':
				cp.exec(`taskkill /pid ${react.pid} /T /F`);
				break;
			case 'darwin':
				cp.exec(`kill -9 ${react.pid}`);
				break;
			// TODO: 完善其他平台下方法
			case 'linux':
				break;
		}
	});
	electron.stdout.on('data', (data) => {
		console.log(`${data}`);
	});
	electron.unref();
};

main();
