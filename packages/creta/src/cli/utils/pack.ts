import debug from 'debug';
import path from 'path';
import { getCretaConfigs } from './getCretaConfigs';
import { packUpdater } from './packUpdater';

/**
 * Copied from `electron-builder`
 *
 * @param executor
 * @param name
 * @returns
 */
function resolveFunction<T>(executor: T | string, name: string): T {
	if (executor == null || typeof executor !== 'string') {
		return executor;
	}

	let p = executor as string;
	if (p.startsWith('.')) {
		p = path.resolve(p);
	}

	try {
		p = require.resolve(p);
	} catch (e: any) {
		debug('electron-builder')(e);
		p = path.resolve(p);
	}

	const m = require(p);
	const namedExport = m[name];
	if (namedExport == null) {
		return m.default || m;
	} else {
		return namedExport;
	}
}

type TPlatform = 'win32' | 'darwin' | 'linux';
export default async (targets: TPlatform[]) => {
	const {
		outDir = 'build',
		electronBuilderConfig: { afterPack: userConfigAfterPack, ...electronBuilderConfig } = {},
		/**
		 * 自行设计更新方案
		 */
		useCretaUpdater = true,
	} = await getCretaConfigs();

	const builder: typeof import('electron-builder') = require('electron-builder');

	return builder.build({
		targets: builder.createTargets(
			(function () {
				const targetsArray: Parameters<typeof builder.createTargets>[0] = [];
				for (const target of targets) {
					switch (target) {
						case 'darwin':
							targetsArray.push(builder.Platform.MAC);
							break;
						case 'linux':
							targetsArray.push(builder.Platform.LINUX);
							break;
						case 'win32':
							targetsArray.push(builder.Platform.WINDOWS);
							break;
						default:
						// no-op
					}
				}
				return targetsArray;
			})()
		),
		config: {
			productName: 'creta-app',
			appId: 'org.creta.app',
			copyright: `Copyright © ${new Date().getFullYear()}`,
			asar: true,
			asarUnpack: '**/*.{node,dll}',
			files: [outDir],
			includeSubNodeModules: true,
			compression: 'maximum',
			nsis: {
				oneClick: false,
				allowElevation: true,
				allowToChangeInstallationDirectory: true,
				createDesktopShortcut: true,
				createStartMenuShortcut: false,
			},
			win: {
				target: [
					{
						target: 'nsis',
						arch: ['x64', 'ia32'],
					},
				],
			},
			linux: {
				target: ['AppImage'],
				category: 'Development',
			},
			mac: {
				target: {
					target: 'default',
					arch: ['arm64', 'x64'],
				},
				type: 'distribution',
				hardenedRuntime: true,
				entitlements: 'assets/entitlements.mac.plist',
				entitlementsInherit: 'assets/entitlements.mac.plist',
				gatekeeperAssess: false,
			},
			dmg: {
				contents: [
					{
						x: 130,
						y: 220,
					},
					{
						x: 410,
						y: 220,
						type: 'link',
						path: '/Applications',
					},
				],
			},
			directories: {
				output: 'dist',
			},
			...electronBuilderConfig,
			afterPack: async (ctx) => {
				// 如果开发者设置了自行更新则不打包更新包及安装程序
				if (useCretaUpdater) {
					packUpdater(ctx);
				}
				const afterPack = resolveFunction(userConfigAfterPack, 'afterPack');
				if (afterPack != null) {
					await afterPack(ctx);
				}
			},
		},
	});
};
