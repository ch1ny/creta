import path from 'path';
import { createServer } from 'vite';
import constants from '../constants';
import { buildMain, buildPreload, getCretaConfigs, runElectron, tscWatch } from '../utils';

const { defaultViteConfig, scriptsCwd } = constants;

const main = async () => {
	// 1. 启动渲染进程
	const {
		electronFastReload = true,
		outDir = path.resolve(process.cwd(), 'build'),
		viteConfig = {},
	} = await getCretaConfigs();
	const viteServer = await createServer({
		...defaultViteConfig,
		...viteConfig,
		build: {
			...viteConfig.build,
			outDir: path.resolve(outDir, 'renderer'),
		},
	});

	await viteServer.listen();
	const devPort = viteServer.config.server.port;

	// 2. 启动 electron
	if (electronFastReload) {
		const tscWatchPrograms = {
			main: undefined as any,
			preload: undefined as any,
		};
		// 2.1 定义启动函数
		const launchElectron = () => {
			let getOnClose = () => () => {
				viteServer.close();
				process.exit();
				return;
			};

			const killElectron = runElectron(
				['.', `--port=${devPort}`],
				{
					cwd: scriptsCwd,
				},
				() => {
					getOnClose()();
				}
			);

			return () => {
				getOnClose = () => () => {};
				killElectron();
			};
		};
		let beforeRelaunchElectron: ReturnType<typeof launchElectron>;

		await Promise.all([
			// 2.2.1 tsc watch 主进程代码
			new Promise<void>((resolve) => {
				const mainConfigPath = path.resolve(scriptsCwd, 'src', 'main', 'tsconfig.json');
				tscWatchPrograms.main = tscWatch(mainConfigPath, {
					onAfterFirstCompile(program, defaultCallback?) {
						defaultCallback?.(program);
						resolve();
					},
					onAfterCompile(program, defaultCallback?) {
						defaultCallback?.(program);
						console.log(
							'\x1B[1m\x1B[32m%s\x1B[39m\x1B[22m %s',
							'[CRETA]',
							'主进程代码编译完成，即将重新启动 electron 应用'
						);
						beforeRelaunchElectron = launchElectron();
					},
					onBeforeFirstCompile(
						defaultCallback,
						rootNames?,
						options?,
						host?,
						oldProgram?,
						configFileParsingDiagnostics?,
						projectReferences?
					) {
						return defaultCallback(
							rootNames,
							options,
							host,
							oldProgram,
							configFileParsingDiagnostics,
							projectReferences
						);
					},
					onBeforeCompile(
						defaultCallback,
						rootNames?,
						options?,
						host?,
						oldProgram?,
						configFileParsingDiagnostics?,
						projectReferences?
					) {
						beforeRelaunchElectron();
						console.log(
							'\x1B[1m\x1B[35m%s\x1B[39m\x1B[22m %s',
							'[CRETA]',
							'检测到主进程代码发生变化，将重新进行编译'
						);
						return defaultCallback(
							rootNames,
							options,
							host,
							oldProgram,
							configFileParsingDiagnostics,
							projectReferences
						);
					},
				});
			}),
			// 2.2.2 tsc watch 预加载脚本代码
			new Promise<void>((resolve) => {
				const preloadConfigPath = path.resolve(scriptsCwd, 'src', 'preload', 'tsconfig.json');
				tscWatchPrograms.preload = tscWatch(preloadConfigPath, {
					onAfterFirstCompile(program, defaultCallback?) {
						defaultCallback?.(program);
						resolve();
					},
					onAfterCompile(program, defaultCallback?) {
						defaultCallback?.(program);
						console.log(
							'\x1B[1m\x1B[32m%s\x1B[39m\x1B[22m %s',
							'[CRETA]',
							'预加载脚本代码编译完成，即将重新启动 electron 应用'
						);
						beforeRelaunchElectron = launchElectron();
					},
					onBeforeFirstCompile(
						defaultCallback,
						rootNames?,
						options?,
						host?,
						oldProgram?,
						configFileParsingDiagnostics?,
						projectReferences?
					) {
						return defaultCallback(
							rootNames,
							options,
							host,
							oldProgram,
							configFileParsingDiagnostics,
							projectReferences
						);
					},
					onBeforeCompile(
						defaultCallback,
						rootNames?,
						options?,
						host?,
						oldProgram?,
						configFileParsingDiagnostics?,
						projectReferences?
					) {
						beforeRelaunchElectron();
						console.log(
							'\x1B[1m\x1B[35m%s\x1B[39m\x1B[22m %s',
							'[CRETA]',
							'检测到预加载脚本代码发生变化，将重新进行编译'
						);
						return defaultCallback(
							rootNames,
							options,
							host,
							oldProgram,
							configFileParsingDiagnostics,
							projectReferences
						);
					},
				});
			}),
		]);

		beforeRelaunchElectron = launchElectron();
	} else {
		await Promise.all([buildMain(), buildPreload()]);
		runElectron(
			['.', `--port=${devPort}`],
			{
				cwd: scriptsCwd,
			},
			() => {
				viteServer.close();
				process.exit();
			}
		);
	}
};

main();
