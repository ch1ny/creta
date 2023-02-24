import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

const PROJECT_ROOT_DIR = path.resolve(__dirname, '../..');
const { DEV_PORT } = require(path.resolve(PROJECT_ROOT_DIR, 'config', 'dev.config.js'));

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	plugins: [react()],
	resolve: {
		alias: {
			'@': __dirname,
		},
	},
	publicDir: path.resolve(PROJECT_ROOT_DIR, 'public'),
	server: {
		port: DEV_PORT,
	},
	build: {
		outDir: path.resolve(PROJECT_ROOT_DIR, 'build', 'render'),
	},
	css: {
		//* css模块化
		modules: {
			// css模块化 文件以.module.[css|less|scss]结尾
			generateScopedName: '[name]_[hash:base64:5]',
			hashPrefix: 'prefix',
		},
		//* 预编译支持less
		preprocessorOptions: {
			less: {
				// 支持内联 JavaScript
				javascriptEnabled: true,
			},
		},
	},
});
