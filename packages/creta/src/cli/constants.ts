import react from '@vitejs/plugin-react';
import cp from 'child_process';
import path from 'path';
class Constants {
	private _gitName?: string;
	get gitName() {
		if (this._gitName !== undefined) return this._gitName;
		this._gitName = cp.execSync('git config --global user.name', { encoding: 'utf8' }).trim();
		return this._gitName;
	}

	cretaRootDir = path.resolve(__dirname, '..');
	binDir = path.resolve(this.cretaRootDir, 'bin');
	cliDir = path.join(this.cretaRootDir, 'cli');
	templatesDir = path.join(this.cretaRootDir, 'templates');

	scriptsCwd = process.cwd();

	/**
	 * 默认 vite 配置
	 */
	defaultViteConfig = {
		base: './',
		plugins: [react()],
		resolve: {
			alias: {
				'@': path.resolve(this.scriptsCwd, 'src', 'renderer'),
			},
		},
		publicDir: path.resolve(this.scriptsCwd, 'public'),
		root: path.resolve(this.scriptsCwd, 'src', 'renderer'),
		css: {
			//* css模块化
			modules: {
				// css模块化 文件以.module.[css|less|scss]结尾
				generateScopedName: '[name]_[local]_[hash:base64:5]',
				hashPrefix: 'prefix',
			},
		},
	};
}

export default new Constants();
