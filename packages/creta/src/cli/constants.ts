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
}

export default new Constants();