// cSpell: disable-next-line
// @ts-nocheck
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

const PROJECT_ROOT_DIR = process.cwd();

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(PROJECT_ROOT_DIR, 'src', 'renderer'),
		},
	},
	publicDir: path.resolve(PROJECT_ROOT_DIR, 'public'),
	root: path.resolve(PROJECT_ROOT_DIR, 'src', 'renderer'),
	build: {
		outDir: path.resolve(PROJECT_ROOT_DIR, 'build', 'renderer'),
	},
	css: {
		//* css模块化
		modules: {
			// css模块化 文件以.module.[css|less|scss]结尾
			generateScopedName: '[name]_[hash:base64:5]',
			hashPrefix: 'prefix',
		},
	},
});
