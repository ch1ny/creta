const { defineConfig } = require('creta/plugins');

module.exports = defineConfig({
	updateFilesPath: {
		win32: ['resources/app.asar'],
		darwin: [
			'Frameworks/ReactElectronTypescriptTemplate Helper (GPU).app/Contents/info.plist',
			'Frameworks/ReactElectronTypescriptTemplate Helper (Plugin).app/Contents/Info.plist',
			'Frameworks/ReactElectronTypescriptTemplate Helper (Renderer).app/Contents/Info.plist',
			'Frameworks/ReactElectronTypescriptTemplate Helper.app/Contents/Info.plist',
			'Info.plist', // 右键显示简介版本号
			'Resources/app.asar', // 应用资源
			'Resources/electron.icns', // 图标文件
		],
	},
});
