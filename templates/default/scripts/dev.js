const path = require('path');
const cp = require('child_process');
const { DIRNAME } = require('./common');

const COMMANDS =
	process.platform === 'win32'
		? {
				WEBPACK: 'webpack.cmd',
				ELECTRON: 'electron.cmd',
		  }
		: {
				WEBPACK: 'webpack',
				ELECTRON: 'electron',
		  };

// 1. 启动渲染进程
const react = cp.spawn(
	COMMANDS.WEBPACK,
	['serve', '--mode', 'development', '--env', 'development'],
	{
		cwd: path.resolve(DIRNAME, 'src', 'render'),
	}
);
react.stdout.on('data', (data) => {
	console.log(`${data}`);
});
react.unref();

// 2. 启动 electron
cp.execSync('tsc', { cwd: path.resolve(DIRNAME, 'src', 'main') });
cp.execSync('tsc', { cwd: path.resolve(DIRNAME, 'src', 'preload') });
const { DEV_PORT } = require('../config/dev.config');
const electron = cp.spawn(COMMANDS.ELECTRON, ['.', `--port=${DEV_PORT}`], {
	cwd: DIRNAME,
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
