import cp from 'child_process';
import path from 'path';
import { createServer } from 'vite';
import constants from '../constants';
import { buildMain, buildPreload, getCretaConfigs } from '../utils';

const { cliDir, scriptsCwd } = constants;

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
	const { viteConfig = {} } = getCretaConfigs();
	const viteServer = await createServer({
		...viteConfig,
		configFile: path.resolve(cliDir, 'vite.config.ts'),
	});

	await viteServer.listen();

	// 2. 启动 electron
	await Promise.all([buildMain(), buildPreload()]);
	const devPort = viteServer.config.server.port;
	const electron = cp.spawn(COMMANDS.ELECTRON, ['.', `--port=${devPort}`], {
		cwd: scriptsCwd,
	});
	electron.on('close', () => {
		viteServer.close();
	});
	electron.stdout.on('data', (data) => {
		console.log(`${data}`);
	});
	electron.unref();
};

main();
